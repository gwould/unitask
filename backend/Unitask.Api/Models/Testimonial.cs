using System.ComponentModel.DataAnnotations;

namespace Unitask.Api.Models;

public class Testimonial
{
    public int Id { get; set; }

    public int Stars { get; set; }

    [MaxLength(600)]
    public string Text { get; set; } = string.Empty;

    [MaxLength(6)]
    public string AvatarLetter { get; set; } = string.Empty;

    [MaxLength(80)]
    public string AvatarGradient { get; set; } = string.Empty;

    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(160)]
    public string Role { get; set; } = string.Empty;
}
