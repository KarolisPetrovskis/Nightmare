using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.Auth;

namespace backend.Server.Interfaces
{
    public interface IAuthService
    {
        void RemoveCookie(HttpContext httpContext);
        long? GetRequesterNid(HttpContext httpContext);
        Task CreateUserAsync(RegisterDTO registerDetails);
        Task CreateBusinessOwnerAsync(RegisterDTO registerDetails, long requesterId);
        public Task<User?> GetUserByEmail(string email);
        bool VerifyPassword(string password, string storedHash);
        public Task AddCookie(HttpContext httpContext, long userId, bool isPersistent);
        public Task<long?> GetUserBusinessId(long? nid);
        public string HashPassword(string password);
        public Task<bool> HasUsers();
    }
}