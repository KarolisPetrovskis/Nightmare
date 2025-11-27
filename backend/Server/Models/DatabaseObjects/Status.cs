using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DatabaseObjects;
public class Statuses
{
    [Key]
    public long Nid { get; set; }
    public string Name { get; set; }
    public int Type { get; set; }
}