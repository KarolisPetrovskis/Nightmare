using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DTOs.Business;
public class BusinessUpdateDTO
{
    [StringLength(200, MinimumLength = 1)]
    public string? Name { get; set; }

    [Range(1, long.MaxValue, ErrorMessage = "Type must be a positive number")]
    public long? Type { get; set; }

    [Range(1, long.MaxValue, ErrorMessage = "OwnerId must be a positive number")]
    public long? OwnerId { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    [Phone(ErrorMessage = "Invalid phone number format")]
    [StringLength(20)]
    public string? Phone { get; set; }

    [EmailAddress(ErrorMessage = "Invalid email format")]
    [StringLength(100)]
    public string? Email { get; set; }
}
