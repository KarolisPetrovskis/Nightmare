using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DatabaseObjects;
public class BusinessTypeName
{
    [Key]
    public long Nid { get; set; }
    public string Name { get; set; }
}