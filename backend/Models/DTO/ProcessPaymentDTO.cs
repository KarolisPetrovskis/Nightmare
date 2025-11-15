namespace NightMare.Backend.Data;
public class ProcessPaymentDTO
{
    public required decimal Amount { get; set; }
    // would it not be wiser to have some utf8 char for currency symbol?
    public required string Currency { get; set; }
    public required long OrderId { get; set; }
    // apparently this is an enum in yaml but not class diagram
    public required PaymentMethod PaymentMethod { get; set; }
    public string? StripePaymentMethodId { get; set; }
    public string? CustomerEmail { get; set; }

}