namespace NightMare.Backend.Data;
// Pass NId to controller manually
public class MenuUpdateDTO
{
    public string Name { get; set; }
    public decimal? Price { get; set; }
    public decimal? Discount { get; set; }
    public int? VatId { get; set; }
    public DateTime? DiscountTime { get; set; }
}