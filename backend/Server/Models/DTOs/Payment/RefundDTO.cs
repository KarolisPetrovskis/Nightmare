using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DTOs.Payment;
public class RefundDTO
{
    [Required]
    [Range(1, long.MaxValue, ErrorMessage = "PaymentId must be a positive number")]
    public required long PaymentId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero")]
    public required decimal Amount { get; set; }

    [Required(ErrorMessage = "Reason is required")]
    [StringLength(500, MinimumLength = 1)]
    public required string Reason { get; set; }
}