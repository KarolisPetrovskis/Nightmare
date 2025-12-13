using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.Appointment;

namespace backend.Server.Interfaces
{
    public interface IAppointmentsService
    {
        Task<List<Appointment>> GetAllAppointmentsAsync(int page, int perPage);
        Task<List<Appointment>> TrimAppointmentsByEmployeeIdAsync(List<Appointment> appointments, long employeeId);
        Task<List<Appointment>> TrimAppointmentsByDateAsync(List<Appointment> appointments, DateTime date);
        Task<Appointment> CreateAppointmentAsync(AppointmentCreateDTO request);
        Task<Appointment> GetAppointmentByNidAsync(long nid);
        Task UpdateAppointmentAsync(AppointmentUpdateDTO request, long nid);
        Task DeleteAppointmentAsync(long nid);
    }
}