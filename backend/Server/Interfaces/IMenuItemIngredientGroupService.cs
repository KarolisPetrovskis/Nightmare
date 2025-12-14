using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.MenuItemIngredientGroup;

namespace backend.Server.Interfaces;

public interface IMenuItemIngredientGroupService
{
    Task<List<MenuItemIngredientGroup>> GetAllGroupsAsync(MenuItemIngredientGroupGetAllDTO request);
    Task<MenuItemIngredientGroup> GetGroupByNidAsync(long nid);
    Task<List<MenuItemIngredientGroup>> GetGroupsByMenuItemNidAsync(long menuItemNid);
    Task<MenuItemIngredientGroup> CreateGroupAsync(MenuItemIngredientGroupCreateDTO request);
    Task UpdateGroupAsync(MenuItemIngredientGroupUpdateDTO request, long nid);
    Task DeleteGroupAsync(long nid);
}
