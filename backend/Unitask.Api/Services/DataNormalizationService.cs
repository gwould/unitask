using System.Text.RegularExpressions;
using Unitask.Api.Models;

namespace Unitask.Api.Services;

/// <summary>
/// Chuẩn hóa dữ liệu từ database để phù hợp với RAG
/// </summary>
using Microsoft.Extensions.Hosting;
using System.Text.Json;

public interface IDataNormalizationService
{
    RagDocument NormalizeJob(Job job);
    RagDocument NormalizeUser(User user);
    RagDocument NormalizeApplication(Application app, Job? job = null);
    string NormalizeText(string? text);
    string CanonicalizeSkill(string skill);
    List<string> CanonicalizeSkills(IEnumerable<string> skills);
    string NormalizeMajorCategory(string major);
    List<RagDocument> GetTaxonomyDocuments();
}

public class DataNormalizationService : IDataNormalizationService
{
    private readonly Dictionary<string, string> _skillToCanonical = new(StringComparer.OrdinalIgnoreCase);
    private readonly Dictionary<string, string> _majorsToCanonical = new(StringComparer.OrdinalIgnoreCase);

    public DataNormalizationService(IHostEnvironment env)
    {
        try
        {
            var path = System.IO.Path.Combine(env.ContentRootPath, "Resources", "skill_taxonomy.json");
            if (System.IO.File.Exists(path))
            {
                var json = System.IO.File.ReadAllText(path);
                using var doc = JsonDocument.Parse(json);
                if (doc.RootElement.TryGetProperty("skills", out var skills))
                {
                    foreach (var prop in skills.EnumerateObject())
                    {
                        var canonical = prop.Name;
                        foreach (var syn in prop.Value.EnumerateArray())
                        {
                            var key = NormalizeText(syn.GetString() ?? canonical);
                            if (!_skillToCanonical.ContainsKey(key))
                                _skillToCanonical[key] = canonical;
                        }
                        var canonicalKey = NormalizeText(canonical);
                        if (!_skillToCanonical.ContainsKey(canonicalKey))
                            _skillToCanonical[canonicalKey] = canonical;
                    }
                }

                if (doc.RootElement.TryGetProperty("majors", out var majors))
                {
                    foreach (var prop in majors.EnumerateObject())
                    {
                        var canonical = prop.Name;
                        foreach (var syn in prop.Value.EnumerateArray())
                        {
                            var key = NormalizeText(syn.GetString() ?? canonical);
                            if (!_majorsToCanonical.ContainsKey(key))
                                _majorsToCanonical[key] = canonical;
                        }
                        var canonicalKey = NormalizeText(canonical);
                        if (!_majorsToCanonical.ContainsKey(canonicalKey))
                            _majorsToCanonical[canonicalKey] = canonical;
                    }
                }
            }
        }
        catch
        {
            // ignore taxonomy load failures
        }
    }
    /// <summary>
    /// Chuẩn hóa text: xóa HTML, dấu chấm phẩy, khoảng trắng dư
    /// </summary>
    public string NormalizeText(string? text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return string.Empty;

        // Xóa HTML tags
        text = Regex.Replace(text, "<[^>]+>", " ");

        // Xóa dấu chấm phẩy, dấu phẩy dư
        text = Regex.Replace(text, "[;]+", ".");

        // Chuyển multiple spaces thành single space
        text = Regex.Replace(text, @"\s+", " ");

        // Loại bỏ ký tự đặc biệt không cần thiết
        text = Regex.Replace(text, @"[^\w\s\.,-]", "");

        // Trim
        text = text.Trim();

        return text;
    }

    public RagDocument NormalizeJob(Job job)
    {
        var normalizedTitle = NormalizeText(job.Title);
        var normalizedDescription = NormalizeText(job.Description);
        var skillsText = string.Join(", ", job.Skills);
        var requirementsText = string.Join(", ", job.Requirements);
        var deliverables = string.Join(", ", job.Deliverables);
        var tagsText = string.Join(", ", job.Tags.Select(t => t.Label));

        // Tạo content từ các trường quan trọng
        var content = $@"
Tiêu đề công việc: {normalizedTitle}
Công ty: {NormalizeText(job.CompanyName)}
Mô tả: {normalizedDescription}
Loại công việc: {NormalizeText(job.Category)}
Địa điểm: {NormalizeText(job.Location)}
Mức lương: {NormalizeText(job.Pay)} (từ {job.PayMin} đến {job.PayMax})
Kỹ năng yêu cầu: {skillsText}
Yêu cầu: {requirementsText}
Kết quả dự kiến: {deliverables}
Thẻ: {tagsText}
Trạng thái: {job.Status}
Số chỗ còn lại: {job.SpotsLeft}/{job.SpotsTotal}
Thời gian nộp: {job.Deadline}
Thời lượng: {job.Duration}
";

        return new RagDocument
        {
            Id = $"job_{job.Id}",
            Type = "job",
            Title = normalizedTitle,
            Content = NormalizeText(content),
            Metadata = new Dictionary<string, string>
            {
                { "job_id", job.Id.ToString() },
                { "company", job.CompanyName },
                { "category", job.Category },
                { "location", job.Location },
                { "status", job.Status },
                { "pay_min", job.PayMin.ToString() },
                { "pay_max", job.PayMax.ToString() },
                { "created_at", job.PostedAt }
            },
            CreatedAt = DateTime.UtcNow
        };
    }

