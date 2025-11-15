namespace NightMare.Backend.Data;
public class GiftCardCreateDTO
{
    public required string Code { get; set; }
    public required decimal Value { get; set; }
    public required long BusinessId {get; set;}
}