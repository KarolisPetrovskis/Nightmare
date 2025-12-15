using backend.server.Models.DTOs.Auth;
using backend.Server.Database;
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
        private readonly ApplicationDbContext _context;
        public AuthController(IAuthService authService, ApplicationDbContext context)
        {
            _authService = authService;
            _context = context;
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDTO>> Login([FromBody] LoginRequestDTO request)
        {
            var user = await _authService.GetUserByEmail(request.Email);

            if (user is null || !_authService.VerifyPassword(request.Password, user.Password))
                return Unauthorized();

            // Persist the cookie accross multiple sessions
            await _authService.AddCookie(HttpContext, user.Nid, true);

            var response = new LoginResponseDTO
            {
                UserId = user.Nid,
                UserType = user.UserType
            };

            return Ok(response);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO request)
        {
            await _authService.CreateUserAsync(request);
            return Created();
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            _authService.RemoveCookie(HttpContext);
            return Ok();
        }
        [HttpGet("businessId")]
        public async Task<ActionResult<Guid?>> GetBusinessId()
        {
            var nid = _authService.GetRequesterNid(HttpContext);
            //var businessId = await _authService.GetUserBusinessId(nid);
            return Ok(nid);
        }
        
    }
}