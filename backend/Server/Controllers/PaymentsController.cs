using backend.Server.Interfaces;
using backend.Server.Models.DTOs.Payment;
using Microsoft.AspNetCore.Mvc;

namespace backend.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentsService _paymentsService;

        public PaymentsController(IPaymentsService paymentsService)
        {
            _paymentsService = paymentsService;
        }

        [HttpPost("process")]
        public async Task<IActionResult> ProcessPayment([FromBody] ProcessPaymentDTO request)
        {
            var result = await _paymentsService.ProcessPaymentAsync(request);
            return Ok(result);
        }

        [HttpPost("refund")]
        public async Task<IActionResult> RefundPayment([FromBody] RefundDTO request)
        {
            var result = await _paymentsService.RefundPaymentAsync(request);
            return Ok(result);
        }

        [HttpGet("{paymentId}")]
        public async Task<IActionResult> GetPayment(long paymentId)
        {
            var payment = await _paymentsService.GetPaymentByIdAsync(paymentId);
            if (payment == null)
            {
                return NotFound("Payment not found");
            }
            return Ok(payment);
        }

        [HttpGet("order/{orderId}")]
        public async Task<IActionResult> GetPaymentsByOrder(long orderId)
        {
            var payments = await _paymentsService.GetPaymentsByOrderIdAsync(orderId);
            return Ok(payments);
        }
    }
}