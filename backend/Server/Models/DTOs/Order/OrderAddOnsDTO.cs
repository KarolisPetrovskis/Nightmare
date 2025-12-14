using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models;

public class OrderAddOnsDTO
{
    [Required]
    [Range(1, long.MaxValue, ErrorMessage = "IngredientId must be a positive number")]
    public required long IngredientId { get; set;}
    [Required]
    [Range(0, double.MaxValue, ErrorMessage = "PriceWoVat must be non-negative")]
    public required decimal PriceWoVat { get; set;}
    
}