using backend.Server.Interfaces;
using backend.Server.Models.Configuration;
using backend.Server.Models.DTOs.Payment;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Stripe;

namespace backend.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentsService _paymentsService;
        private readonly StripeSettings _stripeSettings;

        public PaymentsController(IPaymentsService paymentsService, StripeSettings stripeSettings)
        {
            _paymentsService = paymentsService;
            _stripeSettings = stripeSettings;
        }

        [HttpPost("create-payment-intent")]
        public async Task<IActionResult> CreatePaymentIntent([FromBody] CreatePaymentIntentRequest request)
        {
            var clientSecret = await _paymentsService.CreatePaymentIntentAsync(
                request.OrderId, 
                request.Amount, 
                request.Currency,
                request.Tip
            );
            
            return Ok(new 
            { 
                clientSecret,
                publishableKey = _stripeSettings.PublishableKey
            });
        }

        [HttpGet("config")]
        public IActionResult GetStripeConfig()
        {
            return Ok(new { publishableKey = _stripeSettings.PublishableKey });
        }

        [HttpPost("process")]
        public async Task<IActionResult> ProcessPayment([FromBody] ProcessPaymentDTO request)
        {
            var result = await _paymentsService.ProcessPaymentAsync(request);
            return Ok(result);
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> StripeWebhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();

            try
            {
                var stripeEvent = EventUtility.ConstructEvent(
                    json,
                    Request.Headers["Stripe-Signature"],
                    _stripeSettings.WebhookSecret
                );

                // Handle the event
                switch (stripeEvent.Type)
                {
                    case "payment_intent.succeeded":
                        var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                        // Payment succeeded - you might want to update order status here
                        break;

                    case "payment_intent.payment_failed":
                        var failedPaymentIntent = stripeEvent.Data.Object as PaymentIntent;
                        // Payment failed - you might want to notify the customer
                        break;

                    case "charge.refunded":
                        var charge = stripeEvent.Data.Object as Charge;
                        // Refund processed
                        break;

                    default:
                        // Unexpected event type
                        Console.WriteLine($"Unhandled event type: {stripeEvent.Type}");
                        break;
                }

                return Ok();
            }
            catch (StripeException)
            {
                return BadRequest();
            }
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