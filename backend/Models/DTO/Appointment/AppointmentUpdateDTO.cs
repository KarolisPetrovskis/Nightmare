namespace NightMare.Backend.Data;
public class AppointmentUpdateDTO
{
    public long EmployeeId { get; set; }
    public long ServiceId { get; set; }
    public DateTime AppointmentDate { get; set; }
    public string AppointmentStart { get; set; }
    public string AppointmentEnd { get; set; }
    public decimal Total { get; set; }
    public long StatusId { get; set; }
    public string? CustomerCode { get; set; }
    public string CustomerName { get; set; }
    public string CustomerNumber { get; set; }
}