using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.MenuAddon;

namespace backend.Server.Interfaces
{
    public interface IMenuAddonsService
    {
        Task<List<MenuItemIngredient>> GetAllMenuAddonsAsync(MenuAddonsGetAllDTO request);
        Task<MenuItemIngredient> CreateMenuAddonAsync(MenuAddonCreateDTO request);
        Task<MenuItemIngredient> GetMenuAddonByNidAsync(long nid);
        Task UpdateMenuAddonAsync(MenuAddonUpdateDTO request, long nid);
        Task DeleteMenuAddonAsync(long nid);
        Task<List<MenuItemIngredient>> GetMenuAddonsByMenuItemNidAsync(long menuItemNid);

    }
}