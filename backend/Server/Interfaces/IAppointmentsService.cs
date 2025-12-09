using backend.Server.Models.DatabaseObjects;

namespace backend.Server.Interfaces
{
    public interface IAppointmentsService
    {
        Task<List<Appointment>> GetAllAppointmentsAsync(int page, int perPage);
        Task<List<Appointment>> TrimAppointmentsByEmployeeIdAsync(List<Appointment> appointments, long employeeId);
        Task<List<Appointment>> TrimAppointmentsByDateAsync(List<Appointment> appointments, DateTime date);
        Task CreateAppointmentAsync(Appointment appointment);
        Task<Appointment> GetAppointmentByNidAsync(long nid);
        Task UpdateAppointmentAsync(Appointment appointment);
        Task DeleteAppointmentAsync(long nid);
    }
}