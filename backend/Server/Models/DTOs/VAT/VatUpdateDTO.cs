using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DTOs.VAT;
public class VatUpdateDTO
{
    [StringLength(100, MinimumLength = 1)]
    public string? Name { get; set; }

    [Range(0, 100, ErrorMessage = "Percentage must be between 0 and 100")]
    public float? Percentage { get; set; }
}