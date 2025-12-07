using System.Net;
using backend.Server.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace backend.Server.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task Invoke(HttpContext httpContext)
        {
            try
            {
                await _next(httpContext);
            }
            catch (ApiException ex)
            {
                _logger.LogWarning(ex, "Handled ApiException");
                httpContext.Response.ContentType = "application/problem+json";
                httpContext.Response.StatusCode = ex.StatusCode;
                var problem = new ProblemDetails
                {
                    Title = ex.Message,
                    Status = ex.StatusCode,
                    Detail = ex.Errors?.ToString()
                };
                await httpContext.Response.WriteAsJsonAsync(problem);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception");
                httpContext.Response.ContentType = "application/problem+json";
                httpContext.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                var problem = new ProblemDetails
                {
                    Title = "An unexpected error occurred",
                    Status = (int)HttpStatusCode.InternalServerError
                };
                await httpContext.Response.WriteAsJsonAsync(problem);
            }
        }
    }
}
