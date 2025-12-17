using backend.Server.Database;
using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.MenuAddon;
using backend.Server.Exceptions;
using backend.Server._helpers;
using Microsoft.EntityFrameworkCore;

namespace backend.Server.Services
{
    public class MenuAddonsService(ApplicationDbContext context) : IMenuAddonsService
    {
        private readonly ApplicationDbContext _context = context;

        public async Task<List<MenuItemIngredient>> GetAllMenuAddonsAsync(MenuAddonsGetAllDTO request)
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
                return await _context.MenuItemIngredients
                    .AsNoTracking()
                    .ToListAsync();
            }

            return await _context.MenuItemIngredients
                .Skip((request.Page - 1) * request.PerPage)
                .Take(request.PerPage)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<MenuItemIngredient> CreateMenuAddonAsync(MenuAddonCreateDTO request)
        {
            if (await _context.MenuItemIngredients.AnyAsync(m => m.Name == request.Name && m.GroupId == request.GroupId))
            {
                throw new ApiException(409, $"Menu addon with the same name {request.Name} already exists in this group {request.GroupId}.");
            }

            // Check if the ingredient group exists
            var group = await _context.MenuItemIngredientGroups.FindAsync(request.GroupId);
            if (group == null)
            {
                throw new ApiException(404, $"Ingredient group {request.GroupId} not found");
            }

            var menuAddon = new MenuItemIngredient
            {
                Name = request.Name,
                GroupId = request.GroupId,
                Price = request.Price
            };

            _context.MenuItemIngredients.Add(menuAddon);

            await Helper.SaveChangesOrThrowAsync(_context, "Failed to create menu addon");

            return menuAddon;
        }

        public async Task<MenuItemIngredient> GetMenuAddonByNidAsync(long nid)
        {
            if (nid <= 0)
            {
                throw new ApiException(400, "Invalid menu addon Nid");
            }

            var menuAddon = await _context.MenuItemIngredients.FindAsync(nid) ?? throw new ApiException(404, $"Menu addon {nid} not found");
            
            return menuAddon;
        }

        public async Task<List<MenuItemIngredient>> GetMenuAddonsByMenuItemNidAsync(long menuItemNid)
        {
            if (menuItemNid <= 0)
            {
                throw new ApiException(400, "Invalid menu item ID");
            }

            // Get all groups for this menu item, then get all addons from those groups
            var groups = await _context.MenuItemIngredientGroups
                .Where(g => g.MenuItemId == menuItemNid)
                .Select(g => g.Nid)
                .ToListAsync();

            var addons = await _context.MenuItemIngredients
                .Where(m => m.GroupId != null && groups.Contains(m.GroupId.Value))
                .AsNoTracking()
                .ToListAsync();

            return addons;
        }

        public async Task<List<MenuItemIngredient>> GetMenuAddonsByGroupNidAsync(long groupNid)
        {
            if (groupNid <= 0)
            {
                throw new ApiException(400, "Invalid group ID");
            }

            var addons = await _context.MenuItemIngredients
                .Where(m => m.GroupId == groupNid)
                .AsNoTracking()
                .ToListAsync();

            return addons;
        }

        public async Task UpdateMenuAddonAsync(MenuAddonUpdateDTO request, long nid)
        {
            if (nid <= 0)
            {
                throw new ApiException(400, "Invalid menu addon Nid");
            }
            var menuAddon = await _context.MenuItemIngredients.FindAsync(nid) ?? throw new ApiException(404, $"Menu addon {nid} not found");

            if (request.Name != null) menuAddon.Name = request.Name;
            if (request.GroupId.HasValue)
            {
                // Verify the group exists
                var group = await _context.MenuItemIngredientGroups.FindAsync(request.GroupId.Value);
                if (group == null)
                {
                    throw new ApiException(404, $"Ingredient group {request.GroupId.Value} not found");
                }
                menuAddon.GroupId = request.GroupId.Value;
            }
            if (request.Price.HasValue) menuAddon.Price = request.Price.Value;

            _context.MenuItemIngredients.Update(menuAddon);
            
            await Helper.SaveChangesOrThrowAsync(_context, "Failed to update menu addon", expectChanges: false);
        }

        public async Task DeleteMenuAddonAsync(long nid)
        {
            if (nid <= 0)
            {
                throw new ApiException(400, "Invalid menu addon Nid");
            }
            var menuAddon = await _context.MenuItemIngredients.FindAsync(nid) ?? throw new ApiException(404, $"Menu addon {nid} not found");

            _context.MenuItemIngredients.Remove(menuAddon);

            await Helper.SaveChangesOrThrowAsync(_context, "Failed to delete menu addon");
        }
    }
}