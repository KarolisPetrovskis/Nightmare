using backend.Server.Models.DatabaseObjects;

namespace backend.Server.Interfaces
{
    public interface IGiftCardsService
    {
        Task<List<GiftCard>> GetAllGiftCardsAsync(long businessId, int page, int perPage);
        Task CreateGiftCardAsync(GiftCard giftCard);
        Task<GiftCard> GetGiftCardByNidAsync(long nid);
        Task DeleteGiftCardAsync(long nid);
    }
}