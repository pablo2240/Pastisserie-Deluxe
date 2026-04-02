using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PastisserieAPI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStockIlimitadoToProducto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "StockIlimitado",
                table: "Productos",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StockIlimitado",
                table: "Productos");
        }
    }
}
