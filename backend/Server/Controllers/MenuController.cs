using backend.Server.Interfaces;
using backend.Server.Models.DTOs.Menu;
using backend.Server.Models.DatabaseObjects;
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
        public async Task<ActionResult<MenuGetAllResponseDTO>> GetMenu([FromBody] MenuGetAllDTO request)
        {
            var result = await _menuService.GetMenusAsync(request.BusinessId, request.Page, request.PerPage);

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateItem([FromBody] MenuCreateDTO request)
        {
            if (request == null)
            {
                return BadRequest("Request body is null.");
            }

            var menuItem = new MenuItem
            {
                Name = request.Name,
                BusinessId = request.BusinessId,
                Price = request.Price,
                Discount = request.Discount,
                VatId = request.VatId,
                DiscountTime = request.DiscountTime
            };

            try
            {
                _menuService.CreateMenuItemAsync(menuItem).Wait();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }

            return Ok("Menu item created successfully.");
        }

        [HttpGet("{nid}")]
        public IActionResult GetItemBynid(long nid)
        {
            MenuItem menuItem;
            try
            {
                menuItem = _menuService.GetMenuItemByNidAsync(nid).Result;
            }
            catch (Exception e)
            {
                return NotFound(e.Message);
            }

            return Ok(menuItem);
        }

        [HttpPut("{nid}")]
        public IActionResult UpdateItem([FromBody] MenuUpdateDTO request, long nid)
        {
            MenuItem menuItem;
            try
            {
                menuItem = _menuService.GetMenuItemByNidAsync(nid).Result;
            }
            catch (Exception e)
            {
                return NotFound(e.Message);
            }

            menuItem.Name = request.Name;
            menuItem.Price = request.Price;
            menuItem.Discount = request.Discount;
            menuItem.VatId = request.VatId;
            menuItem.DiscountTime = request.DiscountTime;

            try
            {
                _menuService.UpdateMenuItemAsync(menuItem).Wait();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }

            return Ok($"Menu item {nid} updated successfully.");
        }

        [HttpDelete("{nid}")]
        public IActionResult DeleteItem(long nid)
        {
            try
            {
                _menuService.DeleteMenuItemAsync(nid).Wait();
            }
            catch (Exception e)
            {
                return NotFound(e.Message);
            }

            return Ok($"Menu item {nid} deleted successfully.");
        }
    }
}