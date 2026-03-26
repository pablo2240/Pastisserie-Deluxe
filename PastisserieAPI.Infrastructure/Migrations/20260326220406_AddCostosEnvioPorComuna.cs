using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PastisserieAPI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCostosEnvioPorComuna : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CostosEnvioPorComuna",
                table: "ConfiguracionTienda",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CostosEnvioPorComuna",
                table: "ConfiguracionTienda");
        }
    }
}
