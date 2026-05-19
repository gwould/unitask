using System.ComponentModel.DataAnnotations;

namespace Unitask.Api.Models;

public class Application
{
    public int Id { get; set; }

    [MaxLength(40)]
    public string? ExternalCode { get; set; }

    public int JobId { get; set; }
    public int StudentUserId { get; set; }

    [Required]
    public string CoverLetter { get; set; } = string.Empty;

    [MaxLength(30)]
    public string Status { get; set; } = "pending";

    [MaxLength(40)]
    public string AppliedAt { get; set; } = string.Empty;

    public Job? Job { get; set; }
    public User? StudentUser { get; set; }
}
