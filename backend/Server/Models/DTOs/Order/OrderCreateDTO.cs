using System.ComponentModel.DataAnnotations;
using backend.Server.Models.Enums;

namespace backend.Server.Models.DTOs.Order;
public class OrderCreateDTO
{
    [StringLength(50)]
    public string? Code { get; set; }

    [Required]
    [Range(1, long.MaxValue, ErrorMessage = "VatId must be a positive number")]
    public required long VatId { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Total must be non-negative")]
    public decimal Total { get; set; } = 0.00M;

    [Required]
    [Range(1, long.MaxValue, ErrorMessage = "BusinessId must be a positive number")]
    public required long BusinessId { get; set; }

    [Range(1, long.MaxValue, ErrorMessage = "WorkerId must be a positive number")]
    public long? WorkerId { get; set; } = null;

    [Required]
    public required List<OrderDetailRequest> OrderDetails { get; set; } = new List<OrderDetailRequest>();
}