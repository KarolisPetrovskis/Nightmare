namespace NightMare.Backend.Data;
public class User
{
    [Key]
    public long Nid { get; set; }
    public string Name { get; set; }
    public string Surname { get; set; }
    public long? UserType { get; set; }
    public string? Address { get; set; }
    public string? Telephone { get; set; }
    public long? PlanId { get; set; }
    public decimal? Salary { get; set; }
    public int? BossId { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public string BankAccount { get; set; }
}