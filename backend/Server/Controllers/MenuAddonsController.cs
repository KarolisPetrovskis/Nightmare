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
            var result = await _menuAddonsService.GetAllMenuAddonsAsync(request);
            
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<MenuItemIngredient>> CreateMenuAddon([FromBody] MenuAddonCreateDTO request)
        {
            var menuAddon = await _menuAddonsService.CreateMenuAddonAsync(request);

            return CreatedAtAction(nameof(GetMenuAddonByNid), new { nid = menuAddon.Nid }, menuAddon);
        }

        [HttpGet("{nid}")]
        public async Task<ActionResult<MenuItemIngredient>> GetMenuAddonByNid(long nid)
        {
            var result = await _menuAddonsService.GetMenuAddonByNidAsync(nid);

            return Ok(result);
        }

        [HttpGet("by-group/{groupNid}")]
        public async Task<ActionResult<List<MenuItemIngredient>>> GetMenuAddonsByGroupNid(long groupNid)
        {
            var result = await _menuAddonsService.GetMenuAddonsByGroupNidAsync(groupNid);

            return Ok(result);
        }

        [HttpPut("{nid}")]
        public async Task<IActionResult> UpdateMenuAddon(long nid, [FromBody] MenuAddonUpdateDTO request)
        {
            await _menuAddonsService.UpdateMenuAddonAsync(request, nid);

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