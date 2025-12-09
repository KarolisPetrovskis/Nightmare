using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DTOs.MenuAddon;
public class MenuAddonCreateDTO
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(200, MinimumLength = 1)]
    public required string Name { get; set; }

    [Required]
    [Range(1, long.MaxValue, ErrorMessage = "ItemId must be a positive number")]
    public required long ItemId { get; set; }

    [Required]
    [Range(0, double.MaxValue, ErrorMessage = "Price must be non-negative")]
    public required decimal Price { get; set; }
}
