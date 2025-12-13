using backend.Server._helpers;
using backend.Server.Database;
using backend.Server.Exceptions;
using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.User;
using Microsoft.EntityFrameworkCore;

namespace backend.Server.Services
{
    public class EmployeesService (ApplicationDbContext context) : IEmployeesService 
    {
        private readonly ApplicationDbContext _context = context;
        public async Task<List<User>> GetAllEmployeesAsync(int page, int perPage)
        {
            if (page < 0)
            {
                throw new ApiException(400, "Page number must be greater than or equal to zero");
            }
            if (perPage <= 0)
            {
                throw new ApiException(400, "PerPage value must be greater than or equal to zero");
            }

            if (page == 0)
            {
                return await _context.Users
                    .AsNoTracking()
                    .ToListAsync();
            }

            return await _context.Users
                .AsNoTracking()
                .Skip((page - 1) * perPage)
                .Take(perPage)
                .ToListAsync();
        }

        public async Task<User> CreateEmployeeAsync(UserCreateDTO request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                throw new ApiException(409, $"Employee with Email {request.Email} already exists.");
            }

            var employee = new User
            {
                Name = request.Name,
                Surname = request.Surname,
                Email = request.Email,
                Password = request.Password,
                UserType = request.UserType,
                Address = request.Address,
                Telephone = request.Telephone,
                PlanId = request.PlanId,
                Salary = request.Salary,
                BossId = request.BossId,
                BankAccount = request.BankAccount
            };

            _context.Users.Add(employee);

            await Helper.SaveChangesOrThrowAsync(_context, "Failed to create employee.");

            return employee;
        }

        public async Task<User> GetEmployeeByNidAsync(long nid)
        {
            if (nid <= 0)
            {
                throw new ApiException(400, "Nid must be a positive number");
            }

            var employee = await _context.Users.FindAsync(nid) ?? throw new ApiException(404, $"Employee with Nid {nid} not found.");
            return employee;
        }

        public async Task UpdateEmployeeAsync(UserUpdateDTO request, User employee)
        {
            if (employee == null || employee.Nid <= 0)
            {
                throw new ApiException(400, "Invalid employee data");
            }

            if (request.Name != null) employee.Name = request.Name;
            if (request.Surname != null) employee.Surname = request.Surname;
            if (request.Email != null) employee.Email = request.Email;
            if (request.Password != null) employee.Password = request.Password;
            if (request.UserType.HasValue) employee.UserType = request.UserType.Value;
            if (request.Address != null) employee.Address = request.Address;
            if (request.Telephone != null) employee.Telephone = request.Telephone;
            if (request.PlanId.HasValue) employee.PlanId = request.PlanId;
            if (request.Salary.HasValue) employee.Salary = request.Salary;
            if (request.BossId.HasValue) employee.BossId = request.BossId;
            if (request.BankAccount != null) employee.BankAccount = request.BankAccount;

            _context.Users.Update(employee);

            await Helper.SaveChangesOrThrowAsync(_context, "Failed to update employee.", expectChanges: false);
        }

        public async Task DeleteEmployeeAsync(long nid)
        {
            if (nid <= 0)
            {
                throw new ApiException(400, "Nid must be a positive number");
            }

            var employee = await _context.Users.FindAsync(nid) ?? throw new ApiException(404, $"Employee with Nid {nid} not found.");

            _context.Users.Remove(employee);

            await Helper.SaveChangesOrThrowAsync(_context, $"Failed to delete employee {nid}.");
        }
    }
}