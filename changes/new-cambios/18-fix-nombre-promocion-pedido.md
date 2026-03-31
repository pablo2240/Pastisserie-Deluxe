# 18 - Fix: Nombre de Promoción en Pedidos

## Problema

Al comprar una promoción, el sistema muestra "Producto Desconocido" en lugar del nombre real de la promoción en:
- Confirmación de compra
- Detalle del pedido
- Historial de pedidos
- Factura

## Análisis

### Causa raíz

En el backend (`MappingProfile.cs` línea 68), el mapeo de `PedidoItem` a `PedidoItemResponseDto`:

```csharp
.ForMember(dest => dest.NombreProducto, opt => opt.MapFrom(src => 
    src.Producto != null ? src.Producto.Nombre : "Producto Desconocido"))
```

Esto pone "Producto Desconocido" cuando NO hay producto, aunque SÍ haya promoción.

### Campo disponible

El DTO `PedidoItemResponseDto` tiene el campo `NombrePromocion` que se mapea correctamente:
```csharp
.ForMember(dest => dest.NombrePromocion, opt => opt.MapFrom(src =>
    src.Promocion != null ? src.Promocion.Nombre : null))
```

### Frontend

El frontend usa `nombreProducto` en todas las vistas, sin considerar `nombrePromocion`.

## Solución

### Backend
Modificar el mapeo para priorizar el nombre de la promoción:

```csharp
.ForMember(dest => dest.NombreProducto, opt => opt.MapFrom(src =>
    src.Producto != null ? src.Producto.Nombre :
    (src.Promocion != null ? src.Promocion.Nombre : "Producto Desconocido")))
```

## Tareas

1. ✅ Fix mapeo en MappingProfile.cs
2. ✅ Verificar que compile
3. ⬜ Commit y push
4. ⬜ Testing
