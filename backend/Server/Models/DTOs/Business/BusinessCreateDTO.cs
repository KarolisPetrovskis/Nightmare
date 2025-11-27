namespace backend.Server.Models.DTOs.Business;
public class BusinessCreateDTO
{
    public required string Name { get; set; }
    public required long Type { get; set; }
    public required long OwnerId { get; set; }
    public string Address { get; set; }
    public string Phone { get; set; }
    public string Email { get; set; }
}