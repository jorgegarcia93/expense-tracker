using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseTracker.API.Models;

public class ImportedTransaction
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Description { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    public DateTime TransactionDate { get; set; }

    [MaxLength(100)]
    public string? Category { get; set; }

    [MaxLength(50)]
    public string? Source { get; set; } // Bank name or credit card

    public ImportedTransactionStatus Status { get; set; } = ImportedTransactionStatus.Pending;

    public TransactionType? AssignedType { get; set; }

    public bool IsRecurrent { get; set; }

    public Frequency Frequency { get; set; } = Frequency.OneTime;

    [MaxLength(500)]
    public string? OriginalData { get; set; } // Raw CSV line for reference

    public int ImportBatchId { get; set; }

    [ForeignKey("ImportBatchId")]
    public ImportBatch ImportBatch { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ReviewedAt { get; set; }
}
