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
        public IActionResult ProcessPayment([FromBody] ProcessPaymentDTO request)
        {
            _paymentsService.placeholderMethod();
            return Ok("Payment processed successfully.");
        }

        [HttpPost("refund")]
        public IActionResult RefundPayment([FromBody] RefundDTO request)
        {
            _paymentsService.placeholderMethod();
            return Ok("Payment refunded successfully.");
        }
    }
}