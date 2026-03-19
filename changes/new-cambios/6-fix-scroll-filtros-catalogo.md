# Fix: Scroll automático en filtros de categorías

## Problema
En el archivo `pastisserie-front/src/pages/catalogo.tsx`, línea 148, había una clase CSS `transition-all duration-500 blur-0 scale-100` que causaba que cuando el usuario seleccionaba un filtro de categoría, la página se reposicionaba automáticamente hacia abajo.

## Causa
La transición CSS `transition-all` aplicada durante 500ms causaba que el navegador reposicionara el scroll cuando el contenido cambiaba significativamente (ej: al filtrar de 30 a 5 productos).

## Solución
Se cambió la clase de transición problemática:
- **Antes:** `className="transition-all duration-500 blur-0 scale-100"`
- **Después:** `className="transition-opacity duration-300"`

Esto elimina las transiciones de `blur` y `scale` que causaban el reposicionamiento del scroll, manteniendo solo una transición suave de opacidad que no afecta el layout.

## Verificación
- Build exitoso sin errores: `npm run build` completado con código de salida 0
- La funcionalidad de los filtros se mantiene intacta
- El comportamiento visual sigue siendo atractivo sin causar saltos de scroll

## Fecha
2026-03-19
