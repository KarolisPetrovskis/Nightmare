using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DatabaseObjects;
public class Service
    {
    [Key]
    public long Nid { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
    public decimal Discount { get; set; }
    public long VatId { get; set; }
    public DateTime? DiscountTime { get; set; }
    public int TimeMin { get; set; }
    public long BusinessId { get; set; }
    }
