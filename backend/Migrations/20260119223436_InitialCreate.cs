using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace DeliveryAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Deliveries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CustomerName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DeliveryAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AssignedDriverId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Deliveries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Deliveries_Users_AssignedDriverId",
                        column: x => x.AssignedDriverId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "DeliveryItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsDelivered = table.Column<bool>(type: "bit", nullable: false),
                    DeliveryId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeliveryItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeliveryItems_Deliveries_DeliveryId",
                        column: x => x.DeliveryId,
                        principalTable: "Deliveries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "PasswordHash", "Role", "Username" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 19, 22, 34, 35, 250, DateTimeKind.Utc).AddTicks(577), "admin@delivery.com", "$2a$11$xphDl.Rp0y3k6wX1YAq.ZeTvaL.zk1CJtEBshpF.AgDdryKMQChcK", "Admin", "admin" },
                    { 2, new DateTime(2026, 1, 19, 22, 34, 35, 534, DateTimeKind.Utc).AddTicks(6646), "driver1@delivery.com", "$2a$11$ctRme1sjxy/j57rmtPm6MuU3RqrYQcoXTelTGw8d1P5bPkipO.Seu", "Driver", "driver1" }
                });

            migrationBuilder.InsertData(
                table: "Deliveries",
                columns: new[] { "Id", "AssignedDriverId", "CompletedAt", "CreatedAt", "CustomerName", "DeliveryAddress", "OrderNumber", "Status" },
                values: new object[,]
                {
                    { 1, 2, null, new DateTime(2026, 1, 19, 22, 34, 35, 536, DateTimeKind.Utc).AddTicks(3774), "Jan Kowalski", "ul. Warszawska 15, Warszawa", "ORD-001", "Pending" },
                    { 2, 2, null, new DateTime(2026, 1, 19, 22, 34, 35, 536, DateTimeKind.Utc).AddTicks(4199), "Anna Nowak", "ul. Krakowska 22, Kraków", "ORD-002", "Pending" },
                    { 3, 2, null, new DateTime(2026, 1, 19, 22, 34, 35, 536, DateTimeKind.Utc).AddTicks(4203), "Piotr Wiśniewski", "ul. Gdańska 8, Gdańsk", "ORD-003", "Pending" }
                });

            migrationBuilder.InsertData(
                table: "DeliveryItems",
                columns: new[] { "Id", "DeliveryId", "IsDelivered", "Price", "ProductName", "Quantity" },
                values: new object[,]
                {
                    { 1, 1, false, 25.99m, "Pizza Margherita", 2 },
                    { 2, 1, false, 5.99m, "Coca Cola 0.5L", 2 },
                    { 3, 2, false, 18.99m, "Burger Wołowy", 1 },
                    { 4, 2, false, 8.99m, "Frytki duże", 1 },
                    { 5, 2, false, 5.99m, "Sprite 0.5L", 1 },
                    { 6, 3, false, 45.99m, "Sushi Set", 1 },
                    { 7, 3, false, 3.99m, "Woda mineralna 0.5L", 2 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Deliveries_AssignedDriverId",
                table: "Deliveries",
                column: "AssignedDriverId");

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryItems_DeliveryId",
                table: "DeliveryItems",
                column: "DeliveryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DeliveryItems");

            migrationBuilder.DropTable(
                name: "Deliveries");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
