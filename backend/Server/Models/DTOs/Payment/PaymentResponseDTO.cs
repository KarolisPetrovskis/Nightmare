using backend.Server.Models.Enums;

namespace backend.Server.Models.DTOs.Payment;

public class PaymentResponseDTO
{
    public long PaymentId { get; set; }
    public long OrderId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "EUR";
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public string? TransactionId { get; set; }
    public string? ErrorMessage { get; set; }
}
