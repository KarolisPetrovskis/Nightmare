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
        public IActionResult GetVatRates([FromQuery] VatGetAllDTO request)
        {
            var list = _vatService.GetVatRates(request);
            return Ok(list);
        }

        [HttpPost]
        public IActionResult CreateVatRate([FromBody] VatCreateDTO request)
        {
            _vatService.CreateVatRate(request);
            return Ok("Vat created successfully");
        }

        [HttpPut("{nid}")]
        public IActionResult UpdateVatRate([FromBody] VatUpdateDTO request, long nid)
        {
            _vatService.UpdateVatRate(request, nid);
            return Ok("Vat updated successfully");
        }

        [HttpGet("{nid}")]
        public IActionResult GetVatRateBYNid(long nid)
        {
            var vat = _vatService.GetVatRateByNid(nid);
            if (vat == null)
                return NotFound();
            else
                return Ok(vat);
        }

        [HttpDelete("{nid}")]
        public IActionResult DeleteVATRate(long nid)         //Different from YAML, but DELETE with body is not a good practice
        {
            _vatService.DeleteVatRate(nid);
            return Ok("Vat deleted successfully");
        }
    }
}