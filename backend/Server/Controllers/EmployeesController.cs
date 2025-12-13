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

        [HttpGet("business")]
        public async Task<ActionResult<List<User>>> GetAllEmployeesByBusinessId([FromQuery] UserGetAllDTO request)
        {
            var employees = await _employeesService.GetAllEmployeesByBusinessIdAsync(request);

            return Ok(employees);
        }

        [HttpPost]
        public async Task<ActionResult<User>> CreateEmployee([FromBody] UserCreateDTO request)
        {
            var employee = await _employeesService.CreateEmployeeAsync(request);

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
            await _employeesService.UpdateEmployeeAsync(request, nid);
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