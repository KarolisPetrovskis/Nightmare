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
        public IActionResult GetBusinesses([FromBody] BusinessGetAllDTO request)
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

        [HttpGet("{id}")]
        public IActionResult GetBusinessById(int id)
        {
            _businessService.placeholderMethod();
            return Ok($"Business {id} fetched successfully.");
        }

        [HttpPut("{id}")]
        public IActionResult UpdateBusiness([FromBody] BusinessUpdateDTO request, int id)
        {
            _businessService.placeholderMethod();
            return Ok($"Business {id} updated successfully.");
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteBusiness(int id)
        {
            _businessService.placeholderMethod();
            return Ok($"Business {id} deleted successfully.");
        }
    }
}