# Plan: Comunas en el Checkout - Medellín

## Contexto Actual
- El checkout tiene **2 pasos**: Envío (formulario) -> Pago (MercadoPago)
- El campo "Ciudad/Municipio" es un `<input type="text">` libre, sin restricciones
- La ciudad se concatena en la dirección: `"${direccion}, ${ciudad}"` y se envía al backend como texto plano en `NotasCliente`
- El costo de envío está hardcodeado a **5000 COP** en `PedidoService.cs:204`
- La entidad `DireccionEnvio` no tiene campo de Ciudad ni Comuna
- El `CreatePedidoRequestDto` tampoco tiene campo de Comuna

## Cambios

### 1. Frontend - Constantes y Tipos (`types/index.ts`)

Agregar `ComunasDisponibles` con patrón `as const`:

```typescript
export const ComunasDisponibles = {
  Guayabal: { label: "Comuna 15 - Guayabal", costoEnvio: 5000 },
  Belen: { label: "Comuna 16 - Belén", costoEnvio: 6000 },
} as const;

export type ComunaKey = keyof typeof ComunasDisponibles;
```

### 2. Frontend - Checkout Page (`pages/checkout.tsx`)

**2a. Flujo de 2 a 3 pasos:**
- Estado: `'shipping' | 'summary' | 'payment' | 'success'`
- Indicadores: Envío (1) -> Resumen (2) -> Pago (3)

**2b. Paso 1 - Formulario de Envío:**
- Reemplazar `<input type="text" name="ciudad">` por `<select name="comuna">`
- Actualizar `formData` para usar `comuna` en lugar de `ciudad`
- Actualizar validación
- Costo de envío dinámico según comuna
- Placeholders contextualizados a Medellín

**2c. Paso 2 - Resumen del Pedido (NUEVO):**
- Productos del carrito con cantidades y precios
- Dirección de envío completa
- Comuna seleccionada
- Subtotal, costo envío (por comuna), total final
- Botones: "Editar datos" y "Confirmar y Pagar" (crea el pedido aquí)

**2d. Paso 3 - Pago (MercadoPago):**
- Resumen compacto + botón editar
- MercadoPagoBrick sin cambios

**Cambio clave**: `orderService.createOrder` se mueve del paso 1 al paso 2.

### 3. Frontend - Order Service (`services/orderService.ts`)

- Enviar campo `comuna` separado al backend
- Dirección ya no concatena la ciudad

### 4. Backend - Entidad `DireccionEnvio`

```csharp
[MaxLength(100)]
public string? Comuna { get; set; }
```

### 5. Backend - DTOs

- `CreatePedidoRequestDto`: agregar `public string? Comuna { get; set; }`
- `DireccionEnvioResponseDto`: agregar `public string? Comuna { get; set; }`

### 6. Backend - PedidoService

- Reemplazar `CostoEnvio = 5000` por lógica basada en comuna
- Diccionario: `{ "Guayabal": 5000, "Belen": 6000 }`
- Validar comuna permitida
- Persistir comuna en NotasCliente

### 7. Backend - Migración EF

Nueva migración para columna `Comuna` en tabla `DireccionEnvio`.

## Costos de Envío por Comuna

| Comuna | Costo |
|--------|-------|
| Comuna 15 - Guayabal | $5,000 COP |
| Comuna 16 - Belén | $6,000 COP |

## Archivos Afectados

| Archivo | Cambio |
|---------|--------|
| `pastisserie-front/src/types/index.ts` | Constantes de comunas |
| `pastisserie-front/src/pages/checkout.tsx` | Flujo 3 pasos, select comuna, resumen |
| `pastisserie-front/src/services/orderService.ts` | Campo comuna en payload |
| `PastisserieAPI.Core/Entities/DireccionEnvio.cs` | Propiedad `Comuna` |
| `PastisserieAPI.Services/DTOs/Request/CreatePedidoRequestDto.cs` | Campo `Comuna` |
| `PastisserieAPI.Services/DTOs/Response/DireccionEnvioResponseDto.cs` | Campo `Comuna` |
| `PastisserieAPI.Services/Services/PedidoService.cs` | Costo dinámico + persistir comuna |
| `PastisserieAPI.Infrastructure/` | Migración EF |

## Sin cambios

- `MercadoPagoBrick.tsx`
- `ResultadoPago.tsx`
- `CartContext.tsx` / `CartSidebar.tsx`
- Google Maps (preparación futura)
