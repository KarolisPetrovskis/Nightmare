using backend.Server._helpers;
using backend.Server.Database;
using backend.Server.Exceptions;
using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.Service;
using Microsoft.EntityFrameworkCore;

namespace backend.Server.Services
{
    public class ServicesService : IServicesService
    {
        readonly ApplicationDbContext _context;
        public ServicesService(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<List<Service>> GetServicesByBusinessId(ServiceGetAllDTO request)
        {

            if (request.Page < 0)
            {
                throw new ApiException(400, "Page number must be greater than or equal to zero");
            }
            if (request.PerPage <= 0)
            {
                throw new ApiException(400, "PerPage value must be greater than zero");
            }

            var query = _context.Services
                .Where(a => a.BusinessId == request.BusinessId)
                .AsNoTracking()
                .ToListAsync();

            if (request.Page == 0)
            {
                return await _context.Services
                    .Where(a => a.BusinessId == request.BusinessId)
                    .AsNoTracking()
                    .ToListAsync();
            }

            return await _context.Services
                .Where(a => a.BusinessId == request.BusinessId)
                .Skip((request.Page - 1) * request.PerPage)
                .Take(request.PerPage)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Service> GetServiceByNidAsync(long nid)
        {
            return await _context.Services
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Nid == nid) ?? throw new ApiException(404, "Service not found");
        }

        public async Task<Service> CreateServiceAsync(ServiceCreateDTO request)
        {
            var service = new Service
            {
                Name = request.Name,
                Price = request.Price,
                Discount = request.Discount,
                VatId = request.VatId,
                DiscountTime = DateTime.UtcNow,
                TimeMin = request.TimeMin,
                BusinessId = request.BusinessId
            };
            _context.Services.Add(service);
            await Helper.SaveChangesOrThrowAsync(_context, "Internal server error");
            return service;
        }

        public async Task UpdateServiceAsync(ServiceUpdateDTO request, long nid)
        {
            var service = await _context.Services.FindAsync(nid) ?? throw new ApiException(404, "Service not found");

            if (!string.IsNullOrEmpty(request.Name))
                service.Name = request.Name;
            if (request.Price >= 0)
                service.Price = request.Price;
            if (request.Discount >= 0 || request.Discount == null)
                service.Discount = request.Discount;
            if (request.VatId >= 0)
                service.VatId = request.VatId;
            if (request.TimeMin > 0)
                service.TimeMin = request.TimeMin;

            _context.Services.Update(service);
            await Helper.SaveChangesOrThrowAsync(_context, "Internal server error", expectChanges:false);
        }

        public async Task DeleteServiceAsync(long nid)
        {
            var service = await _context.Services.FindAsync(nid) ?? throw new ApiException(404, "Service not found");

            _context.Services.Remove(service);
            await Helper.SaveChangesOrThrowAsync(_context, "Internal server error");
        }

    }
}