# 10 - Ocultar/Mostrar botón Proceder al Pago según compra mínima

## ¿Qué se implementó?
Se modificó la lógica de visibilidad del botón "Proceder al Pago" en el carrito de compras para que:
- Se oculte cuando el total no alcance la compra mínima
- Se muestre cuando el total alcance o supere la compra mínima

## Archivos modificados
- `pastisserie-front/src/pages/carrito.tsx` (líneas 167-203)

## Problema resuelto
Antes: El botón "Proceder al Pago" siempre era visible aunque el usuario no alcanzara la compra mínima.

Ahora:
| Condición | Elemento mostrado |
|-----------|------------------|
| `totalCalculado < compraMinima` | Solo advertencia de compra mínima |
| `totalCalculado >= compraMinima` | Botón "Proceder al Pago" + estado de tienda |

## Cómo probarlo
1. Iniciar el servidor de desarrollo: `npm run dev`
2. Agregar productos al carrito sin alcanzar la compra mínima
3. Verificar que solo aparece la advertencia (sin botón)
4. Agregar más productos hasta superar la compra mínima
5. Verificar que el botón "Proceder al Pago" aparece automáticamente

## Impacto en el sistema
- **Frontend**: Cambio en visibilidad dinámica del botón
- **Backend**: Sin impacto
- **Base de datos**: Sin impacto
