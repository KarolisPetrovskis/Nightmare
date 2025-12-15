using backend.Server._helpers;
using backend.Server.Database;
using backend.Server.Exceptions;
using backend.Server.Interfaces;
using backend.Server.Models;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.Order;
using backend.Server.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Server.Services
{
    public class OrdersService (ApplicationDbContext context) : IOrdersService
    {
        private readonly ApplicationDbContext _context = context;
        public async Task<List<Order>> GetAllOrdersAsync(int page, int perPage)
        {
            if (page < 0)
            {
                throw new ApiException(400, "Page number must be greater than or equal to zero");
            }
            if (perPage <= 0)
            {
                throw new ApiException(400, "PerPage value must be greater than zero");
            }

            if (page == 0)
            {
                return await _context.Orders
                    .AsNoTracking()
                    .ToListAsync();
            }

            return await _context.Orders
                .Skip((page - 1) * perPage)
                .Take(perPage)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<List<Order>> TrimOrdersByWorkerIdAsync(List<Order> orders, long workerId)
        {
            if (workerId <= 0)
            {
                throw new ApiException(400, "Worker ID must be a positive number");
            }

            var filtered = orders.Where(o => o.WorkerId == workerId).ToList();
            return await Task.FromResult(filtered);
        }

        public async Task<List<Order>> TrimOrdersByDateAsync(List<Order> orders, DateTime date)
        {
            if (date == default)
            {
                throw new ApiException(400, "Invalid date provided");
            }

            var filtered = orders.Where(o => o.DateCreated.Date == date.Date).ToList();
            return await Task.FromResult(filtered);
        }

        public async Task<Order> CreateOrderAsync(OrderCreateDTO request)
        {
            var order = new Order
            {
                Code = request.Code,
                VatId = request.VatId,
                Status = OrderStatus.InProgress,
                Total = request.Total,
                DateCreated = DateTime.UtcNow,
                BusinessId = request.BusinessId,
                WorkerId = request.WorkerId,
            };

            _context.Orders.Add(order);

            await Helper.SaveChangesOrThrowAsync(_context, "Failed to create order.");

            var orderDetails = await CreateOrderDetailsAsync(request.OrderDetails, order.Nid);

            var orderDetailAddOns = new List<OrderDetailAddOn>();
            foreach (var detailRequest in request.OrderDetails)
            {
                if (detailRequest.Addons != null)
                {
                    foreach (var addonRequest in detailRequest.Addons)
                    {
                        var orderAddOn = new OrderDetailAddOn
                        {
                            DetailId = orderDetails.First(od => od.ItemId == detailRequest.ItemId && od.OrderId == order.Nid).Nid,
                            IngredientId = addonRequest.IngredientId,
                            PriceWoVat = addonRequest.PriceWoVat
                        };
                        orderDetailAddOns.Add(orderAddOn);
                    }
                }
            }

            if (orderDetailAddOns.Count > 0)
            {
                await CreateOrderDetailAddOnsAsync(orderDetailAddOns);
            }

            return order;
        }

        public async Task<List<OrderDetail>> CreateOrderDetailsAsync(List<OrderDetailRequest> orderDetailsRequest, long orderNid)
        {
            if (orderDetailsRequest == null || orderDetailsRequest.Count == 0)
            {
                throw new ApiException(400, "Order details cannot be null or empty");
            }

            if (orderNid <= 0)
            {
                throw new ApiException(400, "OrderNid must be a positive number");
            }
            
            var orderDetails = new List<OrderDetail>();
            foreach (var detailRequest in orderDetailsRequest)
            {
                var orderDetail = new OrderDetail
                {
                    OrderId = orderNid,
                    ItemId = detailRequest.ItemId,
                    PriceWoVat = detailRequest.PriceWoVat,
                    PriceWtVat = detailRequest.PriceWtVat,
                    Quantity = detailRequest.Quantity
                };
                orderDetails.Add(orderDetail);
            }

            _context.OrderDetails.AddRange(orderDetails);

            await Helper.SaveChangesOrThrowAsync(_context, "Failed to create order details.");

            return orderDetails;
        }

        public async Task CreateOrderDetailAddOnsAsync(List<OrderDetailAddOn> orderDetailAddOns)
        {
            if (orderDetailAddOns == null || orderDetailAddOns.Count == 0)
            {
                throw new ApiException(400, "Order detail add-ons cannot be null or empty");
            }

            _context.OrderDetailAddOns.AddRange(orderDetailAddOns);

            await Helper.SaveChangesOrThrowAsync(_context, "Failed to create order detail add-ons.");
        }

        public async Task<Order> GetOrderByNidAsync(long nid)
        {
            if (nid <= 0)
            {
                throw new ApiException(400, "Nid must be a positive number");
            }

            var order = await _context.Orders.FindAsync(nid) ?? throw new ApiException(404, $"Order with Nid {nid} not found");

            return order;
        }

        public async Task<List<OrderDetail>> GetOrderDetailsByOrderId(long orderNid)
        {
            if (orderNid <= 0)
            {
                throw new ApiException(400, "OrderNid must be a positive number");
            }

            return await _context.OrderDetails
                .AsNoTracking()
                .Where(od => od.OrderId == orderNid)
                .ToListAsync();
        }

        public async Task<List<OrderDetailAddOn>> GetOrderDetailAddOnsByDetailId(long detailNid)
        {
            if (detailNid <= 0)
            {
                throw new ApiException(400, "DetailNid must be a positive number");
            }

            return await _context.OrderDetailAddOns
                .AsNoTracking()
                .Where(oda => oda.DetailId == detailNid)
                .ToListAsync();
        }

        public async Task<List<Order>> GetOrderByBusinessIdAsync(long businessId)
        {
            if (businessId <= 0)
            {
                throw new ApiException(400, "BusinessId must be a positive number");
            }

            return await _context.Orders
                .AsNoTracking()
                .Where(o => o.BusinessId == businessId)
                .ToListAsync();
        }

        public async Task UpdateOrderAsync(OrderUpdateDTO request, long nid)
        {
            if (nid <= 0)
            {
                throw new ApiException(400, "Nid must be a positive number");
            }
            var order = await _context.Orders.FindAsync(nid) ?? throw new ApiException(404, $"Order {nid} not found");

            if (request.StatusId.HasValue) order.Status = (OrderStatus)request.StatusId.Value;
            if (request.Total.HasValue) order.Total = request.Total.Value;

            _context.Orders.Update(order);

            await Helper.SaveChangesOrThrowAsync(_context, $"Failed to update order {nid}.", expectChanges: false);
        }

        public async Task DeleteOrderAsync(long nid)
        {
            if (nid <= 0)
            {
                throw new ApiException(400, "Nid must be a positive number");
            }

            var order = await _context.Orders.FindAsync(nid) ?? throw new ApiException(404, $"Order {nid} not found");

            // Get all order details for this order
            var orderDetails = await _context.OrderDetails
                .Where(od => od.OrderId == nid)
                .ToListAsync();

            // Get all detail NIDs to find related addons
            var detailNids = orderDetails.Select(od => od.Nid).ToList();

            // Delete all addons associated with these order details
            if (detailNids.Any())
            {
                var addons = await _context.OrderDetailAddOns
                    .Where(addon => detailNids.Contains(addon.DetailId))
                    .ToListAsync();

                if (addons.Any())
                {
                    _context.OrderDetailAddOns.RemoveRange(addons);
                }
            }

            // Delete all order details
            if (orderDetails.Any())
            {
                _context.OrderDetails.RemoveRange(orderDetails);
            }

            // Finally, delete the order itself
            _context.Orders.Remove(order);

            await Helper.SaveChangesOrThrowAsync(_context, $"Failed to delete order {nid}.");
        }

        public async Task<OrderDetail> AddOrderDetailAsync(long orderNid, OrderDetailRequest request)
        {
            if (orderNid <= 0)
            {
                throw new ApiException(400, "Order Nid must be a positive number");
            }

            // Verify order exists
            var order = await _context.Orders.FindAsync(orderNid) ?? throw new ApiException(404, $"Order {orderNid} not found");

            // Create order detail
            var orderDetail = new OrderDetail
            {
                OrderId = orderNid,
                ItemId = request.ItemId,
                PriceWoVat = request.PriceWoVat,
                PriceWtVat = request.PriceWtVat,
                Quantity = request.Quantity
            };

            _context.OrderDetails.Add(orderDetail);
            await Helper.SaveChangesOrThrowAsync(_context, $"Failed to add item to order {orderNid}.");

            // Add addons if provided
            if (request.Addons != null && request.Addons.Count > 0)
            {
                var addOns = request.Addons.Select(addon => new OrderDetailAddOn
                {
                    DetailId = orderDetail.Nid,
                    IngredientId = addon.IngredientId,
                    PriceWoVat = addon.PriceWoVat
                }).ToList();

                await CreateOrderDetailAddOnsAsync(addOns);
            }

            // Update order total
            var allDetails = await _context.OrderDetails.Where(d => d.OrderId == orderNid).ToListAsync();
            order.Total = allDetails.Sum(d => d.PriceWtVat * d.Quantity);
            _context.Orders.Update(order);
            await Helper.SaveChangesOrThrowAsync(_context, $"Failed to update order total.", expectChanges: false);

            return orderDetail;
        }

        public async Task DeleteOrderDetailAsync(long orderNid, long detailNid)
        {
            if (orderNid <= 0)
            {
                throw new ApiException(400, "Order Nid must be a positive number");
            }
            if (detailNid <= 0)
            {
                throw new ApiException(400, "Detail Nid must be a positive number");
            }

            // Verify order exists
            var order = await _context.Orders.FindAsync(orderNid) ?? throw new ApiException(404, $"Order {orderNid} not found");

            // Find and delete order detail
            var orderDetail = await _context.OrderDetails.FindAsync(detailNid) ?? throw new ApiException(404, $"Order detail {detailNid} not found");

            if (orderDetail.OrderId != orderNid)
            {
                throw new ApiException(400, $"Order detail {detailNid} does not belong to order {orderNid}");
            }

            // Delete associated addons first
            var addons = await _context.OrderDetailAddOns
                .Where(addon => addon.DetailId == detailNid)
                .ToListAsync();
            
            if (addons.Any())
            {
                _context.OrderDetailAddOns.RemoveRange(addons);
            }

            // Now delete the order detail
            _context.OrderDetails.Remove(orderDetail);
            await Helper.SaveChangesOrThrowAsync(_context, $"Failed to remove item from order {orderNid}.");

            // Update order total
            var allDetails = await _context.OrderDetails.Where(d => d.OrderId == orderNid).ToListAsync();
            order.Total = allDetails.Sum(d => d.PriceWtVat * d.Quantity);
            _context.Orders.Update(order);
            await Helper.SaveChangesOrThrowAsync(_context, $"Failed to update order total.", expectChanges: false);
        }

        public async Task UpdateOrderDetailAsync(long orderNid, long detailNid, OrderDetailUpdateDTO request)
        {
            if (orderNid <= 0)
            {
                throw new ApiException(400, "Order Nid must be a positive number");
            }
            if (detailNid <= 0)
            {
                throw new ApiException(400, "Detail Nid must be a positive number");
            }

            // Verify order exists
            var order = await _context.Orders.FindAsync(orderNid) ?? throw new ApiException(404, $"Order {orderNid} not found");

            // Find order detail
            var orderDetail = await _context.OrderDetails.FindAsync(detailNid) ?? throw new ApiException(404, $"Order detail {detailNid} not found");

            if (orderDetail.OrderId != orderNid)
            {
                throw new ApiException(400, $"Order detail {detailNid} does not belong to order {orderNid}");
            }

            // Update prices and quantity if provided
            if (request.PriceWoVat.HasValue) orderDetail.PriceWoVat = request.PriceWoVat.Value;
            if (request.PriceWtVat.HasValue) orderDetail.PriceWtVat = request.PriceWtVat.Value;
            if (request.Quantity.HasValue) orderDetail.Quantity = request.Quantity.Value;

            _context.OrderDetails.Update(orderDetail);
            await Helper.SaveChangesOrThrowAsync(_context, $"Failed to update order detail {detailNid}.", expectChanges: false);

            // Update order total
            var allDetails = await _context.OrderDetails.Where(d => d.OrderId == orderNid).ToListAsync();
            order.Total = allDetails.Sum(d => d.PriceWtVat * d.Quantity);
            _context.Orders.Update(order);
            await Helper.SaveChangesOrThrowAsync(_context, $"Failed to update order total.", expectChanges: false);
        }

        public async Task UpdateOrderDetailAddOnsAsync(long orderNid, long detailNid, List<OrderAddOnsDTO> addons)
        {
            if (orderNid <= 0)
            {
                throw new ApiException(400, "Order Nid must be a positive number");
            }
            if (detailNid <= 0)
            {
                throw new ApiException(400, "Detail Nid must be a positive number");
            }

            // Verify order exists
            var order = await _context.Orders.FindAsync(orderNid) ?? throw new ApiException(404, $"Order {orderNid} not found");

            // Find order detail
            var orderDetail = await _context.OrderDetails.FindAsync(detailNid) ?? throw new ApiException(404, $"Order detail {detailNid} not found");

            if (orderDetail.OrderId != orderNid)
            {
                throw new ApiException(400, $"Order detail {detailNid} does not belong to order {orderNid}");
            }

            // Delete existing addons
            var existingAddons = await _context.OrderDetailAddOns.Where(a => a.DetailId == detailNid).ToListAsync();
            _context.OrderDetailAddOns.RemoveRange(existingAddons);
            await Helper.SaveChangesOrThrowAsync(_context, $"Failed to delete old addons for detail {detailNid}.", expectChanges: false);

            // Add new addons if provided
            if (addons != null && addons.Count > 0)
            {
                var newAddOns = addons.Select(addon => new OrderDetailAddOn
                {
                    DetailId = detailNid,
                    IngredientId = addon.IngredientId,
                    PriceWoVat = addon.PriceWoVat
                }).ToList();

                _context.OrderDetailAddOns.AddRange(newAddOns);
                await Helper.SaveChangesOrThrowAsync(_context, $"Failed to add new addons for detail {detailNid}.");
            }

            // Recalculate detail price with new addons
            var addonTotal = addons?.Sum(a => a.PriceWoVat) ?? 0;
            var menuItem = await _context.MenuItems.FindAsync(orderDetail.ItemId);
            if (menuItem != null)
            {
                var basePrice = menuItem.Price;
                orderDetail.PriceWoVat = basePrice + addonTotal;
                // Assuming VAT rate - you might want to fetch this from the VAT table
                orderDetail.PriceWtVat = orderDetail.PriceWoVat * 1.24m; // TODO: Get actual VAT rate
                
                _context.OrderDetails.Update(orderDetail);
                await Helper.SaveChangesOrThrowAsync(_context, $"Failed to update detail prices.", expectChanges: false);
            }

            // Update order total
            var allDetails = await _context.OrderDetails.Where(d => d.OrderId == orderNid).ToListAsync();
            order.Total = allDetails.Sum(d => d.PriceWtVat * d.Quantity);
            _context.Orders.Update(order);
            await Helper.SaveChangesOrThrowAsync(_context, $"Failed to update order total.", expectChanges: false);
        }

        public async Task UpdateOrderStatusAsync(long orderNid, OrderStatus status)
        {
            var order = await _context.Orders.FindAsync(orderNid) ?? throw new ApiException(404, $"Order with ID {orderNid} not found");

            if (!Enum.IsDefined(typeof(OrderStatus), status))
            {
                throw new ApiException(400, $"Invalid status value: {status}");
            }

            order.Status = status;
            _context.Orders.Update(order);
            await Helper.SaveChangesOrThrowAsync(_context, $"Failed to update order status.");
        }
    }
}
