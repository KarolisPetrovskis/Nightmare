namespace NightMare.Backend.Data;
public class ReceiptGetAllDTO
{
    public required long BusinessId { get; set; }
    public int Page { get; set; } = 1;
    // if 0 lets say we laod all
    public int PerPage { get; set; } = 20;
}