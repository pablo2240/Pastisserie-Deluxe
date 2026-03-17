---
title: "Eliminar MercadoPago y Simplificar Pagos"
date: 2026-03-10
applyTo: '**'
---

# Plan Final — Eliminación MercadoPago, Simplificación de Pagos y Notificaciones

## Objetivo
Eliminar la integración de MercadoPago, dejar solo el emulador de pagos (siempre aprobado), simplificar el flujo post-pago y hacer las notificaciones solo informativas.

## Cambios Realizados

### 1. Backend
- Eliminados archivos:
    - `PastisserieAPI.Services/Services/MercadoPagoService.cs`
    - `PastisserieAPI.Services/Services/Interfaces/IMercadoPagoService.cs`
    - `PastisserieAPI.Services/Config/MercadoPagoSettings.cs`
    - `PastisserieAPI.Services/DTOs/MercadoPago/MercadoPagoDtos.cs`
    - `PastisserieAPI.Services/DTOs/Response/MercadoPagoDto.cs`
    - `PastisserieAPI.Services/DTOs/Request/MercadoPagoRequestDto.cs`
    - Directorio `PastisserieAPI.Services/DTOs/MercadoPago/`
- Actualizado `PedidoService.cs` para eliminar lógica especial de MercadoPago: ahora todos los pedidos se confirman automáticamente (`Estado = "Pendiente"`, `Aprobado = true`).
- El endpoint `/pagos/emulador/aprobar` en el controlador `PagosController` ahora siempre registra pagos como aprobados.
- Eliminada la configuración de MercadoPago en `DependencyInjection.cs` y `Program.cs`.

### 2. Frontend
- Eliminados archivos:
    - `pastisserie-front/src/services/mercadoPagoService.ts`
    - `pastisserie-front/src/services/pagoService.ts`
    - `pastisserie-front/src/components/PaymentSimulator.tsx`
- Eliminada la dependencia `@mercadopago/sdk-react` del `package.json`.
- Creado y utilizado el servicio `pagoEmuladorService.ts` para registrar pagos aprobados.
- Reescrito `MercadoPagoBrick.tsx` como emulador de pagos: muestra solo un botón para confirmar pago.
- Actualizado `checkout.tsx`: ahora utiliza el emulador de pago, registra el pago como aprobado y redirige post-pago.
- Actualizado `ResultadoPago.tsx`: siempre muestra pago aprobado, elimina lógica de verificación y redirige automáticamente a `/perfil`.
- Actualizado `Notificaciones.tsx`: elimina la navegación (`navigate`) y sólo permite marcar como leída la notificación.
- Eliminadas las importaciones en componentes y servicios relacionadas con MercadoPago.
- Confirmado que el flujo de carrito se limpia completamente tras el pago exitoso.

### 3. Limpieza y verificación
- Limpiados archivos, imports y referencias viejas de MercadoPago.
- Modificado comentario de campo específico en `MetodoPagoUsuario.cs` para referenciar genéricamente método de pago.
- Validado que notificacions sólo sirven para marcar como leídas.
- Confirmado que tanto el frontend como backend compilan y pasan los chequeos de tipo/compilación.

## Validaciones finales
- Flujo completo: añadir productos → checkout → pago emulador → carrito vacío → redirección a `/perfil`.
- Todas las notificaciones sólo pueden marcarse como leídas.
- No quedan dependencias, archivos, ni lógica de MercadoPago en el sistema.

## Estado Final
**100% completado. Listo para commit.**
