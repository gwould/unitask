using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Unitask.Api.Data;
using Unitask.Api.Models;

namespace Unitask.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobsController : ControllerBase
{
    private readonly AppDbContext _db;

    public JobsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Job>>> GetAll([FromQuery] int? companyId)
    {
        IQueryable<Job> query = _db.Jobs.AsNoTracking();
        if (companyId.HasValue)
        {
            query = query.Where(j => j.CompanyUserId == companyId.Value);
        }
        return Ok(await query.OrderByDescending(j => j.PostedAt).ToListAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Job>> GetById(int id)
    {
        var job = await _db.Jobs.AsNoTracking().FirstOrDefaultAsync(j => j.Id == id);
        if (job == null) return NotFound();
        return Ok(job);
    }

    [HttpPost]
    public async Task<ActionResult<Job>> Create(CreateJobRequest request)
    {
        var job = new Job
        {
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            CompanyName = request.CompanyName.Trim(),
            CompanyCode = request.CompanyCode?.Trim() ?? string.Empty,
            CompanyUserId = request.CompanyUserId,
            PayMin = request.PayMin,
            PayMax = request.PayMax,
            Pay = request.Pay?.Trim() ?? string.Empty,
            Location = request.Location?.Trim() ?? "Remote",
            Category = request.Category?.Trim() ?? "general",
            Deadline = request.Deadline?.Trim() ?? string.Empty,
            Duration = request.Duration?.Trim() ?? "Linh hoat",
            LogoText = request.LogoText?.Trim() ?? string.Empty,
            LogoGradient = request.LogoGradient?.Trim() ?? string.Empty,
            Verified = request.Verified,
            SpotsLeft = request.SpotsLeft,
            SpotsTotal = request.SpotsTotal,
            Featured = request.Featured,
            Status = "open",
            PostedAt = request.PostedAt?.Trim() ?? DateTime.UtcNow.ToString("yyyy-MM-dd"),
            Tags = request.Tags ?? new List<JobTag>(),
            Skills = request.Skills ?? new List<string>(),
            Requirements = request.Requirements ?? new List<string>(),
            Deliverables = request.Deliverables ?? new List<string>(),
        };

        _db.Jobs.Add(job);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = job.Id }, job);
    }

    public record CreateJobRequest(
        string Title,
        string Description,
        string CompanyName,
        int CompanyUserId,
        decimal PayMin,
        decimal PayMax,
        string? Pay,
        string? Deadline,
        string? Location,
        string? Category,
        string? Duration,
        string? CompanyCode,
        string? LogoText,
        string? LogoGradient,
        bool Verified,
        int SpotsLeft,
        int SpotsTotal,
        bool Featured,
        string? PostedAt,
        List<JobTag>? Tags,
        List<string>? Skills,
        List<string>? Requirements,
        List<string>? Deliverables
    );
}
