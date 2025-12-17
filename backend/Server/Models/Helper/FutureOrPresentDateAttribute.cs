using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.Helper
{
    public class FutureOrPresentDateAttribute : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value == null)
            {
                return ValidationResult.Success; // No time limit set
            }
            if (value is DateTime dateValue)
            {
                if (dateValue == default)
                    return ValidationResult.Success;
                
                if (dateValue.Date < DateTime.Now.Date)
                {
                    return new ValidationResult(ErrorMessage ?? "Date cannot be in the past");
                }
            }
            
            return ValidationResult.Success;
        }
    }
}