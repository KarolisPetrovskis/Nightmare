using backend.Server.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GiftCardsController : ControllerBase
    {
        private readonly IGiftCardsService _giftCardsService;

        public GiftCardsController(IGiftCardsService giftCardsService)
        {
            _giftCardsService = giftCardsService;
        }
    }
}