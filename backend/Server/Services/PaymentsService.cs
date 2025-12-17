using backend.Server.Database;
using backend.Server.Exceptions;
using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.Payment;
using backend.Server.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Stripe;
using PaymentMethod = backend.Server.Models.Enums.PaymentMethod;
using OrderStatus = backend.Server.Models.Enums.OrderStatus;

namespace backend.Server.Services
{
    public class PaymentsService : IPaymentsService
    {
        private readonly ApplicationDbContext _context;
        private readonly IOrdersService _ordersService;
        private readonly IReceiptsService _receiptsService;

        public PaymentsService(ApplicationDbContext context, IOrdersService ordersService, IReceiptsService receiptsService)
        {
            _context = context;
            _ordersService = ordersService;
            _receiptsService = receiptsService;
        }

        public async Task<PaymentResponseDTO> ProcessPaymentAsync(ProcessPaymentDTO request)
        {
            // Validate order exists
            var order = await _context.Orders.FindAsync(request.OrderId);
            if (order == null)
            {
                throw new ApiException(404, "Order not found");
            }

            Console.WriteLine($"Processing payment for Order ID: {request.OrderId}, Amount: {request.Amount}, Method: {request.PaymentMethod}, Tip: {request.Tip}");

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
                switch (request.PaymentMethod)
                {
                    case PaymentMethod.Card:
                        // Process card payment through Stripe
                        var paymentIntentService = new PaymentIntentService();
                        var paymentIntent = await paymentIntentService.GetAsync(request.PaymentIntentId);
                        
                        if (paymentIntent.Status == "succeeded")
                        {
                            payment.TransactionId = paymentIntent.Id;
                            payment.Status = PaymentStatus.Completed;
                            payment.ProcessedAt = DateTime.UtcNow;
                            
                            // Update payment intent with receipt email if provided
                            if (!string.IsNullOrEmpty(request.CustomerEmail))
                            {
                                try
                                {
                                    await paymentIntentService.UpdateAsync(paymentIntent.Id, new PaymentIntentUpdateOptions
                                    {
                                        ReceiptEmail = request.CustomerEmail
                                    });
                                }
                                catch (Exception ex)
                                {
                                    // Log but don't fail the payment if receipt email update fails
                                    Console.WriteLine($"Failed to set receipt email: {ex.Message}");
                                }
                            }
                        }
                        else
                        {
                            throw new ApiException(400, $"Payment intent status is {paymentIntent.Status}");
                        }
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

                // Update order status to Paid if payment completed
                if (payment.Status == PaymentStatus.Completed)
                {
                    await _ordersService.UpdateOrderStatusAsync(request.OrderId, OrderStatus.Paid);
                    
                    // Automatically generate receipt for completed payment with detailed content
                    try
                    {
                        var detailedContent = await GenerateReceiptContentAsync(request.OrderId, request.Amount, request.Currency, request.Tip);
                        await _receiptsService.CreateReceiptAsync(request.OrderId, payment.Nid, detailedContent);
                    }
                    catch (Exception ex)
                    {
                        // Log but don't fail the payment if receipt generation fails
                        Console.WriteLine($"Failed to generate receipt: {ex.Message}");
                    }
                }

                return MapToDTO(payment);
            }
            catch (StripeException stripeEx)
            {
                payment.Status = PaymentStatus.Failed;
                payment.ErrorMessage = stripeEx.Message;
                payment.ProcessedAt = DateTime.UtcNow;

                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();

                throw new ApiException(500, $"Stripe error: {stripeEx.Message}");
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

        public async Task<string> CreatePaymentIntentAsync(long orderId, decimal amount, string currency, decimal? tip)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
            {
                throw new ApiException(404, "Order not found");
            }

            // Get order details with items
            var orderDetails = await _context.OrderDetails
                .Where(od => od.OrderId == orderId)
                .ToListAsync();
            
            // Get menu items for the order details
            var itemIds = orderDetails.Select(od => od.ItemId).ToList();
            var menuItems = await _context.MenuItems
                .Where(mi => itemIds.Contains(mi.Nid))
                .ToDictionaryAsync(mi => mi.Nid, mi => mi);

            // Get all addons for order details
            var orderDetailIds = orderDetails.Select(od => od.Nid).ToList();
            var orderDetailAddons = await _context.OrderDetailAddOns
                .Where(oda => orderDetailIds.Contains(oda.DetailId))
                .ToListAsync();
            
            // Get ingredient names for addons
            var ingredientIds = orderDetailAddons.Select(oda => oda.IngredientId).Distinct().ToList();
            var ingredients = await _context.MenuItemIngredients
                .Where(mii => ingredientIds.Contains(mii.Nid))
                .ToDictionaryAsync(mii => mii.Nid, mii => mii.Name);

            try
            {
                // Build detailed description with pricing breakdown for receipt
                var descriptionLines = new List<string>();
                descriptionLines.Add($"Order {order.Code ?? orderId.ToString()}");
                descriptionLines.Add("---");
                
                foreach (var detail in orderDetails)
                {
                    var item = menuItems.ContainsKey(detail.ItemId) ? menuItems[detail.ItemId] : null;
                    var itemName = item?.Name ?? $"Item #{detail.ItemId}";
                    
                    // Get addons for this item
                    var itemAddons = orderDetailAddons.Where(oda => oda.DetailId == detail.Nid).ToList();
                    
                    // Item line
                    descriptionLines.Add($"{detail.Quantity}x {itemName}");
                    
                    descriptionLines.Add($"  Base: {currency.ToUpper()} {detail.BasePrice:F2}");
                    
                    var totalBasePriceWithAddons = detail.BasePrice;

                    // Addons
                    if (itemAddons.Any())
                    {
                        foreach (var addon in itemAddons)
                        {
                            var addonName = ingredients.ContainsKey(addon.IngredientId) ? ingredients[addon.IngredientId] : "Unknown";
                            descriptionLines.Add($"  + {addonName} ({currency.ToUpper()} {addon.PriceWoVat:F2})");
                        }
                        totalBasePriceWithAddons += itemAddons.Sum(a => a.PriceWoVat);
                        descriptionLines.Add($"  Total Base with Add-ons: {currency.ToUpper()} {totalBasePriceWithAddons:F2}");
                    }
                    
                    // Pricing breakdown
                    var vatAmount = totalBasePriceWithAddons * detail.VatRate;
                    var priceWithVat = totalBasePriceWithAddons * (1 + detail.VatRate);
                    descriptionLines.Add($"  VAT ({detail.VatRate * 100:F0}%): +{currency.ToUpper()} {vatAmount:F2}");
                    
                    decimal finalPricePerItem = priceWithVat;
                    if (detail.DiscountPercent.HasValue && detail.DiscountPercent.Value > 0)
                    {
                        var discountAmount = priceWithVat * (detail.DiscountPercent.Value / 100);
                        finalPricePerItem = priceWithVat - discountAmount;
                        descriptionLines.Add($"  Discount ({detail.DiscountPercent.Value:F0}%): -{currency.ToUpper()} {discountAmount:F2}");
                    }
                    
                    var itemSubtotal = detail.Quantity * finalPricePerItem;
                    descriptionLines.Add($"  Subtotal: {currency.ToUpper()} {itemSubtotal:F2}");
                    descriptionLines.Add(""); // Blank line between items
                }
                
                // Order totals
                if (order.Discount > 0)
                {
                    descriptionLines.Add($"Subtotal: {currency.ToUpper()} {order.Total:F2}");
                    descriptionLines.Add($"Order Discount: -{currency.ToUpper()} {order.Discount:F2}");
                }
                if (tip.HasValue && tip.Value > 0)
                {
                    descriptionLines.Add($"Tip: {currency.ToUpper()} {tip.Value:F2}");
                }
                descriptionLines.Add($"TOTAL: {currency.ToUpper()} {amount:F2}");
                
                var description = string.Join("\n", descriptionLines);
                
                // Add detailed line items with full breakdown
                // Calculate and add only essential metadata
                decimal totalBase = orderDetails.Sum(d => d.BasePrice * d.Quantity);
                decimal totalAddons = orderDetailAddons.Sum(a => a.PriceWoVat);
                decimal totalBaseWithAddons = totalBase + totalAddons;
                decimal totalVat = orderDetails.Sum(d => {
                    var addons = orderDetailAddons.Where(a => a.DetailId == d.Nid).Sum(a => a.PriceWoVat);
                    var baseWithAddons = d.BasePrice + addons;
                    return baseWithAddons * d.VatRate * d.Quantity;
                });
                decimal totalDiscount = orderDetails.Sum(d => {
                    var addons = orderDetailAddons.Where(a => a.DetailId == d.Nid).Sum(a => a.PriceWoVat);
                    var baseWithAddons = d.BasePrice + addons;
                    var priceWithVat = baseWithAddons * (1 + d.VatRate);
                    return d.DiscountPercent.HasValue && d.DiscountPercent.Value > 0
                        ? priceWithVat * (d.DiscountPercent.Value / 100) * d.Quantity
                        : 0m;
                });

                var options = new PaymentIntentCreateOptions
                {
                    Amount = (long)(amount * 100), // Stripe uses cents
                    Currency = currency.ToLower(),
                    Description = description,
                    AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                    {
                        Enabled = true,
                    },
                    ReceiptEmail = null, // Will be set when payment is processed
                    Metadata = new Dictionary<string, string>
                    {
                        { "orderId", orderId.ToString() },
                        { "orderCode", order.Code ?? orderId.ToString() },
                        { "businessId", order.BusinessId.ToString() },
                        { "orderDate", order.DateCreated.ToString("yyyy-MM-dd HH:mm:ss") },
                        { "itemCount", orderDetails.Sum(od => od.Quantity).ToString() },
                        { "orderSubtotal", order.Total.ToString("F2") },
                        { "orderDiscount", order.Discount.ToString("F2") },
                        { "finalTotal", amount.ToString("F2") },
                        { "totalBasePrice", totalBaseWithAddons.ToString("F2") },
                        { "totalVatAmount", totalVat.ToString("F2") },
                        { "totalDiscountAmount", totalDiscount.ToString("F2") },
                        { "currency", currency }
                    }
                };

                var service = new PaymentIntentService();
                var paymentIntent = await service.CreateAsync(options);

                return paymentIntent.ClientSecret;
            }
            catch (StripeException ex)
            {
                throw new ApiException(500, $"Failed to create payment intent: {ex.Message}");
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

            try
            {
                // If it's a Stripe payment (has payment intent ID), process refund through Stripe
                if (payment.PaymentMethod == PaymentMethod.Card && payment.TransactionId?.StartsWith("pi_") == true)
                {
                    var refundOptions = new RefundCreateOptions
                    {
                        PaymentIntent = payment.TransactionId,
                        Amount = (long)(request.Amount * 100), // Stripe uses cents
                        Reason = "requested_by_customer"
                    };

                    var refundService = new RefundService();
                    var stripeRefund = await refundService.CreateAsync(refundOptions);

                    // Create a refund payment record
                    var refundPayment = new Payment
                    {
                        OrderId = payment.OrderId,
                        Amount = -request.Amount,
                        Currency = payment.Currency,
                        PaymentMethod = payment.PaymentMethod,
                        Status = PaymentStatus.Refunded,
                        CreatedAt = DateTime.UtcNow,
                        ProcessedAt = DateTime.UtcNow,
                        TransactionId = stripeRefund.Id,
                        CustomerEmail = payment.CustomerEmail,
                        ErrorMessage = $"Refund reason: {request.Reason}"
                    };

                    // Update original payment status
                    if (request.Amount == payment.Amount)
                    {
                        payment.Status = PaymentStatus.Refunded;
                        // Update order status to Refunded
                        await _ordersService.UpdateOrderStatusAsync(payment.OrderId, OrderStatus.Refunded);
                    }
                    else
                    {
                        payment.Status = PaymentStatus.PartiallyRefunded;
                        // Update order status to PartiallyRefunded
                        await _ordersService.UpdateOrderStatusAsync(payment.OrderId, OrderStatus.PartiallyRefunded);
                    }

                    _context.Payments.Add(refundPayment);
                    await _context.SaveChangesAsync();

                    return MapToDTO(refundPayment);
                }
                else
                {
                    // For non-Stripe payments (cash, gift card), just create refund record
                    var refundPayment = new Payment
                    {
                        OrderId = payment.OrderId,
                        Amount = -request.Amount,
                        Currency = payment.Currency,
                        PaymentMethod = payment.PaymentMethod,
                        Status = PaymentStatus.Refunded,
                        CreatedAt = DateTime.UtcNow,
                        ProcessedAt = DateTime.UtcNow,
                        TransactionId = $"REFUND-{payment.TransactionId}",
                        CustomerEmail = payment.CustomerEmail,
                        ErrorMessage = $"Refund reason: {request.Reason}"
                    };

                    if (request.Amount == payment.Amount)
                    {
                        payment.Status = PaymentStatus.Refunded;
                        // Update order status to Refunded
                        await _ordersService.UpdateOrderStatusAsync(payment.OrderId, OrderStatus.Refunded);
                    }
                    else
                    {
                        payment.Status = PaymentStatus.PartiallyRefunded;
                        // Update order status to PartiallyRefunded
                        await _ordersService.UpdateOrderStatusAsync(payment.OrderId, OrderStatus.PartiallyRefunded);
                    }

                    _context.Payments.Add(refundPayment);
                    await _context.SaveChangesAsync();

                    return MapToDTO(refundPayment);
                }
            }
            catch (StripeException ex)
            {
                throw new ApiException(500, $"Stripe refund failed: {ex.Message}");
            }
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

        private async Task<string> GenerateReceiptContentAsync(long orderId, decimal amount, string currency, decimal? tip)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null) return string.Empty;

            var orderDetails = await _context.OrderDetails
                .Where(od => od.OrderId == orderId)
                .ToListAsync();
            
            var itemIds = orderDetails.Select(od => od.ItemId).ToList();
            var menuItems = await _context.MenuItems
                .Where(mi => itemIds.Contains(mi.Nid))
                .ToDictionaryAsync(mi => mi.Nid, mi => mi);

            var orderDetailIds = orderDetails.Select(od => od.Nid).ToList();
            var orderDetailAddons = await _context.OrderDetailAddOns
                .Where(oda => orderDetailIds.Contains(oda.DetailId))
                .ToListAsync();
            
            var ingredientIds = orderDetailAddons.Select(oda => oda.IngredientId).Distinct().ToList();
            var ingredients = await _context.MenuItemIngredients
                .Where(mii => ingredientIds.Contains(mii.Nid))
                .ToDictionaryAsync(mii => mii.Nid, mii => mii.Name);

            var descriptionLines = new List<string>();
            descriptionLines.Add($"Order {order.Code ?? orderId.ToString()}");
            descriptionLines.Add("---");
            
            foreach (var detail in orderDetails)
            {
                var item = menuItems.ContainsKey(detail.ItemId) ? menuItems[detail.ItemId] : null;
                var itemName = item?.Name ?? $"Item #{detail.ItemId}";
                
                var itemAddons = orderDetailAddons.Where(oda => oda.DetailId == detail.Nid).ToList();
                
                descriptionLines.Add($"{detail.Quantity}x {itemName}");
                
                descriptionLines.Add($"  Base: {currency.ToUpper()} {detail.BasePrice:F2}");
                
                var totalBasePriceWithAddons = detail.BasePrice;
                if (itemAddons.Any())
                {
                    foreach (var addon in itemAddons)
                    {
                        var addonName = ingredients.ContainsKey(addon.IngredientId) ? ingredients[addon.IngredientId] : "Unknown";
                        descriptionLines.Add($"  + {addonName} ({currency.ToUpper()} {addon.PriceWoVat:F2})");
                    }
                    totalBasePriceWithAddons += itemAddons.Sum(a => a.PriceWoVat);
                    descriptionLines.Add($"  Total Base with Add-ons: {currency.ToUpper()} {totalBasePriceWithAddons:F2}");
                }
                
                var vatAmount = totalBasePriceWithAddons * detail.VatRate;
                var priceWithVat = totalBasePriceWithAddons * (1 + detail.VatRate);
                descriptionLines.Add($"  VAT ({(detail.VatRate * 100):F0}%): +{currency.ToUpper()} {vatAmount:F2}");
                
                decimal finalPricePerItem = priceWithVat;
                if (detail.DiscountPercent.HasValue && detail.DiscountPercent.Value > 0)
                {
                    var discountAmount = priceWithVat * (detail.DiscountPercent.Value / 100);
                    finalPricePerItem = priceWithVat - discountAmount;
                    descriptionLines.Add($"  Discount ({detail.DiscountPercent.Value:F0}%): -{currency.ToUpper()} {discountAmount:F2}");
                }
                
                var itemSubtotal = detail.Quantity * finalPricePerItem;
                descriptionLines.Add($"  Subtotal: {currency.ToUpper()} {itemSubtotal:F2}");
                descriptionLines.Add("");
            }
            
            if (order.Discount > 0)
            {
                descriptionLines.Add($"Subtotal: {currency.ToUpper()} {order.Total:F2}");
                descriptionLines.Add($"Order Discount: -{currency.ToUpper()} {order.Discount:F2}");
            }
            
            if (tip.HasValue && tip.Value > 0)
            {
                descriptionLines.Add($"Tip: {currency.ToUpper()} {tip.Value:F2}");
            }
            descriptionLines.Add($"TOTAL: {currency.ToUpper()} {amount:F2}");
            
            return string.Join("\n", descriptionLines);
        }
    }
}