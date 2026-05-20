namespace Unitask.Api.Models;

public class CareerChatMessage
{
    public string Role { get; set; } = "user";
    public string Content { get; set; } = string.Empty;
}

public class CareerUserContext
{
    public string? Role { get; set; }
    public string? Major { get; set; }
    public string? University { get; set; }
    public string? CompanyName { get; set; }
    public List<string>? Skills { get; set; }
    public string? Bio { get; set; }
}

public class CareerChatRequest
{
    public string Message { get; set; } = string.Empty;
    public CareerUserContext? User { get; set; }
    public List<CareerChatMessage>? History { get; set; }
    public int TopK { get; set; } = 5;
}

public class CareerJobCardDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Pay { get; set; } = string.Empty;
    public string Deadline { get; set; } = string.Empty;
    public string LogoText { get; set; } = string.Empty;
    public string LogoGradient { get; set; } = string.Empty;
    public bool Verified { get; set; }
    public float MatchScore { get; set; }
    public List<string> MatchReasons { get; set; } = new();
    public string Category { get; set; } = string.Empty;
}

public class CareerChatResponse
{
    public string Reply { get; set; } = string.Empty;
    public List<CareerJobCardDto> Jobs { get; set; } = new();
    public List<string> FollowUpQuestions { get; set; } = new();
    public List<string> CareerPaths { get; set; } = new();
    public bool Refused { get; set; }
    public string? Summary { get; set; }
}
