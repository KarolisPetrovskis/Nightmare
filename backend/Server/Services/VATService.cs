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

        if (request.Page < 0)
            {
                throw new ApiException(400, "Page number must be greater than zero");
            }
            if (request.PerPage <= 0)
            {
                throw new ApiException(400, "PerPage value must be greater than zero");
            }
            AllItems<Vat> list = new AllItems<Vat>();
            if (request.Page == 0)
            {
                list.List = await _context.Vats.ToListAsync();
                list.Page = request.Page;
                list.PerPage = request.PerPage;
                return list;
            }
            list.List = await _context.Vats
                .Skip((request.Page - 1) * request.PerPage)
                .Take(request.PerPage)
                .AsNoTracking()
                .ToListAsync();
            list.Page = request.Page;
            list.PerPage = request.PerPage;
            return list;
    }

    public async Task<Vat> CreateVatRate(VatCreateDTO request)
    {
        if (request.Percentage < 0 || request.Percentage > 100 || string.IsNullOrWhiteSpace(request.Name))
            throw new ApiException(400, "Bad Data imputed");

        if (request.Percentage == 0)
            request.Percentage = null;
        var currentDateTime = DateTime.UtcNow;
        
        Vat vat = new Vat
        {
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
        return vat;
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
        if (request.Percentage == 0)
        {
            vat.Percentage = null;
        }
        if (request.Percentage != 0)
        {
            vat.Percentage = request.Percentage;
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