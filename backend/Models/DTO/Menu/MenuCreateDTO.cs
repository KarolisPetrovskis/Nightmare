namespace NightMare.Backend.Data;
public class MenuCreateDTO
{
    public required string Name { get; set; }

    public required long BusinessId { get; set; }
    // Can we have price as null if its no longer available?
    public required decimal Price { get; set; }
    // If we have no discount it is null and not 0
    public decimal? Discount { get; set; }

    public required long VatId { get; set; }

    public DateTime? DiscountTime { get; set; }
}
