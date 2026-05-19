using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Unitask.Api.Data;
using Unitask.Api.Models;

namespace Unitask.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;

    public AuthController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost("login")]
    public async Task<ActionResult<User>> Login(LoginRequest request)
    {
        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.Password == request.Password);

        if (user == null) return Unauthorized();
        return Ok(user);
    }

    [HttpPost("register")]
    public async Task<ActionResult<User>> Register(RegisterRequest request)
    {
        var exists = await _db.Users.AnyAsync(u => u.Email == request.Email);
        if (exists) return Conflict("Email đã tồn tại");

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim(),
            Role = request.Role.Trim(),
            CompanyName = request.CompanyName?.Trim(),
            University = request.University?.Trim(),
            Phone = request.Phone?.Trim(),
            Password = request.Password.Trim(),
            CreatedAt = DateTime.UtcNow,
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(Register), new { id = user.Id }, user);
    }

    public record LoginRequest(string Email, string Password);

    public record RegisterRequest(
        string FullName,
        string Email,
        string Password,
        string Role,
        string? CompanyName,
        string? University,
        string? Phone
    );
}
