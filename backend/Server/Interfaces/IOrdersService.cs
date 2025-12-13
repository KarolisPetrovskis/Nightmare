using backend.Server.Models;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.Order;

namespace backend.Server.Interfaces
{
    public interface IOrdersService
    {
        Task<List<Order>> GetAllOrdersAsync(int page, int perPage);
        Task<List<Order>> TrimOrdersByWorkerIdAsync(List<Order> orders, long workerId);
        Task<List<Order>> TrimOrdersByDateAsync(List<Order> orders, DateTime date);
        Task<Order> CreateOrderAsync(OrderCreateDTO request);
        Task<List<OrderDetail>> CreateOrderDetailsAsync(List<OrderDetailRequest> orderDetailsRequest, long orderNid);
        Task CreateOrderDetailAddOnsAsync(List<OrderDetailAddOn> orderDetailAddOns);
        Task<Order> GetOrderByNidAsync(long nid);
        Task<List<OrderDetail>> GetOrderDetailsByOrderId(long orderNid);
        Task<List<OrderDetailAddOn>> GetOrderDetailAddOnsByDetailId(long detailNid);
        Task<List<Order>> GetOrderByBusinessIdAsync(long businessId);
        Task UpdateOrderAsync(Order order);
        Task DeleteOrderAsync(long nid);
    }
}