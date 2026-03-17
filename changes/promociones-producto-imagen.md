# Plan: Mejorar creación de promociones con asociación a productos

## Decisiones de diseño
- Al asociar un producto, se usa automáticamente la imagen del producto.
- La relación se persiste en BD con FK nullable `ProductoId` en la entidad Promocion.

## Cambios Backend

### 1. Entidad Promocion
- Agregar `int? ProductoId` con FK a Producto.
- Agregar navegación `Producto? Producto`.

### 2. DTOs
- Request: agregar `int? ProductoId`.
- Response: agregar `int? ProductoId`, `string? ProductoNombre`, `string? ProductoImagenUrl`.

### 3. AutoMapper Profile
- Mapear `Producto.Nombre -> ProductoNombre`, `Producto.ImagenUrl -> ProductoImagenUrl`.

### 4. PromocionesController
- Include Producto en queries.
- Validar que ProductoId exista si se envía.

### 5. DbContext
- Configurar relación opcional en OnModelCreating si necesario.

### 6. Migración EF Core
- `dotnet ef migrations add AddProductoToPromocion`

## Cambios Frontend

### 7. Interface Promocion (promocionesService.ts)
- Agregar `productoId`, `productoNombre`, `productoImagenUrl`.

### 8. Formulario admin (promocionesAdmin.tsx)
- Sección "Tipo de Promoción" con dos modos:
  - "Asociar a producto existente": buscador/selector de productos con preview.
  - "Promoción independiente": zona drag-and-drop para subir imagen personalizada.
- Reutilizar endpoint `POST /api/upload` existente.

### 9. Tabla de promociones (mismo archivo)
- Indicador visual de producto asociado o independiente.
- Thumbnail de imagen.

### 10. Página pública (promociones.tsx)
- Usar `productoImagenUrl` cuando hay producto, `imagenUrl` cuando es independiente, fallback Unsplash.

## Archivos modificados
- PastisserieAPI.Core/Entities/Promocion.cs
- PastisserieAPI.Services/DTOs/Request/PromocionRequestDtos.cs
- PastisserieAPI.Services/DTOs/Response/PromocionResponseDto.cs
- PastisserieAPI.Services/Mappings/MappingProfile.cs
- PastisserieAPI.API/Controllers/PromocionesController.cs
- PastisserieAPI.Infrastructure/Data/ApplicationDbContext.cs
- pastisserie-front/src/services/promocionesService.ts
- pastisserie-front/src/pages/admin/promocionesAdmin.tsx
- pastisserie-front/src/pages/promociones.tsx
