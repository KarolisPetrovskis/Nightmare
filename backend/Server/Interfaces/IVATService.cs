using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.VAT;
using backend.Server.Models.Helpers;

namespace backend.Server.Interfaces
{
    public interface IVatService
    {
        Task<AllItems<Vat>> GetVatRates(VatGetAllDTO request);
        Task CreateVatRate(VatCreateDTO request);
        Task UpdateVatRate(VatUpdateDTO request, long nid);
        Task<Vat?> GetVatRateByNid(long nid);
        Task DeleteVatRate(long nid);
    }
}