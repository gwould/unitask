using Microsoft.EntityFrameworkCore;
using Unitask.Api.Data;

namespace Unitask.Api.Helpers;

public static class UserIdResolver
{
    /// <summary>
    /// Resolves a user id from numeric id or external code (e.g. "stu-1", "biz-1").
    /// </summary>
    public static async Task<int?> ResolveUserIdAsync(AppDbContext db, string? idOrCode, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(idOrCode))
        {
            return null;
        }

        var trimmed = idOrCode.Trim();
        if (int.TryParse(trimmed, out var numericId))
        {
            var exists = await db.Users.AsNoTracking().AnyAsync(u => u.Id == numericId, ct);
            return exists ? numericId : null;
        }

        return await db.Users.AsNoTracking()
            .Where(u => u.ExternalCode == trimmed)
            .Select(u => (int?)u.Id)
            .FirstOrDefaultAsync(ct);
    }
}
