using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.MenuAddonGroup;
using Microsoft.AspNetCore.Mvc;

namespace backend.Server.Controllers;

[ApiController]
[Route("api/menu/addon-groups")]
public class MenuAddonGroupController(IMenuAddonGroupService groupService) : ControllerBase
{
    private readonly IMenuAddonGroupService _groupService = groupService;

    [HttpGet]
    public async Task<ActionResult<List<MenuItemIngredientGroup>>> GetGroups([FromQuery] MenuAddonGroupGetAllDTO request)
    {
        var result = await _groupService.GetAllGroupsAsync(request);
        
        return Ok(result);
    }

    [HttpGet("{nid}")]
    public async Task<ActionResult<MenuItemIngredientGroup>> GetGroupByNid(long nid)
    {
        var result = await _groupService.GetGroupByNidAsync(nid);

        return Ok(result);
    }

    [HttpGet("by-menu-item/{menuItemNid}")]
    public async Task<ActionResult<List<MenuItemIngredientGroup>>> GetGroupsByMenuItemNid(long menuItemNid)
    {
        var result = await _groupService.GetGroupsByMenuItemNidAsync(menuItemNid);

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<MenuItemIngredientGroup>> CreateGroup([FromBody] MenuAddonGroupCreateDTO request)
    {
        var group = await _groupService.CreateGroupAsync(request);

        return CreatedAtAction(nameof(GetGroupByNid), new { nid = group.Nid }, group);
    }

    [HttpPut("{nid}")]
    public async Task<IActionResult> UpdateGroup(long nid, [FromBody] MenuAddonGroupUpdateDTO request)
    {
        await _groupService.UpdateGroupAsync(request, nid);

        return NoContent();
    }

    [HttpDelete("{nid}")]
    public async Task<IActionResult> DeleteGroup(long nid)
    {
        await _groupService.DeleteGroupAsync(nid);

        return NoContent();
    }
}
