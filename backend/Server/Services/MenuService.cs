using backend.Server.Interfaces;
using backend.Server.Database;
using backend.Server.Models.DatabaseObjects;
using Microsoft.EntityFrameworkCore;
using backend.Server.Exceptions;

namespace backend.Server.Services
{
    public class MenuService(ApplicationDbContext context) : IMenuService
    {
        private readonly ApplicationDbContext _context = context;

        public async Task<List<MenuItem>> GetMenusAsync(long businessId, int page, int perPage)
        {
            var query = _context.MenuItems
                .Where(m => m.BusinessId == businessId)
                .Skip((page - 1) * perPage);

            if (perPage > 0)
            {
                query = query.Take(perPage);
            }

            return await query.ToListAsync();
        }

        public async Task CreateMenuItemAsync(MenuItem menuItem)
        {
            if (await _context.MenuItems.AnyAsync(m => m.Name == menuItem.Name))
            {
                throw new ApiException(409, $"Menu item with Name {menuItem.Name} already exists.");
            }

            _context.MenuItems.Add(menuItem);

            var result = await _context.SaveChangesAsync();

            if (result <= 0)
            {
                throw new ApiException(500, "Failed to create menu item.");
            }
        }

        public async Task<MenuItem> GetMenuItemByNidAsync(long nid)
        {
            var menuItem = await _context.MenuItems.FindAsync(nid) ?? throw new ApiException(404, $"Menu item {nid} not found.");
            return menuItem;
        }

        public async Task UpdateMenuItemAsync(MenuItem menuItem)
        {
            if (await _context.MenuItems.FindAsync(menuItem.Nid) == null)
            {
                throw new ApiException(404, $"Menu item {menuItem.Nid} not found.");
            }

            _context.MenuItems.Update(menuItem);

            var result = await _context.SaveChangesAsync();

            if (result <= 0)
            {
                throw new ApiException(500, "Failed to update menu item.");
            }
        }

        public async Task DeleteMenuItemAsync(long nid)
        {
            var menuItem = await _context.MenuItems.FindAsync(nid) ?? throw new ApiException(404, $"Menu item {nid} not found.");
            _context.MenuItems.Remove(menuItem);

            var result = await _context.SaveChangesAsync();

            if (result <= 0)
            {
                throw new ApiException(500, "Failed to delete menu item.");
            }
        }
    }
}