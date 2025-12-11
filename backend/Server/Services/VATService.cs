using backend.Server.Database;
using backend.Server.Exceptions;
using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.VAT;
using backend.Server.Models.Helpers;
using Microsoft.EntityFrameworkCore;
namespace backend.Server.Services;

public class VatService : IVatService
{
    private readonly ApplicationDbContext _context;

    public VatService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AllItems<Vat>> GetVatRates(VatGetAllDTO request)
    {
        return new AllItems<Vat>
        {
            List = await _context.Vats.ToListAsync(),
            Page = request.Page,
            PerPage = request.PerPage
        };
    }

    public async Task CreateVatRate(VatCreateDTO request)
    {
        if (request.Percentage < 0 || request.Percentage > 100 || string.IsNullOrWhiteSpace(request.Name))
            throw new ApiException(400, "Bad Data imputed");
        
        var largestId = await _context.Vats
            .MaxAsync(v => (long?)v.Nid) ?? 0;
        
        var currentDateTime = DateTime.UtcNow;
        
        Vat vat = new Vat
        {
            Nid = largestId + 1,
            Name = request.Name,
            Percentage = request.Percentage,
            DateCreated = currentDateTime
        };

        _context.Vats.Add(vat);
        int rowsAffected = await _context.SaveChangesAsync();

        if (!(rowsAffected > 0))
        {
            throw new ApiException(500, "Internal server error");
        }
    }

    public async Task UpdateVatRate(VatUpdateDTO request, long nid)
    {
        if (request.Percentage < 0 || request.Percentage > 100 || string.IsNullOrWhiteSpace(request.Name))
            throw new ApiException(400, "Bad Data imputed");

        var vat = await _context.Vats.Where(v => v.Nid == nid).FirstOrDefaultAsync();

        if (vat == null)
        {
            throw new ApiException(404, "Vat cannot be null");
        }  

        if (!string.IsNullOrEmpty(request.Name))
        {
            vat.Name = request.Name;
        }
        if (request.Percentage != 0)
        {
            // make it nullable as we cant set it to 0 otherwise and see when is intended and when its a defualt response
            // if afteter pr its decimal change VatUpdateDTO to float
            vat.Percentage = (float) request.Percentage;
        }
        int rowsAffected = await _context.SaveChangesAsync();

        if (!(rowsAffected > 0))
        {
            throw new ApiException(500, "Internal server error");
        }

    }

    public async Task<Vat?> GetVatRateByNid(long nid)
    {   
        return await _context.Vats.Where(v => v.Nid == nid).FirstOrDefaultAsync();
    }

    public async Task DeleteVatRate(long nid)
    {
        var vat = await _context.Vats.FindAsync(nid);
        if (vat == null)
        {
            throw new ApiException(404, "Vat rate not found");
        }
        _context.Vats.Remove(vat);
        await _context.SaveChangesAsync();
    }

}