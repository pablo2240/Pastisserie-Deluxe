using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PastisserieAPI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBusinessRulesFieldsToConfiguracionTienda : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CompraMinima",
                table: "ConfiguracionTienda",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<bool>(
                name: "LimitarUnidadesPorProducto",
                table: "ConfiguracionTienda",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MaxUnidadesPorProducto",
                table: "ConfiguracionTienda",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompraMinima",
                table: "ConfiguracionTienda");

            migrationBuilder.DropColumn(
                name: "LimitarUnidadesPorProducto",
                table: "ConfiguracionTienda");

            migrationBuilder.DropColumn(
                name: "MaxUnidadesPorProducto",
                table: "ConfiguracionTienda");
        }
    }
}
