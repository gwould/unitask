using System.ComponentModel.DataAnnotations;

namespace Unitask.Api.Models;

public class Feature
{
    public int Id { get; set; }

    [MaxLength(10)]
    public string Icon { get; set; } = string.Empty;

    [MaxLength(80)]
    public string IconBg { get; set; } = string.Empty;

    [MaxLength(140)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(400)]
    public string Desc { get; set; } = string.Empty;

    public bool Large { get; set; }

    public List<string> List { get; set; } = new();
}
