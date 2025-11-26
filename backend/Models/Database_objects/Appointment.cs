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
    // CustomerCode is the code customer receives when registering, and is used later to authenticate on arrival.
    public string? CustomerCode { get; set; }
    // CustomerName is Customer name
    public string? CustomerName { get; set; }
    // CustomerNumber is phone number
    public string? CustomerNumber { get; set; }
}