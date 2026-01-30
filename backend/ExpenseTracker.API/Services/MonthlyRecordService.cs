using ExpenseTracker.API.Data;
using ExpenseTracker.API.DTOs;
using ExpenseTracker.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.API.Services;

public interface IMonthlyRecordService
{
    Task<IEnumerable<MonthlyRecordDto>> GetAllAsync();
    Task<MonthlyRecordDetailDto?> GetByIdAsync(int id);
    Task<MonthlyRecordDetailDto?> GetByYearMonthAsync(int year, int month);
    Task<MonthlyRecordDto> CreateAsync(CreateMonthlyRecordDto dto);
    Task<MonthlyRecordDto?> UpdateAsync(int id, UpdateMonthlyRecordDto dto);
    Task<MonthlyRecordDto?> ReconcileAsync(int id, ReconcileMonthDto dto);
    Task<MonthlyRecordDto?> LockAsync(int id);
    Task<MonthlyRecordDto?> UnlockAsync(int id);
    Task<TrendAnalysisDto> GetTrendAnalysisAsync(int? startYear, int? startMonth, int? endYear, int? endMonth);
    Task<IEnumerable<MonthComparisonDto>> CompareMonthsAsync(int year1, int month1, int year2, int month2);
    Task RecalculateTotalsAsync(int monthlyRecordId);
}

public class MonthlyRecordService : IMonthlyRecordService
{
    private readonly ExpenseTrackerDbContext _context;

