using System.ComponentModel.DataAnnotations;

namespace Unitask.Api.Models;

public class BankMethod
{
    public int Id { get; set; }

    public int UserId { get; set; }

    [MaxLength(10)]
    public string Icon { get; set; } = string.Empty;

    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(160)]
    public string Detail { get; set; } = string.Empty;

    public bool IsDefault { get; set; }
}
