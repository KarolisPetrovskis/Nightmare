using backend.Server.Models.DatabaseObjects;

namespace backend.Server.Interfaces
{
    public interface IEmployeesService
    {
        Task<List<User>> GetAllEmployeesAsync(int page, int perPage);
        Task CreateEmployeeAsync(User employee);
        Task<User> GetEmployeeByNidAsync(long nid);
        Task UpdateEmployeeAsync(User employee);
        Task DeleteEmployeeAsync(long nid);
    }
}