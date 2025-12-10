using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DTOs.VAT;
public class VatGetAllDTO
{
    [Range(0, int.MaxValue, ErrorMessage = "Page must be non-negative")]
    public int Page { get; set; } = 1;

    [Range(0, 1000, ErrorMessage = "PerPage must be between 0 and 1000")]
    public int PerPage { get; set; } = 20;
}