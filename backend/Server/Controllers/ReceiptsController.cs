using backend.Server.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReceiptsController : ControllerBase
    {
        private readonly IReceiptsService _receiptsService;

        public ReceiptsController(IReceiptsService receiptsService)
        {
            _receiptsService = receiptsService;
        }
    }
}