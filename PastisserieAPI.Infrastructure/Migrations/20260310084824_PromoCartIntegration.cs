using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PastisserieAPI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PromoCartIntegration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CodigoPromocional",
                table: "Promociones");

            migrationBuilder.AddColumn<int>(
                name: "Stock",
                table: "Promociones",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PrecioOriginal",
                table: "PedidoItems",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PromocionId",
                table: "PedidoItems",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PrecioOriginal",
                table: "CarritoItems",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PromocionId",
                table: "CarritoItems",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PedidoItems_PromocionId",
                table: "PedidoItems",
                column: "PromocionId");

            migrationBuilder.CreateIndex(
                name: "IX_CarritoItems_PromocionId",
                table: "CarritoItems",
                column: "PromocionId");

            migrationBuilder.AddForeignKey(
                name: "FK_CarritoItems_Promociones_PromocionId",
                table: "CarritoItems",
                column: "PromocionId",
                principalTable: "Promociones",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PedidoItems_Promociones_PromocionId",
                table: "PedidoItems",
                column: "PromocionId",
                principalTable: "Promociones",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CarritoItems_Promociones_PromocionId",
                table: "CarritoItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PedidoItems_Promociones_PromocionId",
                table: "PedidoItems");

            migrationBuilder.DropIndex(
                name: "IX_PedidoItems_PromocionId",
                table: "PedidoItems");

            migrationBuilder.DropIndex(
                name: "IX_CarritoItems_PromocionId",
                table: "CarritoItems");

            migrationBuilder.DropColumn(
                name: "Stock",
                table: "Promociones");

            migrationBuilder.DropColumn(
                name: "PrecioOriginal",
                table: "PedidoItems");

            migrationBuilder.DropColumn(
                name: "PromocionId",
                table: "PedidoItems");

            migrationBuilder.DropColumn(
                name: "PrecioOriginal",
                table: "CarritoItems");

            migrationBuilder.DropColumn(
                name: "PromocionId",
                table: "CarritoItems");

            migrationBuilder.AddColumn<string>(
                name: "CodigoPromocional",
                table: "Promociones",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }
    }
}
