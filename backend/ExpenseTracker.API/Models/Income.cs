using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseTracker.API.Models;

public class Income : BaseTransaction
{
    // This represents net income (after taxes)
    public bool IsNetIncome { get; set; } = true;

    public int? MonthlyRecordId { get; set; }

    [ForeignKey("MonthlyRecordId")]
    public MonthlyRecord? MonthlyRecord { get; set; }
}
