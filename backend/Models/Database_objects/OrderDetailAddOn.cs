namespace NightMare.Backend.Data;
public class OrderDetailAddOn
{
    [Key]
    public long Nid { get; set; }
    public long DetailId { get; set; }
    public long IngredientId { get; set; }
    public decimal Price_wo_vat { get; set; }
}