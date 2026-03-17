# Plan: Integración de promociones en el carrito de compras

## Objetivo
Permitir que los usuarios agreguen productos promocionales al carrito directamente desde la página de promociones, con precios descontados aplicados automáticamente y reglas de negocio (límite 3 unidades, validación de stock).

## Decisiones de diseño
- Promociones de tipo **producto** usan el stock del producto vinculado.
- Promociones **independientes** usan un nuevo campo `Stock` en la entidad `Promocion` (nullable; null = ilimitado).
- Cada usuario puede agregar máximo **3 unidades** de un mismo producto por promoción.
- Items con promoción se tratan como **líneas separadas** del mismo producto sin promoción (match por `ProductoId` + `PromocionId`).
- Se eliminó completamente el campo `CodigoPromocional` — las promociones son directas, sin código.
- El precio descontado se calcula con la misma función `CalcularPrecioFinal()` en backend (AutoMapper y PedidoService).

---

## Cambios Backend

### 1. Entidades

**`CarritoItem.cs`**
- `int? PromocionId` — FK nullable a `Promocion`
- `Promocion? Promocion` — navigation property
- `decimal? PrecioOriginal` — precio del producto al momento de agregar (para auditoría)

**`PedidoItem.cs`**
- `int? PromocionId` — FK nullable a `Promocion`
- `Promocion? Promocion` — navigation property
- `decimal? PrecioOriginal` — precio original preservado en la orden

**`Promocion.cs`**
- Eliminado: `string? CodigoPromocional`
- Agregado: `int? Stock` — stock para promociones independientes (null = ilimitado)

### 2. Migración EF Core
- `20260310084824_PromoCartIntegration.cs`
  - Drop column `CodigoPromocional` de `Promociones`
  - Add column `Stock` (int, nullable) a `Promociones`
  - Add columns `PromocionId` (int, nullable) + `PrecioOriginal` (decimal(18,2), nullable) a `CarritoItems`
  - Add columns `PromocionId` (int, nullable) + `PrecioOriginal` (decimal(18,2), nullable) a `PedidoItems`
  - FK indexes en ambas tablas
  - Nota: se editó manualmente para evitar duplicar `PrecioOriginal` en `Promociones` (ya existía de migración anterior)

### 3. DTOs

**Request:**
- `AddToCarritoRequestDto` — agregado `int? PromocionId`
- `CreatePromocionRequestDto` — reemplazado `CodigoPromocional` por `int? Stock`

**Response:**
- `CarritoItemResponseDto` — agregados `PromocionId`, `NombrePromocion`, `PrecioOriginal`
- `PedidoItemResponseDto` — agregados `PromocionId`, `NombrePromocion`, `PrecioOriginal`
- `PromocionResponseDto` — reemplazado `CodigoPromocional` por `int? Stock`

### 4. AutoMapper (`MappingProfile.cs`)
- `CarritoCompra → CarritoResponseDto`: Total recalculado usando precio promo cuando aplica
- `CarritoItem → CarritoItemResponseDto`: `PrecioUnitario` y `Subtotal` usan precio descontado; mapea `PromocionId`, `NombrePromocion`, `PrecioOriginal`
- `PedidoItem → PedidoItemResponseDto`: Mapea `PromocionId`, `NombrePromocion`, `PrecioOriginal`

### 5. Repositorio (`CarritoRepository.cs`)
- `GetByUsuarioIdWithItemsAsync()` ahora incluye `.ThenInclude(i => i.Promocion)` para cargar datos de promo

### 6. Servicio de Carrito (`CarritoService.cs`)
- **`AddItemAsync`**: Valida que la promo existe, está activa y vigente; aplica límite de 3 unidades por promo+producto; valida stock de promos independientes; match por `ProductoId` + `PromocionId`; guarda `PrecioOriginal`
- **`UpdateItemAsync`**: Aplica límite de 3 unidades para items con promoción

### 7. Servicio de Pedidos (`PedidoService.cs`)
- Al crear pedido desde carrito:
  - Calcula `PrecioUnitario` descontado usando `CalcularPrecioFinal()` cuando hay promo
  - Copia `PromocionId` y `PrecioOriginal` al `PedidoItem`
  - Valida stock de promociones independientes antes de procesar
  - Descuenta `Promocion.Stock` para promos independientes al confirmar
