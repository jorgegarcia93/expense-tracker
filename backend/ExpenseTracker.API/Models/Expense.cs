using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseTracker.API.Models;

public class Expense : BaseTransaction
{
    public int? MonthlyRecordId { get; set; }

    [ForeignKey("MonthlyRecordId")]
    public MonthlyRecord? MonthlyRecord { get; set; }
}
