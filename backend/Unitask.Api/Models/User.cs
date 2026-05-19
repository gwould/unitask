using System.ComponentModel.DataAnnotations;

namespace Unitask.Api.Models;

public class User
{
    public int Id { get; set; }

    [MaxLength(40)]
    public string? ExternalCode { get; set; }

    [Required]
    [MaxLength(120)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(160)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(120)]
    public string? Password { get; set; }

    [Required]
    [MaxLength(40)]
    public string Role { get; set; } = "student";

    [MaxLength(160)]
    public string? CompanyName { get; set; }

    [MaxLength(160)]
    public string? University { get; set; }

    [MaxLength(30)]
    public string? Phone { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Job> Jobs { get; set; } = new List<Job>();
    public ICollection<Application> Applications { get; set; } = new List<Application>();
}
