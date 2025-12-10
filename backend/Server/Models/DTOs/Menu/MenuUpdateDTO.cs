using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DTOs.Menu;
public class MenuUpdateDTO
{
    [StringLength(200, MinimumLength = 1)]
    public string? Name { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than zero")]
    public decimal? Price { get; set; }

    [Range(0, 100, ErrorMessage = "Discount must be between 0 and 100")]
    public decimal? Discount { get; set; }

    [Range(1, long.MaxValue, ErrorMessage = "VatId must be a positive number")]
    public long? VatId { get; set; }

    public DateTime? DiscountTime { get; set; }
}