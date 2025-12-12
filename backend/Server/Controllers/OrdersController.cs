using System.Threading.Tasks;
using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
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
        public async Task<IActionResult> CreateOrder([FromBody] OrderCreateDTO request)
        {
            var order = new Order
            {
                Code = request.Code,
                VatId = request.VatId,
                StatusId = request.StatusId,
                Total = request.Total,
                DateCreated = DateTime.Now,
                BusinessId = request.BusinessId,
                WorkerId = request.WorkerId,
            };

            await _ordersService.CreateOrderAsync(order);

            var orderDetails = new List<OrderDetail>();
            foreach (var detailRequest in request.OrderDetails)
            {
                var orderDetail = new OrderDetail
                {
                    OrderId = order.Nid,
                    ItemId = detailRequest.ItemId,
                    PriceWoVat = detailRequest.PriceWoVat,
                    PriceWtVat = detailRequest.PriceWtVat
                };
                orderDetails.Add(orderDetail);
            }

            await _ordersService.CreateOrderDetailsAsync(orderDetails);

            var orderAddOns = new List<OrderDetailAddOn>();
            foreach (var detailRequest in request.OrderDetails)
            {
                if (detailRequest.Addons != null)
                {
                    foreach (var addonRequest in detailRequest.Addons)
                    {
                        var orderAddOn = new OrderDetailAddOn
                        {
                            DetailId = orderDetails.First(od => od.ItemId == detailRequest.ItemId && od.OrderId == order.Nid).Nid,
                            IngredientId = addonRequest.IngredientId,
                            PriceWoVat = addonRequest.PriceWoVat
                        };
                        orderAddOns.Add(orderAddOn);
                    }
                }
            }

            await _ordersService.CreateOrderDetailAddOnsAsync(orderAddOns);

            return CreatedAtAction(nameof(GetOrderByNid), new { nid = order.Nid }, order);

        }

        [HttpPut]
        public IActionResult UpdateOrder([FromBody] OrderUpdateDTO request)
        {
            _ordersService.placeholderMethod();
            return Ok("Order updated successfully.");
        }

        [HttpGet("{nid}")]
        public IActionResult GetOrderByNid(long nid)
        {
            _ordersService.placeholderMethod();
            return Ok($"Order {nid} fetched successfully.");
        }

        [HttpGet("business/{businessnid}")]
        public IActionResult GetOrdersByBusinessnid(long businessnid)
        {
            _ordersService.placeholderMethod();
            return Ok($"Orders for business {businessnid} fetched successfully.");
        }

        [HttpDelete("{nid}")]
        public IActionResult DeleteOrder(long nid)         //Different from YAML, but DELETE with body is not a good practice
        {
            _ordersService.placeholderMethod();
            return Ok("Order deleted successfully.");
        }
    }
}