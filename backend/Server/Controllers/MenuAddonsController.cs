using backend.Server.Interfaces;
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
    }
}