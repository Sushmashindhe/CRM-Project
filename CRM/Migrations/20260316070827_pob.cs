using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRM.Migrations
{
    /// <inheritdoc />
    public partial class pob : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PlaceOfBirth",
                table: "Employees",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PlaceOfBirth",
                table: "Employees");
        }
    }
}
