using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.Auth;

namespace backend.Server.Interfaces
{
    public interface IAuthService
    {
        void RemoveCookie(HttpContext httpContext);
        Guid? GetRequesterNid(HttpContext httpContext);
        Task CreateUserAsync(RegisterDTO registerDetails);
        public Task<User?> GetUserByEmail(string email);
        bool VerifyPassword(string password, string storedHash);
        public Task AddCookie(HttpContext httpContext, long userId, bool isPersistent);
        public Task<long> GetUserBusinessId(HttpContext httpContext);

    }
}