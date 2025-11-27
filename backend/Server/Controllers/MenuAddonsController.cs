using backend.Server.Interfaces;
using backend.Server.Models.DTOs.MenuAddon;
using Microsoft.AspNetCore.Mvc;

namespace backend.Server.Controllers
{
    [ApiController]
    [Route("api/menu/addons")]
    public class MenuAddonsController : ControllerBase
    {
        private readonly IMenuAddonsService _menuAddonsService;

        public MenuAddonsController(IMenuAddonsService menuAddonsService)
        {
            _menuAddonsService = menuAddonsService;
        }

        [HttpGet]
        public IActionResult GetMenuAddons([FromBody] MenuAddonsGetAllDTO request)
        {
            _menuAddonsService.placeholderMethod();
            return Ok("Menu addons fetched successfully.");
        }

        [HttpPost]
        public IActionResult CreateMenuAddon([FromBody] MenuAddonCreateDTO request)
        {
            _menuAddonsService.placeholderMethod();
            return Ok("Menu addon created successfully.");
        }

        [HttpGet("{nid}")]
        public IActionResult GetMenuAddonBynid(long nid)
        {
            _menuAddonsService.placeholderMethod();
            return Ok($"Menu addon {nid} fetched successfully.");
        }

        [HttpPut("{nid}")]
        public IActionResult UpdateMenuAddon([FromBody] MenuAddonUpdateDTO request, long nid)
        {
            _menuAddonsService.placeholderMethod();
            return Ok($"Menu addon {nid} updated successfully.");
        }

        [HttpDelete("{nid}")]
        public IActionResult DeleteMenuAddon(long nid)
        {
            _menuAddonsService.placeholderMethod();
            return Ok($"Menu addon {nid} deleted successfully.");
        }
    }
}