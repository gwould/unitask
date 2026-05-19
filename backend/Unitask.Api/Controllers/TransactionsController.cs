using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Unitask.Api.Data;
using Unitask.Api.Models;

namespace Unitask.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public TransactionsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Transaction>>> GetAll([FromQuery] int userId)
    {
        var items = await _db.Transactions
            .AsNoTracking()
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult<Transaction>> Create(CreateTransactionRequest request)
    {
        var tx = new Transaction
        {
            UserId = request.UserId,
            JobId = request.JobId,
            Amount = request.Amount,
            Type = request.Type ?? "income",
            Status = request.Status ?? "completed",
            Note = request.Note?.Trim(),
            Label = request.Label?.Trim(),
            JobTitle = request.JobTitle?.Trim(),
            CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd"),
        };

        _db.Transactions.Add(tx);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { userId = tx.UserId }, tx);
    }

    public record CreateTransactionRequest(
        int UserId,
        int? JobId,
        decimal Amount,
        string? Type,
        string? Status,
        string? Label,
        string? JobTitle,
        string? Note
    );
}
