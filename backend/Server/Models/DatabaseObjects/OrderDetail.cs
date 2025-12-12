using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DatabaseObjects;
public class OrderDetail
{
    [Key]
    public long Nid { get; set; }
    public long OrderId { get; set; }
    public long ItemId { get; set; }
    public decimal PriceWoVat { get; set; }
    public decimal PriceWtVat { get; set; }
}