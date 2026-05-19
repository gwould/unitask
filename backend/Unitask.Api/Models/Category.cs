using System.ComponentModel.DataAnnotations;

namespace Unitask.Api.Models;

public class Category
{
    public int Id { get; set; }

    [MaxLength(10)]
    public string Icon { get; set; } = string.Empty;

    [MaxLength(60)]
    public string Bg { get; set; } = string.Empty;

    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(80)]
    public string Count { get; set; } = string.Empty;

    [MaxLength(40)]
    public string Slug { get; set; } = string.Empty;
}
