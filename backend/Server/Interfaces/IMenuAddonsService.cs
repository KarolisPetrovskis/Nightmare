using backend.Server.Models.DatabaseObjects;

namespace backend.Server.Interfaces
{
    public interface IMenuAddonsService
    {
        Task<List<MenuItemIngredient>> GetAllMenuAddonsAsync();
        Task CreateMenuAddonAsync(MenuItemIngredient menuAddon);
        Task<MenuItemIngredient> GetMenuAddonByIdAsync(long id);
        Task UpdateMenuAddonAsync(MenuItemIngredient menuAddon);
        Task DeleteMenuAddonAsync(long id);
        void placeholderMethod();
    }
}