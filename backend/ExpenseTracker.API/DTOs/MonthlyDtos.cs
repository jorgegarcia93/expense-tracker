using ExpenseTracker.API.Models;

namespace ExpenseTracker.API.DTOs;

// Monthly Record DTOs
public record MonthlyRecordDto(
    int Id,
    int Year,
    int Month,
    MonthStatus Status,
    decimal TotalIncome,
    decimal TotalExpenses,
    decimal TotalDeductions,
    decimal NetBalance,
    string? Notes,
    DateTime CreatedAt,
    DateTime? ReconciledAt,
    DateTime? LockedAt
);

public record MonthlyRecordDetailDto(
    int Id,
    int Year,
    int Month,
    MonthStatus Status,
    decimal TotalIncome,
    decimal TotalExpenses,
    decimal TotalDeductions,
    decimal NetBalance,
    string? Notes,
    DateTime CreatedAt,
    DateTime? ReconciledAt,
    DateTime? LockedAt,
    IEnumerable<ExpenseDto> Expenses,
    IEnumerable<IncomeDto> Incomes,
    IEnumerable<DeductionDto> Deductions
);

public record CreateMonthlyRecordDto(
    int Year,
    int Month,
    string? Notes
);

public record UpdateMonthlyRecordDto(
    string? Notes
);

public record ReconcileMonthDto(
    string? Notes
);

// Comparison/Trends DTOs
public record MonthComparisonDto(
    int Year,
    int Month,
    decimal TotalIncome,
    decimal TotalExpenses,
    decimal TotalDeductions,
    decimal NetBalance,
    Dictionary<string, decimal> ExpensesByCategory,
    Dictionary<string, decimal> IncomeByCategory
);

public record TrendAnalysisDto(
    IEnumerable<MonthComparisonDto> MonthlyData,
    decimal AverageMonthlyIncome,
    decimal AverageMonthlyExpense,
    decimal AverageMonthlyDeductions,
    decimal AverageNetBalance,
    string? TopExpenseCategory,
    string? TopIncomeCategory
);
