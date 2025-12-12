using backend.Server.Models.DatabaseObjects;

namespace backend.Server.Interfaces
{
    public interface IOrdersService
    {
        Task<List<Order>> GetAllOrdersAsync(int page, int perPage);
        Task<List<Order>> TrimOrdersByWorkerIdAsync(List<Order> orders, long workerId);
        Task<List<Order>> TrimOrdersByDateAsync(List<Order> orders, DateTime date);
        Task CreateOrderAsync(Order order);
        Task CreateOrderDetailsAsync(List<OrderDetail> orderDetails);
        Task CreateOrderDetailAddOnsAsync(List<OrderDetailAddOn> orderDetailAddOns);
        void placeholderMethod();
    }
}