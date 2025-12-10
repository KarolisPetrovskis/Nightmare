using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DTOs.MenuAddon;
public class MenuAddonUpdateDTO
{
    [StringLength(200, MinimumLength = 1)]
    public string? Name { get; set; }

    [Range(1, long.MaxValue, ErrorMessage = "ItemId must be a positive number")]
    public long? ItemId { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Price must be non-negative")]
    public decimal? Price { get; set; }
}