using ExpenseTracker.API.Data;
using ExpenseTracker.API.DTOs;
using ExpenseTracker.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.API.Services;

public interface IIncomeService
{
    Task<IEnumerable<IncomeDto>> GetAllAsync();
    Task<IncomeDto?> GetByIdAsync(int id);
    Task<IEnumerable<IncomeDto>> GetByMonthAsync(int year, int month);
    Task<IncomeDto> CreateAsync(CreateIncomeDto dto);
    Task<IncomeDto?> UpdateAsync(int id, UpdateIncomeDto dto);
    Task<bool> DeleteAsync(int id);
}

public class IncomeService : IIncomeService
{
    private readonly ExpenseTrackerDbContext _context;

    public IncomeService(ExpenseTrackerDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<IncomeDto>> GetAllAsync()
    {
        return await _context.Incomes
            .OrderByDescending(i => i.Date)
            .Select(i => MapToDto(i))
            .ToListAsync();
    }

    public async Task<IncomeDto?> GetByIdAsync(int id)
    {
        var income = await _context.Incomes.FindAsync(id);
        return income == null ? null : MapToDto(income);
    }

    public async Task<IEnumerable<IncomeDto>> GetByMonthAsync(int year, int month)
    {
        return await _context.Incomes
            .Where(i => i.Date.Year == year && i.Date.Month == month)
            .OrderByDescending(i => i.Date)
            .Select(i => MapToDto(i))
            .ToListAsync();
    }

    public async Task<IncomeDto> CreateAsync(CreateIncomeDto dto)
    {
        var income = new Income
        {
            Description = dto.Description,
            Amount = dto.Amount,
            Date = dto.Date,
            Category = dto.Category,
            IsRecurrent = dto.IsRecurrent,
            Frequency = dto.Frequency,
            IsNetIncome = dto.IsNetIncome,
            MonthlyRecordId = dto.MonthlyRecordId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Incomes.Add(income);
        await _context.SaveChangesAsync();

        return MapToDto(income);
    }

    public async Task<IncomeDto?> UpdateAsync(int id, UpdateIncomeDto dto)
    {
        var income = await _context.Incomes.FindAsync(id);
        if (income == null) return null;

        income.Description = dto.Description;
        income.Amount = dto.Amount;
        income.Date = dto.Date;
        income.Category = dto.Category;
        income.IsRecurrent = dto.IsRecurrent;
        income.Frequency = dto.Frequency;
        income.IsNetIncome = dto.IsNetIncome;
        income.MonthlyRecordId = dto.MonthlyRecordId;
        income.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(income);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var income = await _context.Incomes.FindAsync(id);
        if (income == null) return false;

        _context.Incomes.Remove(income);
        await _context.SaveChangesAsync();
        return true;
    }

    private static IncomeDto MapToDto(Income i) => new(
        i.Id,
        i.Description,
        i.Amount,
        i.Date,
        i.Category,
        i.IsRecurrent,
        i.Frequency,
        i.IsNetIncome,
        i.MonthlyRecordId,
        i.CreatedAt
    );
}
