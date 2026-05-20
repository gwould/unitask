using Microsoft.AspNetCore.Mvc;
using Unitask.Api.Models;
using Unitask.Api.Services;

namespace Unitask.Api.Controllers;

[ApiController]
[Route("api/career-assistant")]
public class CareerAssistantController : ControllerBase
{
    private readonly ICareerAssistantService _assistant;
    private readonly ILogger<CareerAssistantController> _logger;

    public CareerAssistantController(ICareerAssistantService assistant, ILogger<CareerAssistantController> logger)
    {
        _assistant = assistant;
        _logger = logger;
    }

    [HttpPost("chat")]
    public async Task<ActionResult<CareerChatResponse>> Chat([FromBody] CareerChatRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest("Message không thể trống");

        try
        {
            var response = await _assistant.ChatAsync(request, ct);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Career assistant chat failed");
            return StatusCode(500, new { error = "Không thể xử lý yêu cầu lúc này." });
        }
    }
}
