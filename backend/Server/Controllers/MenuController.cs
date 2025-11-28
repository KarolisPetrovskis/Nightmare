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