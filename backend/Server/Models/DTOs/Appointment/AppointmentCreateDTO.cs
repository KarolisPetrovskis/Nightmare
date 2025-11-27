namespace backend.Server.Models.DTOs.Appointment;
public class AppointmentCreateDTO
{
    public required string Name { get; set; }
    public required long BusinessId { get; set; }
    public required long ServiceId { get; set; }
    public required long EmployeeId { get; set; }
    public required DateTime AppointmentDate { get; set; }
    public required string AppointmentStart { get; set; }
    public required string AppointmentEnd { get; set; }
    public decimal Total { get; set; } = 0.00M;
    public long StatusId { get; set; }
    public string? CustomerCode { get; set; }
    public string CustomerName { get; set; }
    public string CustomerNumber { get; set; }
}