    public MonthlyRecordService(ExpenseTrackerDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MonthlyRecordDto>> GetAllAsync()
    {
        return await _context.MonthlyRecords
            .OrderByDescending(m => m.Year)
            .ThenByDescending(m => m.Month)
            .Select(m => MapToDto(m))
            .ToListAsync();
    }

    public async Task<MonthlyRecordDetailDto?> GetByIdAsync(int id)
    {
        var record = await _context.MonthlyRecords
            .Include(m => m.Expenses)
            .Include(m => m.Incomes)
            .Include(m => m.Deductions)
            .FirstOrDefaultAsync(m => m.Id == id);

        return record == null ? null : MapToDetailDto(record);
    }

    public async Task<MonthlyRecordDetailDto?> GetByYearMonthAsync(int year, int month)
    {
        var record = await _context.MonthlyRecords
            .Include(m => m.Expenses)
            .Include(m => m.Incomes)
            .Include(m => m.Deductions)
            .FirstOrDefaultAsync(m => m.Year == year && m.Month == month);

        return record == null ? null : MapToDetailDto(record);
    }

    public async Task<MonthlyRecordDto> CreateAsync(CreateMonthlyRecordDto dto)
    {
        var existingRecord = await _context.MonthlyRecords
            .FirstOrDefaultAsync(m => m.Year == dto.Year && m.Month == dto.Month);

        if (existingRecord != null)
        {
            throw new InvalidOperationException($"A record for {dto.Year}-{dto.Month:D2} already exists.");
        }

        var record = new MonthlyRecord
        {
            Year = dto.Year,
            Month = dto.Month,
            Notes = dto.Notes,
            Status = MonthStatus.Open,
            CreatedAt = DateTime.UtcNow
        };

        _context.MonthlyRecords.Add(record);
        await _context.SaveChangesAsync();

        return MapToDto(record);
    }

    public async Task<MonthlyRecordDto?> UpdateAsync(int id, UpdateMonthlyRecordDto dto)
    {
        var record = await _context.MonthlyRecords.FindAsync(id);
        if (record == null) return null;

        if (record.Status == MonthStatus.Locked || record.Status == MonthStatus.Reconciled)
        {
            throw new InvalidOperationException("Cannot update a locked or reconciled month.");
        }

        record.Notes = dto.Notes;
        await _context.SaveChangesAsync();

        return MapToDto(record);
    }

    public async Task<MonthlyRecordDto?> ReconcileAsync(int id, ReconcileMonthDto dto)
    {
        var record = await _context.MonthlyRecords
            .Include(m => m.Expenses)
            .Include(m => m.Incomes)
            .Include(m => m.Deductions)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (record == null) return null;

        // Recalculate totals
        record.TotalIncome = record.Incomes.Sum(i => i.Amount);
        record.TotalExpenses = record.Expenses.Sum(e => e.Amount);
        record.TotalDeductions = record.Deductions.Sum(d => d.Amount);
        record.NetBalance = record.TotalIncome - record.TotalExpenses - record.TotalDeductions;
        record.Notes = dto.Notes ?? record.Notes;
        record.Status = MonthStatus.Reconciled;
        record.ReconciledAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDto(record);
    }

    public async Task<MonthlyRecordDto?> LockAsync(int id)
    {
        var record = await _context.MonthlyRecords.FindAsync(id);
        if (record == null) return null;

        if (record.Status != MonthStatus.Reconciled)
        {
            throw new InvalidOperationException("Can only lock a reconciled month.");
        }

        record.Status = MonthStatus.Locked;
        record.LockedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return MapToDto(record);
    }

    public async Task<MonthlyRecordDto?> UnlockAsync(int id)
    {
        var record = await _context.MonthlyRecords.FindAsync(id);
        if (record == null) return null;

        if (record.Status != MonthStatus.Locked)
        {
            throw new InvalidOperationException("Can only unlock a locked month.");
        }

        record.Status = MonthStatus.Reconciled;
        record.LockedAt = null;
        await _context.SaveChangesAsync();

        return MapToDto(record);
    }

    public async Task<TrendAnalysisDto> GetTrendAnalysisAsync(int? startYear, int? startMonth, int? endYear, int? endMonth)
    {
        var query = _context.MonthlyRecords
            .Include(m => m.Expenses)
            .Include(m => m.Incomes)
            .AsQueryable();

        if (startYear.HasValue && startMonth.HasValue)
        {
            query = query.Where(m => m.Year > startYear.Value ||
                (m.Year == startYear.Value && m.Month >= startMonth.Value));
        }

        if (endYear.HasValue && endMonth.HasValue)
        {
            query = query.Where(m => m.Year < endYear.Value ||
                (m.Year == endYear.Value && m.Month <= endMonth.Value));
        }

        var records = await query
            .OrderBy(m => m.Year)
            .ThenBy(m => m.Month)
            .ToListAsync();

        var monthlyData = records.Select(r => new MonthComparisonDto(
            r.Year,
            r.Month,
            r.TotalIncome,
            r.TotalExpenses,
            r.TotalDeductions,
            r.NetBalance,
            r.Expenses.GroupBy(e => e.Category ?? "Uncategorized")
                .ToDictionary(g => g.Key, g => g.Sum(e => e.Amount)),
            r.Incomes.GroupBy(i => i.Category ?? "Uncategorized")
                .ToDictionary(g => g.Key, g => g.Sum(i => i.Amount))
        )).ToList();

        var totalRecords = records.Count;
        var avgIncome = totalRecords > 0 ? records.Average(r => r.TotalIncome) : 0;
        var avgExpense = totalRecords > 0 ? records.Average(r => r.TotalExpenses) : 0;
        var avgDeductions = totalRecords > 0 ? records.Average(r => r.TotalDeductions) : 0;
        var avgNetBalance = totalRecords > 0 ? records.Average(r => r.NetBalance) : 0;

        var allExpenses = records.SelectMany(r => r.Expenses).ToList();
        var topExpenseCategory = allExpenses
            .GroupBy(e => e.Category ?? "Uncategorized")
            .OrderByDescending(g => g.Sum(e => e.Amount))
            .FirstOrDefault()?.Key;

        var allIncomes = records.SelectMany(r => r.Incomes).ToList();
        var topIncomeCategory = allIncomes
            .GroupBy(i => i.Category ?? "Uncategorized")
            .OrderByDescending(g => g.Sum(i => i.Amount))
            .FirstOrDefault()?.Key;

        return new TrendAnalysisDto(
            monthlyData,
            avgIncome,
            avgExpense,
            avgDeductions,
            avgNetBalance,
            topExpenseCategory,
            topIncomeCategory
        );
    }

    public async Task<IEnumerable<MonthComparisonDto>> CompareMonthsAsync(int year1, int month1, int year2, int month2)
    {
        var records = await _context.MonthlyRecords
            .Include(m => m.Expenses)
            .Include(m => m.Incomes)
            .Where(m => (m.Year == year1 && m.Month == month1) || (m.Year == year2 && m.Month == month2))
            .ToListAsync();

        return records.Select(r => new MonthComparisonDto(
            r.Year,
            r.Month,
            r.TotalIncome,
            r.TotalExpenses,
            r.TotalDeductions,
            r.NetBalance,
            r.Expenses.GroupBy(e => e.Category ?? "Uncategorized")
                .ToDictionary(g => g.Key, g => g.Sum(e => e.Amount)),
            r.Incomes.GroupBy(i => i.Category ?? "Uncategorized")
                .ToDictionary(g => g.Key, g => g.Sum(i => i.Amount))
        ));
    }

    public async Task RecalculateTotalsAsync(int monthlyRecordId)
    {
        var record = await _context.MonthlyRecords
            .Include(m => m.Expenses)
            .Include(m => m.Incomes)
            .Include(m => m.Deductions)
            .FirstOrDefaultAsync(m => m.Id == monthlyRecordId);

        if (record == null) return;

        record.TotalIncome = record.Incomes.Sum(i => i.Amount);
        record.TotalExpenses = record.Expenses.Sum(e => e.Amount);
        record.TotalDeductions = record.Deductions.Sum(d => d.Amount);
        record.NetBalance = record.TotalIncome - record.TotalExpenses - record.TotalDeductions;

        await _context.SaveChangesAsync();
    }

    private static MonthlyRecordDto MapToDto(MonthlyRecord m) => new(
        m.Id,
        m.Year,
        m.Month,
        m.Status,
        m.TotalIncome,
        m.TotalExpenses,
        m.TotalDeductions,
        m.NetBalance,
        m.Notes,
        m.CreatedAt,
        m.ReconciledAt,
        m.LockedAt
    );

    private static MonthlyRecordDetailDto MapToDetailDto(MonthlyRecord m) => new(
        m.Id,
        m.Year,
        m.Month,
        m.Status,
        m.TotalIncome,
        m.TotalExpenses,
        m.TotalDeductions,
        m.NetBalance,
        m.Notes,
        m.CreatedAt,
        m.ReconciledAt,
        m.LockedAt,
        m.Expenses.Select(e => new ExpenseDto(
            e.Id, e.Description, e.Amount, e.Date, e.Category,
            e.IsRecurrent, e.Frequency, e.MonthlyRecordId, e.CreatedAt)),
        m.Incomes.Select(i => new IncomeDto(
            i.Id, i.Description, i.Amount, i.Date, i.Category,
            i.IsRecurrent, i.Frequency, i.IsNetIncome, i.MonthlyRecordId, i.CreatedAt)),
        m.Deductions.Select(d => new DeductionDto(
            d.Id, d.Description, d.Amount, d.Date, d.Category, d.DeductionType,
            d.IsRecurrent, d.Frequency, d.MonthlyRecordId, d.CreatedAt))
    );
}
