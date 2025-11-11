namespace Database_objects;
public class MenuItem
{
    [Key]
    public long Nid { get; set; }
    public string Name { get; set; }
    public long BusinessId { get; set; }
    public decimal Price { get; set; }
    public decimal Discount { get; set; }
    public DateTime? DiscountTime { get; set; }
    public long VatId { get; set; }
}