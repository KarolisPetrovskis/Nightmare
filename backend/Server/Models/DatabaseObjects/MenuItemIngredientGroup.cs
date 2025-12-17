using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DatabaseObjects;

public class MenuItemIngredientGroup
{
    [Key]
    public long Nid { get; set; }
    
    [Required]
    [StringLength(200)]
    public string Name { get; set; }
    
    [Required]
    public long MenuItemId { get; set; }
}
