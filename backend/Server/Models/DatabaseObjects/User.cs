using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DatabaseObjects;
public class User
{
    [Key]
    public long Nid { get; set; }
    public required string Name { get; set; }
    public required string Surname { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required long UserType { get; set; }
    public string? Address { get; set; }
    public string? Telephone { get; set; }
    public long? PlanId { get; set; }
    public decimal? Salary { get; set; }
    public long? BossId { get; set; }
    public string? BankAccount { get; set; }
}