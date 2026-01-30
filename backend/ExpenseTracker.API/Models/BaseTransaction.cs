using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseTracker.API.Models;

public abstract class BaseTransaction
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Description { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    public DateTime Date { get; set; }

    [MaxLength(100)]
    public string? Category { get; set; }

    public bool IsRecurrent { get; set; }

    public Frequency Frequency { get; set; } = Frequency.OneTime;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
