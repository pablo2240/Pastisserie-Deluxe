# Reclamaciones (Claims)

## Evidencia técnica encontrada en el código

### Backend (.NET)

- **API Controller (`ReclamacionesController.cs`)**
  - Endpoints:
    - `POST /reclamaciones` — Crear reclamación.
    - `GET /reclamaciones/mis-reclamaciones` — Listar reclamaciones del usuario.
    - `GET /reclamaciones` — Listar todas las reclamaciones (solo admin).
    - `PUT /reclamaciones/{id}/estado` — Actualizar estado de reclamación (solo admin).
  - Autenticación y autorización (roles) activas.

- **Service (`ReclamacionService.cs`)**
  - Validaciones al crear:
    - Pedido existe.
    - Pedido pertenece al usuario.
    - Pedido no entregado.
    - Sin reclamación pendiente previa para el mismo pedido.
  - Crea entidad con estado "Pendiente".
  - Notificaciones a usuario y admin (no bloquea si falla).
  - Métodos para obtener reclamaciones (usuario, admin).
  - Permite actualización de estado (admin).

- **Entidad (`Reclamacion.cs`)**
  - Campos: Id, PedidoId, UsuarioId, Fecha, Motivo, Estado (Permite "Pendiente", "EnRevision", "Resuelta", "Rechazada").
  - Relaciones: Pedido, Usuario.

### Frontend (React)

- **Página (`reclamaciones.tsx`)**
  - Formulario para enviar reclamaciones (número de pedido, motivo).
  - Lista reclamaciones previas.
  - Visualización de estado codificada por color.
  - Validaciones de campos requeridos y longitud mínima del motivo.

- **Servicio (`reclamacionesService.ts`)**
  - Métodos:
    - Obtener reclamaciones del usuario.
    - Obtener todas las reclamaciones (admin).
    - Crear reclamación.
    - Actualizar estado (admin).

- **Admin UI**
  - Evidencia en el código (grep): interfaz para administración, listado de reclamaciones, actualización de estado.

## Clasificación técnica

- Flujo funcional completo para usuarios y administradores.
- Todas las reglas de negocio presentes.
- Sin endpoints desconectados, ni errores encontrados según evidencia.
- Notificaciones implementadas.

## Conclusión

**La funcionalidad de reclamaciones está implementada de forma completa y robusta, con reglas de negocio, UI/UX, y lógica técnica comprobada por evidencia en el código.**