using backend.Server.Interfaces;
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
    }
}