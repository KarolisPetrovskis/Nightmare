using backend.Server.Interfaces;
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
        public IActionResult GetVATRates([FromBody] VatGetAllDTO request)
        {
            _vatService.placeholderMethod();
            return Ok("VAT rates fetched successfully.");
        }

        [HttpPost]
        public IActionResult CreateVATRate([FromBody] VatCreateDTO request)
        {
            _vatService.placeholderMethod();
            return Ok("VAT rate created successfully.");
        }

        [HttpPut]
        public IActionResult UpdateVATRate([FromBody] VatUpdateDTO request)
        {
            _vatService.placeholderMethod();
            return Ok("VAT rate updated successfully.");
        }

        [HttpGet("{nid}")]
        public IActionResult GetVATRateBynid(long nid)
        {
            _vatService.placeholderMethod();
            return Ok($"VAT rate {nid} fetched successfully.");
        }

        [HttpDelete("{nid}")]
        public IActionResult DeleteVATRate(long nid)         //Different from YAML, but DELETE with body is not a good practice
        {
            _vatService.placeholderMethod();
            return Ok("VAT rate deleted successfully.");
        }
    }
}