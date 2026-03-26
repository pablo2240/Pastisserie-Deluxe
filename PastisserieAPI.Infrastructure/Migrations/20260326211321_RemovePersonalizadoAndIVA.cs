using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PastisserieAPI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemovePersonalizadoAndIVA : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PersonalizadoConfigIngredientes");

            migrationBuilder.DropTable(
                name: "Ingredientes");

            migrationBuilder.DropTable(
                name: "PersonalizadoConfigs");

            migrationBuilder.DropColumn(
                name: "EsPersonalizado",
                table: "Pedidos");

            migrationBuilder.DropColumn(
                name: "IVA",
                table: "Pedidos");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EsPersonalizado",
                table: "Pedidos",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "IVA",
                table: "Pedidos",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "Ingredientes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PrecioAdicional = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ingredientes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PersonalizadoConfigs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PedidoId = table.Column<int>(type: "int", nullable: false),
                    Color = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Diseno = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Forma = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ImagenReferenciaUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    InstruccionesEspeciales = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Niveles = table.Column<int>(type: "int", nullable: false),
                    PrecioAdicional = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Sabor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Tamano = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PersonalizadoConfigs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PersonalizadoConfigs_Pedidos_PedidoId",
                        column: x => x.PedidoId,
                        principalTable: "Pedidos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PersonalizadoConfigIngredientes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IngredienteId = table.Column<int>(type: "int", nullable: false),
                    PersonalizadoConfigId = table.Column<int>(type: "int", nullable: false),
                    Cantidad = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PersonalizadoConfigIngredientes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PersonalizadoConfigIngredientes_Ingredientes_IngredienteId",
                        column: x => x.IngredienteId,
                        principalTable: "Ingredientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PersonalizadoConfigIngredientes_PersonalizadoConfigs_PersonalizadoConfigId",
                        column: x => x.PersonalizadoConfigId,
                        principalTable: "PersonalizadoConfigs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PersonalizadoConfigIngredientes_IngredienteId",
                table: "PersonalizadoConfigIngredientes",
                column: "IngredienteId");

            migrationBuilder.CreateIndex(
                name: "IX_PersonalizadoConfigIngredientes_PersonalizadoConfigId",
                table: "PersonalizadoConfigIngredientes",
                column: "PersonalizadoConfigId");

            migrationBuilder.CreateIndex(
                name: "IX_PersonalizadoConfigs_PedidoId",
                table: "PersonalizadoConfigs",
                column: "PedidoId",
                unique: true);
        }
    }
}
