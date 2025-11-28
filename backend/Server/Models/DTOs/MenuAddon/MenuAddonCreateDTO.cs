namespace backend.Server.Models.DTOs.MenuAddon;
public class MenuAddonCreateDTO
{
    public required string Name { get; set; }
    public required long ItemId { get; set; }
    public required decimal Price { get; set; }
}
