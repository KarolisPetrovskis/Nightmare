using System.Threading.Tasks;
using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.User;
using Microsoft.AspNetCore.Mvc;

namespace backend.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeesController(IEmployeesService employeesService) : ControllerBase
    {
        private readonly IEmployeesService _employeesService = employeesService;

        [HttpGet]
        public async Task<ActionResult<List<User>>> GetAllEmployees([FromQuery] UserGetAllDTO request)
        {
            var employees = await _employeesService.GetAllEmployeesAsync(request.Page, request.PerPage);
            return Ok(employees);
        }

        [HttpPost]
        public async Task<ActionResult<User>> CreateEmployee([FromBody] UserCreateDTO request)
        {
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

            await _employeesService.CreateEmployeeAsync(employee);

            return CreatedAtAction(nameof(GetEmployeeBynid), new { nid = employee.Nid }, employee);
        }

        [HttpGet("{nid}")]
        public async Task<ActionResult<User>> GetEmployeeBynid(long nid)
        {
            var employee = await _employeesService.GetEmployeeByNidAsync(nid);
            return Ok(employee);
        }

        [HttpPut("{nid}")]
        public async Task<IActionResult> UpdateEmployee([FromBody] UserUpdateDTO request, long nid)
        {
            var existingEmployee = await _employeesService.GetEmployeeByNidAsync(nid);

            if (request.Name != null) existingEmployee.Name = request.Name;
            if (request.Surname != null) existingEmployee.Surname = request.Surname;
            if (request.Email != null) existingEmployee.Email = request.Email;
            if (request.Password != null) existingEmployee.Password = request.Password;
            if (request.UserType.HasValue) existingEmployee.UserType = request.UserType.Value;
            if (request.Address != null) existingEmployee.Address = request.Address;
            if (request.Telephone != null) existingEmployee.Telephone = request.Telephone;
            if (request.PlanId.HasValue) existingEmployee.PlanId = request.PlanId;
            if (request.Salary.HasValue) existingEmployee.Salary = request.Salary;
            if (request.BossId.HasValue) existingEmployee.BossId = request.BossId;
            if (request.BankAccount != null) existingEmployee.BankAccount = request.BankAccount;

            await _employeesService.UpdateEmployeeAsync(existingEmployee);

            return NoContent();
        }

        [HttpDelete("{nid}")]
        public async Task<IActionResult> DeleteEmployee(long nid)
        {
            await _employeesService.DeleteEmployeeAsync(nid);
            
            return NoContent();
        }
    }
}