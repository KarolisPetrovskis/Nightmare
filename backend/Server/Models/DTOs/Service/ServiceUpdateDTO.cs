namespace backend.Server.Models.DTOs.Service;
public class ServiceUpdateDTO
{
    public required string Name { get; set; }
    public required decimal Price { get; set; }
    // In minutes
    public required int TimeMin { get; set; }
    // Same problem with DiscountTIme as in ServiceCreateDTO
    public required decimal Discount { get; set; }
    public required long VatId { get; set; }
}