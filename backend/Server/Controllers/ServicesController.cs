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
            var result = await _servicesService.GetServicesAsync(request.BusinessId, request.Page, request.PerPage);

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

        [HttpPut("{nid}")]
        public async Task<IActionResult> UpdateService(long nid, [FromBody] ServiceUpdateDTO request)
            {
            var service = await _servicesService.GetServiceByNid(nid);

            if (service == null)
                return NotFound();

            if (request.Name != null) service.Name = request.Name;
            if (request.Discount != null) service.Discount = request.Discount.Value;
            if (request.TimeMin != null) service.TimeMin = request.TimeMin.Value;
            if (request.VatId != null) service.VatId = request.VatId.Value;
            if (request.Price != null) service.Price = request.Price.Value;

            await _servicesService.UpdateServiceAsync(service);

            return NoContent();
            }

        [HttpGet("{nid}")]
        public async Task<ActionResult<Service?>> GetServiceByNid(long nid)
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