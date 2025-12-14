using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.VAT;
using Microsoft.AspNetCore.Mvc;

namespace backend.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VATController : ControllerBase
    {
        private readonly IVATService _vatService;

        public VATController(IVATService vatService)
        {
            _vatService = vatService;
        }

        [HttpGet]
        public async Task<ActionResult<List<Vat>>> GetVatRatesAsync([FromQuery] VatGetAllDTO request)
        {
            var list = await _vatService.GetVatRates(request);
            return Ok(list);
        }

        [HttpPost]
        public async Task<ActionResult<Vat>> CreateVatRateAsync([FromBody] VatCreateDTO request)
        {
            var vat = await _vatService.CreateVatRate(request);
            return CreatedAtAction(nameof(GetVatRateByNid), new { nid = vat.Nid }, vat);
        }

        [HttpPut("{nid}")]
        public async Task<IActionResult> UpdateVatRate([FromBody] VatUpdateDTO request, long nid)
        {
            await _vatService.UpdateVatRate(request, nid);
            return NoContent();
        }

        [HttpGet("{nid}")]
        public async Task<ActionResult<Vat>> GetVatRateByNid(long nid)
        {
            var vat = await _vatService.GetVatRateByNid(nid);
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