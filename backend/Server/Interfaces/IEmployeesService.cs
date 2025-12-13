using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.User;

namespace backend.Server.Interfaces
{
    public interface IEmployeesService
    {
        Task<List<User>> GetAllEmployeesAsync(int page, int perPage);
        Task<List<User>> GetAllEmployeesByBusinessIdAsync(UserGetAllDTO request);
        Task<User> CreateEmployeeAsync(UserCreateDTO request);
        Task<User> GetEmployeeByNidAsync(long nid);
        Task UpdateEmployeeAsync(UserUpdateDTO request, long nid);
        Task DeleteEmployeeAsync(long nid);
    }
}