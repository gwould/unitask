using System.ComponentModel.DataAnnotations;

namespace Unitask.Api.Models;

public class Transaction
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public int? JobId { get; set; }

    public decimal Amount { get; set; }

    [MaxLength(40)]
    public string Type { get; set; } = "income";

    [MaxLength(30)]
    public string Status { get; set; } = "completed";

    [MaxLength(200)]
    public string? Note { get; set; }

    [MaxLength(200)]
    public string? Label { get; set; }

    [MaxLength(120)]
    public string? JobTitle { get; set; }

    [MaxLength(40)]
    public string CreatedAt { get; set; } = string.Empty;
}
