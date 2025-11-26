namespace NightMare.Backend.Data;
public class ProcessPaymentDTO
{
    public required decimal Amount { get; set; }
    public required string Currency { get; set; }
    public required long OrderId { get; set; }
    public required PaymentMethod PaymentMethod { get; set; }
    public string? StripePaymentMethodId { get; set; }
    public string? CustomerEmail { get; set; }

}