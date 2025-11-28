using backend.Server.Interfaces;
using backend.Server.Models.DTOs.Receipt;
using Microsoft.AspNetCore.Mvc;

namespace backend.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReceiptsController : ControllerBase
    {
        private readonly IReceiptsService _receiptsService;

        public ReceiptsController(IReceiptsService receiptsService)
        {
            _receiptsService = receiptsService;
        }

        [HttpGet]
        public IActionResult GetReceipts([FromBody] ReceiptGetAllDTO request)
        {
            _receiptsService.placeholderMethod();
            return Ok("Receipts fetched successfully.");
        }

        [HttpPost]
        public IActionResult CreateReceipt([FromBody] ReceiptGenerateDTO request)
        {
            _receiptsService.placeholderMethod();
            return Ok("Receipt created successfully.");
        }

        [HttpGet("{nid}")]
        public IActionResult GetReceiptBynid(long nid)
        {
            _receiptsService.placeholderMethod();
            return Ok($"Receipt {nid} fetched successfully.");
        }
    }
}