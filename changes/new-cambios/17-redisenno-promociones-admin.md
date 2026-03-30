# 17 - Rediseño Visual de Promociones (Página Pública)

## Problema

La página de Promociones (`promociones.tsx`) no mantiene coherencia visual con el resto de la aplicación:

1. **Fondo:** Usa gradiente oscuro vs `bg-gray-50` del catálogo
2. **Colores:** Usa `amber-500`, `red-600` vs `#5D1919` (patisserie-red)
3. **Estilo general:** Oscuro vs estilo claro/premium del resto

## Análisis Comparativo

### Estilo Actual (promociones.tsx)
- Fondo: gradiente `from-[#1a0505] via-[#2d0a0a] to-[#1a0505]`
- Colores: `amber-500`, `red-600`
- Cards: con gradientes oscuros

### Estilo Destino (ej: catalogo.tsx)
- Fondo: `bg-gray-50`
- Color primario: `#5D1919` (patisserie-red)
- Cards: estilo limpio, blanco

## Plan de Implementación

### 1. Fondo general
- Cambiar de gradiente oscuro a `bg-gray-50 pt-24 pb-16`

### 2. Header
- Mantener fondo oscuro pero con color institucional `#5D1919`
- Actualizar badge de "Ofertas Limitadas" a `patisserie-red`

### 3. Tarjetas de promociones
- Fondo blanco limpio
- Usar `patisserie-red` para acentos
- Badge de descuento coherente

### 4. Botones
- Estilo coherente con resto de la app

### 5. Tipografía
- Usar `font-serif font-black`

## Tareas

1. ✅ Actualizar fondo general
2. ✅ Rediseñar header
3. ✅ Rediseñar tarjetas
4. ✅ Actualizar botones y badges
5. ✅ Ajustar página de invitado/no autenticado
6. ✅ Ajustar loader de carga
7. ⬜ Verificar que funcione
