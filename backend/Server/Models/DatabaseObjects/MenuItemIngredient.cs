using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DatabaseObjects;
// MenuItemIngredient now belongs to a MenuAddonGroup
public class MenuItemIngredient
{
    [Key]
    public long Nid { get; set; }
    public string Name { get; set; }
    // Reference to the ingredient group
    public long? GroupId { get; set; }
    public decimal Price { get; set; }
}