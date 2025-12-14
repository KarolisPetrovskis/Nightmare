using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DatabaseObjects;
public class Service
    {
    [Key]
    public long Nid { get; set; }
    public required string Name { get; set; }
    public required decimal Price { get; set; }
    public decimal? Discount { get; set; }
    public required long VatId { get; set; }
    public DateTime? DiscountTime { get; set; }
    public required int TimeMin { get; set; }
    public required long BusinessId { get; set; }
    }
