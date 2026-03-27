using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PastisserieAPI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveMetodosPagoTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pedidos_MetodosPagoUsuario_MetodoPagoId",
                table: "Pedidos");

            migrationBuilder.DropForeignKey(
                name: "FK_Productos_CategoriasProducto_CategoriaProductoId",
                table: "Productos");

            migrationBuilder.DropTable(
                name: "MetodosPagoUsuario");

            migrationBuilder.DropTable(
                name: "TiposMetodoPago");

            migrationBuilder.DropIndex(
                name: "IX_Productos_Categoria",
                table: "Productos");

            migrationBuilder.DropIndex(
                name: "IX_Pedidos_MetodoPagoId",
                table: "Pedidos");

            migrationBuilder.DropColumn(
                name: "Categoria",
                table: "Productos");

            migrationBuilder.DropColumn(
                name: "MetodoPagoId",
                table: "Pedidos");

            migrationBuilder.AddColumn<string>(
                name: "MetodoPago",
                table: "Pedidos",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_Productos_CategoriasProducto_CategoriaProductoId",
                table: "Productos",
                column: "CategoriaProductoId",
                principalTable: "CategoriasProducto",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Productos_CategoriasProducto_CategoriaProductoId",
                table: "Productos");

            migrationBuilder.DropColumn(
                name: "MetodoPago",
                table: "Pedidos");

            migrationBuilder.AddColumn<string>(
                name: "Categoria",
                table: "Productos",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "MetodoPagoId",
                table: "Pedidos",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "TiposMetodoPago",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposMetodoPago", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MetodosPagoUsuario",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TipoMetodoPagoId = table.Column<int>(type: "int", nullable: false),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    EsPredeterminado = table.Column<bool>(type: "bit", nullable: false),
                    EstaActivo = table.Column<bool>(type: "bit", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaExpiracion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IdentificacionTitular = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    NombreTitular = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    PaymentMethodId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TokenPago = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    UltimosDigitos = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MetodosPagoUsuario", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MetodosPagoUsuario_TiposMetodoPago_TipoMetodoPagoId",
                        column: x => x.TipoMetodoPagoId,
                        principalTable: "TiposMetodoPago",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MetodosPagoUsuario_Users_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Productos_Categoria",
                table: "Productos",
                column: "Categoria");

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_MetodoPagoId",
                table: "Pedidos",
                column: "MetodoPagoId");

            migrationBuilder.CreateIndex(
                name: "IX_MetodosPagoUsuario_TipoMetodoPagoId",
                table: "MetodosPagoUsuario",
                column: "TipoMetodoPagoId");

            migrationBuilder.CreateIndex(
                name: "IX_MetodosPagoUsuario_UsuarioId",
                table: "MetodosPagoUsuario",
                column: "UsuarioId");

            migrationBuilder.AddForeignKey(
                name: "FK_Pedidos_MetodosPagoUsuario_MetodoPagoId",
                table: "Pedidos",
                column: "MetodoPagoId",
                principalTable: "MetodosPagoUsuario",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Productos_CategoriasProducto_CategoriaProductoId",
                table: "Productos",
                column: "CategoriaProductoId",
                principalTable: "CategoriasProducto",
                principalColumn: "Id");
        }
    }
}
