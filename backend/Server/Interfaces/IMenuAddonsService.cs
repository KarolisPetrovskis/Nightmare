using backend.Server.Models.DatabaseObjects;

namespace backend.Server.Interfaces
{
    public interface IMenuAddonsService
    {
        Task<List<MenuItemIngredient>> GetAllMenuAddonsAsync(int page, int perPage);
        Task CreateMenuAddonAsync(MenuItemIngredient menuAddon);
        Task<MenuItemIngredient> GetMenuAddonByNidAsync(long nid);
        Task UpdateMenuAddonAsync(MenuItemIngredient menuAddon);
        Task DeleteMenuAddonAsync(long nid);
        Task<List<MenuItemIngredient>> GetMenuAddonsByMenuItemNidAsync(long menuItemNid);

    }
}