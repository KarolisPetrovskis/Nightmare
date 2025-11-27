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

        [HttpGet("{id}")]
        public IActionResult GetMenuAddonById(int id)
        {
            _menuAddonsService.placeholderMethod();
            return Ok($"Menu addon {id} fetched successfully.");
        }

        [HttpPut("{id}")]
        public IActionResult UpdateMenuAddon([FromBody] MenuAddonUpdateDTO request, int id)
        {
            _menuAddonsService.placeholderMethod();
            return Ok($"Menu addon {id} updated successfully.");
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteMenuAddon(int id)
        {
            _menuAddonsService.placeholderMethod();
            return Ok($"Menu addon {id} deleted successfully.");
        }
    }
}