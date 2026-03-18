# Desconexiones — Auditoría Técnica

---

## Backend — Desconexión de entidades y flujos
- Algunos métodos en CarritoService, PedidoService y ReviewService retornan null o catch vacío, generando desconexiones lógicas cuando el frontend espera una respuesta válida.
- En servicios de pagos (EpaycoService), si falta configuración, la falla es abrupta y desconectada del resto del flujo.
- Comentarios “avísame si da error” y lógica fragmentada señalada en UnitOfWork, PedidoRepository y ReviewService indican potenciales desconexiones en refactorizaciones o evoluciones.

## Frontend — Desconexión de UI/backend
- Uso de catch vacío, console.error y toast sin recuperación en CartContext, ReviewService, checkout.tsx y admin/Configuracion.tsx generan desconexión de feedback real con la lógica backend.
- Flujos de pago y configuración administran solo errores visuales, dejando desconexión entre la UI y la lógica real del backend ante errores críticos.
- Uso incorrecto de context/provider (CartContext, perfil.tsx), provoca pantallas blancas o falta de datos sin conexión al backend.

## Base de datos
- OnDelete(NoAction) evita errores SQL pero pueden dejar entidades huérfanas, desconectadas del resto de las tablas.

## Desconexión en reporting y notificaciones
- Reportes y notificaciones, ante errores de integración, sólo muestran logs y mensajes al usuario sin conexión real con soluciones automáticas.

---

### Recomendaciones
- Validar y sincronizar flujos en frontend/backend.
- Implementar fallback, logs centralizados y reporting en errores críticos.
- Revisar y corregir retornos nulos o catch vacío en operaciones que deberían tener integración completa.
