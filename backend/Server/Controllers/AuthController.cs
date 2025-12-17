using backend.server.Models.DTOs.Auth;
using backend.Server.Database;
using backend.Server.Interfaces;
using backend.Server.Models.DTOs.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Server.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class AuthController(IAuthService authService) : ControllerBase
    {
        private readonly IAuthService _authService = authService;

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
        public async Task<ActionResult<long>> GetBusinessId()
        {
            var nid = _authService.GetRequesterNid(HttpContext);
            var businessId = await _authService.GetUserBusinessId(nid);
            
            if (businessId == null) return Unauthorized();
            
            return Ok(businessId);
        }

        [HttpGet("has-users")]
        public async Task<ActionResult<bool>> HasUsers()
        {
            var hasUsers = await _authService.HasUsers();
            return Ok(hasUsers);
        }

        [HttpPost("create-business-owner")]
        public async Task<IActionResult> CreateBusinessOwner([FromBody] RegisterDTO request)
        {
            var requesterId = _authService.GetRequesterNid(HttpContext);
            
            if (requesterId == null)
                return Unauthorized("You must be logged in to perform this action.");

            await _authService.CreateBusinessOwnerAsync(request, requesterId.Value);
            return Created();
        }
        
    }
}