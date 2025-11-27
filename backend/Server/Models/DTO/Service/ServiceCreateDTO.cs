namespace NightMare.Backend.Data;
public class ServiceCreateDTO
{
    public required string Name { get; set; }
    public required decimal Price { get; set; }
    // In mins
    public required int TimeMin { get; set; }
    // Should we add discount time so we can arrange its starting time?
    public required decimal Discount { get; set; }
    public required long VatId { get; set; }
    public required long BusinessId { get; set; }
}
