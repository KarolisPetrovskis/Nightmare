using backend.Server.Interfaces;
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
        public IActionResult GetAppointments([FromBody] AppointmentGetAllDTO request)
        {
            _appointmentsService.placeholderMethod();
            return Ok("Appointments fetched successfully.");
        }

        [HttpPost]
        public IActionResult CreateAppointment([FromBody] AppointmentCreateDTO request)
        {
            _appointmentsService.placeholderMethod();
            return Ok("Appointment created successfully.");
        }

        [HttpGet("{nid}")]
        public IActionResult GetAppointmentBynId(long nid)
        {
            _appointmentsService.placeholderMethod();
            return Ok($"Appointment {nid} fetched successfully.");
        }

        [HttpPut("{nid}")]
        public IActionResult UpdateAppointment([FromBody] AppointmentUpdateDTO request, long nid)
        {
            _appointmentsService.placeholderMethod();
            return Ok($"Appointment {nid} updated successfully.");
        }

        [HttpDelete("{nid}")]
        public IActionResult DeleteAppointment(long nid)
        {
            _appointmentsService.placeholderMethod();
            return Ok($"Appointment {nid} deleted successfully.");
        }
    }
}