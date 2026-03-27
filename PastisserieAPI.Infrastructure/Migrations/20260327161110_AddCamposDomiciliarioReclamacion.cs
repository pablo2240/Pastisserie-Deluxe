using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PastisserieAPI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCamposDomiciliarioReclamacion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DomiciliarioId",
                table: "Reclamaciones",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaNoEntrega",
                table: "Reclamaciones",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MotivoDomiciliario",
                table: "Reclamaciones",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NombreDomiciliario",
                table: "Reclamaciones",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Reclamaciones_DomiciliarioId",
                table: "Reclamaciones",
                column: "DomiciliarioId");

            migrationBuilder.AddForeignKey(
                name: "FK_Reclamaciones_Users_DomiciliarioId",
                table: "Reclamaciones",
                column: "DomiciliarioId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reclamaciones_Users_DomiciliarioId",
                table: "Reclamaciones");

            migrationBuilder.DropIndex(
                name: "IX_Reclamaciones_DomiciliarioId",
                table: "Reclamaciones");

            migrationBuilder.DropColumn(
                name: "DomiciliarioId",
                table: "Reclamaciones");

            migrationBuilder.DropColumn(
                name: "FechaNoEntrega",
                table: "Reclamaciones");

            migrationBuilder.DropColumn(
                name: "MotivoDomiciliario",
                table: "Reclamaciones");

            migrationBuilder.DropColumn(
                name: "NombreDomiciliario",
                table: "Reclamaciones");
        }
    }
}
