using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DTOs.Order;
public class OrderUpdateDTO
{
    [Range(1, long.MaxValue, ErrorMessage = "StatusId must be a positive number")]
    public long? StatusId { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Total must be non-negative")]
    public decimal? Total { get; set; }
}