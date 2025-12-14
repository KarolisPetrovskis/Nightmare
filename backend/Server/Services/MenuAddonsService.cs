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
            if (await _context.MenuItemIngredients.AnyAsync(m => m.Name == request.Name))
            {
                throw new ApiException(409, "Menu addon with the same name already exists");
            }

            var menuAddon = new MenuItemIngredient
            {
                Name = request.Name,
                ItemId = request.ItemId,
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

            var addons = await _context.MenuItemIngredients
                .Where(m => m.ItemId == menuItemNid)
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
            if (request.ItemId.HasValue) menuAddon.ItemId = request.ItemId.Value;
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