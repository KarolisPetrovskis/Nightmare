namespace backend.Server.Models.DTOs.Payment;
public class RefundDTO
{
    public required long PaymentId { get; set; }
    public required decimal Amount { get; set; }
    public required string Reason {get; set;}
}