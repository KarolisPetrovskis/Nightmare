using System.Threading.Tasks;
using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.Business;
using Microsoft.AspNetCore.Mvc;

namespace backend.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BusinessController : ControllerBase
    {
        private readonly IBusinessService _businessService;

        public BusinessController(IBusinessService businessService)
        {
            _businessService = businessService;
        }

        [HttpGet]
        public async Task<ActionResult<List<Business>>> GetBusinessesByOwnerNid([FromQuery] BusinessGetAllByOwnerNidDTO request)
        {
            var list = await _businessService.RetrieveAllBusinessbyOwnerNid(request);
            return Ok(list);
        }

        [HttpPost]
        public async Task<ActionResult<Business>> CreateBusiness([FromBody] BusinessCreateDTO request)
        {
            var bus = await _businessService.CreateBusiness(request);
            return CreatedAtAction(nameof(GetBusinessByNidAsync), new { nid = bus.Nid }, bus);
        }

        [HttpGet("{nid}")]
        public async Task<ActionResult<Business>> GetBusinessByNidAsync(long nid)
        {
            var bus = await _businessService.GetBusinessByNid(nid);
            return Ok(bus);
        }

        [HttpPut("{nid}")]
        public async Task<IActionResult> UpdateBusiness([FromBody] BusinessUpdateDTO request, long nid)
        {
            await _businessService.UpdateBussiness(request, nid);
            return NoContent();
        }

        [HttpDelete("{nid}")]
        public async Task<IActionResult> DeleteBusiness(long nid)
        {
            await _businessService.DeleteBusiness(nid);
            return NoContent();
        }
    }
}