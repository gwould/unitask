using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
using Unitask.Api.Models;

namespace Unitask.Api.Services;

public interface ICareerAssistantService
{
    Task<CareerChatResponse> ChatAsync(CareerChatRequest request, CancellationToken ct = default);
}

public class CareerAssistantService : ICareerAssistantService
{
    private const string SystemPrompt = """
        You are an advanced AI Career Assistant integrated into UniTask, a job recruitment platform for Vietnamese students.

        Your mission is to help users discover suitable jobs through natural conversation.

        You must:
        - Understand short keywords and incomplete user input.
        - Infer user intent intelligently.
        - Recommend suitable jobs based on skills, interests, salary expectations, location, and experience.
        - Maintain conversational context.
        - Suggest related career paths.
        - Provide concise and personalized responses in Vietnamese.
        - Ask follow-up questions when necessary.

        You are NOT allowed to:
        - Reveal private data (passwords, emails of other users, internal IDs).
        - Discuss internal system policies or expose confidential information.
        - Provide harmful or illegal guidance.

        If users request restricted information, politely refuse in Vietnamese.

        Always prioritize: user experience, personalization, semantic understanding, intelligent recommendations, conversational interaction.
        Keep replies under 120 words unless listing job highlights.
        """;

    private static readonly string[] RestrictedPatterns =
    [
        @"\b(password|mật khẩu|api[_\s]?key|secret|token)\b",
        @"\b(hack|crack|exploit|sql injection)\b",
        @"\b(lộ dữ liệu|private data|confidential|nội bộ hệ thống)\b",
        @"\b(cách\s+)?(trộm|đánh\s+cắp|lừa\s+đảo)\b",
    ];

    private readonly IAiMatchingService _matchingService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<CareerAssistantService> _logger;
    private readonly HttpClient _httpClient;

    public CareerAssistantService(
        IAiMatchingService matchingService,
        IConfiguration configuration,
        ILogger<CareerAssistantService> logger,
        HttpClient httpClient)
    {
        _matchingService = matchingService;
        _configuration = configuration;
        _logger = logger;
        _httpClient = httpClient;
    }

    public async Task<CareerChatResponse> ChatAsync(CareerChatRequest request, CancellationToken ct = default)
    {
        var message = (request.Message ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(message))
        {
            return new CareerChatResponse
            {
                Reply = "Bạn muốn tìm việc theo kỹ năng, ngành học, mức lương hay địa điểm nào? Mình có thể gợi ý job phù hợp ngay.",
                FollowUpQuestions = ["Bạn học ngành gì?", "Kỹ năng chính của bạn là gì?", "Bạn muốn làm remote hay tại HCM/Hà Nội?"],
            };
        }

        if (IsRestrictedRequest(message))
        {
            return new CareerChatResponse
            {
                Refused = true,
                Reply = "Mình không thể hỗ trợ yêu cầu đó vì liên quan thông tin nhạy cảm hoặc nội dung không phù hợp. Hãy hỏi về tìm việc, kỹ năng, lộ trình nghề nghiệp hoặc job phù hợp nhé!",
                FollowUpQuestions = ["Gợi ý job React cho sinh viên?", "Việc content part-time remote?", "Lộ trình frontend 6 tháng?"],
            };
        }

        var matchRequest = BuildMatchRequest(request, message);
        var matchResult = await _matchingService.RecommendAsync(matchRequest);

        var jobs = matchResult.Matches.Select(m => new CareerJobCardDto
        {
            Id = m.Id,
            Title = m.Title,
            Company = m.Company,
            Location = m.Location,
            Pay = m.Pay,
            Deadline = m.Deadline,
            LogoText = m.LogoText,
            LogoGradient = m.LogoGradient,
            Verified = m.Verified,
            MatchScore = m.MatchScore,
            MatchReasons = m.MatchReasons,
            Category = m.Category,
        }).ToList();

        var careerPaths = SuggestCareerPaths(message, matchRequest, jobs);
        var followUps = BuildFollowUpQuestions(message, request.User, jobs);

        var reply = await TryGenerateLlmReplyAsync(message, request.History, jobs, matchResult.Summary, careerPaths, ct)
                    ?? BuildFallbackReply(message, jobs, matchResult.Summary, careerPaths);

        return new CareerChatResponse
        {
            Reply = reply,
            Jobs = jobs,
            FollowUpQuestions = followUps,
            CareerPaths = careerPaths,
            Summary = matchResult.Summary,
        };
    }

