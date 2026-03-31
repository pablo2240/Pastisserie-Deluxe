# 20 - Fix: Flujo de Checkout - Crear Pedido Solo tras Pago Exitoso

## Problema

Cuando el usuario entra al checkout y hace clic en "Continuar", se creaba un pedido con estado "Pendiente" en la base de datos ANTES de que se procese el pago. Esto generaba pedidos "basura" cuando el usuario abandonaba el proceso.

## Flujo Anterior (INCORRECTO)

1. Usuario llena datos de envío → `createOrder()` → se crea pedido "Pendiente" ❌
2. Usuario pasa a payment
3. Si abandona → queda un pedido "Pendiente" en la base de datos ❌
4. Si paga → se cambia a "Confirmado"

## Flujo Implementado

1. **Datos de envío** → **Resumen** → **Payment** (simular tarjeta)
2. Usuario hace clic en **"Pagar"** en la pantalla de payment
3. **Solo ahí** se crea el pedido y se procesa el pago
4. Si abandona antes de hacer clic en "Pagar" → **NO se crea ningún pedido** ✅

## Solución Implementada

### Frontend (checkout.tsx)

1. **No crear pedido al pasar de paso**
   - `handleShippingSubmit`: pasa al summary sin crear pedido
   - Botón "Ir a Pagar": solo pasa al step 'payment' sin crear pedido

2. **Crear pedido al confirmar pago**
   - `handleProcesarPago`: llama a `crearYPagar()` que crea el pedido + procesa el pago

### Backend (PagosController.cs)

1. **Nuevo endpoint: `POST /pagos/crear-y-pagar`**
   - Recibe los datos del pedido
   - Crea el pedido
   - Procesa el pago (simulado)
   - Limpia el carrito

### orderService.ts

1. **Nuevo método: `crearYPagar()`**
   - Envía los datos del pedido al nuevo endpoint

## Archivos Modificados

1. `PastisserieAPI.API/Controllers/PagosController.cs` - Nuevo endpoint
2. `pastisserie-front/src/services/orderService.ts` - Nuevo método
3. `pastisserie-front/src/pages/checkout.tsx` - Flujo corregido

## Estados Manejados

| Escenario | Estado en DB |
|-----------|--------------|
| Pago exitoso | Confirmado |
| Abandono sin pagar | NO se crea pedido |

## Tareas

1. ✅ Analizar y diseñar cambios en frontend
2. ✅ Modificar checkout.tsx para no crear pedido al avanzar
3. ✅ Crear nuevo endpoint en backend
4. ✅ Verificar que compile
5. ⬜ Testing
