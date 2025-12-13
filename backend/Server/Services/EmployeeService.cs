using backend.Server._helpers;
using backend.Server.Database;
using backend.Server.Exceptions;
using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
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

        public async Task CreateEmployeeAsync(User employee)
        {
            if (await _context.Users.AnyAsync(u => u.Email == employee.Email))
            {
                throw new ApiException(409, $"Employee with Email {employee.Email} already exists.");
            }

            _context.Users.Add(employee);

            await Helper.SaveChangesOrThrowAsync(_context, "Failed to create employee.");
        }

        public async Task<User> GetEmployeeByNidAsync(long nid)
        {
            if (nid <= 0)
            {
                throw new ApiException(400, "Nid must be a positive number");
            }

            var employee = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Nid == nid) ?? throw new ApiException(404, $"Employee with Nid {nid} not found.");
            return employee;
        }

        public async Task UpdateEmployeeAsync(User employee)
        {
            if (employee == null || employee.Nid <= 0)
            {
                throw new ApiException(400, "Invalid employee data");
            }

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