using backend.Server.Database;
using backend.Server.Exceptions;
using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Stripe;

namespace backend.Server.Services
{
    public class ReceiptsService : IReceiptsService
    {
        private readonly ApplicationDbContext _context;
        private readonly PaymentIntentService _paymentIntentService;

        public ReceiptsService(ApplicationDbContext context)
        {
            _context = context;
            _paymentIntentService = new PaymentIntentService();
        }

        public async Task<Receipt> CreateReceiptAsync(long orderId, long paymentId)
        {
            // Check if receipt already exists
            var existingReceipt = await _context.Receipts
                .FirstOrDefaultAsync(r => r.OrderId == orderId && r.PaymentId == paymentId);
            
            if (existingReceipt != null)
            {
                return existingReceipt;
            }

            // Get payment details
            var payment = await _context.Payments.FindAsync(paymentId);
            if (payment == null)
            {
                throw new ApiException(404, "Payment not found");
            }

            // Get order details
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
            {
                throw new ApiException(404, "Order not found");
            }

            string? stripeReceiptUrl = null;
            
            // Try to get Stripe receipt URL if payment has a transaction ID
            if (!string.IsNullOrEmpty(payment.TransactionId))
            {
                try
                {
                    var paymentIntent = await _paymentIntentService.GetAsync(payment.TransactionId);
                    
                    // Get the latest charge from the payment intent
                    if (paymentIntent?.LatestChargeId != null)
                    {
                        var chargeService = new ChargeService();
                        var charge = await chargeService.GetAsync(paymentIntent.LatestChargeId);
                        stripeReceiptUrl = charge?.ReceiptUrl;
                    }
                }
                catch (Exception)
                {
                    // If Stripe API fails, continue without receipt URL
                }
            }

            // Generate receipt number (format: RCP-{timestamp}-{orderId})
            var receiptNumber = $"RCP-{DateTime.UtcNow:yyyyMMddHHmmss}-{orderId}";

            var receipt = new Receipt
            {
                OrderId = orderId,
                PaymentId = paymentId,
                ReceiptNumber = receiptNumber,
                IssuedAt = DateTime.UtcNow,
                Total = payment.Amount,
                Currency = payment.Currency,
                StripeReceiptUrl = stripeReceiptUrl,
                BusinessId = order.BusinessId
            };

            _context.Receipts.Add(receipt);
            await _context.SaveChangesAsync();

            return receipt;
        }

        public async Task<Receipt?> GetReceiptByOrderIdAsync(long orderId)
        {
            return await _context.Receipts
                .FirstOrDefaultAsync(r => r.OrderId == orderId);
        }

        public async Task<Receipt?> GetReceiptByNidAsync(long nid)
        {
            return await _context.Receipts.FindAsync(nid);
        }

        public async Task<List<Receipt>> GetReceiptsByBusinessIdAsync(long businessId)
        {
            return await _context.Receipts
                .Where(r => r.BusinessId == businessId)
                .OrderByDescending(r => r.IssuedAt)
                .ToListAsync();
        }
    }
}