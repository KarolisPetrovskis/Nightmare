using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DTOs.Business;
public class BusinessGetAllByOwnerNidDTO
{
    [Required]
    [Range(1, long.MaxValue, ErrorMessage = "OwnerId must be a positive number")]
    public required long OwnerId { get; set; }
}