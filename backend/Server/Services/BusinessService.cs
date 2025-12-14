using backend.Server._helpers;
using backend.Server.Database;
using backend.Server.Exceptions;
using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.Business;
using Microsoft.EntityFrameworkCore;

namespace backend.Server.Services
{
    public class BusinessService : IBusinessService
    {

        private readonly ApplicationDbContext _context;

        public BusinessService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Business>> RetrieveAllBusinessbyOwnerNid(BusinessGetAllByOwnerNidDTO request)
        {
            return await _context.Businesses.Where(b => b.OwnerId == request.OwnerId).ToListAsync() ?? throw new ApiException(404, "No businesses found for this owner.");
;
        }
        public async Task<Business> GetBusinessByNid(long nid)
        {
            var bus = await _context.Businesses.FindAsync(nid);    
            if (bus == null)
            {
                throw new ApiException(404, "Business with such nid was not found.");
            }
            return bus;
        }
        public async Task<Business> CreateBusiness(BusinessCreateDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Name) || request.OwnerId <= 0 || request.Type <= 0 )
                throw new ApiException(400, "Bad Data imputed");

            var bus = new Business
            {
                Name = request.Name,
                OwnerId = request.OwnerId,
                Type = request.Type,
                WorkStart = request.WorkStart,
                WorkEnd = request.WorkEnd,
                Address = request.Address,
                Phone = request.Phone,
                Email = request.Email
            };

            _context.Businesses.Add(bus);

            await Helper.SaveChangesOrThrowAsync(_context, "Internal server error", expectChanges: true);
            
            return bus;
        }
        public async Task UpdateBussiness(BusinessUpdateDTO request, long nid)
        {
            if (string.IsNullOrWhiteSpace(request.Name) || request.OwnerId < 0 || request.Type < 0 )
                throw new ApiException(400, "Bad Data imputed");

            var bus = await _context.Businesses.FindAsync(nid);
            if (bus == null)
            {
                throw new ApiException(404, "Business with such nid was not found.");
            }
            if (!string.IsNullOrEmpty(request.Name))
            {
                bus.Name = request.Name;
            }
            if (request.OwnerId != null)
            {
                bus.OwnerId = (long)request.OwnerId;
            }
            if (request.Type != null)
            {
                bus.Type = (long)request.Type;
            }
            if (request.WorkStart != null)
            {
                bus.WorkStart = (DateTime)request.WorkStart;
            }
            if (request.WorkEnd != null)
            {
                bus.WorkEnd = (DateTime)request.WorkEnd;
            }
            bus.Address = request.Address;
            bus.Phone = request.Phone;
            bus.Email = request.Email;
            _context.Businesses.Update(bus);
            await Helper.SaveChangesOrThrowAsync(_context, "Internal server error", expectChanges:false);
        }
        public async Task DeleteBusiness(long nid)
        {
            var bus = await _context.Businesses.FindAsync(nid);
            if (bus == null)
            {
                throw new ApiException(404, "Business with such mid was not found");
            }
            _context.Businesses.Remove(bus);
            await Helper.SaveChangesOrThrowAsync(_context, "Internal server error", expectChanges:true);
        }
    }
}