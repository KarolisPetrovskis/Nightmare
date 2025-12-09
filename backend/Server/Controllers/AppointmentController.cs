using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.Appointment;
using Microsoft.AspNetCore.Mvc;

namespace backend.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentController : ControllerBase
    {
        private readonly IAppointmentsService _appointmentsService;

        public AppointmentController(IAppointmentsService appointmentsService)
        {
            _appointmentsService = appointmentsService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAppointments([FromQuery] AppointmentGetAllDTO request)
        {
            var appointments = await _appointmentsService.GetAllAppointmentsAsync(request.Page, request.PerPage);

            if (request.EmployeeId > 0)
            {
                appointments = await _appointmentsService.TrimAppointmentsByEmployeeIdAsync(appointments, request.EmployeeId);
            } 
            if (request.AppointmentDate.HasValue)
            {
                appointments = await _appointmentsService.TrimAppointmentsByDateAsync(appointments, request.AppointmentDate.Value);
            }

            return Ok(appointments);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAppointment([FromBody] AppointmentCreateDTO request)
        {
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

            await _appointmentsService.CreateAppointmentAsync(appointment);

            return CreatedAtAction(nameof(GetAppointmentBynId), new { nid = appointment.Nid }, appointment);
        }

        [HttpGet("{nid}")]
        public async Task<IActionResult> GetAppointmentBynId(long nid)
        {
            var appointment = await _appointmentsService.GetAppointmentByNidAsync(nid);
            return Ok(appointment);
        }

        [HttpPut("{nid}")]
        public async Task<IActionResult> UpdateAppointment(long nid, [FromBody] AppointmentUpdateDTO request)
        {
            var appointment = await _appointmentsService.GetAppointmentByNidAsync(nid);

            // Map only non-null properties from the request
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

            await _appointmentsService.UpdateAppointmentAsync(appointment);

            return NoContent();
        }

        [HttpDelete("{nid}")]
        public async Task<IActionResult> DeleteAppointment(long nid)
        {
            await _appointmentsService.DeleteAppointmentAsync(nid);
            return NoContent();
        }
    }
}