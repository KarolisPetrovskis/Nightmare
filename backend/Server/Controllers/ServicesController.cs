using backend.Server.Interfaces;
using backend.Server.Models.DTOs.Service;
using Microsoft.AspNetCore.Mvc;

namespace backend.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServicesController : ControllerBase
    {
        private readonly IServicesService _servicesService;

        public ServicesController(IServicesService servicesService)
        {
            _servicesService = servicesService;
        }

        [HttpGet]
        public IActionResult GetServices([FromBody] ServiceGetAllDTO request)
        {
            _servicesService.placeholderMethod();
            return Ok("Services fetched successfully.");
        }

        [HttpPost]
        public IActionResult CreateService([FromBody] ServiceCreateDTO request)
        {
            _servicesService.placeholderMethod();
            return Ok("Service created successfully.");
        }

        [HttpPut]
        public IActionResult UpdateService([FromBody] ServiceUpdateDTO request)
        {
            _servicesService.placeholderMethod();
            return Ok("Service updated successfully.");
        }

        [HttpGet("{id}")]
        public IActionResult GetServiceById(int id)
        {
            _servicesService.placeholderMethod();
            return Ok($"Service {id} fetched successfully.");
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteService(int id)         //Different from YAML, but DELETE with body is not a good practice
        {
            _servicesService.placeholderMethod();
            return Ok("Service deleted successfully.");
        }
    }
}