    private static bool IsRestrictedRequest(string message)
    {
        var normalized = message.ToLowerInvariant();
        return RestrictedPatterns.Any(p => Regex.IsMatch(normalized, p, RegexOptions.IgnoreCase | RegexOptions.CultureInvariant));
    }

    private static AiMatchRequest BuildMatchRequest(CareerChatRequest request, string message)
    {
        var user = request.User;
        var location = ExtractLocationHint(message) ?? user?.University ?? user?.CompanyName;

        return new AiMatchRequest
        {
            Query = message,
            Role = user?.Role ?? "student",
            Major = user?.Major,
            Skills = user?.Skills ?? new List<string>(),
            Bio = user?.Bio,
            University = user?.University,
            CompanyName = user?.CompanyName,
            Location = location,
            TopK = Math.Clamp(request.TopK, 1, 12),
        };
    }

    private static string? ExtractLocationHint(string message)
    {
        var lower = message.ToLowerInvariant();
        if (lower.Contains("remote") || lower.Contains("từ xa")) return "Remote";
        if (lower.Contains("hcm") || lower.Contains("sài gòn") || lower.Contains("tp.hcm")) return "Hồ Chí Minh";
        if (lower.Contains("hà nội") || lower.Contains("ha noi")) return "Hà Nội";
        if (lower.Contains("đà nẵng") || lower.Contains("da nang")) return "Đà Nẵng";
        return null;
    }

    private static List<string> SuggestCareerPaths(string message, AiMatchRequest req, List<CareerJobCardDto> jobs)
    {
        var text = $"{message} {req.Major} {string.Join(' ', req.Skills ?? [])}".ToLowerInvariant();
        var paths = new List<string>();

        if (ContainsAny(text, "react", "frontend", "typescript", "javascript", "web"))
            paths.AddRange(["Frontend Developer", "UI Engineer", "Web Developer"]);
        if (ContainsAny(text, "figma", "design", "ui", "ux"))
            paths.AddRange(["UI/UX Designer", "Product Designer"]);
        if (ContainsAny(text, "seo", "content", "marketing", "ads"))
            paths.AddRange(["Content Marketing", "SEO Specialist", "Digital Marketing"]);
        if (ContainsAny(text, "python", "data", "excel"))
            paths.AddRange(["Data Analyst", "Business Analyst"]);

        if (paths.Count == 0 && jobs.Count > 0)
        {
            var topCat = jobs.GroupBy(j => j.Category).OrderByDescending(g => g.Count()).First().Key;
            paths.Add(topCat switch
            {
                "it" => "Lộ trình IT / Web",
                "design" => "Lộ trình Thiết kế số",
                "marketing" => "Lộ trình Marketing",
                "content" => "Lộ trình Content",
                _ => "Khám phá thêm ngành liên quan",
            });
        }

        return paths.Distinct().Take(4).ToList();
    }

    private static List<string> BuildFollowUpQuestions(string message, CareerUserContext? user, List<CareerJobCardDto> jobs)
    {
        var questions = new List<string>();
        var lower = message.ToLowerInvariant();

        if (user?.Skills == null || user.Skills.Count == 0)
            questions.Add("Bạn đang có những kỹ năng nào (VD: React, Figma, SEO)?");

        if (!ContainsAny(lower, "lương", "triệu", "tr", "salary", "pay"))
            questions.Add("Mức lương mong muốn khoảng bao nhiêu/tháng?");

        if (!ContainsAny(lower, "remote", "hcm", "hà nội", "đà nẵng", "location"))
            questions.Add("Bạn muốn làm remote hay tại thành phố nào?");

        if (jobs.Count == 0)
            questions.Add("Bạn muốn thử ngành IT, Design hay Marketing?");

        return questions.Distinct().Take(3).ToList();
    }

