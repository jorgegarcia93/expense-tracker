using ExpenseTracker.API.DTOs;
using ExpenseTracker.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImportController : ControllerBase
{
    private readonly ICsvImportService _importService;

    public ImportController(ICsvImportService importService)
    {
        _importService = importService;
    }

    [HttpPost("csv")]
    public async Task<ActionResult<ImportBatchDto>> ImportCsv(
        IFormFile file,
        [FromQuery] int dateColumnIndex = 0,
        [FromQuery] int descriptionColumnIndex = 1,
        [FromQuery] int amountColumnIndex = 2,
        [FromQuery] int? categoryColumnIndex = null,
        [FromQuery] string dateFormat = "MM/dd/yyyy",
        [FromQuery] bool hasHeader = true,
        [FromQuery] string? source = null)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded" });

        if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Only CSV files are supported" });

        var config = new CsvImportConfigDto(
            dateColumnIndex,
            descriptionColumnIndex,
            amountColumnIndex,
            categoryColumnIndex,
            dateFormat,
            hasHeader,
            source ?? Path.GetFileNameWithoutExtension(file.FileName)
        );

        using var stream = file.OpenReadStream();
        var batch = await _importService.ImportCsvAsync(stream, config);

        return Ok(batch);
    }

    [HttpGet("batches")]
    public async Task<ActionResult<IEnumerable<ImportBatchDto>>> GetAllBatches()
    {
        var batches = await _importService.GetAllBatchesAsync();
        return Ok(batches);
    }

    [HttpGet("batches/{id}")]
    public async Task<ActionResult<ImportBatchDto>> GetBatchById(int id)
    {
        var batch = await _importService.GetBatchByIdAsync(id);
        if (batch == null)
            return NotFound();

        return Ok(batch);
    }

    [HttpGet("pending")]
    public async Task<ActionResult<IEnumerable<ImportedTransactionDto>>> GetPendingTransactions()
    {
        var transactions = await _importService.GetPendingTransactionsAsync();
        return Ok(transactions);
    }

    [HttpPost("transactions/{id}/review")]
    public async Task<ActionResult<ImportedTransactionDto>> ReviewTransaction(
        int id,
        [FromBody] ReviewImportedTransactionDto dto)
    {
        var transaction = await _importService.ReviewTransactionAsync(id, dto);
        if (transaction == null)
            return NotFound();

        return Ok(transaction);
    }

    [HttpPost("transactions/{id}/add-to-month/{monthlyRecordId}")]
    public async Task<ActionResult> AddTransactionToMonth(int id, int monthlyRecordId)
    {
        var result = await _importService.AddTransactionToMonthAsync(id, monthlyRecordId);
        if (!result)
            return BadRequest(new { message = "Failed to add transaction to month. Check if the transaction exists and the month is not locked." });

        return Ok(new { message = "Transaction added to month successfully" });
    }

    [HttpPost("transactions/{id}/ignore")]
    public async Task<ActionResult> IgnoreTransaction(int id)
    {
        var result = await _importService.IgnoreTransactionAsync(id);
        if (!result)
            return NotFound();

        return Ok(new { message = "Transaction ignored" });
    }

    [HttpPost("batches/{batchId}/add-all-to-month/{monthlyRecordId}")]
    public async Task<ActionResult> AddAllReviewedToMonth(int batchId, int monthlyRecordId)
    {
        var count = await _importService.AddAllReviewedToMonthAsync(batchId, monthlyRecordId);
        return Ok(new { message = $"{count} transactions added to month" });
    }
}
