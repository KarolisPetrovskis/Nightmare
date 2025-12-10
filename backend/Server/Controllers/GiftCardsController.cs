using backend.Server.Interfaces;
using backend.Server.Models.DTOs.GiftCard;
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

        [HttpGet]
        public IActionResult GetGiftCards([FromQuery] GiftCardGetAllDTO request)
        {
            _giftCardsService.placeholderMethod();
            return Ok("Gift cards fetched successfully.");
        }

        [HttpPost]
        public IActionResult CreateGiftCard([FromBody] GiftCardCreateDTO request)
        {
            _giftCardsService.placeholderMethod();
            return Ok("Gift card created successfully.");
        } 

        [HttpGet("{nid}")]
        public IActionResult GetGiftCardBynid(long nid)
        {
            _giftCardsService.placeholderMethod();
            return Ok($"Gift card {nid} fetched successfully.");
        }

        [HttpDelete("{nid}")]
        public IActionResult DeleteGiftCard(long nid)
        {
            _giftCardsService.placeholderMethod();
            return Ok($"Gift card {nid} deleted successfully.");
        }
    }
}