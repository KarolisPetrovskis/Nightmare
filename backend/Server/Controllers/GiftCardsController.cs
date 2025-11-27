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
        public IActionResult GetGiftCards([FromBody] GiftCardGetAllDTO request)
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

        [HttpGet("{id}")]
        public IActionResult GetGiftCardById(int id)
        {
            _giftCardsService.placeholderMethod();
            return Ok($"Gift card {id} fetched successfully.");
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteGiftCard(int id)
        {
            _giftCardsService.placeholderMethod();
            return Ok($"Gift card {id} deleted successfully.");
        }
    }
}