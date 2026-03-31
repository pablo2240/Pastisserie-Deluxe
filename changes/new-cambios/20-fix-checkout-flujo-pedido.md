# 20 - Fix: Flujo de Checkout - Crear Pedido Solo tras Pago Exitoso

## Problema

Actualmente, cuando el usuario entra al checkout y hace clic en "Continuar", se crea un pedido con estado "Pendiente" en la base de datos ANTES de que se procese el pago. Esto genera pedidos "basura" cuando el usuario abandona el proceso.

## Flujo Actual (INCORRECTO)

1. Usuario llena datos de envío → `createOrder()` → se crea pedido "Pendiente" ❌
2. Usuario pasa a payment
3. Si abandona → queda un pedido "Pendiente" en la base de datos ❌
4. Si paga → se cambia a "Confirmado"

## Flujo Correcto (REQUERIDO)

1. Usuario llena datos de envío → NO crear pedido, solo guardar en estado
2. Usuario pasa a payment
3. Si usuario abandona → NO se crea ningún pedido ✅
4. Si pago exitoso → crear pedido como "Confirmado" ✅
5. Si pago falla → crear pedido como "PagoFallido" (tuvo intento real) ✅

## Solución

### Frontend (checkout.tsx)

1. **No llamar a `createOrder()` al ir a payment**
   - En lugar de eso, guardar los datos del formulario en estado
   - Pasar al step 'payment' sin crear pedido

2. **Crear pedido solo al procesar pago**
   - En `handlePayment()`, llamar a un nuevo endpoint que cree el pedido Y procese el pago en una sola transacción
   - O modificar `simularPago` para que cree el pedido si no existe

### Backend (PagosController.cs)

1. **Nuevo endpoint o modificar existente**
   - Crear un endpoint que reciba los datos del pedido Y procese el pago
   - O modificar `SimularPago` para que cree el pedido si no existe

2. **Manejar casos:**
   - Pago exitoso → crear como "Confirmado"
   - Pago fallido → crear como "PagoFallido"

### Estados a manejar

| Escenario | Estado en DB |
|-----------|--------------|
| Pago exitoso | Confirmado |
| Pago fallido | PagoFallido |
| Abandono sin pagar | NO crear pedido |

## Tareas

1. ⬜ Analizar y diseñar cambios en frontend
2. ⬜ Modificar checkout.tsx para no crear pedido al avanzar
3. ⬜ Crear nuevo endpoint o modificar existente en backend
4. ⬜ Manejar el caso de pago fallido
5. ⬜ Verificar que compile
6. ⬜ Testing
