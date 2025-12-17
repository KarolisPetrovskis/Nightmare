using backend.Server.Models.DTOs.Payment;

namespace backend.Server.Interfaces
{
    public interface IPaymentsService
    {
        Task<PaymentResponseDTO> ProcessPaymentAsync(ProcessPaymentDTO request);
        Task<string> CreatePaymentIntentAsync(long orderId, decimal amount, string currency, decimal? tip);
        Task<PaymentResponseDTO> RefundPaymentAsync(RefundDTO request);
        Task<PaymentResponseDTO?> GetPaymentByIdAsync(long paymentId);
        Task<List<PaymentResponseDTO>> GetPaymentsByOrderIdAsync(long orderId);
    }
}