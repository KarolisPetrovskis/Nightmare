using backend.Server.Interfaces;
using backend.Server.Models.DTOs.Auth;
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

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequestDTO request)
        {
            _authService.placeholderMethod();
            return Ok("Login successful.");
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterDTO request)
        {
            _authService.placeholderMethod();
            return Ok("Registration successful.");
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            _authService.placeholderMethod();
            return NoContent();
        }
    }
}