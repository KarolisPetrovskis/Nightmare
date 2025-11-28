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

        [HttpGet("{nid}")]
        public IActionResult GetEmployeeBynid(long nid)
        {
            _employeesService.placeholderMethod();
            return Ok($"Employee {nid} fetched successfully.");
        }

        [HttpPut("{nid}")]
        public IActionResult UpdateEmployee([FromBody] UserUpdateDTO request, long nid)
        {
            _employeesService.placeholderMethod();
            return Ok($"Employee {nid} updated successfully.");
        }

        [HttpDelete("{nid}")]
        public IActionResult DeleteEmployee(long nid)
        {
            _employeesService.placeholderMethod();
            return Ok($"Employee {nid} deleted successfully.");
        }
    }
}