-- ============================================================================
-- SCRIPT DE LIMPIEZA Y REESTRUCTURACIÓN - Pastisserie Deluxe
-- Este script:
--   1. Inserta las categorías base en CategoriaProducto (usando datos proporcionados)
--   2. Migra datos del campo Categoria (string) a CategoriaProductoId
--   3. Elimina el campo Categoria ahora redundante
-- ============================================================================

-- ============================================================================
-- NOTA PREVIA: Ejecutar este script en el orden mostrado
--              Respaldar la base de datos antes de ejecutar
-- ============================================================================

-- ============================================================================
-- PASO 1: Verificar estado actual de la tabla Productos
-- ============================================================================
-- SELECT COUNT(*) AS TotalProductos FROM Productos;
-- SELECT DISTINCT Categoria FROM Productos WHERE Categoria IS NOT NULL;

-- ============================================================================
-- PASO 2: Insertar las categorías base en CategoriaProducto
--          (según datos proporcionados por el usuario)
-- ============================================================================
-- NOTA: Si ya existen datos, esto no los duplicará gracias al IF NOT EXISTS

IF NOT EXISTS (SELECT 1 FROM CategoriaProductos WHERE Nombre = 'Tortas')
BEGIN
    INSERT INTO CategoriaProductos (Nombre, Descripcion, Activa)
    VALUES ('Tortas', 'Tortas y pasteles', 1);
END

IF NOT EXISTS (SELECT 1 FROM CategoriaProductos WHERE Nombre = 'Panes')
BEGIN
    INSERT INTO CategoriaProductos (Nombre, Descripcion, Activa)
    VALUES ('Panes', 'Variedad de panes artesanales', 1);
END

IF NOT EXISTS (SELECT 1 FROM CategoriaProductos WHERE Nombre = 'Postres')
BEGIN
    INSERT INTO CategoriaProductos (Nombre, Descripcion, Activa)
    VALUES ('Postres', 'Postres y dulces', 1);
END

IF NOT EXISTS (SELECT 1 FROM CategoriaProductos WHERE Nombre = 'Galletas')
BEGIN
    INSERT INTO CategoriaProductos (Nombre, Descripcion, Activa)
    VALUES ('Galletas', 'Galletas caseras', 1);
END

IF NOT EXISTS (SELECT 1 FROM CategoriaProductos WHERE Nombre = 'Bebidas')
BEGIN
    INSERT INTO CategoriaProductos (Nombre, Descripcion, Activa)
    VALUES ('Bebidas', 'Cafés de especialidad y bebidas naturales', 1);
END

IF NOT EXISTS (SELECT 1 FROM CategoriaProductos WHERE Nombre = 'Salados')
BEGIN
    INSERT INTO CategoriaProductos (Nombre, Descripcion, Activa)
    VALUES ('Salados', 'Opciones saladas y quiches', 1);
END

IF NOT EXISTS (SELECT 1 FROM CategoriaProductos WHERE Nombre = 'Promociones')
BEGIN
    INSERT INTO CategoriaProductos (Nombre, Descripcion, Activa)
    VALUES ('Promociones', 'Combos y ofertas especiales', 1);
END

-- ============================================================================
-- PASO 3: Migrar datos existentes de Categoria string a CategoriaProductoId
-- ============================================================================
-- Este UPDATE une los productos con su categoría por nombre

UPDATE p
SET p.CategoriaProductoId = c.Id
FROM Productos p
INNER JOIN CategoriaProductos c ON LTRIM(RTRIM(p.Categoria)) = c.Nombre
WHERE p.CategoriaProductoId IS NULL AND p.Categoria IS NOT NULL;

-- ============================================================================
-- PASO 4: Verificar productos sin categoría (opcional - para revisión)
-- ============================================================================
-- SELECT p.Id, p.Nombre, p.Categoria, p.CategoriaProductoId
-- FROM Productos p
-- WHERE p.CategoriaProductoId IS NULL AND p.Categoria IS NOT NULL;

-- ============================================================================
-- PASO 5: Eliminar el campo Categoria (string) ahora redundante
-- ============================================================================
ALTER TABLE Productos DROP COLUMN Categoria;

-- ============================================================================
-- VERIFICACIÓN FINAL: Verificar que todo quedó correctamente
-- ============================================================================
-- SELECT p.Id, p.Nombre, c.Nombre AS Categoria
-- FROM Productos p
-- LEFT JOIN CategoriaProductos c ON p.CategoriaProductoId = c.Id
-- ORDER BY p.Nombre;

-- SELECT COUNT(*) AS SinCategoria 
-- FROM Productos WHERE CategoriaProductoId IS NULL;

-- ============================================================================
-- POST-EJECUCIÓN: Notas importantes
-- ============================================================================
-- Después de ejecutar este script, hacer:
--
-- 1. REBUILD del proyecto .NET para actualizar el modelo de Entity Framework
--    dotnet build PastisserieAPI.sln
--
-- 2. ACTUALIZAR AutoMapper si mapeaba el campo Categoria string:
--    - Revisar MappingProfile.cs
--    - Actualizar CreateProductoRequestDto y UpdateProductoRequestDto
--
-- 3. ACTUALIZAR Frontend:
--    - Revisar si usa producto.categoria como string
--    - Cambiar a usar producto.categoriaId para seleccionar categoría
--
-- 4. CREAR nueva migración EF (opcional si se hizo código):
--    dotnet ef migrations add MigrateCategoriaToRelation -p ..\PastisserieAPI.Infrastructure -s PastisserieAPI.API
-- ============================================================================
