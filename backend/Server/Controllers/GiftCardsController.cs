using System.Threading.Tasks;
using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.GiftCard;
using Microsoft.AspNetCore.Mvc;

namespace backend.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GiftCardsController(IGiftCardsService giftCardsService) : ControllerBase
    {
        private readonly IGiftCardsService _giftCardsService = giftCardsService;

        [HttpGet]
        public async Task<ActionResult<List<GiftCard>>> GetAllGiftCards([FromQuery] GiftCardGetAllDTO request)
        {
            var giftCards = await _giftCardsService.GetAllGiftCardsAsync(request.BusinessId, request.Page, request.PerPage);
            return Ok(giftCards);
        }

        [HttpPost]
        public async Task<ActionResult<GiftCard>> CreateGiftCard([FromBody] GiftCardCreateDTO request)
        {
            var giftCard = new GiftCard
            {
                Code = request.Code,
                Value = request.Value,
                DateCreated = DateTime.UtcNow,
                BusinessId = request.BusinessId
            };

            await _giftCardsService.CreateGiftCardAsync(giftCard);

            return CreatedAtAction(nameof(GetGiftCardBynid), new { nid = giftCard.Nid }, giftCard);
        } 

        [HttpGet("{nid}")]
        public async Task<ActionResult<GiftCard>> GetGiftCardBynid(long nid)
        {
            var giftCard = await _giftCardsService.GetGiftCardByNidAsync(nid);
            return Ok(giftCard);
        }

        [HttpDelete("{nid}")]
        public async Task<IActionResult> DeleteGiftCard(long nid)
        {
            await _giftCardsService.DeleteGiftCardAsync(nid);
            return NoContent();
        }
    }
}