using backend.Server.Models.DatabaseObjects;

namespace backend.Server.Interfaces
    {
    public interface IServicesService
        {

        Task<List<Service>> GetServicesAsync(long businessId, int page, int perPage);

        Task CreateServiceAsync(Service service);

        Task UpdateServiceAsync(Service service);

        Task DeleteServiceAsync(long serviceId);

        Task<Service?> GetServiceByNid(long serviceId);
        }
    }