using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.Service;

namespace backend.Server.Interfaces
    {
    public interface IServicesService
        {

        Task<List<Service>> GetServicesByBusinessId(long businessId, int page, int perPage);

        Task CreateServiceAsync(Service service);

        Task UpdateServiceAsync(ServiceUpdateDTO request, long nid);

        Task DeleteServiceAsync(long serviceId);

        Task<Service> GetServiceByNid(long serviceId);
        }
    }       