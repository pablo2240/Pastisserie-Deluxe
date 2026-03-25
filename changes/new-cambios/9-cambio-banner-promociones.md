# 9 - Cambio de banner en página de promociones

## ¿Qué se implementó?
Se reemplazó el banner de "¿Tienes un evento especial?" por un banner de promoción con información de límite de compra.

## Archivos modificados
- `pastisserie-front/src/pages/promociones.tsx` (líneas 145-157)

## Problema resuelto
El banner anterior promovía cotizaciones de eventos. Se cambió para informar sobre la promoción actual con límite de 3 productos.

## Cambio realizado
| Campo | Valor anterior | Valor nuevo |
|-------|----------------|-------------|
| Título | "¿Tienes un evento especial?" | "¡Gran Promoción!" |
| Descripción | "Cotiza mesas de dulces y pasteles personalizados con descuento por volumen." | "Aprovecha esta oferta especial. Máximo 3 productos por promoción." |
| Enlace | "Cotizar Evento" -> /contacto | Eliminado |

## Cómo probarlo
1. Iniciar el servidor de desarrollo: `npm run dev`
2. Navegar a la página de promociones
3. Verificar que el nuevo banner se muestra correctamente

## Impacto en el sistema
- **Frontend**: Cambio visual en la página de promociones
- **Backend**: Sin impacto
- **Base de datos**: Sin impacto
