namespace NightMare.Backend.Data;
public class OrderCreateDTO
{
    public string Code { get; set; }
    public required long VatId { get; set; }
    public required long StatusId { get; set; }
    public decimal Total { get; set; } = 0.00;
    public required long BusinessId { get; set; }
    // Null if untracked or not yet assinged
    public long? WorkerId { get; set; } = null;
    // do we have null or pottentially empty, or do we not have it at all?
    public required List<OrderDetailRequest> OrderDetails { get; set; } = new List<OrderDetailRequest>();
}