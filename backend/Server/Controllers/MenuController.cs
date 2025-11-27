using backend.Server.Interfaces;
using backend.Server.Models.DTOs.Menu;
using Microsoft.AspNetCore.Mvc;

namespace backend.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MenuController : ControllerBase
    {
        private readonly IMenuService _menuService;

        public MenuController(IMenuService menuService)
        {
            _menuService = menuService;
        }

        [HttpGet]
        public IActionResult GetMenu([FromBody] MenuGetAllDTO request)
        {
            _menuService.placeholderMethod();
            return Ok("Menus fetched successfully.");
        }

        [HttpPost]
        public IActionResult CreateItem([FromBody] MenuCreateDTO request)
        {
            _menuService.placeholderMethod();
            return Ok("Menu item created successfully.");
        }

        [HttpGet("{id}")]
        public IActionResult GetItemById(int id)
        {
            _menuService.placeholderMethod();
            return Ok($"Menu item {id} fetched successfully.");
        }

        [HttpPut("{id}")]
        public IActionResult UpdateItem([FromBody] MenuUpdateDTO request, int id)
        {
            _menuService.placeholderMethod();
            return Ok($"Menu item {id} updated successfully.");
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteItem(int id)
        {
            _menuService.placeholderMethod();
            return Ok($"Menu item {id} deleted successfully.");
        }
    }
}