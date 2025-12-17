using System.ComponentModel.DataAnnotations;
using backend.Server.Models.Enums;

namespace backend.Server.Models.DatabaseObjects;

public class Payment
{
    [Key]
    public long Nid { get; set; }
    
    public long OrderId { get; set; }
    
    public decimal Amount { get; set; }
    
    [StringLength(3)]
    public string Currency { get; set; } = "EUR";
    
    public PaymentMethod PaymentMethod { get; set; }
    
    public PaymentStatus Status { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime? ProcessedAt { get; set; }
    
    [StringLength(100)]
    public string? TransactionId { get; set; }
    
    [StringLength(100)]
    public string? CustomerEmail { get; set; }
    
    [StringLength(500)]
    public string? ErrorMessage { get; set; }
}
