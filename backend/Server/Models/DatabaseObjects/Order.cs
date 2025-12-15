using System.ComponentModel.DataAnnotations;
using backend.Server.Models.Enums;

namespace backend.Server.Models.DatabaseObjects;
public class Order
{
    [Key]
    public long Nid { get; set; }
    public string? Code { get; set; }
    public long VatId { get; set; }
    public OrderStatus Status { get; set; }
    public decimal Total { get; set; }
    public DateTime DateCreated { get; set; }
    public long BusinessId { get; set; }
    public long? WorkerId { get; set; }
    public decimal Discount { get; set; }
}