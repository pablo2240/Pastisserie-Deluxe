using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PastisserieAPI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MigrateCategoriaToRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Insertar categorías base (tabla se llama CategoriasProducto)
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM CategoriasProducto WHERE Nombre = 'Tortas')
                BEGIN
                    INSERT INTO CategoriasProducto (Nombre, Descripcion, Activa)
                    VALUES ('Tortas', 'Tortas y pasteles', 1);
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM CategoriasProducto WHERE Nombre = 'Panes')
                BEGIN
                    INSERT INTO CategoriasProducto (Nombre, Descripcion, Activa)
                    VALUES ('Panes', 'Variedad de panes artesanales', 1);
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM CategoriasProducto WHERE Nombre = 'Postres')
                BEGIN
                    INSERT INTO CategoriasProducto (Nombre, Descripcion, Activa)
                    VALUES ('Postres', 'Postres y dulces', 1);
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM CategoriasProducto WHERE Nombre = 'Galletas')
                BEGIN
                    INSERT INTO CategoriasProducto (Nombre, Descripcion, Activa)
                    VALUES ('Galletas', 'Galletas caseras', 1);
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM CategoriasProducto WHERE Nombre = 'Bebidas')
                BEGIN
                    INSERT INTO CategoriasProducto (Nombre, Descripcion, Activa)
                    VALUES ('Bebidas', 'Cafés de especialidad y bebidas naturales', 1);
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM CategoriasProducto WHERE Nombre = 'Salados')
                BEGIN
                    INSERT INTO CategoriasProducto (Nombre, Descripcion, Activa)
                    VALUES ('Salados', 'Opciones saladas y quiches', 1);
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM CategoriasProducto WHERE Nombre = 'Promociones')
                BEGIN
                    INSERT INTO CategoriasProducto (Nombre, Descripcion, Activa)
                    VALUES ('Promociones', 'Combos y ofertas especiales', 1);
                END
            ");

            // Migrar datos existentes de Categoria string a CategoriaProductoId
            migrationBuilder.Sql(@"
                UPDATE p
                SET p.CategoriaProductoId = c.Id
                FROM Productos p
                INNER JOIN CategoriasProducto c ON LTRIM(RTRIM(p.Categoria)) = c.Nombre
                WHERE p.CategoriaProductoId IS NULL AND p.Categoria IS NOT NULL
            ");

            // Eliminar el índice existente en Categoria antes de eliminar la columna
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Productos_Categoria' AND object_id = OBJECT_ID('Productos'))
                BEGIN
                    DROP INDEX [IX_Productos_Categoria] ON [Productos];
                END
            ");

            // Eliminar el campo Categoria (string) ahora redundante
            migrationBuilder.DropColumn(
                name: "Categoria",
                table: "Productos");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Categoria",
                table: "Productos",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }
    }
}
