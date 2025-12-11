using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DTOs.Auth;
public class RegisterDTO
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(100, MinimumLength = 1)]
    public required string Name { get; set; }

    [Required(ErrorMessage = "Surname is required")]
    [StringLength(100, MinimumLength = 1)]
    public required string Surname { get; set; }

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [StringLength(100)]
    public required string Email { get; set; }

    [Required(ErrorMessage = "Password is required")]
    [StringLength(255, MinimumLength = 8, ErrorMessage = "Password must be at least 8 characters")]
    public required string Password { get; set; }

    [Required]
    [Range(1, long.MaxValue, ErrorMessage = "UserType must be a positive number")]
    public required long UserType { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    [Phone(ErrorMessage = "Invalid phone number format")]
    [StringLength(20)]
    public string? Telephone { get; set; }

    [Range(1, long.MaxValue, ErrorMessage = "PlanId must be a positive number")]
    public long PlanId { get; set; }

    [StringLength(100)]
    public string? BankAccount { get; set; }
}