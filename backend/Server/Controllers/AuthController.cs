using backend.Server.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Server.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

    }
}