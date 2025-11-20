namespace NightMare.Backend.Data;
public class MenuItem
{
    [Key]
    public long Nid { get; set; }
    public string Name { get; set; }
    public long BusinessId { get; set; }
    // If we dont sell it anymore its null, unless we retire it?
    public decimal? Price { get; set; }
    // If we have no discount it is null and not 0
    public decimal? Discount { get; set; }
    public DateTime? DiscountTime { get; set; }
    public long VatId { get; set; }
}