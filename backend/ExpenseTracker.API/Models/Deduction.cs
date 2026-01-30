using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseTracker.API.Models;

public class Deduction : BaseTransaction
{
    [MaxLength(100)]
    public string? DeductionType { get; set; } // e.g., Tax, Insurance, 401k, etc.

    public int? MonthlyRecordId { get; set; }

    [ForeignKey("MonthlyRecordId")]
    public MonthlyRecord? MonthlyRecord { get; set; }
}
