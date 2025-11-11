namespace Database_objects;
public class OrderDetail
{
    [Key]
    public long Nid { get; set; }
    public long OrderId { get; set; }
    public long ItemId { get; set; }
    public decimal Price_wo_vat { get; set; }
    public decimal Price_w_vat { get; set; }
}