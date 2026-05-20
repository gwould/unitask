using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Unitask.Api.Data;
using Unitask.Api.Models;

namespace Unitask.Api.Services;

public interface IAiMatchingService
{
    Task<AiMatchResponse> RecommendAsync(AiMatchRequest request);
}

public class AiMatchingService : IAiMatchingService
{
    private readonly AppDbContext _db;
    private readonly IRagService _ragService;
    private readonly IDataNormalizationService _normalizationService;
    private readonly ILogger<AiMatchingService> _logger;

    public AiMatchingService(AppDbContext db, IRagService ragService, IDataNormalizationService normalizationService, ILogger<AiMatchingService> logger)
    {
        _db = db;
        _ragService = ragService;
        _normalizationService = normalizationService;
        _logger = logger;
    }

    public async Task<AiMatchResponse> RecommendAsync(AiMatchRequest request)
    {
        var queryText = BuildQueryText(request);
        var jobs = await _db.Jobs.AsNoTracking()
            .Where(j => j.Status == "open" || j.Status == "active")
            .ToListAsync();

        var semanticBoost = await TryGetSemanticBoostAsync(queryText, request.TopK);
        var canonicalRequestSkills = _normalizationService.CanonicalizeSkills(request.Skills ?? new List<string>());
        var normalizedMajor = _normalizationService.NormalizeMajorCategory(request.Major ?? string.Empty);

        var ranked = jobs
            .Select(job => ScoreJob(job, request, queryText, semanticBoost, canonicalRequestSkills, normalizedMajor))
            .OrderByDescending(item => item.Score)
            .ThenByDescending(item => item.Job.Featured)
            .Take(Math.Clamp(request.TopK, 1, 12))
            .Select(item => Map(item.Job, item.Score, item.Reasons))
            .ToList();

        return new AiMatchResponse
        {
            Query = queryText,
            UsedSemanticSearch = semanticBoost.Count > 0,
            Matches = ranked,
            Summary = BuildSummary(request, ranked.Count, semanticBoost.Count > 0),
        };
    }

    private static string BuildQueryText(AiMatchRequest request)
    {
        var parts = new List<string>();

        if (!string.IsNullOrWhiteSpace(request.Query)) parts.Add(request.Query.Trim());
        if (!string.IsNullOrWhiteSpace(request.Role)) parts.Add(request.Role.Trim());
        if (!string.IsNullOrWhiteSpace(request.Major)) parts.Add(request.Major.Trim());
        if (!string.IsNullOrWhiteSpace(request.Bio)) parts.Add(request.Bio.Trim());
        if (!string.IsNullOrWhiteSpace(request.CompanyName)) parts.Add(request.CompanyName.Trim());
        if (!string.IsNullOrWhiteSpace(request.University)) parts.Add(request.University.Trim());
        if (request.Skills is { Count: > 0 }) parts.Add(string.Join(", ", request.Skills.Where(s => !string.IsNullOrWhiteSpace(s))));

        return string.Join(" | ", parts.Where(p => !string.IsNullOrWhiteSpace(p)));
    }

    private async Task<Dictionary<int, float>> TryGetSemanticBoostAsync(string queryText, int topK)
    {
        if (string.IsNullOrWhiteSpace(queryText))
            return new Dictionary<int, float>();

        try
        {
            var ragResults = await _ragService.SearchSimilarAsync(queryText, Math.Clamp(topK * 2, 3, 20), "job");
            var boosts = new Dictionary<int, float>();

            foreach (var result in ragResults)
            {
                if (!result.DocumentId.StartsWith("job_", StringComparison.OrdinalIgnoreCase))
                    continue;

                if (int.TryParse(result.DocumentId[4..], out var jobId))
                {
                    boosts[jobId] = result.Score;
                }
            }

            return boosts;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Semantic boost unavailable, falling back to heuristic matching");
            return new Dictionary<int, float>();
        }
    }

