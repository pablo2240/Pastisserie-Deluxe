# 14 - Gestión de Inventario para Promociones Agotadas

## Problema resuelto

Cuando el stock disponible de una promoción independiente llega a cero, el sistema debe:
- Ocultar automáticamente el botón "Agregar al carrito"
- Mostrar un indicador visual de texto "Agotado" en tamaño reducido y estilo discreto
- Mantener visible la información del producto y su precio original tachado
- Sincronizar la actualización del inventario en tiempo real mediante polling

## Archivos modificados

- `pastisserie-front/src/pages/promociones.tsx`

## Cambios implementados

1. **Polling de stock (10 segundos)**: Se agregó un intervalo de actualización cada 10 segundos para obtener el stock más reciente del servidor y detectar agotamiento inmediato.

2. **Lógica de agotamiento para promociones independientes**:
   - Función `isPromocionIndependiente()`: Determina si la promoción no tiene producto asociado
   - Función `isAgotada()`: Retorna true solo para promociones independientes con stock <= 0

3. **UI de indicador "Agotado"**:
   - Reemplaza el botón "Agregar al carrito" por un texto "Agotado" discreto
   - Estilo: `text-gray-400 text-xs font-medium px-3 py-2 bg-gray-100 rounded-lg`
   - Posicionado donde estaba el botón de compra

4. **Precio tachado**: Ya estaba implementado - el precio original se muestra tachado cuando hay precioFinal.

## Cómo probarlo

1. Iniciar sesión en la aplicación
2. Crear una promoción independiente con stock = 1
3. Agregar la promoción al carrito (reduce stock a 0)
4. Refrescar la página de promociones
5. Verificar que:
   - El botón "Agregar al carrito" desaparece
   - Aparece el indicador "Agotado" en su lugar
   - El precio original sigue tachado
   - El polling actualiza el estado sin necesidad de refrescar

## Impacto en el sistema

- **Backend**: No requiere cambios (ya validaba stock en `CarritoService`)
- **Frontend**: Solo afecta a la página de promociones
- **Base de datos**: Sin cambios
- **Riesgo bajo**: Validación de backend protege contra condiciones de carrera

## Transición inmediata

El polling de 10 segundos asegura que:
- Cuando un usuario compra el último unidades, otros usuarios ven "Agotado" en máximo 10 segundos
- La transición es sincronizada con la actualización del inventario en tiempo real
