using backend.Server.Models.Enums;

namespace backend.server.Models.DTOs.Auth
{
    public class LoginResponseDTO
    {
        public long UserId { get; set; }
        public UserRole UserType { get; set; }
    }
}
