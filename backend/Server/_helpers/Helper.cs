using backend.Server.Database;
using backend.Server.Exceptions;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace backend.Server._helpers
{
    public class Helper
    {
        public static async Task SaveChangesOrThrowAsync(ApplicationDbContext context, string errorMessage)
        {
            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                // Check for PostgreSQL-specific constraint violations
                if (ex.InnerException is PostgresException pgEx)
                {
                    // 23505: unique_violation, 23503: foreign_key_violation
                    if (pgEx.SqlState == "23505" || pgEx.SqlState == "23503")
                    {
                        throw new ApiException(409, errorMessage, pgEx.MessageText);
                    }
                }
                
                // For other database errors (concurrency, connection issues, etc.)
                throw new ApiException(500, errorMessage, ex.Message);
            }
        }
    }
}