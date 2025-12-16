using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DatabaseObjects;
public class OrderDetail
{
    [Key]
    public long Nid { get; set; }
    public long OrderId { get; set; }
    public long ItemId { get; set; }
    public decimal BasePrice { get; set; }
    public decimal VatRate { get; set; }
    public decimal? DiscountPercent { get; set; }
    public int Quantity { get; set; } = 1;
}