using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DTOs.GiftCard;
public class GiftCardCreateDTO
{
    [Required(ErrorMessage = "Code is required")]
    [StringLength(50, MinimumLength = 1)]
    public required string Code { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Value must be greater than zero")]
    public required decimal Value { get; set; }

    [Required]
    [Range(1, long.MaxValue, ErrorMessage = "BusinessId must be a positive number")]
    public required long BusinessId { get; set; }
}