# 16 - Sincronización de Estados: Confirmado (Cliente) vs Pendiente (Admin)

## Problema

El sistema necesita mostrar dos perspectivas diferentes del mismo pedido:
- **Cliente:** Ve el estado como "Confirmado" (el pago fue realizado exitosamente)
- **Administrador:** Debe ver el mismo pedido como "Pendiente" (orden por gestionar internamente)

Actualmente, ambos ven el mismo estado "Confirmado", lo cual genera confusión en la gestión operativa.

## Análisis

### Endpoints involucrados

| Endpoint | Rol | Comportamiento actual | Comportamiento deseado |
|----------|-----|----------------------|----------------------|
| `GET /pedidos/mis-pedidos` | Cliente | Ve "Confirmado" | Mantener "Confirmado" ✅ |
| `GET /pedidos/todos` | Admin | Ve "Confirmado" | Transformar a "Pendiente" |

### Estados a transformar

| Estado Original (DB) | Estado para Admin | Estado para Cliente |
|---------------------|-------------------|-------------------|
| Confirmado | Pendiente | Confirmado |
| *Otros estados* | Sin cambios | Sin cambios |

## Solución

Se implementará la transformación en el **Backend**, específicamente en el método del servicio que retorna los pedidos para el admin.

### Archivo a modificar

**`PastisserieAPI.Services/Services/PedidoService.cs`**

### Cambio específico

En el método `GetAllAsync()` (que es usado por el endpoint `/pedidos/todos`), transformar el estado "Confirmado" a "Pendiente" antes de retornar el DTO.

### Alternativa considerada

También se podría hacer en el frontend (adminOrders.tsx, pedidosAdmin.tsx), pero la solución backend es más robusta porque:
1. Centraliza la lógica
2. El admin siempre recibirá el estado correcto
3. No depende de cambios en el frontend

## Tareas de implementación

1. ✅ Crear este plan
2. ⬜ Modificar `PedidoService.GetAllAsync()` para transformar "Confirmado" → "Pendiente"
3. ⬜ Verificar que el endpoint `/pedidos/todos` retorne el estado transformado
4. ⬜ Verificar que el endpoint `/pedidos/mis-pedidos` mantenga "Confirmado"
5. ⬜ Testing de cambios
6. ⬜ Commit y push
7. ⬜ Documentación final
