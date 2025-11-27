using backend.Server.Interfaces;
using backend.Server.Models.DTOs.Order;
using Microsoft.AspNetCore.Mvc;

namespace backend.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrdersService _ordersService;

        public OrdersController(IOrdersService ordersService)
        {
            _ordersService = ordersService;
        }

        [HttpGet]
        public IActionResult GetOrders()        //They don't have it in YAML, but we should probably have it
        {
            _ordersService.placeholderMethod();
            return Ok("Orders fetched successfully.");
        }

        [HttpPost]
        public IActionResult CreateOrder([FromBody] OrderCreateDTO request)
        {
            _ordersService.placeholderMethod();
            return Ok("Order created successfully.");
        }

        [HttpPut]
        public IActionResult UpdateOrder([FromBody] OrderUpdateDTO request)
        {
            _ordersService.placeholderMethod();
            return Ok("Order updated successfully.");
        }

        [HttpGet("{id}")]
        public IActionResult GetOrderById(int id)
        {
            _ordersService.placeholderMethod();
            return Ok($"Order {id} fetched successfully.");
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteOrder(int id)         //Different from YAML, but DELETE with body is not a good practice
        {
            _ordersService.placeholderMethod();
            return Ok("Order deleted successfully.");
        }

        [HttpGet("business/{businessId}")]
        public IActionResult GetOrdersByBusinessId(int businessId)
        {
            _ordersService.placeholderMethod();
            return Ok($"Orders for business {businessId} fetched successfully.");
        }
    }
}