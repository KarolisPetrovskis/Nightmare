namespace NightMare.Backend.Data;

public class Appointment
{
    [Key]
    public long Nid { get; set; }
    public string Code { get; set; }
    public long BusinessId { get; set; }
    public decimal Total { get; set; }
    public long StatusId { get; set; }
    public long EmployeeId { get; set; }
    public long ServiceId { get; set; }
    public DateTime AppointmentDate { get; set; }
    public DateTime AppointmentStart { get; set; }
    public DateTime AppointmentEnd { get; set; }
    // is this server related, if so maybe we dont use null?
    public string? CustomerCode { get; set; }
    // Based on BDR laws if they ask data to be remove will we have to remove name?
    public string CustomerName { get; set; }
    public string? CustomerNumber { get; set; }
}