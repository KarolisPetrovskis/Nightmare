using System.Threading.Tasks;
using backend.Server.Interfaces;
using backend.Server.Models.DTOs.VAT;
using Microsoft.AspNetCore.Mvc;

namespace backend.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VatController : ControllerBase
    {
        private readonly IVatService _vatService;

        public VatController(IVatService vatService)
        {
            _vatService = vatService;
        }

        [HttpGet]
        public async Task<IActionResult> GetVatRatesAsync([FromQuery] VatGetAllDTO request)
        {
            var list = await _vatService.GetVatRates(request);
            return Ok(list);
        }

        [HttpPost]
        public async Task<IActionResult> CreateVatRateAsync([FromBody] VatCreateDTO request)
        {
            await _vatService.CreateVatRate(request);
            return Ok("Vat created successfully");
        }

        [HttpPut("{nid}")]
        public async Task<IActionResult> UpdateVatRate([FromBody] VatUpdateDTO request, long nid)
        {
            await _vatService.UpdateVatRate(request, nid);
            return NoContent();
        }

        [HttpGet("{nid}")]
        public async Task<IActionResult> GetVatRateBYNid(long nid)
        {
            var vat = await _vatService.GetVatRateByNid(nid);
            if (vat == null)
                return NotFound();
            else
                return Ok(vat);
        }

        [HttpDelete("{nid}")]
        public async Task<IActionResult> DeleteVATRate(long nid)         //Different from YAML, but DELETE with body is not a good practice
        {
            await _vatService.DeleteVatRate(nid);
            return NoContent();
        }
    }
}