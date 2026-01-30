using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.API.Models;

public class ImportBatch
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string FileName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Source { get; set; } // Bank or Credit Card name

    public DateTime ImportedAt { get; set; } = DateTime.UtcNow;

    public int TotalTransactions { get; set; }

    public int ProcessedTransactions { get; set; }

    public ICollection<ImportedTransaction> Transactions { get; set; } = new List<ImportedTransaction>();
}
