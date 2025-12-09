using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DTOs.Auth;
public class LoginRequestDTO
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [StringLength(100)]
    public required string Email { get; set; }

    [Required(ErrorMessage = "Password is required")]
    [StringLength(255, MinimumLength = 1)]
    public required string Password { get; set; }
}