using backend.Server.Interfaces;
using backend.Server.Database;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.Menu;
using backend.Server.Exceptions;
using backend.Server._helpers;
using backend.Server.Models.Helper;
using Microsoft.EntityFrameworkCore;

namespace backend.Server.Services
{

public class MenuService(ApplicationDbContext context, IMenuAddonsService menuAddonsService) : IMenuService
{
    private readonly ApplicationDbContext _context = context;
    private readonly IMenuAddonsService _menuAddonsService = menuAddonsService;
        
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

        public async Task<MenuItem> CreateMenuItemAsync(MenuCreateDTO request)
        {
            if (await _context.MenuItems.AnyAsync(m => m.Name == request.Name && m.BusinessId == request.BusinessId))
            {
                throw new ApiException(409, $"Menu item with Name {request.Name} already exists.");
            }

            var menuItem = new MenuItem
            {
                Name = request.Name,
                BusinessId = request.BusinessId,
                Price = request.Price,
                Discount = request.Discount,
                VatId = request.VatId,
                DiscountTime = request.DiscountTime
            };

            _context.MenuItems.Add(menuItem);

            await Helper.SaveChangesOrThrowAsync(_context, "Failed to create menu item.");

            return menuItem;
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

        public async Task<MenuItemWithAddons> GetMenuItemWithAddonsAsync(long nid)
        {
            if (nid <= 0)
            {
                throw new ApiException(400, "Invalid menu item ID");
            }
            var menuItem = await GetMenuItemByNidAsync(nid) ?? throw new ApiException(404, $"Menu item {nid} not found.");

            var addons = await _menuAddonsService.GetMenuAddonsByMenuItemNidAsync(nid);

            if (addons == null || addons.Count == 0)
            {
                return new MenuItemWithAddons
                {
                    MenuItem = menuItem,
                    Addons = null
                };
            }

            return new MenuItemWithAddons
            {
                MenuItem = menuItem,
                Addons = addons
            };
        }

        public async Task UpdateMenuItemAsync(MenuUpdateDTO request, long nid)
        {
            if (nid <= 0)
            {
                throw new ApiException(400, "Nid must be a positive number");
            }
            var menuItem = await _context.MenuItems.FindAsync(nid) ?? throw new ApiException(404, $"Menu item {nid} not found.");

            if (request.Name != null) menuItem.Name = request.Name;
            if (request.Price.HasValue) menuItem.Price = request.Price.Value;
            if (request.Discount.HasValue) menuItem.Discount = request.Discount.Value;
            if (request.VatId.HasValue) menuItem.VatId = request.VatId.Value;
            if (request.DiscountTime.HasValue) menuItem.DiscountTime = request.DiscountTime;

            _context.MenuItems.Update(menuItem);

            await Helper.SaveChangesOrThrowAsync(_context, "Failed to update menu item.", expectChanges: false);
        }

        public async Task DeleteMenuItemAsync(long nid)
        {
            if (nid <= 0)
            {
                throw new ApiException(400, "Nid must be a positive number");
            }
            var menuItem = await _context.MenuItems.FindAsync(nid) ?? throw new ApiException(404, $"Menu item {nid} not found.");
            
            // Check if this menu item is used in any orders
            var usedInOrders = await _context.OrderDetails
                .AnyAsync(od => od.ItemId == nid);
            
            if (usedInOrders)
            {
                throw new ApiException(400, "Cannot delete menu item because it is used in existing orders. Consider marking it as unavailable instead.");
            }
            
            // Get all addon groups for this menu item
            var groups = await _context.MenuItemIngredientGroups
                .Where(g => g.MenuItemId == nid)
                .ToListAsync();
            
            // For each group, delete its addons
            var groupIds = groups.Select(g => g.Nid).ToList();
            if (groupIds.Any())
            {
                var addons = await _context.MenuItemIngredients
                    .Where(a => a.GroupId != null && groupIds.Contains(a.GroupId.Value))
                    .ToListAsync();
                
                if (addons.Any())
                {
                    _context.MenuItemIngredients.RemoveRange(addons);
                }
                
                // Delete the groups
                _context.MenuItemIngredientGroups.RemoveRange(groups);
            }
            
            // Finally delete the menu item
            _context.MenuItems.Remove(menuItem);

            await Helper.SaveChangesOrThrowAsync(_context, "Failed to delete menu item.");
        }
    }
}