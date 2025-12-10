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
        public async Task<ActionResult<List<MenuItemIngredient>>> GetMenuAddons([FromQuery] MenuAddonsGetAllDTO request)
        {
            var result = await _menuAddonsService.GetAllMenuAddonsAsync(request.Page, request.PerPage);
            
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<MenuItemIngredient>> CreateMenuAddon([FromBody] MenuAddonCreateDTO request)
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
        public async Task<ActionResult<MenuItemIngredient>> GetMenuAddonByNid(long nid)
        {
            var result = await _menuAddonsService.GetMenuAddonByNidAsync(nid);
            return Ok(result);
        }

        [HttpPut("{nid}")]
        public async Task<IActionResult> UpdateMenuAddon(long nid, [FromBody] MenuAddonUpdateDTO request)
        {
            var menuAddon = await _menuAddonsService.GetMenuAddonByNidAsync(nid);

            if (request.Name != null) menuAddon.Name = request.Name;
            if (request.ItemId.HasValue) menuAddon.ItemId = request.ItemId.Value;
            if (request.Price.HasValue) menuAddon.Price = request.Price.Value;

            await _menuAddonsService.UpdateMenuAddonAsync(menuAddon);

            return NoContent();
        }

        [HttpDelete("{nid}")]
        public async Task<IActionResult> DeleteMenuAddon(long nid)
        {
            await _menuAddonsService.DeleteMenuAddonAsync(nid);
            return NoContent();
        }
    }
}