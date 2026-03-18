# Plan: Soporte completo a promociones independientes

## Objetivo
Permitir promociones que no estén asociadas a ningún producto ("promociones independientes") para que los usuarios puedan agregarlas al carrito y comprar como un producto normal, incluyendo restricciones de stock y unidad.

## Resumen de cambios principales

### Backend
- Refactorización de entidades (`CarritoItem`, `PedidoItem`, `Promocion`) para hacer `productoId` nullable.
- Migraciones EF Core generadas y aplicadas para modificar PK/FK (`productoId`) a nullable en tablas de carrito y pedido.
- DTOs actualizados (request/response) para aceptar/promocionar items sin producto asociado.
- Refactorización de servicios (`CarritoService`, `PedidoService`) para lógica de stock, límites y validaciones sobre promociones independientes.
- AutoMapper perfil (`MappingProfile`) adaptado para mapear promociones independientes y productos asociados de manera flexible.
- Restauración automática de stock validada para promociones independientes en casos de cancelación de pedido.

### Frontend
- Tipos (types) y servicios adaptados para aceptar promociones independientes en contexto de carrito y pedido.
- Lógica de UI (botones):
    - "Agregar al carrito" disponible siempre para cualquier promoción.
    - "Ver Producto" solo aparece si la promoción está asociada a un producto (productoId presente).
- Routing corregido para el botón "Ver Producto":
    - Ahora navega correctamente a `/productos/:id`.
    - Evita rutas inexistentes y páginas en blanco.
- Validaciones de negocio aplicadas (stock, límite de unidades, compra mínima) tanto en UI como en backend.
- Pruebas manuales exitosas: backend compilado, migraciones aplicadas, servidores arriba, port 5173 liberado y frontend funcional.

### Documentación y Implicaciones
- Este cambio permite futuras promociones de servicios, combos o packs sin producto vinculado.
- Todas las reglas de negocio se mantienen consistentes para promociones independientes y asociadas.
- El resumen y análisis de errores previos (routing, botón y lógica de negocio) se solucionó y están documentados aquí.

---

## Detalles de implementación

- **Backend:**
    - Archivos modificados: `AddToCarritoRequestDto.cs`, `CarritoItem.cs`, `PedidoItem.cs`, `Promocion.cs`, servicios, MappingProfile.
    - Migración: `20260311161214_MakeProductoIdNullableInCarritoAndPedido`
    - Lógica centralizada para stock y límites de unidades por usuario.
- **Frontend:**
    - Archivos clave: `cartService.ts`, `CartContext.tsx`, `promociones.tsx`, `productDetail.tsx`, `promocionesService.ts`, `admin/promocionesAdmin.tsx`, `App.tsx`
    - Botón "Ver Producto" solo para promociones ligadas a producto.
    - Botón "Agregar al carrito" para todas promociones.
    - Corrección del routing.
- **Pruebas:**
    - Servidores arriba y funcionales post-migración.
    - Pruebas manuales de UI y backend (agregar/cancelar promociones independientes).

## Próximos pasos
- Monitorear feedback de clientes y ventas de promociones independientes.
- Revisar nuevas oportunidades para promociones sin producto para campañas futuras.

---

**Autor:** sistema autónomo (GPT-4)
**Fecha:** 11-Mar-2026
