using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using ExpenseTracker.API.Data;
using ExpenseTracker.API.DTOs;
using ExpenseTracker.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.API.Services;

public interface ICsvImportService
{
    Task<ImportBatchDto> ImportCsvAsync(Stream csvStream, CsvImportConfigDto config);
    Task<IEnumerable<ImportBatchDto>> GetAllBatchesAsync();
    Task<ImportBatchDto?> GetBatchByIdAsync(int id);
    Task<IEnumerable<ImportedTransactionDto>> GetPendingTransactionsAsync();
    Task<ImportedTransactionDto?> ReviewTransactionAsync(int id, ReviewImportedTransactionDto dto);
    Task<bool> AddTransactionToMonthAsync(int transactionId, int monthlyRecordId);
    Task<bool> IgnoreTransactionAsync(int id);
    Task<int> AddAllReviewedToMonthAsync(int batchId, int monthlyRecordId);
}

public class CsvImportService : ICsvImportService
{
    private readonly ExpenseTrackerDbContext _context;

    public CsvImportService(ExpenseTrackerDbContext context)
    {
        _context = context;
    }

    public async Task<ImportBatchDto> ImportCsvAsync(Stream csvStream, CsvImportConfigDto config)
    {
        var batch = new ImportBatch
        {
            FileName = $"Import_{DateTime.UtcNow:yyyyMMdd_HHmmss}",
            Source = config.Source,
            ImportedAt = DateTime.UtcNow
        };

        _context.ImportBatches.Add(batch);
        await _context.SaveChangesAsync();

        var transactions = new List<ImportedTransaction>();

        using var reader = new StreamReader(csvStream);
        var csvConfig = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = config.HasHeader,
            MissingFieldFound = null,
            BadDataFound = null
        };

        using var csv = new CsvReader(reader, csvConfig);

        if (config.HasHeader)
        {
            await csv.ReadAsync();
            csv.ReadHeader();
        }

        while (await csv.ReadAsync())
        {
            try
            {
                var rawLine = csv.Parser.RawRecord;
                var dateStr = csv.GetField(config.DateColumnIndex);
                var description = csv.GetField(config.DescriptionColumnIndex);
                var amountStr = csv.GetField(config.AmountColumnIndex);
                var category = config.CategoryColumnIndex.HasValue
                    ? csv.GetField(config.CategoryColumnIndex.Value)
                    : null;

                if (string.IsNullOrWhiteSpace(dateStr) || string.IsNullOrWhiteSpace(amountStr))
                    continue;

                DateTime.TryParseExact(dateStr, config.DateFormat, CultureInfo.InvariantCulture,
                    DateTimeStyles.None, out var date);

                decimal.TryParse(amountStr.Replace("$", "").Replace(",", "").Trim(),
                    NumberStyles.Any, CultureInfo.InvariantCulture, out var amount);

                var transaction = new ImportedTransaction
                {
                    Description = description?.Trim() ?? "Unknown",
                    Amount = Math.Abs(amount),
                    TransactionDate = date,
                    Category = category?.Trim(),
                    Source = config.Source,
                    Status = ImportedTransactionStatus.Pending,
                    ImportBatchId = batch.Id,
                    OriginalData = rawLine?.Trim(),
                    CreatedAt = DateTime.UtcNow
                };

                // Negative amounts typically indicate expenses
                if (amount < 0)
                {
                    transaction.AssignedType = TransactionType.Expense;
                }

                transactions.Add(transaction);
            }
            catch
            {
                // Skip malformed rows
                continue;
            }
        }

        _context.ImportedTransactions.AddRange(transactions);
        batch.TotalTransactions = transactions.Count;
        await _context.SaveChangesAsync();

