using backend.Server.Models.DatabaseObjects;
using Microsoft.EntityFrameworkCore;

namespace backend.Server.Database
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Appointment> Appointment { get; set; }
        public DbSet<Business> Businesses { get; set; }
        public DbSet<BusinessTypeName> BusinessTypeNames { get; set; }
        public DbSet<GiftCard> GiftCard { get; set; }
        public DbSet<MenuItem> MenuItems { get; set; }
        public DbSet<MenuItemIngredient> MenuItemIngredients { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<OrderDetailAddOn> OrderDetailAddOns { get; set; }
        public DbSet<Plan> Plans { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<Status> Status { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserType> UserTypes { get; set; }
        public DbSet<Vat> Vats { get; set; }
    }
}
