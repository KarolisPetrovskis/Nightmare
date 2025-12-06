using backend.Server.Interfaces;
using backend.Server.Database;
using backend.Server.Models.DatabaseObjects;
using Microsoft.EntityFrameworkCore;

namespace backend.Server.Services
{
    public class MenuService : IMenuService
    {
        private readonly ApplicationDbContext _context;

        public MenuService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<MenuItem>> GetMenusAsync(long businessId, int page, int perPage)
        {
            return await _context.MenuItems
                .Where(m => m.BusinessId == businessId)
                .Skip((page - 1) * perPage)
                .Take(perPage)
                .ToListAsync();
        }

        public async Task CreateMenuItemAsync(MenuItem menuItem)
        {
            if (await _context.MenuItems.AnyAsync(m => m.Name == menuItem.Name))
            {
                throw new Exception($"Menu item with Name {menuItem.Name} already exists.");
            }

            _context.MenuItems.Add(menuItem);

            var result = await _context.SaveChangesAsync();

            if (result <= 0)
            {
                throw new Exception("Failed to create menu item.");
            }

            return;
        }

        public async Task<MenuItem> GetMenuItemByNidAsync(long nid)
        {
            var menuItem = await _context.MenuItems.FindAsync(nid);
            if (menuItem == null)
            {
                throw new Exception($"Menu item {nid} not found.");
            }
            return menuItem;
        }

        public async Task UpdateMenuItemAsync(MenuItem menuItem)
        {
            _context.MenuItems.Update(menuItem);

            var result = await _context.SaveChangesAsync();

            if (result <= 0)
            {
                throw new Exception("Failed to update menu item.");
            }

            return;
        }

        public async Task DeleteMenuItemAsync(long nid)
        {
            var menuItem = await _context.MenuItems.FindAsync(nid);
            if (menuItem == null)
            {
                throw new Exception($"Menu item {nid} not found.");
            }

            _context.MenuItems.Remove(menuItem);

            var result = await _context.SaveChangesAsync();

            if (result <= 0)
            {
                throw new Exception("Failed to delete menu item.");
            }

            return;
        }
    }
}