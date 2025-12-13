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
        public async Task<ActionResult<List<Service>>> GetServices([FromQuery] ServiceGetAllDTO request)
        {
            var result = await _servicesService.GetServicesByBusinessId(request.BusinessId, request.Page, request.PerPage);
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<Service>> CreateService([FromBody] ServiceCreateDTO request)
        {
            var service = new Service
            {
                BusinessId = request.BusinessId,
                Discount = request.Discount,
                Name = request.Name,
                Price = request.Price,
                TimeMin = request.TimeMin,
                VatId = request.VatId,
            };

            await _servicesService.CreateServiceAsync(service);
            return CreatedAtAction(nameof(GetServiceByNid), new { nid = service.Nid }, service);
        }

        [HttpPut("nid")]
        public async Task<IActionResult> UpdateServiceAsync([FromBody] ServiceUpdateDTO request, long nid)
        {
            await _servicesService.UpdateServiceAsync(request, nid);
            return NoContent();
        }

        [HttpGet("{nid}")]
        public async Task<ActionResult<Service>> GetServiceByNid(long nid)
        {
            var result = await _servicesService.GetServiceByNid(nid);
            return Ok(result);
        }

        [HttpDelete("{nid}")]
        public async Task<IActionResult> DeleteService(long nid)
        {
            await _servicesService.DeleteServiceAsync(nid);
            return NoContent();
        }
    }
}