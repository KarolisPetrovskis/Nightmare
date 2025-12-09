using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.MenuAddon;
using Microsoft.AspNetCore.Mvc;

namespace backend.Server.Controllers
{
    [ApiController]
    [Route("api/menu/addons")]
    public class MenuAddonsController(IMenuAddonsService menuAddonsService) : ControllerBase
    {
        private readonly IMenuAddonsService _menuAddonsService = menuAddonsService;

        [HttpGet]
        public async Task<IActionResult> GetMenuAddons([FromQuery] MenuAddonsGetAllDTO request)
        {
            var result = await _menuAddonsService.GetAllMenuAddonsAsync(request.Page, request.PerPage);
            
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateMenuAddon([FromBody] MenuAddonCreateDTO request)
        {
            MenuItemIngredient menuAddon = new()
            {
                Name = request.Name,
                ItemId = request.ItemId,
                Price = request.Price
            };

            await _menuAddonsService.CreateMenuAddonAsync(menuAddon);

            return CreatedAtAction(nameof(GetMenuAddonByNid), new { nid = menuAddon.Nid }, menuAddon);
        }

        [HttpGet("{nid}")]
        public async Task<IActionResult> GetMenuAddonByNid(long nid)
        {
            var result = await _menuAddonsService.GetMenuAddonByNidAsync(nid);
            return Ok(result);
        }

        [HttpPut("{nid}")]
        public async Task<IActionResult> UpdateMenuAddon([FromBody] MenuAddonUpdateDTO request, long nid)
        {
            var menuAddon = await _menuAddonsService.GetMenuAddonByNidAsync(nid);

            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                menuAddon.Name = request.Name;
            }
            if (request.ItemId != default)
            {
                menuAddon.ItemId = request.ItemId;
            }
            if (request.Price != default)
            {
                menuAddon.Price = request.Price;
            }

            await _menuAddonsService.UpdateMenuAddonAsync(menuAddon);

            return Ok(menuAddon);
        }

        [HttpDelete("{nid}")]
        public async Task<IActionResult> DeleteMenuAddon(long nid)
        {
            await _menuAddonsService.DeleteMenuAddonAsync(nid);
            return NoContent();
        }
    }
}