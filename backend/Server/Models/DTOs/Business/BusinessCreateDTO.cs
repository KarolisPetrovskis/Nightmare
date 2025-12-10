using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DTOs.Business;
public class BusinessCreateDTO
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(200, MinimumLength = 1)]
    public required string Name { get; set; }

    [Required]
    [Range(1, long.MaxValue, ErrorMessage = "Type must be a positive number")]
    public required long Type { get; set; }

    [Required]
    [Range(1, long.MaxValue, ErrorMessage = "OwnerId must be a positive number")]
    public required long OwnerId { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    [Phone(ErrorMessage = "Invalid phone number format")]
    [StringLength(20)]
    public string? Phone { get; set; }

    [EmailAddress(ErrorMessage = "Invalid email format")]
    [StringLength(100)]
    public string? Email { get; set; }
}