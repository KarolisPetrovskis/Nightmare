using System;

namespace backend.Server.Exceptions
{
    public class ApiException : Exception
    {
        public int StatusCode { get; }
        public object? Errors { get; }

        public ApiException(int statusCode, string message, object? errors = null) : base(message)
        {
            StatusCode = statusCode;
            Errors = errors;
        }
    }
}