- Agregado helper `CalcularPrecioFinal()` (misma lógica que MappingProfile)

---

## Cambios Frontend

### 8. Types (`types/index.ts`)
- `CarritoItem` — agregados `promocionId?`, `nombrePromocion?`, `precioOriginal?`
- `PedidoItem` — agregados `promocionId?`, `nombrePromocion?`, `precioOriginal?`

### 9. Servicios
- `cartService.ts` (`AddToCartRequest`) — agregado `promocionId?`
- `promocionesService.ts` (`Promocion`) — reemplazado `codigoPromocional` por `stock?`

### 10. Contexto (`CartContext.tsx`)
- `addToCart(productoId, cantidad, promocionId?)` — acepta `promocionId` opcional y lo pasa en el request API

### 11. Página de Promociones (`promociones.tsx`)
- Botón "Agregar al carrito" con icono `FiShoppingCart` para promos con producto vinculado
- Llama `addToCart(promo.productoId!, 1, promo.id)`
- Promos sin producto siguen mostrando "Lo quiero" con link a contacto

### 12. Cart Sidebar (`CartSidebar.tsx`)
- Badge con `nombrePromocion` para items con promo
- Indicador "(Max 3)" junto al badge
- Precio original tachado + precio descontado

### 13. Página de Carrito (`carrito.tsx`)
- Badge de promoción
- Precio original tachado junto al precio descontado
- Botón "+" deshabilitado al llegar a cantidad 3 para items con promo
- Advertencia "(Max 3)" visual

### 14. Admin Promociones (`promocionesAdmin.tsx`)
- Eliminado: campo "Código Promocional" del formulario
- Eliminado: columna "Código" de la tabla
- Eliminado: `codigoPromocional` de `initialFormState` y `openEditModal`
- Agregado: campo "Stock Disponible" (solo visible para promos independientes, null = ilimitado)
- Agregado: columna "Stock" en la tabla (muestra "Producto" / valor numérico / "Ilimitado")
- Payload de guardado envía `stock` solo para promos independientes

---

## Archivos modificados

### Backend
- `PastisserieAPI.Core/Entities/CarritoItem.cs`
- `PastisserieAPI.Core/Entities/PedidoItem.cs`
- `PastisserieAPI.Core/Entities/Promocion.cs`
- `PastisserieAPI.Infrastructure/Migrations/20260310084824_PromoCartIntegration.cs`
- `PastisserieAPI.Services/DTOs/Request/AddToCarritoRequestDto.cs`
- `PastisserieAPI.Services/DTOs/Request/PromocionRequestDtos.cs`
- `PastisserieAPI.Services/DTOs/Response/CarritoResponseDto.cs`
- `PastisserieAPI.Services/DTOs/Response/PedidoResponseDto.cs`
- `PastisserieAPI.Services/DTOs/Response/PromocionResponseDto.cs`
- `PastisserieAPI.Services/Mappings/MappingProfile.cs`
- `PastisserieAPI.Services/Services/CarritoService.cs`
- `PastisserieAPI.Services/Services/PedidoService.cs`
- `PastisserieAPI.Infrastructure/Repositories/CarritoRepository.cs`

### Frontend
- `pastisserie-front/src/types/index.ts`
- `pastisserie-front/src/services/cartService.ts`
- `pastisserie-front/src/services/promocionesService.ts`
- `pastisserie-front/src/context/CartContext.tsx`
- `pastisserie-front/src/pages/promociones.tsx`
- `pastisserie-front/src/components/CartSidebar.tsx`
- `pastisserie-front/src/pages/carrito.tsx`
- `pastisserie-front/src/pages/admin/promocionesAdmin.tsx`

---

## Verificación
- Backend: compila con 0 errores
- Frontend: 0 errores de TypeScript
- Migración aplicada exitosamente a la base de datos

## Flujo completo
1. Usuario visita `/promociones` y ve productos en oferta
2. Click en "Agregar al carrito" pasa `productoId` + `promocionId` al contexto
3. Backend valida promo activa/vigente, límite de 3 unidades, stock disponible
4. Cart sidebar y página de carrito muestran badge de promo, precio original tachado, precio descontado
5. Al hacer checkout, `PedidoService` crea `PedidoItem` con precio descontado, `PromocionId` y `PrecioOriginal`
6. Stock del producto y de la promo independiente se descuentan

(End of plan - v1)
