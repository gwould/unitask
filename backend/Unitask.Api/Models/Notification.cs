using System.ComponentModel.DataAnnotations;

namespace Unitask.Api.Models;

public class Notification
{
    public int Id { get; set; }

    public int RecipientUserId { get; set; }

    [Required]
    [MaxLength(160)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(800)]
    public string Message { get; set; } = string.Empty;

    [MaxLength(40)]
    public string Type { get; set; } = "system";

    public bool IsRead { get; set; }

    [MaxLength(220)]
    public string? ActionUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
