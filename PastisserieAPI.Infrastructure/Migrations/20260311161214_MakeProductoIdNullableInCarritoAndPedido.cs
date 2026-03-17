using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PastisserieAPI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MakeProductoIdNullableInCarritoAndPedido : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CarritoItems_Productos_ProductoId",
                table: "CarritoItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PedidoItems_Productos_ProductoId",
                table: "PedidoItems");

            migrationBuilder.AlterColumn<int>(
                name: "ProductoId",
                table: "PedidoItems",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "ProductoId",
                table: "CarritoItems",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_CarritoItems_Productos_ProductoId",
                table: "CarritoItems",
                column: "ProductoId",
                principalTable: "Productos",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PedidoItems_Productos_ProductoId",
                table: "PedidoItems",
                column: "ProductoId",
                principalTable: "Productos",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CarritoItems_Productos_ProductoId",
                table: "CarritoItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PedidoItems_Productos_ProductoId",
                table: "PedidoItems");

            migrationBuilder.AlterColumn<int>(
                name: "ProductoId",
                table: "PedidoItems",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ProductoId",
                table: "CarritoItems",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_CarritoItems_Productos_ProductoId",
                table: "CarritoItems",
                column: "ProductoId",
                principalTable: "Productos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PedidoItems_Productos_ProductoId",
                table: "PedidoItems",
                column: "ProductoId",
                principalTable: "Productos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
