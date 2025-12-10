using backend.Server.Interfaces;
using backend.Server.Database;
using backend.Server.Models.DatabaseObjects;
using Microsoft.EntityFrameworkCore;
using backend.Server.Exceptions;
using backend.Server._helpers;

namespace backend.Server.Services
{
    public class MenuService(ApplicationDbContext context) : IMenuService
    {
        private readonly ApplicationDbContext _context = context;

        public async Task<List<MenuItem>> GetMenuItemsAsync(long businessId, int page, int perPage)
        {
            if (businessId <= 0)
            {
                throw new ApiException(400, "BusinessId must be a positive number");
            }
            if (page < 0)
            {
                throw new ApiException(400, "Page number must be greater than or equal to zero");
            }
            if (perPage <= 0)
            {
                throw new ApiException(400, "PerPage value must be greater than or equal to zero");
            }

            if (page == 0)
            {
                return await _context.MenuItems
                    .Where(m => m.BusinessId == businessId)
                    .AsNoTracking()
                    .ToListAsync();
            }

            return await _context.MenuItems
                .Where(m => m.BusinessId == businessId)
                .AsNoTracking()
                .Skip((page - 1) * perPage)
                .Take(perPage)
                .ToListAsync();
        }

        public async Task CreateMenuItemAsync(MenuItem menuItem)
        {
            if (await _context.MenuItems.AnyAsync(m => m.Name == menuItem.Name && m.BusinessId == menuItem.BusinessId))
            {
                throw new ApiException(409, $"Menu item with Name {menuItem.Name} already exists.");
            }

            _context.MenuItems.Add(menuItem);

            await Helper.SaveChangesOrThrowAsync(_context, "Failed to create menu item.");
        }

        public async Task<MenuItem> GetMenuItemByNidAsync(long nid)
        {
            if (nid <= 0)
            {
                throw new ApiException(400, "Nid must be a positive number");
            }

            var menuItem = await _context.MenuItems.FindAsync(nid) ?? throw new ApiException(404, $"Menu item {nid} not found.");
            return menuItem;
        }

        public async Task UpdateMenuItemAsync(MenuItem menuItem)
        {
            _context.MenuItems.Update(menuItem);
            await Helper.SaveChangesOrThrowAsync(_context, "Failed to update menu item.", expectChanges: false);
        }

        public async Task DeleteMenuItemAsync(long nid)
        {
            var menuItem = await _context.MenuItems.FindAsync(nid) ?? throw new ApiException(404, $"Menu item {nid} not found.");
            _context.MenuItems.Remove(menuItem);

            await Helper.SaveChangesOrThrowAsync(_context, "Failed to delete menu item.");
        }
    }
}