using backend.Server.Interfaces;
using backend.Server.Models.DTOs.User;
using Microsoft.AspNetCore.Mvc;

namespace backend.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeesController : ControllerBase
    {
        private readonly IEmployeesService _employeesService;

        public EmployeesController(IEmployeesService employeesService)
        {
            _employeesService = employeesService;
        }

        [HttpGet]
        public IActionResult GetEmployees([FromBody] UserGetAllDTO request)
        {
            _employeesService.placeholderMethod();
            return Ok("Employees fetched successfully.");
        }

        [HttpPost]
        public IActionResult CreateEmployee([FromBody] UserCreateDTO request)
        {
            _employeesService.placeholderMethod();
            return Ok("Employee created successfully.");
        }

        [HttpGet("{id}")]
        public IActionResult GetEmployeeById(long id)
        {
            _employeesService.placeholderMethod();
            return Ok($"Employee {id} fetched successfully.");
        }

        [HttpPut("{id}")]
        public IActionResult UpdateEmployee([FromBody] UserUpdateDTO request, long id)
        {
            _employeesService.placeholderMethod();
            return Ok($"Employee {id} updated successfully.");
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteEmployee(long id)
        {
            _employeesService.placeholderMethod();
            return Ok($"Employee {id} deleted successfully.");
        }
    }
}