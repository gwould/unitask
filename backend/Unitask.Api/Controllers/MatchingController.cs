using Microsoft.AspNetCore.Mvc;
using Unitask.Api.Services;

namespace Unitask.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MatchingController : ControllerBase
{
    private readonly IAiMatchingService _matchingService;
    private readonly ILogger<MatchingController> _logger;

    public MatchingController(IAiMatchingService matchingService, ILogger<MatchingController> logger)
    {
        _matchingService = matchingService;
        _logger = logger;
    }

    [HttpPost("recommendations")]
    public async Task<ActionResult<AiMatchResponse>> GetRecommendations([FromBody] AiMatchRequest request)
    {
        try
        {
            var response = await _matchingService.RecommendAsync(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating AI recommendations");
            return StatusCode(500, new { error = "Không thể tạo đề xuất AI lúc này." });
        }
    }
}