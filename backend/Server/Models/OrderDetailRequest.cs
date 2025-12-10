namespace backend.Server.Models;

public class OrderDetailRequest
{
    public long ItemID { get; set; }
    public decimal PriceWoVat { get; set; }
    public decimal PriceWtVat { get; set; }
    public List<AddOns>? Addons { get; set;}
}