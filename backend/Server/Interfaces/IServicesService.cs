using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.Service;

namespace backend.Server.Interfaces
{
    public interface IServicesService
    {
        Task<List<Service>> GetServicesByBusinessId(ServiceGetAllDTO request);
        Task<Service> GetServiceByNidAsync(long nid);
        Task<Service> CreateServiceAsync(ServiceCreateDTO request);
        Task UpdateServiceAsync(ServiceUpdateDTO request, long nid);
        Task DeleteServiceAsync(long nid);
    }
}