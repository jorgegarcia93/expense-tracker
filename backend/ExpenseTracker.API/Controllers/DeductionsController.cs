using ExpenseTracker.API.DTOs;
using ExpenseTracker.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DeductionsController : ControllerBase
{
    private readonly IDeductionService _deductionService;

    public DeductionsController(IDeductionService deductionService)
    {
        _deductionService = deductionService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DeductionDto>>> GetAll()
    {
        var deductions = await _deductionService.GetAllAsync();
        return Ok(deductions);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DeductionDto>> GetById(int id)
    {
        var deduction = await _deductionService.GetByIdAsync(id);
        if (deduction == null)
            return NotFound();

        return Ok(deduction);
    }

    [HttpGet("month/{year}/{month}")]
    public async Task<ActionResult<IEnumerable<DeductionDto>>> GetByMonth(int year, int month)
    {
        var deductions = await _deductionService.GetByMonthAsync(year, month);
        return Ok(deductions);
    }

    [HttpPost]
    public async Task<ActionResult<DeductionDto>> Create([FromBody] CreateDeductionDto dto)
    {
        var deduction = await _deductionService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = deduction.Id }, deduction);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<DeductionDto>> Update(int id, [FromBody] UpdateDeductionDto dto)
    {
        var deduction = await _deductionService.UpdateAsync(id, dto);
        if (deduction == null)
            return NotFound();

        return Ok(deduction);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var result = await _deductionService.DeleteAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}
