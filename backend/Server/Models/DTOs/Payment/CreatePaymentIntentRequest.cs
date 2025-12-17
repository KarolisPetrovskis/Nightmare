using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DTOs.Payment;

public class CreatePaymentIntentRequest
{
    [Required]
    [Range(1, long.MaxValue, ErrorMessage = "OrderId must be a positive number")]
    public required long OrderId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero")]
    public required decimal Amount { get; set; }

    [Required(ErrorMessage = "Currency is required")]
    [StringLength(3, MinimumLength = 3, ErrorMessage = "Currency must be a 3-letter code (e.g., USD, EUR)")]
    public required string Currency { get; set; }

    public decimal? Tip { get; set; }
}
