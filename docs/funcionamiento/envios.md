# Funcionamiento real: Envíos

## Flujos principales
- Gestión de envíos de pedidos.
- Estados: Pendiente, Asignado, EnCamino, Entregado, Fallido, Devuelto.
- Exclusivo para admins (según roles).
- Relación con pedido, usuario y repartidor.

## Evidencia de código (end-to-end)
- **Frontend:**
  - Página de checkout (`checkout.tsx`) recoge dirección, comuna, teléfono, notas y envía a backend.
  - Servicio `enviosService.ts` (admin): obtener, actualizar, consultar envíos.
- **Backend:**
  - `EnviosController.cs`: Endpoints GET (listado, detalle), PUT (actualización de estado). Acceso admin.
  - `EnvioService.cs`: obtención, mapeo, actualización de estado, conexión con pedido, usuario, repartidor, fechas.
  - `EnvioRepository.cs`: métodos por repartidor, estado, pedido; relaciones en joins.
- **DB:**
  - `Envio.cs`: relaciones, campos clave, estados validados.
  - Migraciones con comuna, fechas, relaciones, estado.
  - Enums de estado (`EstadoEnvio.cs`): Pendiente, Asignado, EnCamino, Entregado, Fallido, Devuelto.

## Validaciones y reglas técnicas
- Validación de campos de envío (frontend y backend).
- Control estricto de roles (admin).
- Actualización/registro de estado y fecha según acciones.
- Flujo reactivo de feedback frontend/backend.

## Estado
- El flujo está **100% funcional y conectado**.
- No se detectan endpoints rotos, errores ni desconexión de entidades.
- Implementación UI → API → Servicio → BD end-to-end comprobada en código.

## Archivos clave
- Frontend: checkout.tsx, enviosService.ts
- Backend: EnviosController.cs, EnvioService.cs, EnvioRepository.cs, DireccionEnvio.cs, EstadoEnvio.cs
- DB: Envio.cs

**Clasificación:** Funcional, flujo completo comprobado en código.