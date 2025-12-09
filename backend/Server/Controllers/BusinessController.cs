using backend.Server.Interfaces;
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
        public IActionResult GetBusinesses([FromQuery] BusinessGetAllDTO request)
        {
            _businessService.placeholderMethod();
            return Ok("Businesses fetched successfully.");
        }

        [HttpPost]
        public IActionResult CreateBusiness([FromBody] BusinessCreateDTO request)
        {
            _businessService.placeholderMethod();
            return Ok("Business created successfully.");
        }

        [HttpGet("{nid}")]
        public IActionResult GetBusinessBynid(long nid)
        {
            _businessService.placeholderMethod();
            return Ok($"Business {nid} fetched successfully.");
        }

        [HttpPut("{nid}")]
        public IActionResult UpdateBusiness([FromBody] BusinessUpdateDTO request, long nid)
        {
            _businessService.placeholderMethod();
            return Ok($"Business {nid} updated successfully.");
        }

        [HttpDelete("{nid}")]
        public IActionResult DeleteBusiness(long nid)
        {
            _businessService.placeholderMethod();
            return Ok($"Business {nid} deleted successfully.");
        }
    }
}