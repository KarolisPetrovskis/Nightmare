using backend.Server.Database;
using backend.Server.Exceptions;
using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
using backend.Server._helpers;
using Microsoft.EntityFrameworkCore;

namespace backend.Server.Services
{
    public class AppointmentsService(ApplicationDbContext context) : IAppointmentsService
    {
        private readonly ApplicationDbContext _context = context;
        private readonly Helper _helper = new();

        public async Task<List<Appointment>> GetAllAppointmentsAsync(int page, int perPage)
        {
            if (page < 0)
            {
                throw new ApiException(400, "Page number must be greater than zero");
            }
            if (perPage <= 0)
            {
                throw new ApiException(400, "PerPage value must be greater than zero");
            }
            if (page == 0)
            {
                return await _context.Appointment
                    .AsNoTracking()
                    .ToListAsync();
            }

            return await _context.Appointment
                .Skip((page - 1) * perPage)
                .Take(perPage)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<List<Appointment>> TrimAppointmentsByEmployeeIdAsync(List<Appointment> appointments, long employeeId)
        {
            if (employeeId <= 0)
            {
                throw new ApiException(400, "Employee ID must be a positive number");
            }

            appointments = [.. appointments.Where(a => a.EmployeeId == employeeId)];

            return appointments;
        }

        public async Task<List<Appointment>> TrimAppointmentsByDateAsync(List<Appointment> appointments, DateTime date)
        {
            if (date == default)
            {
                throw new ApiException(400, "Invalid date provided");
            }

            appointments = [.. appointments.Where(a => a.AppointmentDate.Date == date.Date)];

            return appointments;
        }

        public async Task CreateAppointmentAsync(Appointment appointment)
        {
            if (appointment == null)
            {
                throw new ApiException(400, "Appointment cannot be null");
            }

            if (await _context.Appointment.AnyAsync(a => a.Code == appointment.Code))
            {
                throw new ApiException(409, "Appointment with the same code already exists");
            }

            _context.Appointment.Add(appointment);

            await _helper.SaveChangesOrThrowAsync(_context, "Failed to create appointment");
        }

        public async Task<Appointment> GetAppointmentByNidAsync(long nid)
        {
            if (nid <= 0)
            {
                throw new ApiException(400, "Nid must be a positive number");
            }

            var appointment = await _context.Appointment
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Nid == nid) ?? throw new ApiException(404, $"Appointment with Nid {nid} not found");
            
            return appointment;
        }

        public async Task UpdateAppointmentAsync(Appointment appointment)
        {
            if (appointment == null || appointment.Nid <= 0)
            {
                throw new ApiException(400, "Invalid appointment data");
            }

            _context.Appointment.Update(appointment);
            
            await _helper.SaveChangesOrThrowAsync(_context, "Failed to update appointment");
        }

        public async Task DeleteAppointmentAsync(long nid)
        {
            var appointment = await _context.Appointment.FindAsync(nid) ?? throw new ApiException(404, $"Appointment {nid} not found");

            _context.Appointment.Remove(appointment);

            await _helper.SaveChangesOrThrowAsync(_context, "Failed to delete appointment");
        }
    }
}