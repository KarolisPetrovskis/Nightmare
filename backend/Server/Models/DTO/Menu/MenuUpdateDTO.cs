namespace NightMare.Backend.Data;
// Pass NId to controller manually
public class MenuUpdateDTO
{
    public string Name { get; set; }
    // Can we have price as null if its no longer available?
    public decimal Price { get; set; }
    public decimal? Discount { get; set; }
    public long VatId { get; set; }
    // If we have no discount it is null and not 0
    public DateTime? DiscountTime { get; set; }
}