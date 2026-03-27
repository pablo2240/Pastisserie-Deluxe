# Historial de Cambios - Patisserie Deluxe

## Fecha: 27 de Marzo 2026

---

## 1. Fixes de Código - Frontend

### 1.1 Home - Productos Activos
**Archivo:** `pastisserie-front/src/pages/home.tsx`
- Cambiado de `productService.getAll()` a `productService.getActivos()` para mostrar solo productos activos

**Archivo:** `pastisserie-front/src/services/productService.ts`
- Agregado método `getActivos()` que llama a `/productos/activos`
- Actualizado método `update()` para incluir campo `Activo`

### 1.2 Facturas en BD
**Archivo:** `pastisserie-api/Controllers/PagosController.cs`
- Agregado código para crear registro `Factura` al confirmar pago
- Guardar Factura con PedidoId, número, fecha, subtotal, IVA, total

### 1.3 Admin Producto - Toggle Activo
**Archivo:** `pastisserie-front/src/pages/admin/productosAdmin.tsx`
- Agregado toggle switch para activar/desactivar productos
- Mejorado diseño del formulario con grid de 2 columnas

### 1.4 Diseño Productos Admin
- reorganizado layout con cards diferenciados
- Imagen en card separado con preview grande
- Grid horizontal para Precio, Stock, Categoría

---

## 2. Migración de Categorías

### 2.1 Nueva Estructura de BD
- Campo `Categoria` (string) migrado a `CategoriaProductoId` (relación)
- Tabla `CategoriasProducto` con las 7 categorías base

**Datos de Categorías:**
1. Tortas - Tortas y pasteles
2. Panes - Variedad de panes artesanales
3. Postres - Postres y dulces
4. Galletas - Galletas caseras
5. Bebidas - Cafés de especialidad y bebidas naturales
6. Salados - Opciones saladas y quiches
7. Promociones - Combos y ofertas especiales

### 2.2 Archivos Modificados

**Backend:**
- `PastisserieAPI.Core/Entities/Producto.cs` - Cambiado `Categoria` string a `CategoriaProductoId` nullable
- `PastisserieAPI.Core/Entities/CategoriaProducto.cs` - Relacionada con Producto
- `PastisserieAPI.Services/DTOs/Request/CreateProductoRequestDto.cs` - `Categoria` → `CategoriaProductoId`
- `PastisserieAPI.Services/DTOs/Request/UpdateProductoRequestDto.cs` - Actualizado
- `PastisserieAPI.Services/DTOs/Response/ProductoResponseDto.cs` - `Categoria` → `CategoriaProductoId`, `CategoriaNombre`
- `PastisserieAPI.Services/Mappings/MappingProfile.cs` - Actualizado mapeo
- `PastisserieAPI.Core/Interfaces/Repositories/IProductoRepository.cs` - GetByCategoriaAsync(int)
- `PastisserieAPI.Infrastructure/Repositories/ProductoRepository.cs` - Include CategoriaProducto en queries
- `PastisserieAPI.Infrastructure/Data/Configurations/ProductoConfiguration.cs` - Actualizada relación
- `PastisserieAPI.Infrastructure/Data/ApplicationDbContext.cs` - Índice en CategoriaProductoId
- `PastisserieAPI.Infrastructure/Data/DbInitializer.cs` - Productos con CategoriaProductoId

**Frontend:**
- `pastisserie-front/src/types/index.ts` - `categoria` → `categoriaProductoId`, `categoriaNombre`
- `pastisserie-front/src/services/productService.ts` - Actualizado create/update
- `pastisserie-front/src/pages/home.tsx` - Usa getActivos()
- `pastisserie-front/src/components/ProductCard.tsx` - Usa `categoriaNombre`
- `pastisserie-front/src/pages/catalogo.tsx` - Filtros usan `categoriaNombre`
- `pastisserie-front/src/pages/admin/productosAdmin.tsx` - Formulario usa `categoriaId`
- `pastisserie-front/src/pages/admin/promocionesAdmin.tsx` - Muestra `categoriaNombre`