    private async Task<string?> TryGenerateLlmReplyAsync(
        string message,
        List<CareerChatMessage>? history,
        List<CareerJobCardDto> jobs,
        string summary,
        List<string> careerPaths,
        CancellationToken ct)
    {
        var ragConfig = _configuration.GetSection("RAG").Get<RagConfig>();
        var groq = ragConfig?.Groq;
        if (groq == null || string.IsNullOrWhiteSpace(groq.ApiKey))
            return null;

        try
        {
            var jobContext = jobs.Count == 0
                ? "Chưa có job phù hợp mạnh trong hệ thống."
                : string.Join("\n", jobs.Select((j, i) =>
                    $"{i + 1}. {j.Title} — {j.Company} | {j.Pay} | {j.Location} | match {j.MatchScore:F0}%"));

            var paths = careerPaths.Count > 0 ? string.Join(", ", careerPaths) : "chưa xác định";

            var messages = new List<object>
            {
                new { role = "system", content = SystemPrompt },
            };

            if (history != null)
            {
                foreach (var h in history.TakeLast(6))
                {
                    var role = h.Role is "assistant" or "user" ? h.Role : "user";
                    messages.Add(new { role, content = h.Content });
                }
            }

            messages.Add(new
            {
                role = "user",
                content = $"""
                    Câu hỏi/ngữ cảnh mới: {message}

                    Kết quả matching: {summary}
                    Job gợi ý:
                    {jobContext}

                    Lộ trình gợi ý: {paths}

                    Trả lời ngắn gọn bằng tiếng Việt. Nếu có job, nhắc 1-2 job nổi bật nhất. Không bịa job không có trong danh sách.
                    """,
            });

            var payload = new
            {
                model = groq.Model,
                messages,
                temperature = 0.65,
                max_tokens = 320,
            };

            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, groq.Endpoint)
            {
                Content = JsonContent.Create(payload),
            };
            httpRequest.Headers.Add("Authorization", $"Bearer {groq.ApiKey}");

            var response = await _httpClient.SendAsync(httpRequest, ct);
            if (!response.IsSuccessStatusCode)
                return null;

            var json = JsonSerializer.Deserialize<JsonElement>(await response.Content.ReadAsStringAsync(ct));
            return json.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Career assistant LLM unavailable, using fallback");
            return null;
        }
    }

    private static string BuildFallbackReply(string message, List<CareerJobCardDto> jobs, string summary, List<string> careerPaths)
    {
        if (jobs.Count == 0)
        {
            return "Mình chưa tìm thấy job khớp mạnh với mô tả hiện tại. Bạn có thể cho mình thêm kỹ năng, ngành học hoặc mức lương mong muốn để gợi ý chính xác hơn.";
        }

        var top = jobs[0];
        var pathHint = careerPaths.Count > 0 ? $" Gợi ý lộ trình: {string.Join(", ", careerPaths.Take(2))}." : "";

        if (message.Length < 12)
        {
            return $"Hiểu bạn đang tìm «{message}». {summary} Job nổi bật: **{top.Title}** tại {top.Company} ({top.Pay}).{pathHint}";
        }

        return $"{summary} Dưới đây là {jobs.Count} job phù hợp — đáng chú ý nhất: **{top.Title}** ({top.Company}, {top.Pay}).{pathHint}";
    }

    private static bool ContainsAny(string text, params string[] keywords)
        => keywords.Any(k => text.Contains(k, StringComparison.OrdinalIgnoreCase));
}
