using backend.Server.Database;
using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.VAT;
using backend.Server.Models.Helpers;
using Microsoft.EntityFrameworkCore;
namespace backend.Services.Services;

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

    public async Task<int> CreateVatRate(VatCreateDTO request)
    {
        if (request.Percentage < 0 || request.Percentage > 100 || string.IsNullOrWhiteSpace(request.Name))
            return 400; // Bad Request
        
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

        if (rowsAffected > 0)
        {
            return 201; // Created
        }
        else
        {
            return 500; // Internal Server Error
        }
    }

    public async Task<int> UpdateVatRate(VatUpdateDTO request, long nid)
    {
        if (request.Percentage < 0 || request.Percentage > 100 || string.IsNullOrWhiteSpace(request.Name))
            return 400; // Bad Request

        var vat = await _context.Vats.Where(v => v.Nid == nid).FirstOrDefaultAsync();

        if (vat == null)
        {
            return 404; // Not found
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

        if (rowsAffected > 0)
        {
            return 201; // Created
        }
        else
        {
            return 500; // Internal Server Error
        }

    }

    public async Task<Vat?> GetVatRateByNid(long nid)
    {   
        return await _context.Vats.Where(v => v.Nid == nid).FirstOrDefaultAsync();
    }

    public async Task<int> DeleteVatRate(long nid)
    {
        var vat = await _context.Vats.FindAsync(nid);
        if (vat == null) return 204;

        _context.Vats.Remove(vat);
        await _context.SaveChangesAsync();

        return 204; // No Content
    }

}