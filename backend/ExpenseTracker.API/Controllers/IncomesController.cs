using ExpenseTracker.API.DTOs;
using ExpenseTracker.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IncomesController : ControllerBase
{
    private readonly IIncomeService _incomeService;

    public IncomesController(IIncomeService incomeService)
    {
        _incomeService = incomeService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<IncomeDto>>> GetAll()
    {
        var incomes = await _incomeService.GetAllAsync();
        return Ok(incomes);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<IncomeDto>> GetById(int id)
    {
        var income = await _incomeService.GetByIdAsync(id);
        if (income == null)
            return NotFound();

        return Ok(income);
    }

    [HttpGet("month/{year}/{month}")]
    public async Task<ActionResult<IEnumerable<IncomeDto>>> GetByMonth(int year, int month)
    {
        var incomes = await _incomeService.GetByMonthAsync(year, month);
        return Ok(incomes);
    }

    [HttpPost]
    public async Task<ActionResult<IncomeDto>> Create([FromBody] CreateIncomeDto dto)
    {
        var income = await _incomeService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = income.Id }, income);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<IncomeDto>> Update(int id, [FromBody] UpdateIncomeDto dto)
    {
        var income = await _incomeService.UpdateAsync(id, dto);
        if (income == null)
            return NotFound();

        return Ok(income);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var result = await _incomeService.DeleteAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}
