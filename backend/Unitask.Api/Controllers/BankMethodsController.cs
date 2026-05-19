using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Unitask.Api.Data;
using Unitask.Api.Models;

namespace Unitask.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BankMethodsController : ControllerBase
{
    private readonly AppDbContext _db;

    public BankMethodsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BankMethod>>> GetAll([FromQuery] int userId)
    {
        var items = await _db.BankMethods
            .AsNoTracking()
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.IsDefault)
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult<BankMethod>> Create(CreateBankMethodRequest request)
    {
        var method = new BankMethod
        {
            UserId = request.UserId,
            Icon = request.Icon.Trim(),
            Name = request.Name.Trim(),
            Detail = request.Detail.Trim(),
            IsDefault = request.IsDefault,
        };

        _db.BankMethods.Add(method);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { userId = method.UserId }, method);
    }

    public record CreateBankMethodRequest(int UserId, string Icon, string Name, string Detail, bool IsDefault);
}
