using System.Net;
using backend.Server.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace backend.Server.Middleware
{
    public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        private readonly RequestDelegate _next = next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger = logger;

        public async Task Invoke(HttpContext httpContext)
        {
            try
            {
                await _next(httpContext);
            }
            catch (ApiException ex)
            {
                _logger.LogWarning(ex, "Handled ApiException");
                if (!httpContext.Response.HasStarted)
                {
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
                else
                {
                    _logger.LogWarning("The response has already started, the error handling middleware will not modify the response.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception");
                if (!httpContext.Response.HasStarted)
                {
                    httpContext.Response.ContentType = "application/problem+json";
                    httpContext.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    var problem = new ProblemDetails
                    {
                        Title = "An unexpected error occurred",
                        Status = (int)HttpStatusCode.InternalServerError
                    };
                    await httpContext.Response.WriteAsJsonAsync(problem);
                }
                else
                {
                    _logger.LogError("The response has already started, the error handling middleware will not modify the response.");
                }
            }
        }
    }
}
