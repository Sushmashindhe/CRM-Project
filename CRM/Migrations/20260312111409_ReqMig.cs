using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRM.Migrations
{
    /// <inheritdoc />
    public partial class ReqMig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomerEmail",
                table: "CustomerRequirements");

            migrationBuilder.DropColumn(
                name: "CustomerName",
                table: "CustomerRequirements");

            migrationBuilder.AddColumn<int>(
                name: "CustomerId",
                table: "CustomerRequirements",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomerId",
                table: "CustomerRequirements");

            migrationBuilder.AddColumn<string>(
                name: "CustomerEmail",
                table: "CustomerRequirements",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CustomerName",
                table: "CustomerRequirements",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