### 2.3 Migración EF
- `20260327052326_MigrateCategoriaToRelation.cs` - Migra datos y elimina columna

---

## 3. Reclamaciones - Fix Hooks

**Archivo:** `pastisserie-front/src/pages/Reclamaciones.tsx`
- Problema: Early return antes de useState violaba Rules of Hooks
- Solución: Todos los useState declarados al inicio, verificación de auth después

---

## 4. Promociones - Mejoras

### 4.1 Página de Promociones (Home)
**Archivo:** `pastisserie-front/src/pages/promociones.tsx`
- Ahora usa `getActivas()` - solo muestra promociones activas y vigentes
- Nuevo diseño premium con fondo oscuro, gradientes, cards modernos
- Grid de 3 columnas (lg:grid-cols-3)
- Botón "Ver Catálogo" cambiado de `/catalog` a `/productos`

### 4.2 Admin Promociones - Bug Eliminación
- Confirmación mejorada con nombre de promoción
- Fix en backend DELETE para retornar JSON consistente

### 4.3 Admin Promociones - Fechas
**Archivo:** `pastisserie-front/src/pages/admin/promocionesAdmin.tsx`
- Fix: `formatLocalISO` y `toISOStringLocal` preservan hora local correctamente

---

## 5. Reseñas Admin - Mejoras

### 5.1 Nuevo Endpoint
**Backend:**
- Nuevo endpoint `GET /api/Reviews/admin/todas` para listar todas las reseñas
- Nuevo método `GetAllAsync()` en Repository → Service → Controller

**Frontend:**
- `pastisserie-front/src/services/reviewService.ts` - Agregado `getAll()`
- `pastisserie-front/src/pages/admin/resenasAdmin.tsx` - "Todas" carga todas las reseñas

### 5.2 Eliminar Botón Editar
- Removido botón de editar reseñas
- Removido modal de edición completo

---

## 6. Limpieza ePayco (Tablas Eliminadas)

### 6.1 Entidades Eliminadas
- `PastisserieAPI.Core/Entities/MetodoPagoUsuario.cs` - Eliminado
- `PastisserieAPI.Core/Entities/TipoMetodoPago.cs` - Eliminado

### 6.2 Pedido - Cambiado a String
**Archivo:** `PastisserieAPI.Core/Entities/Pedido.cs`
- Antes: `public int MetodoPagoId { get; set; }` + navigation property
- Después: `public string MetodoPago { get; set; } = "Efectivo"`

### 6.3 Archivos Actualizados

| Archivo | Cambio |
|---------|--------|
| `PastisserieAPI.Core/Entities/User.cs` | Eliminado `MetodosPago` collection |
| `PastisserieAPI.Core/Interfaces/IUnitOfWork.cs` | Eliminadas propiedades MetodosPagoUsuario, TiposMetodoPago |
| `PastisserieAPI.Infrastructure/Repositories/UnitOfWork.cs` | Eliminadas propiedades e inicializaciones |
| `PastisserieAPI.Infrastructure/Data/ApplicationDbContext.cs` | Eliminados DbSets |
| `PastisserieAPI.Infrastructure/Data/DbInitializer.cs` | Eliminado SeedTiposMetodoPago |
| `PastisserieAPI.Services/Services/PedidoService.cs` | Usa string MetodoPago directamente |
| `PastisserieAPI.Infrastructure/Repositories/PedidoRepository.cs` | Eliminados ThenInclude MetodoPago |
| `PastisserieAPI.Services/Mappings/MappingProfile.cs` | Actualizado mapeo |

### 6.4 Migración
- `20260327084638_RemoveMetodosPagoTables.cs` - Elimina tablas de BD y agrega columna MetodoPago string

---

## Pendiente por Aplicar

```bash
# Aplicar migraciones
dotnet ef database update -p PastisserieAPI.Infrastructure -s PastisserieAPI.API
```