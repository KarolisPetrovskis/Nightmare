using backend.Server.Interfaces;
using backend.Server.Models.DTOs.Menu;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.Helper;
using Microsoft.AspNetCore.Mvc;

namespace backend.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MenuController(IMenuService menuService) : ControllerBase
    {
        private readonly IMenuService _menuService = menuService;

        [HttpGet]
        public async Task<ActionResult<List<MenuItem>>> GetMenu([FromQuery] MenuGetAllDTO request)
        {
            var result = await _menuService.GetMenuItemsAsync(request.BusinessId, request.Page, request.PerPage);

            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<MenuItem>> CreateItem([FromBody] MenuCreateDTO request)
        {
            var menuItem = await _menuService.CreateMenuItemAsync(request);

            return CreatedAtAction(nameof(GetItemByNid), new { nid = menuItem.Nid }, menuItem);
        }

        [HttpGet("{nid}")]
        public async Task<ActionResult<MenuItem>> GetItemByNid(long nid)
        {
            var menuItem = await _menuService.GetMenuItemByNidAsync(nid);

            return Ok(menuItem);
        }

        [HttpGet("{nid}/addons")]
        public async Task<ActionResult<MenuItemWithAddons>> GetMenuItemWithAddons(long nid)
        {
            var result = await _menuService.GetMenuItemWithAddonsAsync(nid);

            return Ok(result);
        }

        [HttpPut("{nid}")]
        public async Task<IActionResult> UpdateItem(long nid, [FromBody] MenuUpdateDTO request)
        {
            await _menuService.UpdateMenuItemAsync(request, nid);

            return NoContent();
        }

        [HttpDelete("{nid}")]
        public async Task<IActionResult> DeleteItem(long nid)
        {
            await _menuService.DeleteMenuItemAsync(nid);

            return NoContent();
        }
    }
}