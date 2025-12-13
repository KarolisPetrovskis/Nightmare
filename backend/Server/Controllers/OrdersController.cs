using System.Threading.Tasks;
using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.Order;
using Microsoft.AspNetCore.Mvc;

namespace backend.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController(IOrdersService ordersService) : ControllerBase
    {
        private readonly IOrdersService _ordersService = ordersService;

        [HttpGet]
        public async Task<ActionResult<List<Order>>> GetAllOrders([FromQuery] OrderGetAllDTO request)
        {
            var orders = await _ordersService.GetAllOrdersAsync(request.Page, request.PerPage);

            if (request.WorkerId.HasValue && request.WorkerId > 0)
            {
                orders = await _ordersService.TrimOrdersByWorkerIdAsync(orders, request.WorkerId.Value);
            }
            if (request.DateCreated.HasValue)
            {
                orders = await _ordersService.TrimOrdersByDateAsync(orders, request.DateCreated.Value);
            }

            return Ok(orders);
        }

        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder([FromBody] OrderCreateDTO request)
        {
            var order = await _ordersService.CreateOrderAsync(request);

            return CreatedAtAction(nameof(GetOrderByNid), new { nid = order.Nid }, order);
        }

        [HttpGet("{nid}")]
        public async Task<ActionResult<Order>> GetOrderByNid(long nid)
        {
            var order = await _ordersService.GetOrderByNidAsync(nid);
            return Ok(order);
        }

        [HttpGet("item/{orderNid}")]
        public async Task<ActionResult<List<OrderDetail>>> GetOrderDetailsByOrderNid(long orderNid)
        {
            var order = await _ordersService.GetOrderByNidAsync(orderNid);

            var orderDetails = await _ordersService.GetOrderDetailsByOrderId(order.Nid);

            return Ok(orderDetails);
        }

        [HttpGet("item/addons/{orderNid}")]
        public async Task<ActionResult<List<OrderDetailAddOn>>> GetOrderDetailAddOnsByDetailNid(long orderNid)
        {
            var orderDetails = await _ordersService.GetOrderDetailsByOrderId(orderNid);

            var addOns = new List<OrderDetailAddOn>();
            foreach (var detail in orderDetails)
            {
                var detailAddOns = await _ordersService.GetOrderDetailAddOnsByDetailId(detail.Nid);
                addOns.AddRange(detailAddOns);
            }

            return Ok(addOns);
        }

        [HttpGet("business/{businessnid}")]
        public async Task<ActionResult<List<Order>>> GetOrdersByBusinessnid(long businessnid)
        {
            var orders = await _ordersService.GetOrderByBusinessIdAsync(businessnid);
            return Ok(orders);
        }

        [HttpPut("{nid}")]
        public async Task<IActionResult> UpdateOrder(long nid, [FromBody] OrderUpdateDTO request)
        {
            await _ordersService.UpdateOrderAsync(request, nid);
            return NoContent();
        }

        [HttpDelete("{nid}")]
        public async Task<IActionResult> DeleteOrder(long nid)         //Different from YAML, but DELETE with body is not a good practice
        {
            await _ordersService.DeleteOrderAsync(nid);
            return NoContent();
        }
    }
}