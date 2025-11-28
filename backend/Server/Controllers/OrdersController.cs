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

        [HttpGet("{nid}")]
        public IActionResult GetOrderBynid(long nid)
        {
            _ordersService.placeholderMethod();
            return Ok($"Order {nid} fetched successfully.");
        }

        [HttpDelete("{nid}")]
        public IActionResult DeleteOrder(long nid)         //Different from YAML, but DELETE with body is not a good practice
        {
            _ordersService.placeholderMethod();
            return Ok("Order deleted successfully.");
        }

        [HttpGet("business/{businessnid}")]
        public IActionResult GetOrdersByBusinessnid(long businessnid)
        {
            _ordersService.placeholderMethod();
            return Ok($"Orders for business {businessnid} fetched successfully.");
        }
    }
}