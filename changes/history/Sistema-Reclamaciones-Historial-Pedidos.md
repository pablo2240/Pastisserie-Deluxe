# Sistema de Reclamaciones y Historial de Pedidos

## Fecha: 27 Mar 2026

## Resumen

Se implementó un sistema completo de reclamaciones con información del domiciliario y se agregó el historial de cambios en los pedidos para el administrador.

---

## 1. Sistema de Reclamaciones - Opción C

### Problema Anterior
- El admin no podía ver el motivo que ponía el domiciliario cuando marcaba un pedido como "NoEntregado"
- Los datos del domiciliario no se guardaban en la reclamación

### Solución Implementada

#### Backend - Entidad Reclamacion.cs
Nuevos campos agregados:
```csharp
public string? MotivoDomiciliario { get; set; }    // Motivo del domiciliario
public DateTime? FechaNoEntrega { get; set; }       // Fecha del intento de entrega
public int? DomiciliarioId { get; set; }              // ID del domiciliario
public string? NombreDomiciliario { get; set; }       // Nombre del domiciliario
```

#### Backend - PedidoService.cs
Cuando el domiciliario marca un pedido como "NoEntregado":
1. Se crea automáticamente una reclamación
2. Se guardan todos los datos del domiciliario (nombre, motivo, fecha)
3. El admin puede ver el reporte completo

#### Migración
- `AddCamposDomiciliarioReclamacion` - Agrega los nuevos campos a la base de datos

---

## 2. Historial de Cambios en Pedidos

### Nueva Funcionalidad
El administrador ahora puede ver el historial completo de cambios de estado de cada pedido.

#### Backend - PedidoHistorialResponseDto.cs
Nuevo campo:
```csharp
public string? NombreCambiadoPor { get; set; }  // Nombre de quien hizo el cambio
```

#### Backend - PedidosController.cs
- Mejorado el endpoint GET `/pedidos/{id}/historial`
- Ahora incluye el nombre del usuario que realizó cada cambio

#### Frontend - adminOrders.tsx
Nueva sección en el modal de detalles del pedido:
- **Historial de Cambios**
- Muestra cada cambio con:
  - Estado anterior → Estado nuevo
  - Quién realizó el cambio
  - Fecha del cambio
  - Notas (si existen)

---

## 3. Notificaciones al Admin (ya implementadas)

| Evento | Notificación |
|--------|--------------|
| Nuevo pedido creado | "Nuevo Pedido #X 🛒" |
| Pedido marcado como NoEntregado | "Alerta: Pedido Fallido ❌" |

---

## Archivos Modificados

### Backend
- `PastisserieAPI.Core/Entities/Reclamacion.cs` - Nuevos campos
- `PastisserieAPI.Services/Services/PedidoService.cs` - Creación automática de reclamación
- `PastisserieAPI.Infrastructure/Data/ApplicationDbContext.cs` - Relaciones
- `PastisserieAPI.Services/DTOs/Response/PedidoHistorialResponseDto.cs` - NombreCambiadoPor
- `PastisserieAPI.API/Controllers/PedidosController.cs` - Historial mejorado
- Migración: `AddCamposDomiciliarioReclamacion`

### Frontend
- `pastisserie-front/src/services/reclamacionesService.ts` - Tipos actualizados
- `pastisserie-front/src/pages/admin/reportesAdmin.tsx` - Mostrar motivo domiciliario
- `pastisserie-front/src/pages/admin/adminOrders.tsx` - Historial de cambios
- `pastisserie-front/src/services/orderService.ts` - getHistorial

---

## Flujo Completo

1. **Usuario hace un pedido** → Se crea el pedido
2. **Admin recibe notificación** de nuevo pedido
3. **Se asigna repartidor** → Notificación al repartidor
4. **Repartidor marca "NoEntregado"** con motivo:
   - Se guarda en `Pedido.MotivoNoEntrega`
   - Se crea automáticamente una `Reclamacion` con datos del domiciliario
   - Admin recibe notificación de pedido fallido
5. **Admin revisa reclamaciones** → Ve motivo del domiciliario
6. **Admin revisa historial del pedido** → Ve todos los cambios de estado

---

## Build Results
- Backend: ✅ Compilación exitosa
- Frontend: ✅ Build exitoso

---

## Acción Requerida

Ejecutar la migración en la base de datos:
```bash
dotnet ef database update -p PastisserieAPI.Infrastructure -s PastisserieAPI.API
```
