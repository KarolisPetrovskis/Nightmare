using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DTOs.Order;

public class OrderGetAllDTO
{
    [Range(1, int.MaxValue, ErrorMessage = "Page must be non-negative")]
    public int Page { get; set; } = 1;
    [Range(0, 1000, ErrorMessage = "PerPage must be between 0 and 1000")]
    public int PerPage { get; set; } = 20;
    public DateTime? DateCreated { get; set; }
    [Range(1, long.MaxValue, ErrorMessage = "WorkerId must be a positive number")]
    public long? WorkerId { get; set; }
}