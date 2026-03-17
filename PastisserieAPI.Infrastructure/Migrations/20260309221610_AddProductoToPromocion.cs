using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PastisserieAPI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProductoToPromocion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProductoId",
                table: "Promociones",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Promociones_ProductoId",
                table: "Promociones",
                column: "ProductoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Promociones_Productos_ProductoId",
                table: "Promociones",
                column: "ProductoId",
                principalTable: "Productos",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Promociones_Productos_ProductoId",
                table: "Promociones");

            migrationBuilder.DropIndex(
                name: "IX_Promociones_ProductoId",
                table: "Promociones");

            migrationBuilder.DropColumn(
                name: "ProductoId",
                table: "Promociones");
        }
    }
}
