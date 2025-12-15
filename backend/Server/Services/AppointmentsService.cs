using backend.Server.Database;
using backend.Server.Exceptions;
using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.Appointment;
using backend.Server._helpers;
using Microsoft.EntityFrameworkCore;

namespace backend.Server.Services
{
    public class AppointmentsService(ApplicationDbContext context) : IAppointmentsService
    {
        private readonly ApplicationDbContext _context = context;

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

        public Task<List<Appointment>> TrimAppointmentsByEmployeeIdAsync(List<Appointment> appointments, long employeeId)
        {
            if (employeeId <= 0)
            {
                throw new ApiException(400, "Employee ID must be a positive number");
            }

            var filtered = appointments.Where(a => a.EmployeeId == employeeId).ToList();
            
            return Task.FromResult(filtered);
        }

        public Task<List<Appointment>> TrimAppointmentsByDateAsync(List<Appointment> appointments, DateTime date)
        {
            if (date == default)
            {
                throw new ApiException(400, "Invalid date provided");
            }

            var filtered = appointments.Where(a => a.AppointmentDate.Date == date.Date).ToList();

            return Task.FromResult(filtered);
        }

        public async Task<Appointment> CreateAppointmentAsync(AppointmentCreateDTO request)
        {
            if (await _context.Appointment.AnyAsync(a => a.Code == request.Code))
            {
                throw new ApiException(409, $"Appointment with the code {request.Code} already exists");
            }
            var bus = await _context.Businesses.FindAsync(request.BusinessId) ?? throw new ApiException(404, $"Business not found");
            if (request.AppointmentStart.TimeOfDay < bus.WorkStart.TimeOfDay)
                throw new ApiException(400, $"Appointment cannot start before business starts work");
            if (request.AppointmentEnd.TimeOfDay > bus.WorkEnd.TimeOfDay)
                throw new ApiException(400, $"Appointment cannot extend past working hours");


            var appointment = new Appointment
            {
                Code = request.Code,
                BusinessId = request.BusinessId,
                EmployeeId = request.EmployeeId,
                ServiceId = request.ServiceId,
                AppointmentDate = request.AppointmentDate,
                AppointmentStart = request.AppointmentStart,
                AppointmentEnd = request.AppointmentEnd,
                Total = request.Total,
                StatusId = request.StatusId,
                CustomerCode = request.CustomerCode,
                CustomerName = request.CustomerName,
                CustomerNumber = request.CustomerNumber
            };

            _context.Appointment.Add(appointment);

            await Helper.SaveChangesOrThrowAsync(_context, "Failed to create appointment");

            return appointment;
        }

        public async Task<Appointment> GetAppointmentByNidAsync(long nid)
        {
            if (nid <= 0)
            {
                throw new ApiException(400, "Nid must be a positive number");
            }

            var appointment = await _context.Appointment.FindAsync(nid) ?? throw new ApiException(404, $"Appointment with Nid {nid} not found");
            
            return appointment;
        }

        public async Task UpdateAppointmentAsync(AppointmentUpdateDTO request, long nid)
        {
            if (nid <= 0)
            {
                throw new ApiException(400, "Nid must be a positive number");
            }


            var server = await _context.Users.FindAsync(request.EmployeeId) ?? throw new ApiException(404, $"Such personnel not found");
            var bus = await _context.Businesses.FindAsync(server.BusinessId) ?? throw new ApiException(404, $"Business not found");
            
            if (request.AppointmentStart.HasValue && request.AppointmentStart.Value.TimeOfDay < bus.WorkStart.TimeOfDay)
                throw new ApiException(400, $"Appointment cannot start before business starts work");
            if (request.AppointmentEnd.HasValue && request.AppointmentEnd.Value.TimeOfDay > bus.WorkEnd.TimeOfDay)
                throw new ApiException(400, $"Appointment cannot extend past working hours");

            var appointment = await _context.Appointment.FindAsync(nid) ?? throw new ApiException(404, $"Appointment {nid} not found");

            if (request.EmployeeId.HasValue) appointment.EmployeeId = request.EmployeeId.Value;
            if (request.ServiceId.HasValue) appointment.ServiceId = request.ServiceId.Value;
            if (request.AppointmentDate.HasValue) appointment.AppointmentDate = request.AppointmentDate.Value;
            if (request.AppointmentStart.HasValue) appointment.AppointmentStart = request.AppointmentStart.Value;
            if (request.AppointmentEnd.HasValue) appointment.AppointmentEnd = request.AppointmentEnd.Value;
            if (request.Total.HasValue) appointment.Total = request.Total.Value;
            if (request.StatusId.HasValue) appointment.StatusId = request.StatusId.Value;
            if (request.CustomerCode != null) appointment.CustomerCode = request.CustomerCode;
            if (request.CustomerName != null) appointment.CustomerName = request.CustomerName;
            if (request.CustomerNumber != null) appointment.CustomerNumber = request.CustomerNumber;

            _context.Appointment.Update(appointment);
            
            await Helper.SaveChangesOrThrowAsync(_context, "Failed to update appointment", expectChanges: false);
        }

        public async Task DeleteAppointmentAsync(long nid)
        {
            var appointment = await _context.Appointment.FindAsync(nid) ?? throw new ApiException(404, $"Appointment {nid} not found");

            _context.Appointment.Remove(appointment);

            await Helper.SaveChangesOrThrowAsync(_context, "Failed to delete appointment");
        }
    }
}