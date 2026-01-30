using ExpenseTracker.API.Data;
using ExpenseTracker.API.DTOs;
using ExpenseTracker.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.API.Services;

public interface IExpenseService
{
    Task<IEnumerable<ExpenseDto>> GetAllAsync();
    Task<ExpenseDto?> GetByIdAsync(int id);
    Task<IEnumerable<ExpenseDto>> GetByMonthAsync(int year, int month);
    Task<ExpenseDto> CreateAsync(CreateExpenseDto dto);
    Task<ExpenseDto?> UpdateAsync(int id, UpdateExpenseDto dto);
    Task<bool> DeleteAsync(int id);
}

public class ExpenseService : IExpenseService
{
    private readonly ExpenseTrackerDbContext _context;

    public ExpenseService(ExpenseTrackerDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ExpenseDto>> GetAllAsync()
    {
        return await _context.Expenses
            .OrderByDescending(e => e.Date)
            .Select(e => MapToDto(e))
            .ToListAsync();
    }

    public async Task<ExpenseDto?> GetByIdAsync(int id)
    {
        var expense = await _context.Expenses.FindAsync(id);
        return expense == null ? null : MapToDto(expense);
    }

    public async Task<IEnumerable<ExpenseDto>> GetByMonthAsync(int year, int month)
    {
        return await _context.Expenses
            .Where(e => e.Date.Year == year && e.Date.Month == month)
            .OrderByDescending(e => e.Date)
            .Select(e => MapToDto(e))
            .ToListAsync();
    }

    public async Task<ExpenseDto> CreateAsync(CreateExpenseDto dto)
    {
        var expense = new Expense
        {
            Description = dto.Description,
            Amount = dto.Amount,
            Date = dto.Date,
            Category = dto.Category,
            IsRecurrent = dto.IsRecurrent,
            Frequency = dto.Frequency,
            MonthlyRecordId = dto.MonthlyRecordId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        return MapToDto(expense);
    }

    public async Task<ExpenseDto?> UpdateAsync(int id, UpdateExpenseDto dto)
    {
        var expense = await _context.Expenses.FindAsync(id);
        if (expense == null) return null;

        expense.Description = dto.Description;
        expense.Amount = dto.Amount;
        expense.Date = dto.Date;
        expense.Category = dto.Category;
        expense.IsRecurrent = dto.IsRecurrent;
        expense.Frequency = dto.Frequency;
        expense.MonthlyRecordId = dto.MonthlyRecordId;
        expense.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(expense);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var expense = await _context.Expenses.FindAsync(id);
        if (expense == null) return false;

        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync();
        return true;
    }

    private static ExpenseDto MapToDto(Expense e) => new(
        e.Id,
        e.Description,
        e.Amount,
        e.Date,
        e.Category,
        e.IsRecurrent,
        e.Frequency,
        e.MonthlyRecordId,
        e.CreatedAt
    );
}
