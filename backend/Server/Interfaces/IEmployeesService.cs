using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.User;

namespace backend.Server.Interfaces
{
    public interface IEmployeesService
    {
        Task<List<User>> GetAllEmployeesAsync(int page, int perPage);
        Task<List<User>> GetAllEmployeesByBusinessIdAsync(UserGetAllDTO request);
        Task<User> CreateEmployeeAsync(UserCreateDTO request, HttpContext httpContext);
        Task<User> GetEmployeeByNidAsync(long nid);
        Task<User> GetEmployeeByEmailAsync(string email);
        Task UpdateEmployeeAsync(UserUpdateDTO request, long nid, HttpContext httpContext);
        Task DeleteEmployeeAsync(long nid);
    }
}