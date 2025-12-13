using backend.Server._helpers;
using backend.Server.Database;
using backend.Server.Exceptions;
using backend.Server.Interfaces;
using backend.Server.Models;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.Order;
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
                StatusId = request.StatusId,
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
                            Price_wo_vat = addonRequest.PriceWoVat
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
                    Price_wo_vat = detailRequest.PriceWoVat,
                    Price_w_vat = detailRequest.PriceWtVat
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

            if (request.StatusId.HasValue) order.StatusId = request.StatusId.Value;
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

            _context.Orders.Remove(order);

            await Helper.SaveChangesOrThrowAsync(_context, $"Failed to delete order {nid}.");
        }
    }
}