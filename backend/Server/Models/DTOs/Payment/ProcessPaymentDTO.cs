using System.ComponentModel.DataAnnotations;
using backend.Server.Models.Enums;

namespace backend.Server.Models.DTOs.Payment;
public class ProcessPaymentDTO
{
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero")]
    public required decimal Amount { get; set; }

    [Required(ErrorMessage = "Currency is required")]
    [StringLength(3, MinimumLength = 3, ErrorMessage = "Currency must be a 3-letter code (e.g., USD, EUR)")]
    public required string Currency { get; set; }

    [Required]
    [Range(1, long.MaxValue, ErrorMessage = "OrderId must be a positive number")]
    public required long OrderId { get; set; }

    [Required]
    public required PaymentMethod PaymentMethod { get; set; }

    [StringLength(100)]
    public string? StripePaymentMethodId { get; set; }

    [StringLength(200)]
    public string? PaymentIntentId { get; set; }

    [EmailAddress(ErrorMessage = "Invalid email format")]
    [StringLength(100)]
    public string? CustomerEmail { get; set; }
    public decimal? Tip { get; set; }
}