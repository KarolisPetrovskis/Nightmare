using backend.Server.Database;
using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.MenuItemIngredientGroup;
using backend.Server.Exceptions;
using backend.Server._helpers;
using Microsoft.EntityFrameworkCore;

namespace backend.Server.Services;

public class MenuItemIngredientGroupService(ApplicationDbContext context) : IMenuItemIngredientGroupService
{
    private readonly ApplicationDbContext _context = context;

    public async Task<List<MenuItemIngredientGroup>> GetAllGroupsAsync(MenuItemIngredientGroupGetAllDTO request)
    {
        if (request.Page < 0)
        {
            throw new ApiException(400, "Page number must be greater than zero");
        }
        if (request.PerPage <= 0)
        {
            throw new ApiException(400, "PerPage value must be greater than zero");
        }

        if (request.Page == 0)
        {
            return await _context.MenuItemIngredientGroups
                .AsNoTracking()
                .ToListAsync();
        }

        return await _context.MenuItemIngredientGroups
            .Skip((request.Page - 1) * request.PerPage)
            .Take(request.PerPage)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<MenuItemIngredientGroup> GetGroupByNidAsync(long nid)
    {
        if (nid <= 0)
        {
            throw new ApiException(400, "Invalid group Nid");
        }

        var group = await _context.MenuItemIngredientGroups.FindAsync(nid) 
            ?? throw new ApiException(404, $"Ingredient group {nid} not found");
        
        return group;
    }

    public async Task<List<MenuItemIngredientGroup>> GetGroupsByMenuItemNidAsync(long menuItemNid)
    {
        if (menuItemNid <= 0)
        {
            throw new ApiException(400, "Invalid menu item ID");
        }

        var groups = await _context.MenuItemIngredientGroups
            .Where(g => g.MenuItemId == menuItemNid)
            .AsNoTracking()
            .ToListAsync();

        return groups;
    }

    public async Task<MenuItemIngredientGroup> CreateGroupAsync(MenuItemIngredientGroupCreateDTO request)
    {
        // Check if MenuItem exists
        var menuItem = await _context.MenuItems.FindAsync(request.MenuItemId);
        if (menuItem == null)
        {
            throw new ApiException(404, $"Menu item {request.MenuItemId} not found");
        }

        var group = new MenuItemIngredientGroup
        {
            Name = request.Name,
            MenuItemId = request.MenuItemId
        };

        _context.MenuItemIngredientGroups.Add(group);

        await Helper.SaveChangesOrThrowAsync(_context, "Failed to create ingredient group");

        return group;
    }

    public async Task UpdateGroupAsync(MenuItemIngredientGroupUpdateDTO request, long nid)
    {
        if (nid <= 0)
        {
            throw new ApiException(400, "Invalid group Nid");
        }

        var group = await _context.MenuItemIngredientGroups.FindAsync(nid) 
            ?? throw new ApiException(404, $"Ingredient group {nid} not found");

        if (request.Name != null) group.Name = request.Name;
        if (request.MenuItemId.HasValue)
        {
            // Verify the new menu item exists
            var menuItem = await _context.MenuItems.FindAsync(request.MenuItemId.Value);
            if (menuItem == null)
            {
                throw new ApiException(404, $"Menu item {request.MenuItemId.Value} not found");
            }
            group.MenuItemId = request.MenuItemId.Value;
        }

        _context.MenuItemIngredientGroups.Update(group);

        await Helper.SaveChangesOrThrowAsync(_context, expectChanges: false, errorMessage: "Failed to update ingredient group");
    }

    public async Task DeleteGroupAsync(long nid)
    {
        if (nid <= 0)
        {
            throw new ApiException(400, "Invalid group Nid");
        }

        var group = await _context.MenuItemIngredientGroups.FindAsync(nid)
            ?? throw new ApiException(404, $"Ingredient group {nid} not found");

        _context.MenuItemIngredientGroups.Remove(group);        await Helper.SaveChangesOrThrowAsync(_context, "Failed to delete ingredient group");
    }
}
