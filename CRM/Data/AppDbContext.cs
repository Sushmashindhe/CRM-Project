using Microsoft.EntityFrameworkCore;
using CRM.Models;

namespace CRM.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Managers> Managers { get; set; }

        public DbSet<Employees> Employees { get; set; }

        public DbSet<CustomerRequirement> CustomerRequirements { get; set; }

        public DbSet<Customers> Customers { get; set; }

        public DbSet<ProjectUpdate> ProjectUpdates { get; set; }

    }
}