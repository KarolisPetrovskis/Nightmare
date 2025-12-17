using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models;

public class OrderDetailRequest
{
    [Required]
    [Range(1, long.MaxValue, ErrorMessage = "ItemId must be a positive number")]
    public required long ItemId { get; set; }
    [Required]
    [Range(0, double.MaxValue, ErrorMessage = "BasePrice must be non-negative")]
    public required decimal BasePrice { get; set; }
    [Required]
    [Range(0, double.MaxValue, ErrorMessage = "VatRate must be non-negative")]
    public required decimal VatRate { get; set; }
    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
    public int Quantity { get; set; } = 1;
    public List<OrderAddOnsDTO>? Addons { get; set;}
    public decimal? DiscountPercent { get; set; }
}