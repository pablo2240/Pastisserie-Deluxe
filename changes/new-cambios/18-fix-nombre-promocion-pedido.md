# 18 - Fix: Nombre de Promoción en Pedidos

## Problema

Al comprar una promoción, el sistema muestra "Producto Desconocido" en lugar del nombre real de la promoción en:
- Confirmación de compra
- Detalle del pedido
- Historial de pedidos
- Factura

## Análisis

Se identificaron dos problemas:

### Problema 1: Mapeo en MappingProfile

El mapeo de `PedidoItem` a `PedidoItemResponseDto` no consideraba la promoción:

```csharp
// Antes
.ForMember(dest => dest.NombreProducto, opt => opt.MapFrom(src => 
    src.Producto != null ? src.Producto.Nombre : "Producto Desconocido"))
```

### Problema 2: Repositorio no incluía Promocion

El repositorio `PedidoRepository` no incluía la relación `Promocion` en los Include, por lo que siempre era null al mapear.

## Solución

### Fix 1: MappingProfile.cs

Modificar el mapeo para priorizar el nombre de la promoción:

```csharp
// Después
.ForMember(dest => dest.NombreProducto, opt => opt.MapFrom(src => 
    src.Producto != null ? src.Producto.Nombre :
    (src.Promocion != null ? src.Promocion.Nombre : "Producto Desconocido")))
```

### Fix 2: PedidoRepository.cs

Agregar `.Include(i => i.Promocion)` en todos los métodos de consulta de pedidos:

- `GetAllAsync()`
- `GetByUsuarioIdAsync()`
- `GetByEstadoAsync()`
- `GetByIdWithDetailsAsync()`
- `GetPedidosPendientesAsync()`
- `GetPedidosEnPreparacionAsync()`

## Archivos modificados

1. `PastisserieAPI.Services/Mappings/MappingProfile.cs` - Fix del mapeo
2. `PastisserieAPI.Infrastructure/Repositories/PedidoRepository.cs` - Include de Promocion

## Tareas

1. ✅ Fix mapeo en MappingProfile.cs
2. ✅ Fix repositorio - incluir Promocion en todas las consultas
3. ✅ Verificar que compile
4. ✅ Commit y push
5. ⬜ Testing
