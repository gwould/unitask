using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Unitask.Api.Data;
using Unitask.Api.Helpers;
using Unitask.Api.Models;

namespace Unitask.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApplicationsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ApplicationsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Application>>> GetAll([FromQuery] string? studentId, [FromQuery] int? jobId)
    {
        IQueryable<Application> query = _db.Applications.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(studentId))
        {
            var resolvedId = await UserIdResolver.ResolveUserIdAsync(_db, studentId);
            if (!resolvedId.HasValue)
            {
                return BadRequest($"Invalid student id: {studentId}");
            }
            query = query.Where(a => a.StudentUserId == resolvedId.Value);
        }
        if (jobId.HasValue)
        {
            query = query.Where(a => a.JobId == jobId.Value);
        }
        return Ok(await query.OrderByDescending(a => a.AppliedAt).ToListAsync());
    }

    [HttpPost]
    public async Task<ActionResult<Application>> Create(CreateApplicationRequest request)
    {
        var studentUserId = await UserIdResolver.ResolveUserIdAsync(_db, request.StudentUserId);
        if (!studentUserId.HasValue)
        {
            return BadRequest($"Invalid student id: {request.StudentUserId}");
        }

        var application = new Application
        {
            JobId = request.JobId,
            StudentUserId = studentUserId.Value,
            CoverLetter = request.CoverLetter.Trim(),
            Status = "pending",
            AppliedAt = DateTime.UtcNow.ToString("yyyy-MM-dd"),
        };

        _db.Applications.Add(application);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { studentId = application.StudentUserId }, application);
    }

    [HttpPut("{id:int}/status")]
    public async Task<ActionResult<Application>> UpdateStatus(int id, UpdateApplicationStatusRequest request)
    {
        var application = await _db.Applications.FirstOrDefaultAsync(a => a.Id == id);
        if (application == null)
        {
            return NotFound();
        }

        application.Status = request.Status;
        await _db.SaveChangesAsync();

        return Ok(application);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var application = await _db.Applications.FirstOrDefaultAsync(a => a.Id == id);
        if (application == null)
        {
            return NotFound();
        }

        _db.Applications.Remove(application);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    public record CreateApplicationRequest(int JobId, string StudentUserId, string CoverLetter);

    public record UpdateApplicationStatusRequest(string Status);
}
