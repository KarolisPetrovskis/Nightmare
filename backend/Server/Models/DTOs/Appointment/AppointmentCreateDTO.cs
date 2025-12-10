using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DTOs.Appointment;
public class AppointmentCreateDTO
{
    [Required(ErrorMessage = "Code is required")]
    [StringLength(50, MinimumLength = 1)]
    public required string Code { get; set; }

    [Required]
    [Range(1, long.MaxValue, ErrorMessage = "BusinessId must be a positive number")]
    public required long BusinessId { get; set; }

    [Required]
    [Range(1, long.MaxValue, ErrorMessage = "ServiceId must be a positive number")]
    public required long ServiceId { get; set; }

    [Required]
    [Range(1, long.MaxValue, ErrorMessage = "EmployeeId must be a positive number")]
    public required long EmployeeId { get; set; }

    [Required]
    public required DateTime AppointmentDate { get; set; }

    [Required]
    public required DateTime AppointmentStart { get; set; }

    [Required]
    public required DateTime AppointmentEnd { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Total must be non-negative")]
    public decimal Total { get; set; } = 0.00M;

    [Range(0, long.MaxValue)]
    public long StatusId { get; set; }

    [StringLength(100)]
    public string? CustomerCode { get; set; }

    [StringLength(200)]
    public string? CustomerName { get; set; }

    [Phone(ErrorMessage = "Invalid phone number format")]
    [StringLength(20)]
    public string? CustomerNumber { get; set; }
}