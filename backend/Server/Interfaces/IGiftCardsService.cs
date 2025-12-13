using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.GiftCard;

namespace backend.Server.Interfaces
{
    public interface IGiftCardsService
    {
        Task<List<GiftCard>> GetAllGiftCardsAsync(GiftCardGetAllDTO request);
        Task<GiftCard> CreateGiftCardAsync(GiftCardCreateDTO request);
        Task<GiftCard> GetGiftCardByNidAsync(long nid);
        Task DeleteGiftCardAsync(long nid);
    }
}