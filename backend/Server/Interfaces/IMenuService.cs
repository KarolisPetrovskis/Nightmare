using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.Helper;

namespace backend.Server.Interfaces
{
    public interface IMenuService
    {
        Task<List<MenuItem>> GetMenuItemsAsync(long businessId, int page, int perPage);
        Task CreateMenuItemAsync(MenuItem menuItem);
        Task<MenuItem> GetMenuItemByNidAsync(long nid);
        Task UpdateMenuItemAsync(MenuItem menuItem);
        Task DeleteMenuItemAsync(long nid);
        Task<MenuItemWithAddons> GetMenuItemWithAddonsAsync(long nid);

    }
}