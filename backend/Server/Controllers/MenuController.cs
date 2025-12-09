using backend.Server.Interfaces;
using backend.Server.Models.DTOs.Menu;
using backend.Server.Models.DatabaseObjects;
using Microsoft.AspNetCore.Mvc;

namespace backend.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MenuController(IMenuService menuService) : ControllerBase
    {
        private readonly IMenuService _menuService = menuService;

        [HttpGet]
        public IActionResult GetMenu([FromQuery] MenuGetAllDTO request)
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

        [HttpGet("{nid}")]
        public IActionResult GetItemBynid(long nid)
        {
            _menuService.placeholderMethod();
            return Ok($"Menu item {nid} fetched successfully.");
        }

        [HttpPut("{nid}")]
        public IActionResult UpdateItem([FromBody] MenuUpdateDTO request, long nid)
        {
            _menuService.placeholderMethod();
            return Ok($"Menu item {nid} updated successfully.");
        }

        [HttpDelete("{nid}")]
        public IActionResult DeleteItem(long nid)
        {
            _menuService.placeholderMethod();
            return Ok($"Menu item {nid} deleted successfully.");
        }
    }
}