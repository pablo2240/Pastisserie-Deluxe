# 14.2 - Gestión de Inventario para Promociones Asociadas a Productos

## Problema resuelto

Las promociones asociadas a productos existentes (con `productoId`) ahora también muestran el indicador "Agotado" cuando el stock del producto llega a cero, además de las promociones independientes.

## Archivos modificados

| Capa | Archivo |
|------|---------|
| Backend | `PastisserieAPI.Services/DTOs/Response/PromocionResponseDto.cs` |
| Backend | `PastisserieAPI.Services/Mappings/MappingProfile.cs` |
| Frontend | `pastisserie-front/src/services/promocionesService.ts` |
| Frontend | `pastisserie-front/src/pages/promociones.tsx` |

## Cambios implementados

1. **Backend - PromocionResponseDto.cs**
   - Agregado campo `ProductoStock` (int?) para enviar el stock del producto asociado

2. **Backend - MappingProfile.cs**
   - Mapear `src.Producto.Stock` → `ProductoStock` en el mapping de Promocion a PromocionResponseDto

3. **Frontend - promocionesService.ts**
   - Agregado campo `productoStock` a la interfaz `Promocion`

4. **Frontend - promociones.tsx**
   - Actualizada función `isAgotada()` para verificar ambos casos:
     - Promociones independientes: usa `promo.stock`
     - Promociones asociadas a productos: usa `promo.productoStock`

## Lógica de agotamiento

```typescript
const isAgotada = (promo: Promocion): boolean => {
  if (isPromocionIndependiente(promo)) {
    return promo.stock != null && promo.stock <= 0;
  }
  return promo.productoStock != null && promo.productoStock <= 0;
};
```

## Cómo probarlo

1. Crear una promoción asociada a un producto existente
2. Reducir el stock del producto a 0 (vendiendo todas las unidades)
3. Verificar que en la página de promociones:
   - El botón "Agregar al carrito" se oculta
   - Aparece el indicador "Agotado" con el mismo estilo discreto
   - El precio original sigue tachado visible
4. El polling de 10 segundos mantiene la sincronización en tiempo real

## Impacto en el sistema

- **Backend**: Cambio menor en DTO y mapping
- **Frontend**: Extensión de lógica existente (14.1)
- **Base de datos**: Sin cambios
- **Riesgo bajo**: Validación de backend protege contra condiciones de carrera
