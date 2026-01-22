using Microsoft.EntityFrameworkCore;
using DeliveryAPI.Models;

namespace DeliveryAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Delivery> Deliveries { get; set; }
        public DbSet<DeliveryItem> DeliveryItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure decimal precision for Price
            modelBuilder.Entity<DeliveryItem>()
                .Property(di => di.Price)
                .HasColumnType("decimal(18,2)");

            // Configure User-Delivery relationship
            modelBuilder.Entity<Delivery>()
                .HasOne(d => d.AssignedDriver)
                .WithMany(u => u.Deliveries)
                .HasForeignKey(d => d.AssignedDriverId)
                .OnDelete(DeleteBehavior.SetNull);

            // Configure Delivery-DeliveryItem relationship
            modelBuilder.Entity<DeliveryItem>()
                .HasOne(di => di.Delivery)
                .WithMany(d => d.Items)
                .HasForeignKey(di => di.DeliveryId)
                .OnDelete(DeleteBehavior.Cascade);

            // Seed data
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Seed Users
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Username = "admin",
                    Email = "admin@delivery.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    Role = "Admin",
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = 2,
                    Username = "driver1",
                    Email = "driver1@delivery.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("driver123"),
                    Role = "Driver",
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = 3,
                    Username = "driver2",
                    Email = "driver2@delivery.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("driver123"),
                    Role = "Driver",
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = 4,
                    Username = "manager1",
                    Email = "manager1@delivery.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("manager123"),
                    Role = "Manager",
                    CreatedAt = DateTime.UtcNow
                }
            );

            // Seed Deliveries
            modelBuilder.Entity<Delivery>().HasData(
                new Delivery
                {
                    Id = 1,
                    OrderNumber = "ORD-001",
                    CustomerName = "Jan Kowalski",
                    DeliveryAddress = "ul. Warszawska 15, Warszawa",
                    Status = "Pending",
                    AssignedDriverId = 2,
                    CreatedAt = DateTime.UtcNow
                },
                new Delivery
                {
                    Id = 2,
                    OrderNumber = "ORD-002",
                    CustomerName = "Anna Nowak",
                    DeliveryAddress = "ul. Krakowska 22, Kraków",
                    Status = "Pending",
                    AssignedDriverId = 2,
                    CreatedAt = DateTime.UtcNow
                },
                new Delivery
                {
                    Id = 3,
                    OrderNumber = "ORD-003",
                    CustomerName = "Piotr Wiśniewski",
                    DeliveryAddress = "ul. Gdańska 8, Gdańsk",
                    Status = "Pending",
                    AssignedDriverId = 2,
                    CreatedAt = DateTime.UtcNow
                }
            );

            // Seed DeliveryItems
            modelBuilder.Entity<DeliveryItem>().HasData(
                // Items for Delivery 1
                new DeliveryItem { Id = 1, DeliveryId = 1, ProductName = "Pizza Margherita", Quantity = 2, Price = 25.99m, IsDelivered = false },
                new DeliveryItem { Id = 2, DeliveryId = 1, ProductName = "Coca Cola 0.5L", Quantity = 2, Price = 5.99m, IsDelivered = false },
                
                // Items for Delivery 2
                new DeliveryItem { Id = 3, DeliveryId = 2, ProductName = "Burger Wołowy", Quantity = 1, Price = 18.99m, IsDelivered = false },
                new DeliveryItem { Id = 4, DeliveryId = 2, ProductName = "Frytki duże", Quantity = 1, Price = 8.99m, IsDelivered = false },
                new DeliveryItem { Id = 5, DeliveryId = 2, ProductName = "Sprite 0.5L", Quantity = 1, Price = 5.99m, IsDelivered = false },
                
                // Items for Delivery 3
                new DeliveryItem { Id = 6, DeliveryId = 3, ProductName = "Sushi Set", Quantity = 1, Price = 45.99m, IsDelivered = false },
                new DeliveryItem { Id = 7, DeliveryId = 3, ProductName = "Woda mineralna 0.5L", Quantity = 2, Price = 3.99m, IsDelivered = false }
            );
        }
    }
}
