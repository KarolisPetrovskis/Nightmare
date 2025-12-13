using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
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
        public async Task<ActionResult<List<Service>>> GetBusinessServices([FromQuery] ServiceGetAllDTO request)
        {
            var service = await _servicesService.GetServicesByBusinessId(request);
            return Ok(service);
        }
        [HttpGet("{nid}")]
        public async Task<ActionResult<Service>> GetServiceByNid(long nid)
        {
            var service = await _servicesService.GetServiceByNidAsync(nid);
            return Ok(service);
        }

        [HttpPost]
        public async Task<ActionResult<Service>> CreateService([FromBody] ServiceCreateDTO request)
        {
            var service = await _servicesService.CreateServiceAsync(request);
            return CreatedAtAction(nameof(GetServiceByNid), new { nid = service.Nid }, service);
        }

        [HttpPut("nid")]
        public async Task<IActionResult> UpdateServiceAsync([FromBody] ServiceUpdateDTO request, long nid)
        {
            await _servicesService.UpdateServiceAsync(request, nid);
            return NoContent();
        }

        [HttpDelete("{nid}")]
        public async Task<IActionResult> DeleteService(long nid)         //Different from YAML, but DELETE with body is not a good practice
        {
            await _servicesService.DeleteServiceAsync(nid);
            return NoContent();
        }
    }
}