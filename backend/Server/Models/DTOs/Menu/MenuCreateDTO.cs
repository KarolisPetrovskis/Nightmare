namespace backend.Server.Models.DTOs.Menu;
public class MenuCreateDTO
{
    public required string Name { get; set; }
    public required long BusinessId { get; set; }
    public required decimal Price { get; set; }
    // If we have no discount it is null
    public decimal? Discount { get; set; }
    public required long VatId { get; set; }
    public DateTime? DiscountTime { get; set; }
}
