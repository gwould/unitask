using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Unitask.Api.Models;

namespace Unitask.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Job> Jobs => Set<Job>();
    public DbSet<Application> Applications => Set<Application>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<HowStep> HowSteps => Set<HowStep>();
    public DbSet<Testimonial> Testimonials => Set<Testimonial>();
    public DbSet<Feature> Features => Set<Feature>();
    public DbSet<BankMethod> BankMethods => Set<BankMethod>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        };

        var stringListConverter = new ValueConverter<List<string>, string>(
            v => JsonSerializer.Serialize(v, jsonOptions),
            v => string.IsNullOrWhiteSpace(v)
                ? new List<string>()
                : JsonSerializer.Deserialize<List<string>>(v, jsonOptions) ?? new List<string>()
        );

        var tagListConverter = new ValueConverter<List<JobTag>, string>(
            v => JsonSerializer.Serialize(v, jsonOptions),
            v => string.IsNullOrWhiteSpace(v)
                ? new List<JobTag>()
                : JsonSerializer.Deserialize<List<JobTag>>(v, jsonOptions) ?? new List<JobTag>()
        );

        modelBuilder.Entity<Job>()
            .Property(j => j.Tags)
            .HasConversion(tagListConverter);

        modelBuilder.Entity<Job>()
            .Property(j => j.Skills)
            .HasConversion(stringListConverter);

        modelBuilder.Entity<Job>()
            .Property(j => j.Requirements)
            .HasConversion(stringListConverter);

        modelBuilder.Entity<Job>()
            .Property(j => j.Deliverables)
            .HasConversion(stringListConverter);

        modelBuilder.Entity<Feature>()
            .Property(f => f.List)
            .HasConversion(stringListConverter);

        modelBuilder.Entity<User>()
            .HasMany(u => u.Jobs)
            .WithOne(j => j.CompanyUser)
            .HasForeignKey(j => j.CompanyUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<User>()
            .HasMany(u => u.Applications)
            .WithOne(a => a.StudentUser)
            .HasForeignKey(a => a.StudentUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Job>()
            .HasMany(j => j.Applications)
            .WithOne(a => a.Job)
            .HasForeignKey(a => a.JobId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
