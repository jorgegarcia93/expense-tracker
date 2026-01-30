using ExpenseTracker.API.DTOs;
using ExpenseTracker.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _expenseService;

    public ExpensesController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExpenseDto>>> GetAll()
    {
        var expenses = await _expenseService.GetAllAsync();
        return Ok(expenses);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExpenseDto>> GetById(int id)
    {
        var expense = await _expenseService.GetByIdAsync(id);
        if (expense == null)
            return NotFound();

        return Ok(expense);
    }

    [HttpGet("month/{year}/{month}")]
    public async Task<ActionResult<IEnumerable<ExpenseDto>>> GetByMonth(int year, int month)
    {
        var expenses = await _expenseService.GetByMonthAsync(year, month);
        return Ok(expenses);
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseDto>> Create([FromBody] CreateExpenseDto dto)
    {
        var expense = await _expenseService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = expense.Id }, expense);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ExpenseDto>> Update(int id, [FromBody] UpdateExpenseDto dto)
    {
        var expense = await _expenseService.UpdateAsync(id, dto);
        if (expense == null)
            return NotFound();

        return Ok(expense);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var result = await _expenseService.DeleteAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}
