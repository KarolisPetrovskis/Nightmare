using backend.Server.Database;
using backend.Server.Exceptions;
using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.Payment;
using backend.Server.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Server.Services
{
    public class PaymentsService : IPaymentsService
    {
        private readonly ApplicationDbContext _context;

        public PaymentsService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PaymentResponseDTO> ProcessPaymentAsync(ProcessPaymentDTO request)
        {
            // Validate order exists
            var order = await _context.Orders.FindAsync(request.OrderId);
            if (order == null)
            {
                throw new ApiException(404, "Order not found");
            }

            // Create payment record
            var payment = new Payment
            {
                OrderId = request.OrderId,
                Amount = request.Amount,
                Currency = request.Currency,
                PaymentMethod = request.PaymentMethod,
                Status = PaymentStatus.Processing,
                CreatedAt = DateTime.UtcNow,
                CustomerEmail = request.CustomerEmail
            };

            try
            {
                // Simulate payment processing logic
                // In a real application, you would integrate with payment providers like Stripe, PayPal, etc.
                switch (request.PaymentMethod)
                {
                    case PaymentMethod.Card:
                        // Simulate card payment processing
                        payment.TransactionId = $"TXN-{Guid.NewGuid().ToString()[..8].ToUpper()}";
                        payment.Status = PaymentStatus.Completed;
                        payment.ProcessedAt = DateTime.UtcNow;
                        break;

                    case PaymentMethod.Cash:
                        // Cash payments are immediately completed
                        payment.TransactionId = $"CASH-{DateTime.UtcNow:yyyyMMddHHmmss}";
                        payment.Status = PaymentStatus.Completed;
                        payment.ProcessedAt = DateTime.UtcNow;
                        break;

                    case PaymentMethod.GiftCard:
                        // Validate gift card (simplified)
                        payment.TransactionId = $"GC-{Guid.NewGuid().ToString()[..8].ToUpper()}";
                        payment.Status = PaymentStatus.Completed;
                        payment.ProcessedAt = DateTime.UtcNow;
                        break;

                    default:
                        throw new ApiException(400, "Unsupported payment method");
                }

                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();

                return MapToDTO(payment);
            }
            catch (Exception ex)
            {
                payment.Status = PaymentStatus.Failed;
                payment.ErrorMessage = ex.Message;
                payment.ProcessedAt = DateTime.UtcNow;

                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();

                throw new ApiException(500, $"Payment processing failed: {ex.Message}");
            }
        }

        public async Task<PaymentResponseDTO> RefundPaymentAsync(RefundDTO request)
        {
            var payment = await _context.Payments.FindAsync(request.PaymentId);
            if (payment == null)
            {
                throw new ApiException(404, "Payment not found");
            }

            if (payment.Status != PaymentStatus.Completed)
            {
                throw new ApiException(400, "Only completed payments can be refunded");
            }

            if (request.Amount > payment.Amount)
            {
                throw new ApiException(400, "Refund amount cannot exceed payment amount");
            }

            // Create a refund payment record
            var refundPayment = new Payment
            {
                OrderId = payment.OrderId,
                Amount = -request.Amount, // Negative amount for refund
                Currency = payment.Currency,
                PaymentMethod = payment.PaymentMethod,
                Status = PaymentStatus.Refunded,
                CreatedAt = DateTime.UtcNow,
                ProcessedAt = DateTime.UtcNow,
                TransactionId = $"REFUND-{payment.TransactionId}",
                CustomerEmail = payment.CustomerEmail,
                ErrorMessage = $"Refund reason: {request.Reason}"
            };

            // Update original payment status
            if (request.Amount == payment.Amount)
            {
                payment.Status = PaymentStatus.Refunded;
            }
            else
            {
                payment.Status = PaymentStatus.PartiallyRefunded;
            }

            _context.Payments.Add(refundPayment);
            await _context.SaveChangesAsync();

            return MapToDTO(refundPayment);
        }

        public async Task<PaymentResponseDTO?> GetPaymentByIdAsync(long paymentId)
        {
            var payment = await _context.Payments.FindAsync(paymentId);
            return payment == null ? null : MapToDTO(payment);
        }

        public async Task<List<PaymentResponseDTO>> GetPaymentsByOrderIdAsync(long orderId)
        {
            var payments = await _context.Payments
                .Where(p => p.OrderId == orderId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return payments.Select(MapToDTO).ToList();
        }

        private static PaymentResponseDTO MapToDTO(Payment payment)
        {
            return new PaymentResponseDTO
            {
                PaymentId = payment.Nid,
                OrderId = payment.OrderId,
                Amount = payment.Amount,
                Currency = payment.Currency,
                PaymentMethod = payment.PaymentMethod,
                Status = payment.Status,
                CreatedAt = payment.CreatedAt,
                ProcessedAt = payment.ProcessedAt,
                TransactionId = payment.TransactionId,
                ErrorMessage = payment.ErrorMessage
            };
        }
    }
}