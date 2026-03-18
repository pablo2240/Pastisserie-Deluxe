# Notificaciones (Notifications)

## Evidencia técnica encontrada en el código

### Backend (.NET)

- **API Controller (`NotificacionesController.cs`)**
  - Endpoints:
    - `GET /notificaciones` — Consultar notificaciones del usuario.
    - `PUT /notificaciones/{id}/leer` — Marcar notificación individual como leída.
    - `PUT /notificaciones/leer-todas` — Marcar todas las notificaciones como leídas.
  - Requiere autenticación.

- **Service (`NotificacionService.cs`)**
  - Obtención de notificaciones: ordenadas y mapeadas.
  - Marcado como leída (individual/todas).
  - Creación de notificaciones (título, mensaje, tipo, enlace), usado por flujos de negocio como pedidos y reclamaciones.
  - Entidad: UsuarioId, Titulo, Mensaje, Tipo, Enlace, Leida, FechaCreacion.

### Frontend (React)

- **Componente (`Notificaciones.tsx`)**
  - Consulta periódica (cada 12s) de notificaciones del usuario.
  - Lista con iconos/color según tipo y estado.
  - Permite marcar individuales/todas como leídas.
  - Badge de cantidad no leídas.
  - UX robusta: dropdown, click fuera, accesibilidad.

- **Servicio (`notificacionService.ts`)**
  - Métodos:
    - Obtener notificaciones.
    - Marcar individual/todas como leídas.
    - Estructura compatible con backend.

## Flujo y reglas técnicas

- Eventos de negocio (operaciones de pedidos/reclamaciones/pagos) generan notificaciones.
- El backend expone endpoints para la consulta y actualización del estado de notificaciones.
- El frontend sincroniza y muestra los datos, permitiendo al usuario interactuar.
- No hay evidencia de endpoints desconectados o lógica incompleta.

## Clasificación técnica

- Flujo funcional completo para notificaciones.
- Todas las reglas técnicas cubiertas.
- Sin errores ni desconexiones hallados.

## Conclusión

**La funcionalidad de notificaciones está implementada de forma completa y robusta, cubriendo todos los flujos esperados y la interacción de usuario/admin.**