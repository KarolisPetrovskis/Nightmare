using backend.Server._helpers;
using backend.Server.Database;
using backend.Server.Exceptions;
using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.Service;
using Microsoft.EntityFrameworkCore;

namespace backend.Server.Services
{
    public class ServicesService(ApplicationDbContext context) : IServicesService
    {
        private readonly ApplicationDbContext _context = context;

        public async Task CreateServiceAsync(Service service)
            {
            if (await _context.Services.AnyAsync(s => s.Name == service.Name && s.BusinessId == service.BusinessId))
                {
                throw new ApiException(409, $"Service with Name: \"{service.Name}\" already exists.");
                }

            _context.Services.Add(service);

            await Helper.SaveChangesOrThrowAsync(_context, "Failed to create service.");
            }

        public async Task DeleteServiceAsync(long serviceId)
        {
            var service = await _context.Services.FindAsync(serviceId) ?? throw new ApiException(404, $"Service with id: \"{serviceId}\" not found.");
            _context.Services.Remove(service);

            await Helper.SaveChangesOrThrowAsync(_context, "Failed to delete service.");
        }

        public async Task<Service> GetServiceByNid(long serviceId)
        {
            if (serviceId <= 0)
            {
                throw new ApiException(400, "Nid must be a positive number");
            }

            var service = await _context.Services
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Nid == serviceId) ?? throw new ApiException(404, $"Appointment with Nid {serviceId} not found");

            return service;
        }

        public async Task<List<Service>> GetServicesByBusinessId(long businessId, int page, int perPage)
        {
            if (businessId < 0)
            {
                throw new ApiException(400, "BusinessId must be a positive number");
            }
            if (page < 0)
            {
                throw new ApiException(400, "Page number must be greater than or equal to zero");
            }
            if (perPage <= 0)
            {
                throw new ApiException(400, "PerPage value must be greater than or equal to zero");
            }

            if (page == 0)
            {
                return await _context.Services
                    .Where(s => s.BusinessId == businessId)
                    .AsNoTracking()
                    .ToListAsync();
            }

            return await _context.Services
                .Where(s => s.BusinessId == businessId)
                .AsNoTracking()
                .Skip((page - 1) * perPage)
                .Take(perPage)
                .ToListAsync();
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
    }
}