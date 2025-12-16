namespace backend.Server.Models.DTOs.Order;

public class OrderItemAddonDTO
{
    public long IngredientId { get; set; }
    public string IngredientName { get; set; } = string.Empty;
    public decimal Price { get; set; }
}

public class OrderItemDetailDTO
{
    public long ItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal BasePrice { get; set; }
    public decimal VatRate { get; set; }
    public decimal VatAmount { get; set; }
    public decimal PriceBeforeDiscount { get; set; }
    public decimal? ItemDiscountPercent { get; set; }
    public decimal? ItemDiscountAmount { get; set; }
    public decimal PricePerItem { get; set; }
    public decimal Subtotal { get; set; }
    public List<OrderItemAddonDTO> Addons { get; set; } = new();
}

public class OrderWithItemsDTO
{
    public long OrderId { get; set; }
    public string? OrderCode { get; set; }
    public DateTime DateCreated { get; set; }
    public decimal Subtotal { get; set; }
    public decimal OrderDiscount { get; set; }
    public decimal Total { get; set; }
    public List<OrderItemDetailDTO> Items { get; set; } = new();
}
