using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DatabaseObjects;
public class Plan
{
    [Key]
    public long Nid { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
}