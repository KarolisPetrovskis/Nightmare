using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DTOs.Appointment;
public class AppointmentGetAllDTO
{
    public DateTime? AppointmentDate { get; set; }

    [Range(0, long.MaxValue, ErrorMessage = "EmployeeId must be non-negative")]
    public long EmployeeId { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Page must be non-negative")]
    public int Page { get; set; } = 1;

    [Range(0, 1000, ErrorMessage = "PerPage must be between 0 and 1000")]
    public int PerPage { get; set; } = 20;
}