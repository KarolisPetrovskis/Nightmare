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

        [HttpGet("order/{orderId}")]
        public async Task<IActionResult> GetReceiptByOrderId(long orderId)
        {
            var receipt = await _receiptsService.GetReceiptByOrderIdAsync(orderId);
            
            if (receipt == null)
            {
                return NotFound(new { message = "Receipt not found for this order" });
            }

            return Ok(receipt);
        }

        [HttpPost]
        public async Task<IActionResult> CreateReceipt([FromBody] ReceiptGenerateDTO request)
        {
            // For now, we assume PaymentId is the same as OrderId's primary payment
            // In production, you'd get the specific payment ID from the request or context
            var payments = await _receiptsService.GetReceiptByOrderIdAsync(request.OrderId);
            
            if (payments != null)
            {
                return Ok(payments);
            }

            return BadRequest(new { message = "Cannot create receipt: Order or Payment not found" });
        }

        [HttpGet("{nid}")]
        public async Task<IActionResult> GetReceiptByNid(long nid)
        {
            var receipt = await _receiptsService.GetReceiptByNidAsync(nid);
            
            if (receipt == null)
            {
                return NotFound(new { message = "Receipt not found" });
            }

            return Ok(receipt);
        }

        [HttpGet("business/{businessId}")]
        public async Task<IActionResult> GetReceiptsByBusinessId(long businessId)
        {
            var receipts = await _receiptsService.GetReceiptsByBusinessIdAsync(businessId);
            return Ok(receipts);
        }
    }
}