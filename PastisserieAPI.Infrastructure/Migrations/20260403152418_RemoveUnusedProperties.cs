using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PastisserieAPI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUnusedProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Direccion",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AprobadaPor",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "NombreDomiciliario",
                table: "Reclamaciones");

            migrationBuilder.DropColumn(
                name: "FechaLeida",
                table: "Notificaciones");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Direccion",
                table: "Users",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AprobadaPor",
                table: "Reviews",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NombreDomiciliario",
                table: "Reclamaciones",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaLeida",
                table: "Notificaciones",
                type: "datetime2",
                nullable: true);
        }
    }
}
