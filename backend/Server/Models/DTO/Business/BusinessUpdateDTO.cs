namespace NightMare.Backend.Data;
// Pass NId to controller manually
public class BusinessUpdateDTO
{
    public string Name { get; set; }
    public long Type { get; set; }
    public long OwnerId { get; set; }
    public string Address { get; set; }
    public string Phone { get; set; }
    public string Email { get; set; }
}
