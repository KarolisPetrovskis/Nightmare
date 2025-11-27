using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DatabaseObjects;
public class MenuItem
{
    [Key]
    public long Nid { get; set; }
    public string Name { get; set; }
    public long BusinessId { get; set; }
    public decimal Price { get; set; }
    // If we have no discount it is null and not 0
    public decimal? Discount { get; set; }
    public DateTime? DiscountTime { get; set; }
    public long VatId { get; set; }
}