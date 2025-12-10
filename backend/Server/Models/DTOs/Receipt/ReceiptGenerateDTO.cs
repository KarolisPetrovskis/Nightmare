using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DTOs.Receipt;
public class ReceiptGenerateDTO
{
    [Required]
    [Range(1, long.MaxValue, ErrorMessage = "OrderId must be a positive number")]
    public required long OrderId { get; set; }
}