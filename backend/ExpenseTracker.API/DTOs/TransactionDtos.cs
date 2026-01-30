using ExpenseTracker.API.Models;

namespace ExpenseTracker.API.DTOs;

// Expense DTOs
public record ExpenseDto(
    int Id,
    string Description,
    decimal Amount,
    DateTime Date,
    string? Category,
    bool IsRecurrent,
    Frequency Frequency,
    int? MonthlyRecordId,
    DateTime CreatedAt
);

public record CreateExpenseDto(
    string Description,
    decimal Amount,
    DateTime Date,
    string? Category,
    bool IsRecurrent,
    Frequency Frequency,
    int? MonthlyRecordId
);

public record UpdateExpenseDto(
    string Description,
    decimal Amount,
    DateTime Date,
    string? Category,
    bool IsRecurrent,
    Frequency Frequency,
    int? MonthlyRecordId
);

// Income DTOs
public record IncomeDto(
    int Id,
    string Description,
    decimal Amount,
    DateTime Date,
    string? Category,
    bool IsRecurrent,
    Frequency Frequency,
    bool IsNetIncome,
    int? MonthlyRecordId,
    DateTime CreatedAt
);

public record CreateIncomeDto(
    string Description,
    decimal Amount,
    DateTime Date,
    string? Category,
    bool IsRecurrent,
    Frequency Frequency,
    bool IsNetIncome = true,
    int? MonthlyRecordId = null
);

public record UpdateIncomeDto(
    string Description,
    decimal Amount,
    DateTime Date,
    string? Category,
    bool IsRecurrent,
    Frequency Frequency,
    bool IsNetIncome,
    int? MonthlyRecordId
);

// Deduction DTOs
public record DeductionDto(
    int Id,
    string Description,
    decimal Amount,
    DateTime Date,
    string? Category,
    string? DeductionType,
    bool IsRecurrent,
    Frequency Frequency,
    int? MonthlyRecordId,
    DateTime CreatedAt
);

public record CreateDeductionDto(
    string Description,
    decimal Amount,
    DateTime Date,
    string? Category,
    string? DeductionType,
    bool IsRecurrent,
    Frequency Frequency,
    int? MonthlyRecordId
);

public record UpdateDeductionDto(
    string Description,
    decimal Amount,
    DateTime Date,
    string? Category,
    string? DeductionType,
    bool IsRecurrent,
    Frequency Frequency,
    int? MonthlyRecordId
);
