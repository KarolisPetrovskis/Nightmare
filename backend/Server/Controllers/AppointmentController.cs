using backend.Server.Interfaces;
using backend.Server.Models.DatabaseObjects;
using backend.Server.Models.DTOs.Appointment;
using Microsoft.AspNetCore.Mvc;

namespace backend.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentController(IAppointmentsService appointmentsService) : ControllerBase
    {
        private readonly IAppointmentsService _appointmentsService = appointmentsService;

        [HttpGet]
        public async Task<ActionResult<List<Appointment>>> GetAllAppointments([FromQuery] AppointmentGetAllDTO request)
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
        public async Task<ActionResult<Appointment>> CreateAppointment([FromBody] AppointmentCreateDTO request)
        {
            var appointment = await _appointmentsService.CreateAppointmentAsync(request);

            return CreatedAtAction(nameof(GetAppointmentBynId), new { nid = appointment.Nid }, appointment);
        }

        [HttpGet("{nid}")]
        public async Task<ActionResult<Appointment>> GetAppointmentBynId(long nid)
        {
            var appointment = await _appointmentsService.GetAppointmentByNidAsync(nid);

            return Ok(appointment);
        }

        [HttpPut("{nid}")]
        public async Task<IActionResult> UpdateAppointment(long nid, [FromBody] AppointmentUpdateDTO request)
        {
            await _appointmentsService.UpdateAppointmentAsync(request, nid);

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