using ExpenseTracker.API.Models;

namespace ExpenseTracker.API.DTOs;

// Import DTOs
public record ImportedTransactionDto(
    int Id,
    string Description,
    decimal Amount,
    DateTime TransactionDate,
    string? Category,
    string? Source,
    ImportedTransactionStatus Status,
    TransactionType? AssignedType,
    bool IsRecurrent,
    Frequency Frequency,
    int ImportBatchId,
    DateTime CreatedAt,
    DateTime? ReviewedAt
);

public record ReviewImportedTransactionDto(
    TransactionType AssignedType,
    string? Category,
    bool IsRecurrent,
    Frequency Frequency,
    int? MonthlyRecordId // Optional - to add to a specific month
);

public record ImportBatchDto(
    int Id,
    string FileName,
    string? Source,
    DateTime ImportedAt,
    int TotalTransactions,
    int ProcessedTransactions,
    IEnumerable<ImportedTransactionDto> Transactions
);

public record CreateImportBatchDto(
    string FileName,
    string? Source
);

// CSV Import configuration
public record CsvImportConfigDto(
    int DateColumnIndex,
    int DescriptionColumnIndex,
    int AmountColumnIndex,
    int? CategoryColumnIndex,
    string DateFormat,
    bool HasHeader,
    string? Source
);
