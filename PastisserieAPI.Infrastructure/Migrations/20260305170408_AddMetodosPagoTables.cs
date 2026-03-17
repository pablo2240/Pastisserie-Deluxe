using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PastisserieAPI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMetodosPagoTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EstaActivo",
                table: "MetodosPagoUsuario",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "IdentificacionTitular",
                table: "MetodosPagoUsuario",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NombreTitular",
                table: "MetodosPagoUsuario",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethodId",
                table: "MetodosPagoUsuario",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EstaActivo",
                table: "MetodosPagoUsuario");

            migrationBuilder.DropColumn(
                name: "IdentificacionTitular",
                table: "MetodosPagoUsuario");

            migrationBuilder.DropColumn(
                name: "NombreTitular",
                table: "MetodosPagoUsuario");

            migrationBuilder.DropColumn(
                name: "PaymentMethodId",
                table: "MetodosPagoUsuario");
        }
    }
}
