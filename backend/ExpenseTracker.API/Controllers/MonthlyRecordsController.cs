using ExpenseTracker.API.DTOs;
using ExpenseTracker.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MonthlyRecordsController : ControllerBase
{
    private readonly IMonthlyRecordService _monthlyRecordService;

    public MonthlyRecordsController(IMonthlyRecordService monthlyRecordService)
    {
        _monthlyRecordService = monthlyRecordService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MonthlyRecordDto>>> GetAll()
    {
        var records = await _monthlyRecordService.GetAllAsync();
        return Ok(records);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MonthlyRecordDetailDto>> GetById(int id)
    {
        var record = await _monthlyRecordService.GetByIdAsync(id);
        if (record == null)
            return NotFound();

        return Ok(record);
    }

    [HttpGet("{year}/{month}")]
    public async Task<ActionResult<MonthlyRecordDetailDto>> GetByYearMonth(int year, int month)
    {
        var record = await _monthlyRecordService.GetByYearMonthAsync(year, month);
        if (record == null)
            return NotFound();

        return Ok(record);
    }

    [HttpPost]
    public async Task<ActionResult<MonthlyRecordDto>> Create([FromBody] CreateMonthlyRecordDto dto)
    {
        try
        {
            var record = await _monthlyRecordService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = record.Id }, record);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<MonthlyRecordDto>> Update(int id, [FromBody] UpdateMonthlyRecordDto dto)
    {
        try
        {
            var record = await _monthlyRecordService.UpdateAsync(id, dto);
            if (record == null)
                return NotFound();

            return Ok(record);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/reconcile")]
    public async Task<ActionResult<MonthlyRecordDto>> Reconcile(int id, [FromBody] ReconcileMonthDto dto)
    {
        var record = await _monthlyRecordService.ReconcileAsync(id, dto);
        if (record == null)
            return NotFound();

        return Ok(record);
    }

    [HttpPost("{id}/lock")]
    public async Task<ActionResult<MonthlyRecordDto>> Lock(int id)
    {
        try
        {
            var record = await _monthlyRecordService.LockAsync(id);
            if (record == null)
                return NotFound();

            return Ok(record);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/unlock")]
    public async Task<ActionResult<MonthlyRecordDto>> Unlock(int id)
    {
        try
        {
            var record = await _monthlyRecordService.UnlockAsync(id);
            if (record == null)
                return NotFound();

            return Ok(record);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("trends")]
    public async Task<ActionResult<TrendAnalysisDto>> GetTrends(
        [FromQuery] int? startYear,
        [FromQuery] int? startMonth,
        [FromQuery] int? endYear,
        [FromQuery] int? endMonth)
    {
        var trends = await _monthlyRecordService.GetTrendAnalysisAsync(startYear, startMonth, endYear, endMonth);
        return Ok(trends);
    }

    [HttpGet("compare")]
    public async Task<ActionResult<IEnumerable<MonthComparisonDto>>> CompareMonths(
        [FromQuery] int year1,
        [FromQuery] int month1,
        [FromQuery] int year2,
        [FromQuery] int month2)
    {
        var comparison = await _monthlyRecordService.CompareMonthsAsync(year1, month1, year2, month2);
        return Ok(comparison);
    }
}
