using System.ComponentModel.DataAnnotations;

namespace backend.Server.Models.DatabaseObjects;
public class Business
{
    [Key]
    public long Nid { get; set; }
    public string Name { get; set; }
    // This is business type id
    public long Type { get; set; }
    public long OwnerId { get; set; }
    public string Address { get; set; }
    public string Phone { get; set; }
    public string Email { get; set; }

    //public BusinessTypeName BusinessType { get; set; }
}