using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DatabaseObjects;
public class Vat
{
    [Key]
    public long Nid { get; set; }
    public required string Name { get; set; }
    public float? Percentage { get; set; }
    public DateTime DateCreated { get; set; }
}