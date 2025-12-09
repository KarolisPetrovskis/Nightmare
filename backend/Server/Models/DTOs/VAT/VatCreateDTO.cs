using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DTOs.VAT;

public class VatCreateDTO
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(100, MinimumLength = 1)]
    public required string Name { get; set; }

    [Required]
    [Range(0, 100, ErrorMessage = "Percentage must be between 0 and 100")]
    public required decimal Percentage { get; set; }
}