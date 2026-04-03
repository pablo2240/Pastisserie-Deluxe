using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PastisserieAPI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DropMetodoPagoIdFromPedidos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Pedidos') AND name = 'MetodoPagoId')
                BEGIN
                    ALTER TABLE [Pedidos] DROP COLUMN [MetodoPagoId];
                END
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>("MetodoPagoId", "Pedidos", nullable: true);
        }
    }
}
