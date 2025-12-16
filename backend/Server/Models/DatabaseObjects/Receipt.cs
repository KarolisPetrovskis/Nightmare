using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DatabaseObjects;

public class Receipt
{
    [Key]
    public long Nid { get; set; }
    
    public long OrderId { get; set; }
    
    public long PaymentId { get; set; }
    
    [StringLength(50)]
    public string ReceiptNumber { get; set; } = string.Empty;
    
    public DateTime IssuedAt { get; set; }
    
    public decimal Total { get; set; }
    
    [StringLength(3)]
    public string Currency { get; set; } = "EUR";
    
    [StringLength(500)]
    public string? StripeReceiptUrl { get; set; }
    
    public long BusinessId { get; set; }
}
