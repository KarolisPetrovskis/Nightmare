using backend.Server._helpers;
using backend.Server.Database;
using backend.Server.Exceptions;
using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
using Microsoft.EntityFrameworkCore;

namespace backend.Server.Services
{
    public class GiftCardsService(ApplicationDbContext context) : IGiftCardsService
    {
        private readonly ApplicationDbContext _context = context;
        public async Task<List<GiftCard>> GetAllGiftCardsAsync(long businessId, int page, int perPage)
        {
            if (page < 0)
            {
                throw new ApiException(400, "Page number must be greater than zero");
            }
            if (perPage <= 0)
            {
                throw new ApiException(400, "PerPage value must be greater than zero");
            }

            if (page == 0)
            {
                return await _context.GiftCard
                    .Where(g => g.BusinessId == businessId)
                    .AsNoTracking()
                    .ToListAsync();
            }

            return await _context.GiftCard
                .Where(g => g.BusinessId == businessId)
                .Skip((page - 1) * perPage)
                .Take(perPage)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task CreateGiftCardAsync(GiftCard giftCard)
        {
            if (await _context.GiftCard.AnyAsync(g => g.Code == giftCard.Code && g.BusinessId == giftCard.BusinessId))
            {
                throw new ApiException(409, $"Gift card with Code {giftCard.Code} already exists.");
            }

            _context.GiftCard.Add(giftCard);

            await Helper.SaveChangesOrThrowAsync(_context, "Failed to create gift card.");
        }

        public async Task<GiftCard> GetGiftCardByNidAsync(long nid)
        {
            if (nid <= 0)
            {
                throw new ApiException(400, "Nid must be a positive number");
            }

            var giftCard = await _context.GiftCard
                .AsNoTracking()
                .FirstOrDefaultAsync(g => g.Nid == nid) ?? throw new ApiException(404, $"Gift card with Nid {nid} not found.");
            return giftCard;
        }

        public async Task DeleteGiftCardAsync(long nid)
        {
            var giftCard = await _context.GiftCard.FirstOrDefaultAsync(g => g.Nid == nid) ?? throw new ApiException(404, $"Gift card with Nid {nid} not found.");
            
            _context.GiftCard.Remove(giftCard);

            await Helper.SaveChangesOrThrowAsync(_context, "Failed to delete gift card.");
        }
    }
}