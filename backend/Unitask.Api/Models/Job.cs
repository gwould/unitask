using System.ComponentModel.DataAnnotations;

namespace Unitask.Api.Models;

public class Job
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    [MaxLength(160)]
    public string CompanyName { get; set; } = string.Empty;

    [MaxLength(40)]
    public string CompanyCode { get; set; } = string.Empty;

    public int CompanyUserId { get; set; }

    [MaxLength(8)]
    public string LogoText { get; set; } = string.Empty;

    [MaxLength(120)]
    public string LogoGradient { get; set; } = string.Empty;

    public bool Verified { get; set; }

    public decimal PayMin { get; set; }
    public decimal PayMax { get; set; }

    [MaxLength(60)]
    public string Pay { get; set; } = string.Empty;

    [MaxLength(80)]
    public string Location { get; set; } = "Remote";

    [MaxLength(60)]
    public string Category { get; set; } = "general";

    [MaxLength(60)]
    public string Deadline { get; set; } = string.Empty;

    [MaxLength(60)]
    public string Duration { get; set; } = "Linh hoat";

    [MaxLength(30)]
    public string Status { get; set; } = "open";

    public int SpotsLeft { get; set; }
    public int SpotsTotal { get; set; }

    public bool Featured { get; set; }

    [MaxLength(40)]
    public string PostedAt { get; set; } = string.Empty;

    public List<JobTag> Tags { get; set; } = new();
    public List<string> Skills { get; set; } = new();
    public List<string> Requirements { get; set; } = new();
    public List<string> Deliverables { get; set; } = new();

    public User? CompanyUser { get; set; }
    public ICollection<Application> Applications { get; set; } = new List<Application>();
}

public class JobTag
{
    public string Label { get; set; } = string.Empty;
    public string Variant { get; set; } = string.Empty;
}
