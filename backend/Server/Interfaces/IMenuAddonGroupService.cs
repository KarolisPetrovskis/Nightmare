using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.MenuAddonGroup;

namespace backend.Server.Interfaces;

public interface IMenuAddonGroupService
{
    Task<List<MenuItemIngredientGroup>> GetAllGroupsAsync(MenuAddonGroupGetAllDTO request);
    Task<MenuItemIngredientGroup> GetGroupByNidAsync(long nid);
    Task<List<MenuItemIngredientGroup>> GetGroupsByMenuItemNidAsync(long menuItemNid);
    Task<MenuItemIngredientGroup> CreateGroupAsync(MenuAddonGroupCreateDTO request);
    Task UpdateGroupAsync(MenuAddonGroupUpdateDTO request, long nid);
    Task DeleteGroupAsync(long nid);
}
