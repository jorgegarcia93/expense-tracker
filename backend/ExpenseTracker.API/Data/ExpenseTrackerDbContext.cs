using Microsoft.EntityFrameworkCore;
using ExpenseTracker.API.Models;

namespace ExpenseTracker.API.Data;

public class ExpenseTrackerDbContext : DbContext
{
    public ExpenseTrackerDbContext(DbContextOptions<ExpenseTrackerDbContext> options)
        : base(options)
    {
    }

    public DbSet<Expense> Expenses { get; set; }
    public DbSet<Income> Incomes { get; set; }
    public DbSet<Deduction> Deductions { get; set; }
    public DbSet<ImportedTransaction> ImportedTransactions { get; set; }
    public DbSet<ImportBatch> ImportBatches { get; set; }
    public DbSet<MonthlyRecord> MonthlyRecords { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure unique index for MonthlyRecord (Year, Month)
        modelBuilder.Entity<MonthlyRecord>()
            .HasIndex(m => new { m.Year, m.Month })
            .IsUnique();

        // Configure relationships
        modelBuilder.Entity<Expense>()
            .HasOne(e => e.MonthlyRecord)
            .WithMany(m => m.Expenses)
            .HasForeignKey(e => e.MonthlyRecordId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Income>()
            .HasOne(i => i.MonthlyRecord)
            .WithMany(m => m.Incomes)
            .HasForeignKey(i => i.MonthlyRecordId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Deduction>()
            .HasOne(d => d.MonthlyRecord)
            .WithMany(m => m.Deductions)
            .HasForeignKey(d => d.MonthlyRecordId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<ImportedTransaction>()
            .HasOne(it => it.ImportBatch)
            .WithMany(ib => ib.Transactions)
            .HasForeignKey(it => it.ImportBatchId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
