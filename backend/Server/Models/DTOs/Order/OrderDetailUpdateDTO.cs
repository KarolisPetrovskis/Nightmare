using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DTOs.Order;

public class OrderDetailUpdateDTO
{
    [Range(0, double.MaxValue, ErrorMessage = "PriceWoVat must be non-negative")]
    public decimal? PriceWoVat { get; set; }
    
    [Range(0, double.MaxValue, ErrorMessage = "PriceWtVat must be non-negative")]
    public decimal? PriceWtVat { get; set; }
    
    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
    public int? Quantity { get; set; }
}
