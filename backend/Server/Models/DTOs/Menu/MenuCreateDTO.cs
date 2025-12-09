using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DTOs.Menu;
public class MenuCreateDTO
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(200, MinimumLength = 1)]
    public required string Name { get; set; }

    [Required]
    [Range(1, long.MaxValue, ErrorMessage = "BusinessId must be a positive number")]
    public required long BusinessId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than zero")]
    public required decimal Price { get; set; }

    [Range(0, 100, ErrorMessage = "Discount must be between 0 and 100")]
    public decimal? Discount { get; set; }

    [Required]
    [Range(1, long.MaxValue, ErrorMessage = "VatId must be a positive number")]
    public required long VatId { get; set; }

    public DateTime? DiscountTime { get; set; }
}
