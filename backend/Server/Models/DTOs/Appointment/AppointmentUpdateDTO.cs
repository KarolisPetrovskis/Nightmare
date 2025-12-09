using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DTOs.Appointment;
public class AppointmentUpdateDTO
{
    [Range(1, long.MaxValue, ErrorMessage = "EmployeeId must be a positive number")]
    public long? EmployeeId { get; set; }

    [Range(1, long.MaxValue, ErrorMessage = "ServiceId must be a positive number")]
    public long? ServiceId { get; set; }

    public DateTime? AppointmentDate { get; set; }

    public DateTime? AppointmentStart { get; set; }

    public DateTime? AppointmentEnd { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "Total must be greater than zero")]
    public decimal? Total { get; set; }

    [Range(1, long.MaxValue, ErrorMessage = "StatusId must be a positive number")]
    public long? StatusId { get; set; }

    [StringLength(100)]
    public string? CustomerCode { get; set; }

    [StringLength(200)]
    public string? CustomerName { get; set; }

    [Phone(ErrorMessage = "Invalid phone number format")]
    [StringLength(20)]
    public string? CustomerNumber { get; set; }
}