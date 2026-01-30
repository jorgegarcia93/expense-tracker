using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseTracker.API.Models;

public class MonthlyRecord
{
    [Key]
    public int Id { get; set; }

    public int Year { get; set; }

    public int Month { get; set; }

    public MonthStatus Status { get; set; } = MonthStatus.Open;

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalIncome { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalExpenses { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalDeductions { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal NetBalance { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ReconciledAt { get; set; }

    public DateTime? LockedAt { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    public ICollection<Income> Incomes { get; set; } = new List<Income>();
    public ICollection<Deduction> Deductions { get; set; } = new List<Deduction>();
}
