using backend.Server.Models.DatabaseObjects;

namespace backend.Server.Interfaces
{
    public interface IReceiptsService
    {
        Task<Receipt> CreateReceiptAsync(long orderId, long paymentId);
        Task<Receipt?> GetReceiptByOrderIdAsync(long orderId);
        Task<Receipt?> GetReceiptByNidAsync(long nid);
        Task<List<Receipt>> GetReceiptsByBusinessIdAsync(long businessId);
    }
}