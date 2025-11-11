namespace Database_objects;

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
    public string CustomerCode { get; set; }
    public string CustomerName { get; set; }
    public string CustomerNumber { get; set; }
}