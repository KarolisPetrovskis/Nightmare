using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DatabaseObjects;
// I assume one Menu item has many MenuItemIngredients yes?
public class MenuItemIngredient
{
    [Key]
    public long Nid { get; set; }
    public string Name { get; set; }
    // How would the items retirement be handeled?
    public long? ItemId { get; set; }
    public decimal Price { get; set; }
}