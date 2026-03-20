using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRM.Migrations
{
    /// <inheritdoc />
    public partial class AddEmployeeAssignment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EmployeeId",
                table: "CustomerRequirements",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsAssigned",
                table: "CustomerRequirements",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmployeeId",
                table: "CustomerRequirements");

            migrationBuilder.DropColumn(
                name: "IsAssigned",
                table: "CustomerRequirements");
        }
    }
}
