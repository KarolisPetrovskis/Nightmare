using backend.Server.Database;
using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace backend.Server.Services
{
    public class MenuAddonsService(ApplicationDbContext context) : IMenuAddonsService
    {
        private readonly ApplicationDbContext _context = context;
        public async Task<List<MenuItemIngredient>> GetAllMenuAddonsAsync(int page, int perPage)
        {
            var result = await _context.MenuItemIngredients
                .Skip((page - 1) * perPage)
                .Take(perPage)
                .ToListAsync();

            if (result == null)
            {
                throw new ApiException(500, "Failed to retrieve menu addons");
            }
            
            if (result.Count == 0)
            {
                throw new ApiException(404, "No menu addons found");
            }

            return result;
        }

        public async Task CreateMenuAddonAsync(MenuItemIngredient menuAddon)
        {
            if (menuAddon == null)
            {
                throw new ApiException(400, "Menu addon cannot be null");
            }

            if (await _context.MenuItems.AnyAsync(m => m.Name == menuAddon.Name))
            {
                throw new ApiException(409, "Menu addon with the same name already exists");
            }

            _context.MenuItemIngredients.Add(menuAddon);

            var result = await _context.SaveChangesAsync();

            if (result <= 0)
            {
                throw new ApiException(500, "Failed to create menu addon");
            }
        }

        public async Task<MenuItemIngredient> GetMenuAddonByIdAsync(long nid)
        {
            if (nid <= 0)
            {
                throw new ApiException(400, "Invalid menu addon ID");
            }

            var menuAddon = await _context.MenuItemIngredients.FindAsync(nid) ?? throw new ApiException(404, $"Menu addon {nid} not found");
            
            return menuAddon;
        }

        public async Task UpdateMenuAddonAsync(MenuItemIngredient menuAddon)
        {
            _context.MenuItemIngredients.Update(menuAddon);

            var result = await _context.SaveChangesAsync();

            if (result <= 0)
            {
                throw new ApiException(500, "Failed to update menu addon");
            }
        }

        public async Task DeleteMenuAddonAsync(long nid)
        {
            var menuAddon = await _context.MenuItemIngredients.FindAsync(nid) ?? throw new ApiException(404, $"Menu addon {nid} not found");

            _context.MenuItemIngredients.Remove(menuAddon);

            var result = await _context.SaveChangesAsync();

            if (result <= 0)
            {
                throw new ApiException(500, "Failed to delete menu addon");
            }
        }
    }
}