# Eliminación de Botón Eliminar Usuario en Panel Admin

## Fecha: 30 Mar 2026

## Resumen

Se eliminó la funcionalidad y botón de "Eliminar Usuario" del panel de gestión de usuarios del administrador. El admin ahora solo puede activar/desactivar usuarios (soft delete), pero no eliminarlos permanentemente.

---

## Cambios Realizados

### Archivo modificado

**`pastisserie-front/src/pages/admin/usuariosAdmin.tsx`**

### Elementos eliminados

1. **Función eliminada:**
   - `handleDeleteUser(id, nombre)` - función que realizaba la llamada DELETE al backend

2. **Import eliminado:**
   - `Trash2` de `lucide-react`

3. **UI eliminada:**
   - Botón de Trash2 en la columna "Seguridad" de la tabla de usuarios

### Resultado

- El panel de usuarios ahora solo muestra el botón de activar/desactivar (escudo)
- Ya no existe la opción de eliminación permanente de usuarios
- La funcionalidad DELETE del backend (`/users/{id}`) nunca estuvo implementada, por lo que el botón llamaba a un endpoint inexistente

---

## Build Result

- Frontend: ✅ Lint verificado (errores preexistentes, no introducidos por este cambio)
- Archivo modificado: ✅ Sin referencias a la función eliminada
