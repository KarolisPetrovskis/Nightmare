namespace backend.Server.Models.Enums;

public enum OrderStatus
{
    Paid = 1,
    Refunded = 2,
    PartiallyRefunded = 3,
    InProgress = 4,
    Cancelled = 5
}
