using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.Business;

namespace backend.Server.Interfaces
{
    public interface IBusinessService
    {
        Task<List<Business>> GetAllBusinesses();
        Task<List<Business>> RetrieveAllBusinessbyOwnerNid(BusinessGetAllByOwnerNidDTO request);
        public Task<Business> GetBusinessByNid(long nid);
        public Task<Business> CreateBusiness(BusinessCreateDTO request);
        public Task UpdateBussiness(BusinessUpdateDTO request, long nid);
        public Task DeleteBusiness(long nid);

    }
}