using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.Menu;
using backend.Server.Models.Helper;

namespace backend.Server.Interfaces
{
    public interface IMenuService
    {
        Task<List<MenuItem>> GetMenuItemsAsync(long businessId, int page, int perPage);
        Task<MenuItem> CreateMenuItemAsync(MenuCreateDTO request);
        Task<MenuItem> GetMenuItemByNidAsync(long nid);
        Task UpdateMenuItemAsync(MenuUpdateDTO request, long nid);
        Task DeleteMenuItemAsync(long nid);
        Task<MenuItemWithAddons> GetMenuItemWithAddonsAsync(long nid);

    }
}