namespace Database_objects;
public class MenuItemIngredient
{
    [Key]
    public long Nid { get; set; }
    public string Name { get; set; }
    public long ItemId { get; set; }
    public decimal Price { get; set; }
}