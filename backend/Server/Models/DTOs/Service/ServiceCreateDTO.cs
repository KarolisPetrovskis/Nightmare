using System.ComponentModel.DataAnnotations;
using backend.Server.Models.Helper;

namespace backend.Server.Models.DTOs.Service;
public class ServiceCreateDTO
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(200, MinimumLength = 1)]
    public required string Name { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than zero")]
    public required decimal Price { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "TimeMin must be at least 1 minute")]
    public required int TimeMin { get; set; }

    [Required]
    [Range(0, 100, ErrorMessage = "Discount must be between 0 and 100")]
    public required decimal Discount { get; set; }

    [Required]
    [Range(1, long.MaxValue, ErrorMessage = "VatId must be a positive number")]
    public required long VatId { get; set; }

    [Required]
    [Range(1, long.MaxValue, ErrorMessage = "BusinessId must be a positive number")]
    public required long BusinessId { get; set; }
    [FutureOrPresentDate(ErrorMessage = "Discount time cannot be in the past")]
    public DateTime? DiscountTime { get; set; }
    // Need to add validation.
    [StringLength(1000, ErrorMessage = "Description can't be longer than 1000 characters")]
    public string? Description { get; set; }
}
