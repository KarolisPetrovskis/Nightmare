using System;

namespace backend.Server.Exceptions
{
    public class ApiException : Exception
    {
        public int StatusCode { get; }
        public object? Errors { get; }

        public ApiException(int statusCode, string message, object? errors = null) : base(message)
        {
            if (statusCode < 100 || statusCode > 599)
            {
                throw new ArgumentOutOfRangeException(nameof(statusCode), "Status code must be a valid HTTP status code (100-599).");
            }
            StatusCode = statusCode;
            Errors = errors;
        }
    }
}
