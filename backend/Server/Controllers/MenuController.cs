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
        public async Task<ActionResult<List<MenuItem>>> GetMenu([FromQuery] MenuGetAllDTO request)
        {
            var result = await _menuService.GetMenuItemsAsync(request.BusinessId, request.Page, request.PerPage);

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateItem([FromBody] MenuCreateDTO request)
        {

            var menuItem = new MenuItem
            {
                Name = request.Name,
                BusinessId = request.BusinessId,
                Price = request.Price,
                Discount = request.Discount,
                VatId = request.VatId,
                DiscountTime = request.DiscountTime
            };

            await _menuService.CreateMenuItemAsync(menuItem);

            return CreatedAtAction(nameof(GetItemByNid), new { nid = menuItem.Nid }, menuItem);
        }

        [HttpGet("{nid}")]
        public async Task<ActionResult<MenuItem>> GetItemByNid(long nid)
        {
            var menuItem = await _menuService.GetMenuItemByNidAsync(nid);
            return Ok(menuItem);
        }

        [HttpPut("{nid}")]
        public async Task<IActionResult> UpdateItem(long nid, [FromBody] MenuUpdateDTO request)
        {
            var menuItem = await _menuService.GetMenuItemByNidAsync(nid);

            menuItem.Name = request.Name;
            menuItem.Price = request.Price;
            menuItem.Discount = request.Discount;
            menuItem.VatId = request.VatId;
            menuItem.DiscountTime = request.DiscountTime;

            await _menuService.UpdateMenuItemAsync(menuItem);

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