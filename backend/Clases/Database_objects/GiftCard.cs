namespace Database_objects;
public class GiftCard
{
    [Key]
    public long Nid { get; set; }
    public string Code { get; set; }
    public decimal Value { get; set; }
    public DateTime DateCreated { get; set; }
    public long BusinessId { get; set; }

    /// mby add if it is used if we dont want to simply delete it on use
}