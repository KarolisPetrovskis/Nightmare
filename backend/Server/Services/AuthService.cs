using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using backend.Server.Database;
using backend.Server.Exceptions;
using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.Auth;
using backend.Server.Models.Enums;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;

namespace backend.Server.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;

        public AuthService(ApplicationDbContext context)
        {
            _context = context;
        }

        public string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        public bool VerifyPassword(string password, string storedHash)
        {
            var hashedPassword = HashPassword(password);
            return hashedPassword == storedHash;
        }

        public async Task AddCookie(HttpContext httpContext, long userId, bool isPersistent)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            };
            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            await httpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity), new AuthenticationProperties
            {
                IsPersistent = isPersistent,
                ExpiresUtc = DateTime.UtcNow.AddDays(10)
            });
        }

        public void RemoveCookie(HttpContext httpContext)
        {
            httpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        }

        public long? GetRequesterNid(HttpContext httpContext)
        {
            var claim = httpContext.User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;
            if (long.TryParse(claim, out long requesterId))
            {
                return requesterId;
            }
            return null;
        }

        public async Task CreateUserAsync(RegisterDTO registerDetails)
        {
            if (registerDetails is null)
                throw new ApiException(400, "Register details are required.");

            var missingFields = new List<string>();

            if (string.IsNullOrWhiteSpace(registerDetails.Name)) missingFields.Add(nameof(registerDetails.Name));
            if (string.IsNullOrWhiteSpace(registerDetails.Surname)) missingFields.Add(nameof(registerDetails.Surname));
            if (string.IsNullOrWhiteSpace(registerDetails.Email)) missingFields.Add(nameof(registerDetails.Email));
            if (string.IsNullOrWhiteSpace(registerDetails.Password)) missingFields.Add(nameof(registerDetails.Password));

            // need to validate that the plan is valid once that is implemented

            if (missingFields.Count > 0)
            {
                throw new ApiException(400, $"Missing or invalid required fields: {string.Join(", ", missingFields)}");
            }

            var exists = await _context.Users.AnyAsync(u => u.Email == registerDetails.Email);
            if (exists)
                throw new ApiException(409, "User with this email already exists.");

            // Check if this is the first user in the system
            var isFirstUser = !await _context.Users.AnyAsync();
            
            // First user becomes SuperAdmin, others use the provided UserType (default to Employee)
            var userType = isFirstUser ? UserRole.SuperAdmin : (registerDetails.UserType ?? UserRole.Employee);

            var user = new User
            {
                Name = registerDetails.Name,
                Surname = registerDetails.Surname,
                UserType = userType,
                Address = registerDetails.Address,
                Telephone = registerDetails.Telephone,
                PlanId = registerDetails.PlanId,
                BankAccount = registerDetails.BankAccount,
                Email = registerDetails.Email,
                Password = HashPassword(registerDetails.Password),
                BusinessId = 1  // Default value for registration
            };

            _context.Users.Add(user);
            var result = await _context.SaveChangesAsync();

            if (result == 0)
                throw new ApiException(500, "Something went wrong when creating the user");

            return;
        }

        public async Task<User?> GetUserByEmail(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }


        public async Task<long?> GetUserBusinessId(long? nid)
        {            
            if (nid == null)
                return null;

            var user = await _context.Users.FindAsync(nid);

            if (user == null)
                return null;
            return user.BusinessId;
        }

        public async Task<bool> HasUsers()
        {
            return await _context.Users.AnyAsync();
        }
    }
}