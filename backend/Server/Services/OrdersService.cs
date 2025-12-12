using backend.Server._helpers;
using backend.Server.Database;
using backend.Server.Exceptions;
using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
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
                throw new ApiException(400, "Page number must be greater than zero");
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

        public async Task CreateOrderAsync(Order order)
        {
            if (order == null)
            {
                throw new ApiException(400, "Order cannot be null");
            }

            _context.Orders.Add(order);

            await Helper.SaveChangesOrThrowAsync(_context, "Failed to create order.");
        }

        public async Task CreateOrderDetailsAsync(List<OrderDetail> orderDetails)
        {
            if (orderDetails == null || orderDetails.Count == 0)
            {
                throw new ApiException(400, "Order details cannot be null or empty");
            }

            _context.OrderDetails.AddRange(orderDetails);

            await Helper.SaveChangesOrThrowAsync(_context, "Failed to create order details.");
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

            var order = await _context.Orders
                .AsNoTracking()
                .FirstOrDefaultAsync(o => o.Nid == nid) ?? throw new ApiException(404, $"Order with Nid {nid} not found");

            return order;
        }

        public async Task<List<OrderDetail>> GetOrderDetailsByOrderId(long orderNid)
        {
            if (orderNid <= 0)
            {
                throw new ApiException(400, "OrderNid must be a positive number");
            }

            var orderDetails = await _context.OrderDetails
                .AsNoTracking()
                .Where(od => od.OrderId == orderNid)
                .ToListAsync() ?? throw new ApiException(404, $"Order details for OrderNid {orderNid} not found");

            return orderDetails;
        }

        public async Task<List<OrderDetailAddOn>> GetOrderDetailAddOnsByDetailId(long detailNid)
        {
            if (detailNid <= 0)
            {
                throw new ApiException(400, "DetailNid must be a positive number");
            }

            var orderDetailAddOns = await _context.OrderDetailAddOns
                .AsNoTracking()
                .Where(oda => oda.DetailId == detailNid)
                .ToListAsync() ?? throw new ApiException(404, $"Order detail add-ons for DetailNid {detailNid} not found");

            return orderDetailAddOns;
        }

        public async Task<Order> GetOrderByBusinessIdAsync(long businessId)
        {
            if (businessId <= 0)
            {
                throw new ApiException(400, "BusinessId must be a positive number");
            }

            var order = await _context.Orders
                .AsNoTracking()
                .FirstOrDefaultAsync(o => o.BusinessId == businessId) ?? throw new ApiException(404, $"Order with BusinessId {businessId} not found");

            return order;
        }

        public async Task UpdateOrderAsync(Order order)
        {
            if (order == null || order.Nid <= 0)
            {
                throw new ApiException(400, "Invalid order data");
            } 

            _context.Orders.Update(order);

            await Helper.SaveChangesOrThrowAsync(_context, $"Failed to update order {order.Nid}.", expectChanges: false);
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