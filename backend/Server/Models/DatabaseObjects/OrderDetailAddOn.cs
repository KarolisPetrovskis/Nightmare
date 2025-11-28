using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DatabaseObjects;
public class OrderDetailAddOn
{
    [Key]
    public long Nid { get; set; }
    public long DetailId { get; set; }
    public long IngredientId { get; set; }
    public decimal Price_wo_vat { get; set; }
}