using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Unitask.Api.Data;
using Unitask.Api.Models;

namespace Unitask.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HowStepsController : ControllerBase
{
    private readonly AppDbContext _db;

    public HowStepsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<HowStep>>> GetAll([FromQuery] string? type)
    {
        IQueryable<HowStep> query = _db.HowSteps.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(type))
        {
            query = query.Where(s => s.Type == type);
        }
        return Ok(await query.OrderBy(s => s.Id).ToListAsync());
    }
}
