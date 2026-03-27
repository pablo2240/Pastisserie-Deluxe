using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PastisserieAPI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveMetodosPagoOnly : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Only try to drop foreign key if it exists (handle gracefully)
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Pedidos_MetodosPagoUsuario_MetodoPagoId' AND parent_object_id = OBJECT_ID('Pedidos'))
                BEGIN
                    ALTER TABLE [Pedidos] DROP CONSTRAINT [FK_Pedidos_MetodosPagoUsuario_MetodoPagoId];
                END
            ");

            // Drop tables if they exist
            migrationBuilder.Sql(@"
                IF OBJECT_ID('dbo.MetodosPagoUsuario', 'U') IS NOT NULL
                    DROP TABLE [dbo].[MetodosPagoUsuario];
            ");

            migrationBuilder.Sql(@"
                IF OBJECT_ID('dbo.TiposMetodoPago', 'U') IS NOT NULL
                    DROP TABLE [dbo].[TiposMetodoPago];
            ");

            // Drop index if it exists
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Pedidos_MetodoPagoId' AND object_id = OBJECT_ID('Pedidos'))
                    DROP INDEX [IX_Pedidos_MetodoPagoId] ON [Pedidos];
            ");

            // Add MetodoPago column if it doesn't exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Pedidos') AND name = 'MetodoPago')
                BEGIN
                    ALTER TABLE [Pedidos] ADD [MetodoPago] nvarchar(100) NOT NULL DEFAULT 'Efectivo';
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop the MetodoPago column
            migrationBuilder.DropColumn(name: "MetodoPago", table: "Pedidos");

            // Recreate tables would require complex SQL - not implementing downgrade for safety
        }
    }
}