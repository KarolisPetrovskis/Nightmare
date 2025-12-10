namespace backend.Server.Models.DTOs.VAT;

public class VatCreateDTO
{
    public required string Name { get; set; }
    public required float Percentage { get; set; }
}