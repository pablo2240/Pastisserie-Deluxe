using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PastisserieAPI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRegistroPago : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EpaycoEstadoTransaccion",
                table: "Pedidos");

            migrationBuilder.DropColumn(
                name: "EpaycoMetodoPago",
                table: "Pedidos");

            migrationBuilder.DropColumn(
                name: "EpaycoRefPayco",
                table: "Pedidos");

            migrationBuilder.DropColumn(
                name: "EpaycoTransactionId",
                table: "Pedidos");

            migrationBuilder.CreateTable(
                name: "RegistrosPago",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PedidoId = table.Column<int>(type: "int", nullable: false),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FechaIntento = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaConfirmacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MensajeError = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReferenciaExterna = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RegistrosPago", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RegistrosPago_Pedidos_PedidoId",
                        column: x => x.PedidoId,
                        principalTable: "Pedidos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosPago_PedidoId",
                table: "RegistrosPago",
                column: "PedidoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RegistrosPago");

            migrationBuilder.AddColumn<string>(
                name: "EpaycoEstadoTransaccion",
                table: "Pedidos",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EpaycoMetodoPago",
                table: "Pedidos",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EpaycoRefPayco",
                table: "Pedidos",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EpaycoTransactionId",
                table: "Pedidos",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }
    }
}
