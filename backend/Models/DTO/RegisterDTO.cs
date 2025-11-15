namespace NightMare.Backend.Data;
public class RegisterDTO
{
        public required string Name { get; set; }
        public required string Surname { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        // i think this should not be an int, but this is yaml, but apparently its an id from user type table
        public required long UserType { get; set; }
        public string? Address { get; set; }
        public string? Telephone { get; set; }
        public int? PlanId { get; set; }
        public string? BankAccount { get; set; }
}