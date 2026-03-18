# Plan: Gestión de precios y descuentos en promociones

## Decisiones de diseño
- Promociones pueden ser asociadas a un producto o independientes.
- Cuando se asocian a un producto, el precio original proviene de ese producto.
- Promociones independientes requieren que el admin ingrese el precio original manualmente.
- El descuento puede ser porcentaje o monto fijo.
- Siempre se muestran al usuario el precio original (tachado) y el precio final (descuento aplicado).
- Todas las reglas de validación se aplican en backend y frontend.

## Cambios Backend

### 1. Entidad Promocion
- Se agregó campo `decimal? PrecioOriginal` (nullable).
- En promociones asociadas a producto, `PrecioOriginal` se ignora (se usa el precio de producto).
- En promociones independientes, `PrecioOriginal` se usa y es obligatoria (validación).

### 2. DTOs
- Request: incluye `PrecioOriginal`, `TipoDescuento` (porcentaje/monto fijo), `ValorDescuento`.
- Response: incluye `PrecioOriginal`, `PrecioFinal` (calculado), y `PrecioProducto` (si aplica).

### 3. AutoMapper Profile
- Lógica para calcular/preparar `PrecioFinal`. 
- Prioriza el precio de producto si hay producto.

### 4. Validación
- Si promoción es independiente, `PrecioOriginal` requerido y > 0.
- Si es por producto, `PrecioOriginal` ignorado.
- Descuento nunca puede disminuir el precio a < 0.

### 5. Migrations
- EF Core migración para agregar campo `PrecioOriginal`.

## Cambios Frontend

### 6. Interface Promocion (promocionesService.ts)
- Agregados nuevos campos: `precioOriginal`, `precioFinal`, `tipoDescuento`, `valorDescuento`.

### 7. Formulario admin (promocionesAdmin.tsx)
- En promociones independientes, muestra y requiere el campo `precioOriginal`.
- Preview de descuento/calculadora en tiempo real.
- Validación de descuentos y precios.

### 8. Tabla de promociones (mismo archivo)
- Muestra los campos originales y finales.

### 9. Página pública (promociones.tsx)
- Muestra precio original tachado y el final.
- Usa campos del Response DTO, sin recalcular en frontend.

## Archivos modificados
- PastisserieAPI.Core/Entities/Promocion.cs
- PastisserieAPI.Services/DTOs/Request/PromocionRequestDtos.cs
- PastisserieAPI.Services/DTOs/Response/PromocionResponseDto.cs
- PastisserieAPI.Services/Mappings/MappingProfile.cs
- PastisserieAPI.API/Controllers/PromocionesController.cs
- PastisserieAPI.Infrastructure/Migrations/AddPrecioOriginalToPromocion.cs
- pastisserie-front/src/services/promocionesService.ts
- pastisserie-front/src/pages/admin/promocionesAdmin.tsx
- pastisserie-front/src/pages/promociones.tsx

## Testing / Verificación
- Migraciones aplicadas exitosamente.
- Pruebas de frontend y backend para crear, editar y visualizar promociones de ambos tipos.
- Validaciones de precios y descuentos funcionando correctamente en ambos entornos.

## Futuro
- Considerar soporte para múltiple descuentos/personalización avanzada.
- Mejoras visuales al mostrar precios, animaciones o tooltips para ofertas.

(End of plan - v1)
