namespace NightMare.Backend.Data;
// Pass NId to controller manually
public class EmployeeUpdateDTO
{
    public string Name { get; set; }
    public string Surname { get; set; }
    public string Email { get; set; }
    public long? UserType { get; set; }
    public string Address { get; set; }
    public string Telephone { get; set; }
    public long? PlanId { get; set; }
    public decimal? Salary { get; set; }
    public long? BossId { get; set; }
    public string WorkStart { get; set; }
    public string WorkEnd { get; set; }
}