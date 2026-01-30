using ExpenseTracker.API.Data;
using ExpenseTracker.API.DTOs;
using ExpenseTracker.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.API.Services;

public interface IDeductionService
{
    Task<IEnumerable<DeductionDto>> GetAllAsync();
    Task<DeductionDto?> GetByIdAsync(int id);
    Task<IEnumerable<DeductionDto>> GetByMonthAsync(int year, int month);
    Task<DeductionDto> CreateAsync(CreateDeductionDto dto);
    Task<DeductionDto?> UpdateAsync(int id, UpdateDeductionDto dto);
    Task<bool> DeleteAsync(int id);
}

public class DeductionService : IDeductionService
{
    private readonly ExpenseTrackerDbContext _context;

    public DeductionService(ExpenseTrackerDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<DeductionDto>> GetAllAsync()
    {
        return await _context.Deductions
            .OrderByDescending(d => d.Date)
            .Select(d => MapToDto(d))
            .ToListAsync();
    }

    public async Task<DeductionDto?> GetByIdAsync(int id)
    {
        var deduction = await _context.Deductions.FindAsync(id);
        return deduction == null ? null : MapToDto(deduction);
    }

    public async Task<IEnumerable<DeductionDto>> GetByMonthAsync(int year, int month)
    {
        return await _context.Deductions
            .Where(d => d.Date.Year == year && d.Date.Month == month)
            .OrderByDescending(d => d.Date)
            .Select(d => MapToDto(d))
            .ToListAsync();
    }

    public async Task<DeductionDto> CreateAsync(CreateDeductionDto dto)
    {
        var deduction = new Deduction
        {
            Description = dto.Description,
            Amount = dto.Amount,
            Date = dto.Date,
            Category = dto.Category,
            DeductionType = dto.DeductionType,
            IsRecurrent = dto.IsRecurrent,
            Frequency = dto.Frequency,
            MonthlyRecordId = dto.MonthlyRecordId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Deductions.Add(deduction);
        await _context.SaveChangesAsync();

        return MapToDto(deduction);
    }

    public async Task<DeductionDto?> UpdateAsync(int id, UpdateDeductionDto dto)
    {
        var deduction = await _context.Deductions.FindAsync(id);
        if (deduction == null) return null;

        deduction.Description = dto.Description;
        deduction.Amount = dto.Amount;
        deduction.Date = dto.Date;
        deduction.Category = dto.Category;
        deduction.DeductionType = dto.DeductionType;
        deduction.IsRecurrent = dto.IsRecurrent;
        deduction.Frequency = dto.Frequency;
        deduction.MonthlyRecordId = dto.MonthlyRecordId;
        deduction.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(deduction);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var deduction = await _context.Deductions.FindAsync(id);
        if (deduction == null) return false;

        _context.Deductions.Remove(deduction);
        await _context.SaveChangesAsync();
        return true;
    }

    private static DeductionDto MapToDto(Deduction d) => new(
        d.Id,
        d.Description,
        d.Amount,
        d.Date,
        d.Category,
        d.DeductionType,
        d.IsRecurrent,
        d.Frequency,
        d.MonthlyRecordId,
        d.CreatedAt
    );
}
