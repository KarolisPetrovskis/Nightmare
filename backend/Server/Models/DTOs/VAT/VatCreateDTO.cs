using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DTOs.VAT;

public class VatCreateDTO
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(100, MinimumLength = 1)]
    public required string Name { get; set; }
    public required float Percentage { get; set; }
}