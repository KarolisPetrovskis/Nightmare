namespace NightMare.Backend.Data;
public class UserCreateDTO
{
    public required string Name { get; set; }
    public required string Surname { get; set; }
    public required string Email { get; set; }
    // In yaml this was not required but im making it mandatory
    public required string Password { get; set; }
    public required long UserType { get; set; }
    public string? Address { get; set; }
    public string? Telephone { get; set; }
    public long? PlanId { get; set; }
    public decimal? Salary { get; set; }
    // In yamal all this thing is employee which does not conform to the class diagram and im unsure if user can be a customer so im making it nullable by default and non mandatory unlike yaml
    public long? BossId { get; set; } = null;
    public string? WorkStart { get; set; }
    public string? WorkEnd { get; set; }
}