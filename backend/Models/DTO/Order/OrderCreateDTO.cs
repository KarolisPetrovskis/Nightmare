namespace NightMare.Backend.Data;
public class OrderCreateDTO
{
    public string Code { get; set; }
    public required long VatId { get; set; }
    public required long StatusId { get; set; }
    public decimal? Total { get; set; }
    public required long BusinessId { get; set; }
    public required long WorkerId { get; set; }
    // do we have null or pottentially empty
    public List<OrderDetailRequest> OrderDetails { get; set; } = new List<OrderDetailRequest>();
}