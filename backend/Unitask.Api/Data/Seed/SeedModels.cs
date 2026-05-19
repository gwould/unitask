namespace Unitask.Api.Data.Seed;

public class SeedData
{
    public List<SeedUser> Users { get; set; } = new();
    public List<SeedJob> Jobs { get; set; } = new();
    public List<SeedApplication> Applications { get; set; } = new();
    public List<SeedCategory> Categories { get; set; } = new();
    public List<SeedHowStep> StudentSteps { get; set; } = new();
    public List<SeedHowStep> BusinessSteps { get; set; } = new();
    public List<SeedTestimonial> Testimonials { get; set; } = new();
    public List<SeedFeature> Features { get; set; } = new();
}

public record SeedUser(
    int Id,
    string ExternalCode,
    string FullName,
    string Email,
    string Role,
    string? CompanyName,
    string? University,
    string? Phone
);

public record SeedJob(
    int Id,
    string Title,
    string Description,
    string CompanyName,
    string CompanyCode,
    int CompanyUserId,
    string LogoText,
    string LogoGradient,
    bool Verified,
    string Location,
    List<SeedJobTag> Tags,
    int SpotsLeft,
    int SpotsTotal,
    string Pay,
    decimal PayMin,
    decimal PayMax,
    string Deadline,
    string Category,
    bool Featured,
    string Duration,
    string PostedAt,
    List<string> Skills,
    List<string> Requirements,
    List<string> Deliverables
);

public record SeedJobTag(string Label, string Variant);

public record SeedApplication(
    int Id,
    string ExternalCode,
    int JobId,
    int StudentUserId,
    string CoverLetter,
    string Status,
    string AppliedAt
);

public record SeedCategory(
    string Icon,
    string Bg,
    string Name,
    string Count,
    string Slug
);

public record SeedHowStep(
    int Id,
    string Type,
    string Num,
    string Icon,
    string Title,
    string Desc
);

public record SeedTestimonial(
    int Id,
    int Stars,
    string Text,
    string AvatarLetter,
    string AvatarGradient,
    string Name,
    string Role
);

public record SeedFeature(
    int Id,
    string Icon,
    string IconBg,
    string Title,
    string Desc,
    bool Large,
    List<string>? List
);
