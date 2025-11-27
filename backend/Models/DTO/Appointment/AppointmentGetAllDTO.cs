namespace NightMare.Backend.Data;
public class AppointmentGetAllDTO
{
    public DateTime AppointmentDate {get; set;}
    public long EmployeeId {get; set;}
    public int Page { get; set; } = 1;
    // if 0 lets say we laod all
    public int PerPage { get; set; } = 20;
}