    public RagDocument NormalizeUser(User user)
    {
        var content = $@"
Tên: {NormalizeText(user.FullName)}
Email: {user.Email}
Vai trò: {user.Role}
{(user.Role == "business" ? $"Công ty: {NormalizeText(user.CompanyName)}" : $"Trường: {NormalizeText(user.University)}")}
Điện thoại: {NormalizeText(user.Phone)}
Ngày tạo: {user.CreatedAt:yyyy-MM-dd}
";

        return new RagDocument
        {
            Id = $"user_{user.Id}",
            Type = "user",
            Title = NormalizeText(user.FullName),
            Content = NormalizeText(content),
            Metadata = new Dictionary<string, string>
            {
                { "user_id", user.Id.ToString() },
                { "role", user.Role },
                { "email", user.Email },
                { "company_or_university", user.Role == "business" ? user.CompanyName : user.University },
                { "created_at", user.CreatedAt.ToString("yyyy-MM-dd") }
            },
            CreatedAt = DateTime.UtcNow
        };
    }

    public RagDocument NormalizeApplication(Application app, Job? job = null)
    {
        var jobTitle = job?.Title ?? "Job";
        var jobCompany = job?.CompanyName ?? "Company";
        
        var content = $@"
Công việc ứng tuyển: {NormalizeText(jobTitle)}
Công ty: {NormalizeText(jobCompany)}
Thư giới thiệu: {NormalizeText(app.CoverLetter)}
Trạng thái: {app.Status}
Ngày ứng tuyển: {app.AppliedAt}
";

        return new RagDocument
        {
            Id = $"app_{app.Id}",
            Type = "application",
            Title = $"Application for {NormalizeText(jobTitle)}",
            Content = NormalizeText(content),
            Metadata = new Dictionary<string, string>
            {
                { "app_id", app.Id.ToString() },
                { "job_id", app.JobId.ToString() },
                { "student_id", app.StudentUserId.ToString() },
                { "status", app.Status },
                { "applied_at", app.AppliedAt }
            },
            CreatedAt = DateTime.UtcNow
        };
    }

    public string CanonicalizeSkill(string skill)
    {
        if (string.IsNullOrWhiteSpace(skill)) return string.Empty;
        var key = NormalizeText(skill);
        return _skillToCanonical.TryGetValue(key, out var canon) ? canon : skill.Trim();
    }

    public List<string> CanonicalizeSkills(IEnumerable<string> skills)
    {
        return skills
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .Select(s => CanonicalizeSkill(s))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    public string NormalizeMajorCategory(string major)
    {
        if (string.IsNullOrWhiteSpace(major)) return string.Empty;
        var key = NormalizeText(major);
        return _majorsToCanonical.TryGetValue(key, out var canon) ? canon : major.Trim();
    }

    public List<RagDocument> GetTaxonomyDocuments()
    {
        var docs = new List<RagDocument>();

        foreach (var kv in _skillToCanonical.Values.Distinct(StringComparer.OrdinalIgnoreCase))
        {
            var id = $"skill_{kv.Replace(' ', '_')}";
            docs.Add(new RagDocument
            {
                Id = id,
                Type = "skill",
                Title = kv,
                Content = NormalizeText(kv),
                Metadata = new Dictionary<string, string> { { "skill", kv } },
                CreatedAt = DateTime.UtcNow
            });
        }

        foreach (var kv in _majorsToCanonical.Values.Distinct(StringComparer.OrdinalIgnoreCase))
        {
            var id = $"major_{kv.Replace(' ', '_')}";
            docs.Add(new RagDocument
            {
                Id = id,
                Type = "major",
                Title = kv,
                Content = NormalizeText(kv),
                Metadata = new Dictionary<string, string> { { "major", kv } },
                CreatedAt = DateTime.UtcNow
            });
        }

        return docs;
    }
}