        return MapBatchToDto(batch, transactions);
    }

    public async Task<IEnumerable<ImportBatchDto>> GetAllBatchesAsync()
    {
        var batches = await _context.ImportBatches
            .Include(b => b.Transactions)
            .OrderByDescending(b => b.ImportedAt)
            .ToListAsync();

        return batches.Select(b => MapBatchToDto(b, b.Transactions));
    }

    public async Task<ImportBatchDto?> GetBatchByIdAsync(int id)
    {
        var batch = await _context.ImportBatches
            .Include(b => b.Transactions)
            .FirstOrDefaultAsync(b => b.Id == id);

        return batch == null ? null : MapBatchToDto(batch, batch.Transactions);
    }

    public async Task<IEnumerable<ImportedTransactionDto>> GetPendingTransactionsAsync()
    {
        return await _context.ImportedTransactions
            .Where(t => t.Status == ImportedTransactionStatus.Pending)
            .OrderByDescending(t => t.TransactionDate)
            .Select(t => MapTransactionToDto(t))
            .ToListAsync();
    }

    public async Task<ImportedTransactionDto?> ReviewTransactionAsync(int id, ReviewImportedTransactionDto dto)
    {
        var transaction = await _context.ImportedTransactions.FindAsync(id);
        if (transaction == null) return null;

        transaction.AssignedType = dto.AssignedType;
        transaction.Category = dto.Category;
        transaction.IsRecurrent = dto.IsRecurrent;
        transaction.Frequency = dto.Frequency;
        transaction.Status = ImportedTransactionStatus.Reviewed;
        transaction.ReviewedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        if (dto.MonthlyRecordId.HasValue)
        {
            await AddTransactionToMonthAsync(id, dto.MonthlyRecordId.Value);
        }

        return MapTransactionToDto(transaction);
    }

    public async Task<bool> AddTransactionToMonthAsync(int transactionId, int monthlyRecordId)
    {
        var transaction = await _context.ImportedTransactions.FindAsync(transactionId);
        var monthlyRecord = await _context.MonthlyRecords.FindAsync(monthlyRecordId);

        if (transaction == null || monthlyRecord == null)
            return false;

        if (monthlyRecord.Status == MonthStatus.Locked || monthlyRecord.Status == MonthStatus.Reconciled)
            return false;

        switch (transaction.AssignedType)
        {
            case TransactionType.Expense:
                var expense = new Expense
                {
                    Description = transaction.Description,
                    Amount = transaction.Amount,
                    Date = transaction.TransactionDate,
                    Category = transaction.Category,
                    IsRecurrent = transaction.IsRecurrent,
                    Frequency = transaction.Frequency,
                    MonthlyRecordId = monthlyRecordId,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Expenses.Add(expense);
                break;

            case TransactionType.Income:
                var income = new Income
                {
                    Description = transaction.Description,
                    Amount = transaction.Amount,
                    Date = transaction.TransactionDate,
                    Category = transaction.Category,
                    IsRecurrent = transaction.IsRecurrent,
                    Frequency = transaction.Frequency,
                    IsNetIncome = true,
                    MonthlyRecordId = monthlyRecordId,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Incomes.Add(income);
                break;

            case TransactionType.Deduction:
                var deduction = new Deduction
                {
                    Description = transaction.Description,
                    Amount = transaction.Amount,
                    Date = transaction.TransactionDate,
                    Category = transaction.Category,
                    IsRecurrent = transaction.IsRecurrent,
                    Frequency = transaction.Frequency,
                    MonthlyRecordId = monthlyRecordId,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Deductions.Add(deduction);
                break;

            default:
                return false;
        }

        transaction.Status = ImportedTransactionStatus.AddedToMonth;
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> IgnoreTransactionAsync(int id)
    {
        var transaction = await _context.ImportedTransactions.FindAsync(id);
        if (transaction == null) return false;

        transaction.Status = ImportedTransactionStatus.Ignored;
        transaction.ReviewedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<int> AddAllReviewedToMonthAsync(int batchId, int monthlyRecordId)
    {
        var reviewedTransactions = await _context.ImportedTransactions
            .Where(t => t.ImportBatchId == batchId && t.Status == ImportedTransactionStatus.Reviewed)
            .ToListAsync();

        var count = 0;
        foreach (var transaction in reviewedTransactions)
        {
            if (await AddTransactionToMonthAsync(transaction.Id, monthlyRecordId))
            {
                count++;
            }
        }

        // Update batch processed count
        var batch = await _context.ImportBatches.FindAsync(batchId);
        if (batch != null)
        {
            batch.ProcessedTransactions = await _context.ImportedTransactions
                .CountAsync(t => t.ImportBatchId == batchId && t.Status == ImportedTransactionStatus.AddedToMonth);
            await _context.SaveChangesAsync();
        }

        return count;
    }

    private static ImportBatchDto MapBatchToDto(ImportBatch batch, IEnumerable<ImportedTransaction> transactions) => new(
        batch.Id,
        batch.FileName,
        batch.Source,
        batch.ImportedAt,
        batch.TotalTransactions,
        batch.ProcessedTransactions,
        transactions.Select(MapTransactionToDto)
    );

    private static ImportedTransactionDto MapTransactionToDto(ImportedTransaction t) => new(
        t.Id,
        t.Description,
        t.Amount,
        t.TransactionDate,
        t.Category,
        t.Source,
        t.Status,
        t.AssignedType,
        t.IsRecurrent,
        t.Frequency,
        t.ImportBatchId,
        t.CreatedAt,
        t.ReviewedAt
    );
}
