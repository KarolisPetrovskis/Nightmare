using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DTOs.Service;
public class ServiceUpdateDTO
{
    [StringLength(200, MinimumLength = 1)]
    public required string Name { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than zero")]
    public decimal Price { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "TimeMin must be at least 1 minute")]
    public int TimeMin { get; set; }
    // Same problem with DiscountTIme as in ServiceCreateDTO

    [Range(0, 100, ErrorMessage = "Discount must be between 0 and 100")]
    public decimal? Discount { get; set; }

    [Range(1, long.MaxValue, ErrorMessage = "VatId must be a positive number")]
    public long VatId { get; set; }
    [StringLength(1000, ErrorMessage = "Description can't be longer than 1000 characters")]
    public string? Description { get; set; }
}