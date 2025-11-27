namespace NightMare.Backend.Data;
public class Statuses
{
    [Key]
    public long Nid { get; set; }
    public string Name { get; set; }
    public int Type { get; set; }
}