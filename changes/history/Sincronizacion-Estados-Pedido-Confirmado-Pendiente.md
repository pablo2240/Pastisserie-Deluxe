# Sincronización de Estados: Confirmado (Cliente) vs Pendiente (Admin)

## Fecha: 30 Mar 2026

## Resumen

Se implementó una transformación de estados diferenciada para pedidos:
- **Cliente:** Ve el estado "Confirmado" (pago realizado)
- **Admin:** Ve el mismo pedido como "Pendiente" (gestión operativa interna)

Esto permite mantener una separación clara entre el estado de pago (perspectiva del cliente) y el estado operativo (perspectiva del administrador).

---

## Problema Original

El sistema mostraba el mismo estado "Confirmado" tanto para clientes como para administradores, lo cual generaba confusión ya que:
- El cliente ve "Confirmado" → su pago fue exitoso
- El admin veía "Confirmado" → pero no quedaba claro que había una orden por gestionar

---

## Solución Implementada

Se modificó el **Backend** para transformar el estado automáticamente según el endpoint consultado.

### Archivo modificado

**`PastisserieAPI.Services/Services/PedidoService.cs`**

### Cambio realizado

En el método `GetAllAsync()` (usado por el endpoint `/pedidos/todos` para el admin), se agregó lógica para transformar "Confirmado" → "Pendiente":```csharp
// Transformar "Confirmado" a "Pendiente" para el admin
// (El cliente ve "Confirmado", el admin ve "Pendiente" para gestión operativa)
foreach (var pedido in pedidosDto)
{
    if (pedido.Estado == "Confirmado")
    {
        pedido.Estado = "Pendiente";
    }
}
```

### Endpoints afectados

| Endpoint | Rol | Comportamiento |
|----------|-----|---------------|
| `GET /pedidos/mis-pedidos` | Cliente | Ve "Confirmado" ✅ |
| `GET /pedidos/todos` | Admin | Ve "Pendiente" ✅ |

---

## Build Result

- Backend: ✅ Build exitoso (0 errores)
- Cambio pushueado a `origin/develop`
