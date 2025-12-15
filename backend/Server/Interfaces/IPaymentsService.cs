using backend.Server.Models.DTOs.Payment;

namespace backend.Server.Interfaces
{
    public interface IPaymentsService
    {
        Task<PaymentResponseDTO> ProcessPaymentAsync(ProcessPaymentDTO request);
        Task<PaymentResponseDTO> RefundPaymentAsync(RefundDTO request);
        Task<PaymentResponseDTO?> GetPaymentByIdAsync(long paymentId);
        Task<List<PaymentResponseDTO>> GetPaymentsByOrderIdAsync(long orderId);
    }
}