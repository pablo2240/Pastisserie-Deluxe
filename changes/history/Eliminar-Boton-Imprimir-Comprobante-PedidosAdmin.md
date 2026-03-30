# Eliminación de Botón Imprimir Comprobante en Detalles de Pedido

## Fecha: 30 Mar 2026

## Resumen

Se eliminó el botón "Imprimir Comprobante" del modal de detalles de pedido en el panel de administración. Ahora solo queda el botón "Cerrar".

---

## Cambios Realizados

### Archivo modificado

**`pastisserie-front/src/pages/admin/adminOrders.tsx`**

### Elementos eliminados

1. **Botón eliminado:**
   - "Imprimir Comprobante" que llamaba a `window.print()`
   - La funcionalidad simplemente invocaba el print nativo del navegador

2. **UI actualizada:**
   - Se eliminó el `gap-3` del contenedor ya que solo queda un botón

### Resultado

- El modal de detalles de pedido ahora solo tiene el botón "Cerrar"
- Ya no es posible imprimir el comprobante desde el modal

---

## Build Result

- Frontend: ✅ Lint verificado (errores preexistentes, no introducidos por este cambio)
- Archivo modificado: ✅ Sin referencias a "Imprimir" o "print"
