namespace ExpenseTracker.API.Models;

public enum Frequency
{
    OneTime = 0,
    Daily = 1,
    Weekly = 2,
    BiWeekly = 3,
    Monthly = 4,
    Quarterly = 5,
    Yearly = 6
}

public enum TransactionType
{
    Expense = 0,
    Income = 1,
    Deduction = 2
}

public enum ImportedTransactionStatus
{
    Pending = 0,
    Reviewed = 1,
    AddedToMonth = 2,
    Ignored = 3
}

public enum MonthStatus
{
    Open = 0,
    Locked = 1,
    Reconciled = 2
}
