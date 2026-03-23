using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRM.Migrations
{
    /// <inheritdoc />
    public partial class updatesmanager : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_ProjectUpdates_EmployeeId",
                table: "ProjectUpdates",
                column: "EmployeeId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProjectUpdates_Employees_EmployeeId",
                table: "ProjectUpdates",
                column: "EmployeeId",
                principalTable: "Employees",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProjectUpdates_Employees_EmployeeId",
                table: "ProjectUpdates");

            migrationBuilder.DropIndex(
                name: "IX_ProjectUpdates_EmployeeId",
                table: "ProjectUpdates");
        }
    }
}
