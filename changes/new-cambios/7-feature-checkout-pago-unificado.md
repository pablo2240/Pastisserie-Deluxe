# Feature: Checkout con Pago Unificado - Tarea #7

## Problema Original

1. Al confirmar el resumen de compra, el sistema redirigía a una página externa (`/pago`) para el ingreso de la tarjeta, rompiendo la experiencia unificada.
2. El mensaje de "pedido creado" se disparaba al iniciar checkout, antes de que el pago se completara.
3. El stock se descontaba al crear el pedido (no al confirmar pago), causando inconsistencias si el pago fallaba.
4. No existía registro de intentos de pago fallidos.

## Solución Implementada

### Flujo Nuevo
1. Checkout: shipping → summary → payment (formulario inline) → success
2. El usuario permanece en la misma página de checkout durante todo el proceso
3. El stock SOLO se descuenta cuando el pago es confirmado exitosamente
4. Se registra cada intento de pago con estados: Espera, Exitoso, Fallido
5. La notificación "Pedido Recibido 🍰" solo se envía al confirmar pago exitoso

### Backend (ASP.NET Core)

#### Nueva Entidad: RegistroPago
- Ubicación: `PastisserieAPI.Core/Entities/RegistroPago.cs`
- Estados: Espera, Exitoso, Fallido
- Registra intentos de pago para trazabilidad

#### Endpoints Nuevos
- `PATCH /api/pagos/{pedidoId}/registrar-intento` - Registra entrada a pago
- `PATCH /api/pagos/{pedidoId}/abandonar` - Registra abandono
- `PATCH /api/pagos/{pedidoId}/confirmar` - Confirma pago exitoso con descuento de stock

#### Modificaciones
- `PedidoService.CreateAsync()`: Ya no descuenta stock, no envía notificación
- `PagosController.SimularPago()`: Descuenta stock solo al aprobar

### Frontend (React)

#### checkout.tsx
- Paso 3 ahora integra el formulario de pago inline
- No más navegación a `/pago`
- Mantiene botón "Volver al resumen"
- Maneja éxito/fracaso del pago localmente
- Detecta abandono con useEffect cleanup

## Archivos Creados
- `PastisserieAPI.Core/Entities/RegistroPago.cs`
- `PastisserieAPI.Core/Interfaces/IRegistroPagoRepository.cs`
- `PastisserieAPI.Infrastructure/Repositories/RegistroPagoRepository.cs`

## Archivos Modificados
- `PastisserieAPI.Core/Data/PatisserieDbContext.cs` - Agregar DbSet
- `PastisserieAPI.API/Controllers/PagosController.cs` - Nuevos endpoints
- `PastisserieAPI.Services/Services/PedidoService.cs` - Eliminar descuento stock
- `pastisserie-front/src/pages/checkout.tsx` - Formulario inline
- `pastisserie-front/src/pages/Pago.tsx` - Redirigir a checkout
- `pastisserie-front/src/App.tsx` - Cambiar rutas

## Lógica de Stock
- **Crear pedido**: Valida stock pero NO lo descuenta
- **Pago exitoso**: Descuenta stock y limpia carrito
- **Pago fallido/Abandono**: Stock permanece intacto

## Estados de RegistroPago
| Estado | Significado |
|--------|-------------|
| Espera | Usuario entró a sección de pago |
| Exitoso | Pago confirmado |
| Fallido | Pago rechazado o abandono |

## Verificación
- dotnet build: ✅ Exitoso
- npm run build: ✅ Exitoso

## Fecha
2026-03-20
