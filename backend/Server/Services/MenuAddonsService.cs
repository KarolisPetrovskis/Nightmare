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
            if (page <= 0)
            {
                throw new ApiException(400, "Page number must be greater than zero");
            }
            if (perPage <= 0)
            {
                throw new ApiException(400, "PerPage value must be greater than zero");
            }
            var result = await _context.MenuItemIngredients
                .Skip((page - 1) * perPage)
                .Take(perPage)
                .AsNoTracking()
                .ToListAsync();

            return result;
        }

        public async Task CreateMenuAddonAsync(MenuItemIngredient menuAddon)
        {
            if (menuAddon == null)
            {
                throw new ApiException(400, "Menu addon cannot be null");
            }

            if (await _context.MenuItemIngredients.AnyAsync(m => m.Name == menuAddon.Name))
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

        public async Task<MenuItemIngredient> GetMenuAddonByNidAsync(long nid)
        {
            if (nid <= 0)
            {
                throw new ApiException(400, "Invalid menu addon ID");
            }

            var menuAddon = await _context.MenuItemIngredients
                .AsNoTracking()
                .SingleOrDefaultAsync(m => m.Nid == nid) ?? throw new ApiException(404, $"Menu addon {nid} not found");
            
            return menuAddon;
        }

        public async Task UpdateMenuAddonAsync(MenuItemIngredient menuAddon)
        {
            if (menuAddon == null || menuAddon.Nid <= 0)
            {
                throw new ApiException(400, "Invalid menu addon data");
            }

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