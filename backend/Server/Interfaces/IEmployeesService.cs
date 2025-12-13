using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.User;

namespace backend.Server.Interfaces
{
    public interface IEmployeesService
    {
        Task<List<User>> GetAllEmployeesAsync(int page, int perPage);
        Task<User> CreateEmployeeAsync(UserCreateDTO request);
        Task<User> GetEmployeeByNidAsync(long nid);
        Task UpdateEmployeeAsync(UserUpdateDTO request, User employee);
        Task DeleteEmployeeAsync(long nid);
    }
}