using Microsoft.EntityFrameworkCore;
using Unitask.Api.Data;
using Unitask.Api.Models;
using Unitask.Api.Services;

namespace Unitask.Api.Jobs;

/// <summary>
/// Background job để đánh chỉ mục dữ liệu vào Qdrant
/// </summary>
public class RagIndexingJob
{
    private readonly IRagService _ragService;
    private readonly AppDbContext _dbContext;
    private readonly ILogger<RagIndexingJob> _logger;

    public RagIndexingJob(IRagService ragService, AppDbContext dbContext, ILogger<RagIndexingJob> logger)
    {
        _ragService = ragService;
        _dbContext = dbContext;
        _logger = logger;
    }

    /// <summary>
    /// Chạy đánh chỉ mục ban đầu
    /// </summary>
    public async Task RunInitialIndexingAsync()
    {
        _logger.LogInformation("Starting initial RAG indexing...");
        
        try
        {
            // Kiểm tra số lượng dữ liệu
            var jobCount = await _dbContext.Jobs.CountAsync();
            var userCount = await _dbContext.Users.CountAsync();
            var appCount = await _dbContext.Applications.CountAsync();

            _logger.LogInformation($"Found {jobCount} jobs, {userCount} users, {appCount} applications");

            // Đánh chỉ mục
            await _ragService.RefreshIndexAsync();

            _logger.LogInformation("Initial RAG indexing completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during initial RAG indexing");
            throw;
        }
    }

    /// <summary>
    /// Đánh chỉ mục một công việc mới
    /// </summary>
    public async Task IndexNewJobAsync(int jobId)
    {
        try
        {
            var job = await _dbContext.Jobs.FindAsync(jobId);
            if (job != null)
                await _ragService.IndexJobsAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error indexing new job {jobId}");
        }
    }

    /// <summary>
    /// Đánh chỉ mục một ứng tuyển mới
    /// </summary>
    public async Task IndexNewApplicationAsync(int appId)
    {
        try
        {
            var app = await _dbContext.Applications.Include(a => a.Job).FirstOrDefaultAsync(a => a.Id == appId);
            if (app != null)
                await _ragService.IndexApplicationsAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error indexing new application {appId}");
        }
    }
}
