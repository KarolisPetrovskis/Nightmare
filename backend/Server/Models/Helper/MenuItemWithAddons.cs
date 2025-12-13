using backend.Server.Models.DatabaseObjects;

namespace backend.Server.Models.Helper
{
    public class MenuItemWithAddons
    {
        public required MenuItem MenuItem { get; set; }
        public List<MenuItemIngredient>? Addons { get; set; }
    }
}