using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Unitask.Api.Models;

namespace Unitask.Api.Data.Seed;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(AppDbContext db, IWebHostEnvironment env)
    {
        if (!env.IsDevelopment()) return;
        if (await db.Jobs.AnyAsync()) return;

        var seedPath = Path.Combine(AppContext.BaseDirectory, "Data", "Seed", "seed.json");
        if (!File.Exists(seedPath)) return;

        var json = await File.ReadAllTextAsync(seedPath);
        var seed = JsonSerializer.Deserialize<SeedData>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        });

        if (seed == null) return;

        await InsertWithIdentityAsync(db, seed.Users.Select(u => new User
        {
            Id = u.Id,
            ExternalCode = u.ExternalCode,
            FullName = u.FullName,
            Email = u.Email,
            Role = u.Role,
            CompanyName = u.CompanyName,
            University = u.University,
            Phone = u.Phone,
            Password = "demo123",
            CreatedAt = DateTime.UtcNow,
        }).ToList());

        await InsertWithIdentityAsync(db, seed.Jobs.Select(j => new Job
        {
            Id = j.Id,
            Title = j.Title,
            Description = j.Description,
            CompanyName = j.CompanyName,
            CompanyCode = j.CompanyCode,
            CompanyUserId = j.CompanyUserId,
            LogoText = j.LogoText,
            LogoGradient = j.LogoGradient,
            Verified = j.Verified,
            Location = j.Location,
            Tags = j.Tags.Select(t => new JobTag { Label = t.Label, Variant = t.Variant }).ToList(),
            SpotsLeft = j.SpotsLeft,
            SpotsTotal = j.SpotsTotal,
            Pay = j.Pay,
            PayMin = j.PayMin,
            PayMax = j.PayMax,
            Deadline = j.Deadline,
            Category = j.Category,
            Featured = j.Featured,
            Duration = j.Duration,
            PostedAt = j.PostedAt,
            Skills = j.Skills,
            Requirements = j.Requirements,
            Deliverables = j.Deliverables,
            Status = "open",
        }).ToList());

        await InsertWithIdentityAsync(db, seed.Applications.Select(a => new Application
        {
            Id = a.Id,
            ExternalCode = a.ExternalCode,
            JobId = a.JobId,
            StudentUserId = a.StudentUserId,
            CoverLetter = a.CoverLetter,
            Status = a.Status,
            AppliedAt = a.AppliedAt,
        }).ToList());

        await InsertWithIdentityAsync(db, seed.Categories.Select((c, idx) => new Category
        {
            Id = idx + 1,
            Icon = c.Icon,
            Bg = c.Bg,
            Name = c.Name,
            Count = c.Count,
            Slug = c.Slug,
        }).ToList());

        await InsertWithIdentityAsync(db, seed.StudentSteps.Select(s => new HowStep
        {
            Id = s.Id,
            Type = s.Type,
            Num = s.Num,
            Icon = s.Icon,
            Title = s.Title,
            Desc = s.Desc,
        }).ToList());

        await InsertWithIdentityAsync(db, seed.BusinessSteps.Select(s => new HowStep
        {
            Id = s.Id,
            Type = s.Type,
            Num = s.Num,
            Icon = s.Icon,
            Title = s.Title,
            Desc = s.Desc,
        }).ToList());

        await InsertWithIdentityAsync(db, seed.Testimonials.Select(t => new Testimonial
        {
            Id = t.Id,
            Stars = t.Stars,
            Text = t.Text,
            AvatarLetter = t.AvatarLetter,
            AvatarGradient = t.AvatarGradient,
            Name = t.Name,
            Role = t.Role,
        }).ToList());

        await InsertWithIdentityAsync(db, seed.Features.Select(f => new Feature
        {
            Id = f.Id,
            Icon = f.Icon,
            IconBg = f.IconBg,
            Title = f.Title,
            Desc = f.Desc,
            Large = f.Large,
            List = f.List ?? new List<string>(),
        }).ToList());

        var bankMethods = new List<BankMethod>
        {
            new BankMethod
            {
                Id = 1,
                UserId = seed.Users.First().Id,
                Icon = "🏦",
                Name = "Vietcombank",
                Detail = "****1234 · Nguyễn Minh Khoa",
                IsDefault = true,
            },
            new BankMethod
            {
                Id = 2,
                UserId = seed.Users.First().Id,
                Icon = "📱",
                Name = "Ví MoMo",
                Detail = "0912***678",
                IsDefault = false,
            },
        };

        await InsertWithIdentityAsync(db, bankMethods);

        var transactions = new List<Transaction>
        {
            new Transaction
            {
                Id = 1,
                UserId = seed.Users.First().Id,
                Type = "income",
                Status = "completed",
                Label = "Thanh toán job: Frontend Developer",
                JobTitle = "Frontend Developer (React + Tailwind)",
                Amount = 3_200_000,
                CreatedAt = "2026-03-01",
            },
            new Transaction
            {
                Id = 2,
                UserId = seed.Users.First().Id,
                Type = "income",
                Status = "completed",
                Label = "Thanh toán job: Viết 10 bài SEO Blog",
                JobTitle = "Viết 10 bài SEO Blog (chuẩn EEAT)",
                Amount = 1_600_000,
                CreatedAt = "2026-02-22",
            },
        };

        await InsertWithIdentityAsync(db, transactions);
    }

    private static async Task InsertWithIdentityAsync<T>(AppDbContext db, List<T> entities) where T : class
    {
        if (entities.Count == 0) return;

        var entityType = db.Model.FindEntityType(typeof(T));
        var table = entityType?.GetTableName();
        var schema = entityType?.GetSchema();
        if (table == null) return;

        var fullName = schema == null ? table : $"{schema}.{table}";

        await db.Database.ExecuteSqlRawAsync($"SET IDENTITY_INSERT {fullName} ON");
        db.Set<T>().AddRange(entities);
        await db.SaveChangesAsync();
        await db.Database.ExecuteSqlRawAsync($"SET IDENTITY_INSERT {fullName} OFF");
    }
}
