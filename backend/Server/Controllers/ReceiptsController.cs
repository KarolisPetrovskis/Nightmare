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

        [HttpGet("local/{orderId}")]
        public async Task<IActionResult> GetLocalReceiptContent(long orderId)
        {
            var receipt = await _receiptsService.GetReceiptByOrderIdAsync(orderId);
            
            if (receipt == null)
            {
                return NotFound(new { message = "Receipt not found for this order" });
            }

            if (string.IsNullOrEmpty(receipt.DetailedContent))
            {
                return NotFound(new { message = "Receipt content not available" });
            }

            // Return as HTML formatted receipt
            var htmlContent = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Receipt - {receipt.ReceiptNumber}</title>
    <style>
        body {{
            font-family: 'Courier New', monospace;
            background-color: #1a1a1a;
            color: rgba(255, 255, 255, 0.87);
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
        }}
        .receipt-container {{
            background-color: #252525;
            border: 1px solid #3a3a3a;
            border-radius: 8px;
            padding: 30px;
        }}
        .receipt-header {{
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #3a3a3a;
            padding-bottom: 20px;
        }}
        .receipt-number {{
            font-size: 1.2em;
            color: #5e92f3;
            margin-bottom: 10px;
        }}
        .receipt-date {{
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.9em;
        }}
        .receipt-content {{
            white-space: pre-wrap;
            line-height: 1.6;
            font-size: 0.95em;
        }}
        .receipt-footer {{
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #3a3a3a;
            text-align: center;
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.85em;
        }}
    </style>
</head>
<body>
    <div class='receipt-container'>
        <div class='receipt-header'>
            <div class='receipt-number'>Receipt #{receipt.ReceiptNumber}</div>
            <div class='receipt-date'>Issued: {receipt.IssuedAt:yyyy-MM-dd HH:mm:ss}</div>
        </div>
        <div class='receipt-content'>{receipt.DetailedContent}</div>
        <div class='receipt-footer'>
            Thank you for your order!
        </div>
    </div>
</body>
</html>";

            return Content(htmlContent, "text/html");
        }
    }
}