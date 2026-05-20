using Microsoft.AspNetCore.Mvc;
using Unitask.Api.Models;
using Unitask.Api.Services;

namespace Unitask.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RagController : ControllerBase
{
    private readonly IRagService _ragService;
    private readonly ILogger<RagController> _logger;

    public RagController(IRagService ragService, ILogger<RagController> logger)
    {
        _ragService = ragService;
        _logger = logger;
    }

    /// <summary>
    /// Truy vấn RAG - tìm kiếm thông tin và tạo phản hồi từ LLM
    /// </summary>
    [HttpPost("query")]
    public async Task<ActionResult<RagQueryResponse>> Query([FromBody] RagQueryRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Query))
            return BadRequest("Query không thể trống");

        try
        {
            var result = await _ragService.QueryAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing RAG query");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Tìm kiếm các tài liệu tương tự
    /// </summary>
    [HttpPost("search")]
    public async Task<ActionResult<List<RagSearchResult>>> Search([FromBody] RagQueryRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Query))
            return BadRequest("Query không thể trống");

        try
        {
            var results = await _ragService.SearchSimilarAsync(request.Query, request.TopK, request.DocumentType);
            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching RAG");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Cập nhật index - đánh chỉ mục lại toàn bộ dữ liệu
    /// </summary>
    [HttpPost("index/refresh")]
    public async Task<ActionResult> RefreshIndex()
    {
        try
        {
            await _ragService.RefreshIndexAsync();
            return Ok(new { message = "Index đã được cập nhật thành công" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing RAG index");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Đánh chỉ mục các công việc
    /// </summary>
    [HttpPost("index/jobs")]
    public async Task<ActionResult> IndexJobs()
    {
        try
        {
            await _ragService.IndexJobsAsync();
            return Ok(new { message = "Jobs đã được đánh chỉ mục" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error indexing jobs");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Đánh chỉ mục các người dùng
    /// </summary>
    [HttpPost("index/users")]
    public async Task<ActionResult> IndexUsers()
    {
        try
        {
            await _ragService.IndexUsersAsync();
            return Ok(new { message = "Users đã được đánh chỉ mục" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error indexing users");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Đánh chỉ mục các ứng tuyển
    /// </summary>
    [HttpPost("index/applications")]
    public async Task<ActionResult> IndexApplications()
    {
        try
        {
            await _ragService.IndexApplicationsAsync();
            return Ok(new { message = "Applications đã được đánh chỉ mục" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error indexing applications");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Kiểm tra sức khỏe của hệ thống RAG
    /// </summary>
    [HttpGet("health")]
    public async Task<ActionResult> Health()
    {
        try
        {
            var isHealthy = await _ragService.HealthCheckAsync();
            if (isHealthy)
                return Ok(new { status = "healthy", message = "RAG system is operational" });
            else
                return StatusCode(503, new { status = "unhealthy", message = "RAG system is not accessible" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking RAG health");
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
