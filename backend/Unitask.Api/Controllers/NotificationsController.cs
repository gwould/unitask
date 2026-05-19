using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Unitask.Api.Data;
using Unitask.Api.Models;

namespace Unitask.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _db;

    public NotificationsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Notification>>> GetAll([FromQuery] int recipientId)
    {
        var items = await _db.Notifications
            .AsNoTracking()
            .Where(n => n.RecipientUserId == recipientId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult<Notification>> Create(CreateNotificationRequest request)
    {
        var notification = new Notification
        {
            RecipientUserId = request.RecipientUserId,
            Title = request.Title.Trim(),
            Message = request.Message.Trim(),
            Type = request.Type?.Trim() ?? "system",
            ActionUrl = request.ActionUrl?.Trim(),
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
        };

        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { recipientId = notification.RecipientUserId }, notification);
    }

    [HttpPut("{id:int}/read")]
    public async Task<IActionResult> MarkRead(int id)
    {
        var notification = await _db.Notifications.FirstOrDefaultAsync(n => n.Id == id);
        if (notification == null) return NotFound();

        notification.IsRead = true;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    public record CreateNotificationRequest(
        int RecipientUserId,
        string Title,
        string Message,
        string? Type,
        string? ActionUrl
    );
}
