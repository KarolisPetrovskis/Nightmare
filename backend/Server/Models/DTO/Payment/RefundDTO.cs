namespace NightMare.Backend.Data;
public class RefundDTO
{
    public required long PaymentId { get; set; }
    public required decimal Amount { get; set; }
    public required string Reason {get; set;}
}