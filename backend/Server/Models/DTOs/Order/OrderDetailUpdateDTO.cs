using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DTOs.Order;

public class OrderDetailUpdateDTO
{
    [Range(0, double.MaxValue, ErrorMessage = "BasePrice must be non-negative")]
    public decimal? BasePrice { get; set; }
    
    [Range(0, double.MaxValue, ErrorMessage = "VatRate must be non-negative")]
    public decimal? VatRate { get; set; }
    
    [Range(0, 100, ErrorMessage = "DiscountPercent must be between 0 and 100")]
    public decimal? DiscountPercent { get; set; }
    
    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
    public int? Quantity { get; set; }
}
