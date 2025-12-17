using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DTOs.MenuAddonGroup;

public class MenuAddonGroupCreateDTO
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(200, MinimumLength = 1)]
    public required string Name { get; set; }

    [Required]
    [Range(1, long.MaxValue, ErrorMessage = "MenuItemId must be a positive number")]
    public required long MenuItemId { get; set; }
}