    private (Job Job, float Score, List<string> Reasons) ScoreJob(
        Job job,
        AiMatchRequest request,
        string queryText,
        IReadOnlyDictionary<int, float> semanticBoost,
        List<string> canonicalRequestSkills,
        string normalizedMajor)
    {
        var score = 0f;
        var reasons = new List<string>();
        var normalizedJobText = NormalizeText($"{job.Title} {job.CompanyName} {job.Description} {string.Join(' ', job.Skills)} {string.Join(' ', job.Requirements)} {string.Join(' ', job.Tags.Select(t => t.Label))}");
        var normalizedQuery = NormalizeText(queryText);
        var queryTokens = Tokenize(normalizedQuery);

        var matchedSkills = MatchItems(canonicalRequestSkills ?? new List<string>(), job.Skills, normalizedJobText);
        if (matchedSkills.Count > 0)
        {
            // stronger boost for canonical skill overlap
            score += Math.Min(48, matchedSkills.Count * 16);
            reasons.Add($"Khớp kỹ năng: {string.Join(", ", matchedSkills.Take(3))}");
        }

        var majorCategory = !string.IsNullOrWhiteSpace(normalizedMajor) ? normalizedMajor : InferCategory(request.Major ?? string.Empty, request.Bio ?? string.Empty, request.Skills ?? new List<string>(), normalizedJobText);
        if (!string.IsNullOrWhiteSpace(majorCategory) && string.Equals(majorCategory, job.Category, StringComparison.OrdinalIgnoreCase))
        {
            score += 24;
            reasons.Add($"Phù hợp ngành nghề: {job.Category}");
        }

        if (!string.IsNullOrWhiteSpace(request.Location) && ContainsNormalized(job.Location, request.Location))
        {
            score += 10;
            reasons.Add($"Khớp địa điểm: {job.Location}");
        }

        if (!string.IsNullOrWhiteSpace(request.CompanyName) && ContainsNormalized(job.CompanyName, request.CompanyName))
        {
            score += 16;
            reasons.Add($"Khớp doanh nghiệp: {job.CompanyName}");
        }

        var tokenHits = queryTokens.Count(token => normalizedJobText.Contains(token, StringComparison.OrdinalIgnoreCase));
        if (tokenHits > 0)
        {
            score += Math.Min(20, tokenHits * 4);
            reasons.Add("Khớp truy vấn tìm kiếm");
        }

        if (semanticBoost.TryGetValue(job.Id, out var boost))
        {
            score += Math.Min(28, boost * 30);
            reasons.Add("Tương đồng ngữ nghĩa từ vector data");
        }

        if (job.Featured)
        {
            score += 4;
        }

        if (job.Verified)
        {
            score += 3;
        }

        if (job.SpotsLeft <= 1)
        {
            score += 5;
            reasons.Add("Ưu tiên vì sắp hết chỗ");
        }

        if (reasons.Count == 0)
        {
            reasons.Add("Phù hợp với hồ sơ và xu hướng job nổi bật");
        }

        return (job, Math.Clamp(score, 0, 100), reasons.Distinct().Take(3).ToList());
    }

