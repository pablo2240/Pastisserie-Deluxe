using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PastisserieAPI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEpaycoPaymentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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
        }
    }
}
