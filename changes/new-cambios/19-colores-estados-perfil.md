# 19 - Fix: Colores de Estados EnProceso y Cancelado en Perfil

## Problema

Los estados "EnProceso" y "Cancelado" no tenían colores diferenciados en la vista del perfil del usuario:
- EnProceso aparecía con color indigo
- Cancelado aparecía con color gris

## Solución

Se agregaron los colores correspondientes en `perfil.tsx`:

- **EnProceso**: `bg-yellow-100 text-yellow-700` (amarillo)
- **Cancelado**: `bg-red-100 text-red-700` (rojo)

## Archivo modificado

- `pastisserie-front/src/pages/perfil.tsx`

## Tareas

1. ✅ Fix de colores en getStatusColor
2. ✅ Commit y push
