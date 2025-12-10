using backend.Server.Interfaces;
using backend.Server.Models.DTOs.VAT;
using Microsoft.AspNetCore.Mvc;

namespace backend.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VATController : ControllerBase
    {
        private readonly IVatService _vatService;

        public VATController(IVatService vatService)
        {
            _vatService = vatService;
        }

        [HttpGet]
        public IActionResult GetVatRates([FromBody] VatGetAllDTO request)
        {
            var list = _vatService.GetVatRates(request);
            return Ok(list);
        }

        [HttpPost]
        public IActionResult CreateVatRate([FromBody] VatCreateDTO request)
        {
            Task<int> code = _vatService.CreateVatRate(request);
            return Ok(code);
        }

        [HttpPut("{nid}")]
        public IActionResult UpdateVatRate([FromBody] VatUpdateDTO request, long nid)
        {
            Task<int> code = _vatService.UpdateVatRate(request, nid);
            return Ok(code);
        }

        [HttpGet("{nid}")]
        public IActionResult GetVatRateBYNid(long nid)
        {
            var vat = _vatService.GetVatRateByNid(nid);
            if (vat == null)
                return NotFound(null);
            else
                return Ok(vat);
        }

        [HttpDelete("{nid}")]
        public IActionResult DeleteVATRate(long nid)         //Different from YAML, but DELETE with body is not a good practice
        {
            Task<int> code = _vatService.DeleteVatRate(nid);
            return Ok(code);
        }
    }
}