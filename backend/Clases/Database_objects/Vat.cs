namespace Database_objects;
public class Vat
{
    [Key]
    public long Nid { get; set; }
    public string Name { get; set; }
    public float Percentage { get; set; }
    public DateTime DateCreated { get; set; }
}