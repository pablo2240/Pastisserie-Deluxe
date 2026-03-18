# Reseñas (Reviews)

## Evidencia técnica encontrada en el código

### Backend (.NET)

- **API Controller (`ReviewsController.cs`)**
  - Endpoints:
    - `GET /Reviews/producto/{productId}` — Listar reseñas de producto.
    - `GET /Reviews/producto/{productId}/mi-resena` — Consultar reseña del usuario.
    - `GET /Reviews` — Reseñas destacadas.
    - `POST /Reviews` — Crear reseña (requiere autenticación).
    - `PUT /Reviews/{id}` — Editar reseña (requiere autenticación).
    - `GET /Reviews/pendientes` — Listar reseñas pendientes para moderación (solo admin).
    - `PUT /Reviews/{id}/aprobar` — Aprobar reseña (solo admin).
    - `DELETE /Reviews/{id}` — Eliminar reseña (solo admin).

- **Service (`ReviewService.cs`)**
  - Lógica:
    - Listar por producto, destacadas, pendientes.
    - Crear: verifica si el usuario ya tiene reseña para el producto.
    - Editar: solo propietario (usuario), pone estado "Aprobada = false" tras edición (requiere nueva aprobación admin).
    - Admin: aprobar o eliminar reseñas.

- **Validadores**
  - Valida calificación entre 1–5.

### Frontend (React)

- **Componente (`ProductReviews.tsx`)**
  - Lista y permite crear/editar reseñas vinculadas al producto.
  - Valida usuario autenticado.
  - Visualiza calificación (estrellas) y comentarios.

- **Admin UI (`admin/resenasAdmin.tsx`)**
  - Listado, filtrado, aprobación y eliminación de reseñas.
  - Permite ver estado (pendiente/aprobada).
  - Auditoría para control de calidad.

- **Servicio (`reviewService.ts`)**
  - Llama endpoints: listar, crear, editar, destacar, aprobar y eliminar reseñas.
  - Interface Review: id, productoId, usuarioId, usuarioNombre, calificacion, comentario, fecha, aprobada.

## Flujo y reglas técnicas

- Usuario sólo puede tener una reseña por producto.
- Puede editar su reseña (requiere moderación posterior).
- Admin debe aprobar para que sea visible/publicada.
- Listado en UI de producto, home y panel admin.
- Validación de calificación.

## Clasificación técnica

- Flujo funcional completo para usuario y admin.
- Reglas de negocio presentes y bien conectadas.
- Sin evidencia de endpoints rotos ni lógica desconectada.
- Moderación de reseñas está implementada.

## Conclusión

**La funcionalidad de reseñas y calificaciones está implementada de forma completa y robusta, cubriendo todos los flujos esperados y reglas de negocio estrictamente evidenciadas en el código.**