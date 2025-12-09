using backend.Server.Database;
using backend.Server.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace backend.Server._helpers
{
    public class Helper
    {
        public async Task SaveChangesOrThrowAsync(ApplicationDbContext context, string errorMessage)
            {
                var result = await context.SaveChangesAsync();
                if (result <= 0)
                {
                    throw new ApiException(500, errorMessage);
                }
            }
    }
}