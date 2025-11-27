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

        [HttpGet("{id}")]
        public IActionResult GetAppointmentById(long id)
        {
            _appointmentsService.placeholderMethod();
            return Ok($"Appointment {id} fetched successfully.");
        }

        [HttpPut("{id}")]
        public IActionResult UpdateAppointment([FromBody] AppointmentUpdateDTO request, long id)
        {
            _appointmentsService.placeholderMethod();
            return Ok($"Appointment {id} updated successfully.");
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteAppointment(long id)
        {
            _appointmentsService.placeholderMethod();
            return Ok($"Appointment {id} deleted successfully.");
        }
    }
}