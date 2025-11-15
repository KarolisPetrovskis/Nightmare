namespace NightMare.Backend.Data;
// pass id
public class VatGetDTO
{
    public int Page { get; set; } = 1;
    // if 0 lets say we laod all
    public int PerPage { get; set; } = 20;
}