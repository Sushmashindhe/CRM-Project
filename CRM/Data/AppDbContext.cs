using Microsoft.EntityFrameworkCore;
using CRM.Models;

namespace CRM.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Employees> Employees { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Employees>().HasData(
                new Employees { Id = 1, Name = "Virat",Email="virat@gmail.com", Phone="+91 12222222"},
                new Employees { Id = 2, Name = "Rohit",Email="rohit@gmail.com", Phone="+91 66666666"}
            );
        }
    }
}