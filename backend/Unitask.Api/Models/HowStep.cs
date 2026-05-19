using System.ComponentModel.DataAnnotations;

namespace Unitask.Api.Models;

public class HowStep
{
    public int Id { get; set; }

    [MaxLength(20)]
    public string Type { get; set; } = "student";

    [MaxLength(6)]
    public string Num { get; set; } = string.Empty;

    [MaxLength(10)]
    public string Icon { get; set; } = string.Empty;

    [MaxLength(120)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(400)]
    public string Desc { get; set; } = string.Empty;
}
