using backend.Server._helpers;
using backend.Server.Database;
using backend.Server.Exceptions;
using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.GiftCard;
using Microsoft.EntityFrameworkCore;

namespace backend.Server.Services
{
    public class GiftCardsService(ApplicationDbContext context) : IGiftCardsService
    {
        private readonly ApplicationDbContext _context = context;
        public async Task<List<GiftCard>> GetAllGiftCardsAsync(GiftCardGetAllDTO request)
        {
            if (request.Page < 0)
            {
                throw new ApiException(400, "Page number must be greater than zero");
            }
            if (request.PerPage <= 0)
            {
                throw new ApiException(400, "PerPage value must be greater than zero");
            }

            if (request.Page == 0)
            {
                return await _context.GiftCard
                    .Where(g => g.BusinessId == request.BusinessId)
                    .AsNoTracking()
                    .ToListAsync();
            }

            return await _context.GiftCard
                .Where(g => g.BusinessId == request.BusinessId)
                .Skip((request.Page - 1) * request.PerPage)
                .Take(request.PerPage)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<GiftCard> CreateGiftCardAsync(GiftCardCreateDTO request)
        {
            if (await _context.GiftCard.AnyAsync(g => g.Code == request.Code && g.BusinessId == request.BusinessId))
            {
                throw new ApiException(409, $"Gift card with Code {request.Code} already exists.");
            }

            var giftCard = new GiftCard
            {
                Code = request.Code,
                Value = request.Value,
                DateCreated = DateTime.UtcNow,
                BusinessId = request.BusinessId
            };

            _context.GiftCard.Add(giftCard);

            await Helper.SaveChangesOrThrowAsync(_context, "Failed to create gift card.");

            return giftCard;
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
            if (nid <= 0)
            {
                throw new ApiException(400, "Nid must be a positive number");
            }

            var giftCard = await _context.GiftCard.FindAsync(nid) ?? throw new ApiException(404, $"Gift card with Nid {nid} not found.");
            
            _context.GiftCard.Remove(giftCard);

            await Helper.SaveChangesOrThrowAsync(_context, "Failed to delete gift card.");
        }
    }
}