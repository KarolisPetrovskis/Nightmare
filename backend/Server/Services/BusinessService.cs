using System.Threading.Tasks;
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
            return await _context.Businesses.Where(b => b.OwnerId == request.OwnerId).ToListAsync();    
        }
        public async Task<Business> GetBusinessByNid(long nid)
        {
            return await _context.Businesses.Where(b => b.Nid == nid).FirstOrDefaultAsync();    
        }
        public async Task<Business> CreateBusiness(BusinessCreateDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Name) || request.OwnerId < 0 || request.Type < 0 )
                throw new ApiException(400, "Bad Data imputed");
            
            var  bus = new Business
            {
                Name = request.Name,
                OwnerId = request.OwnerId,
                Type = request.Type,
            };
            bus.Address = request.Address;
            bus.Phone = request.Phone;
            bus.Email = request.Email;
            
            _context.Businesses.Add(bus);

            int rowsAffected = await _context.SaveChangesAsync();

            if (!(rowsAffected > 0))
            {
                throw new ApiException(500, "Internal server error");
            }
            return bus;
        }
        public async Task UpdateBussiness(BusinessUpdateDTO request, long nid)
        {
            if (string.IsNullOrWhiteSpace(request.Name) || request.OwnerId < 0 || request.Type < 0 )
                throw new ApiException(400, "Bad Data imputed");

            var bus = await _context.Businesses.Where(b => b.Nid == nid).FirstOrDefaultAsync();
            if (bus == null)
            {
                throw new ApiException(404, "Business cannot be null");
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
            bus.Address = request.Address;
            bus.Phone = request.Phone;
            bus.Email = request.Email;

            int rowsAffected = await _context.SaveChangesAsync();
            if (!(rowsAffected > 0))
            {
                throw new ApiException(500, "Internal server error");
            }
        }
        public async Task DeleteBusiness(long nid)
        {
            var bus = await _context.Businesses.FindAsync(nid);
            if (bus == null)
            {
                throw new ApiException(404, "Vat rate not found");
            }
            _context.Businesses.Remove(bus);
            await _context.SaveChangesAsync();  
        }
    }
}