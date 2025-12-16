using System.ComponentModel.DataAnnotations;
using backend.Server.Models.Enums;

namespace backend.Server.Models.DTOs.User;
public class UserUpdateDTO
{
    [StringLength(100, MinimumLength = 1)]
    public string? Name { get; set; }

    [StringLength(100, MinimumLength = 1)]
    public string? Surname { get; set; }

    [EmailAddress(ErrorMessage = "Invalid email format")]
    [StringLength(100)]
    public string? Email { get; set; }
    [StringLength(255, MinimumLength = 8, ErrorMessage = "Password must be at least 8 characters")]
    public string? Password { get; set; }
    [EnumDataType(typeof(UserRole), ErrorMessage = "Invalid user role")]
    public UserRole? UserType { get; set; }
    [Range(1, long.MaxValue, ErrorMessage = "BusinessId must be a positive number")]
    public long? BusinessId { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    [Phone(ErrorMessage = "Invalid phone number format")]
    [StringLength(20)]
    public string? Telephone { get; set; }

    [Range(1, long.MaxValue, ErrorMessage = "PlanId must be a positive number")]
    public long? PlanId { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Salary must be non-negative")]
    public decimal? Salary { get; set; }

    [Range(1, long.MaxValue, ErrorMessage = "BossId must be a positive number")]
    public long? BossId { get; set; }
    [StringLength(50)]
    public string? BankAccount { get; set; }

    [StringLength(50)]
    public string? WorkStart { get; set; }

    [StringLength(50)]
    public string? WorkEnd { get; set; }
}