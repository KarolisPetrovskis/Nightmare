using backend.Server.Models.DatabaseObjects;

namespace backend.Server.Models.DTOs.Menu;

public class MenuGetAllResponseDTO
{
    public required long BusinessId { get; set; }
    public int Page { get; set; } = 1;
    // if 0 lets say we laod all
    public int PerPage { get; set; } = 20;
    public required List<MenuItem> MenuItems { get; set; }
}