    private static List<string> MatchItems(IEnumerable<string> source, IEnumerable<string> target, string normalizedJobText)
    {
        var normalizedTarget = target
            .Where(item => !string.IsNullOrWhiteSpace(item))
            .Select(item => NormalizeText(item))
            .ToList();

        return source
            .Where(item => !string.IsNullOrWhiteSpace(item))
            .Select(item => item.Trim())
            .Where(item => normalizedTarget.Any(targetItem =>
                targetItem.Contains(NormalizeText(item), StringComparison.OrdinalIgnoreCase) ||
                normalizedJobText.Contains(NormalizeText(item), StringComparison.OrdinalIgnoreCase)))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private static string InferCategory(string major, string bio, IEnumerable<string> skills, string normalizedJobText)
    {
        var text = NormalizeText($"{major} {bio} {string.Join(' ', skills)} {normalizedJobText}");

        if (ContainsAny(text, ["react", "typescript", "javascript", "frontend", "backend", "python", "flask", "node", "api", "web", "software", "coding", "cntt", "cong nghe thong tin"]))
            return "it";
        if (ContainsAny(text, ["figma", "illustrator", "design", "branding", "ui", "ux", "photoshop", "graphic", "do hoa"]))
            return "design";
        if (ContainsAny(text, ["seo", "content", "copywriting", "marketing", "ads", "digital", "social", "brand"]))
            return "marketing";
        if (ContainsAny(text, ["write", "writing", "blog", "translation", "translator", "english", "ngon ngu", "phien dich", "dich thuat"]))
            return "language";

        return string.Empty;
    }

    private static string BuildSummary(AiMatchRequest request, int matchCount, bool usedSemantic)
    {
        var roleText = string.IsNullOrWhiteSpace(request.Role) ? "người dùng" : request.Role.Trim();
        var basis = usedSemantic ? "kết hợp vector data và hồ sơ cá nhân" : "dựa trên hồ sơ cá nhân";
        return $"AI đã chọn {matchCount} job phù hợp cho {roleText} ({basis}).";
    }

    private static AiMatchJobDto Map(Job job, float score, List<string> reasons)
    {
        return new AiMatchJobDto
        {
            Id = job.Id,
            LogoText = job.LogoText,
            LogoGradient = job.LogoGradient,
            Title = job.Title,
            Company = job.CompanyName,
            CompanyId = job.CompanyUserId.ToString(),
            Verified = job.Verified,
            Location = job.Location,
            Tags = job.Tags,
            SpotsLeft = job.SpotsLeft,
            SpotsTotal = job.SpotsTotal,
            Pay = job.Pay,
            PayMin = job.PayMin,
            PayMax = job.PayMax,
            Deadline = job.Deadline,
            Category = job.Category,
            Featured = job.Featured,
            Description = job.Description,
            Requirements = job.Requirements,
            Deliverables = job.Deliverables,
            Duration = job.Duration,
            PostedAt = job.PostedAt,
            Skills = job.Skills,
            MatchScore = (float)Math.Round(score, 1),
            MatchReasons = reasons,
        };
    }

    private static string NormalizeText(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;

        var normalized = text.Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder(normalized.Length);

        foreach (var ch in normalized)
        {
            var category = CharUnicodeInfo.GetUnicodeCategory(ch);
            if (category != UnicodeCategory.NonSpacingMark)
            {
                builder.Append(char.ToLowerInvariant(ch));
            }
        }

        var cleaned = Regex.Replace(builder.ToString(), @"[^\w\s]", " ");
        cleaned = Regex.Replace(cleaned, @"\s+", " ");
        return cleaned.Trim();
    }

    private static List<string> Tokenize(string text)
    {
        return NormalizeText(text)
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(token => token.Length > 2)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private static bool ContainsNormalized(string source, string value)
        => NormalizeText(source).Contains(NormalizeText(value), StringComparison.OrdinalIgnoreCase);

    private static bool ContainsAny(string source, IEnumerable<string> keywords)
        => keywords.Any(keyword => source.Contains(NormalizeText(keyword), StringComparison.OrdinalIgnoreCase));
}

public class AiMatchRequest
{
    public string? Query { get; set; }
    public string? Role { get; set; }
    public string? Major { get; set; }
    public List<string> Skills { get; set; } = new();
    public string? Bio { get; set; }
    public string? CompanyName { get; set; }
    public string? University { get; set; }
    public string? Location { get; set; }
    public int TopK { get; set; } = 6;
}

public class AiMatchResponse
{
    public string Query { get; set; } = string.Empty;
    public bool UsedSemanticSearch { get; set; }
    public string Summary { get; set; } = string.Empty;
    public List<AiMatchJobDto> Matches { get; set; } = new();
}

public class AiMatchJobDto
{
    public int Id { get; set; }
    public string LogoText { get; set; } = string.Empty;
    public string LogoGradient { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string CompanyId { get; set; } = string.Empty;
    public bool Verified { get; set; }
    public string Location { get; set; } = string.Empty;
    public List<JobTag> Tags { get; set; } = new();
    public int SpotsLeft { get; set; }
    public int SpotsTotal { get; set; }
    public string Pay { get; set; } = string.Empty;
    public decimal PayMin { get; set; }
    public decimal PayMax { get; set; }
    public string Deadline { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public bool Featured { get; set; }
    public string Description { get; set; } = string.Empty;
    public List<string> Requirements { get; set; } = new();
    public List<string> Deliverables { get; set; } = new();
    public string Duration { get; set; } = string.Empty;
    public string PostedAt { get; set; } = string.Empty;
    public List<string> Skills { get; set; } = new();
    public float MatchScore { get; set; }
    public List<string> MatchReasons { get; set; } = new();
}