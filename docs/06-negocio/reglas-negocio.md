# Reglas de Negocio - PastisserieDeluxe

**Proyecto**: PASTISSERIE'S DELUXE  
**Código**: SENA Ficha 3035528  
**Versión**: 2.0  
**Fecha**: 03/04/2026  
**Estado**: 85-90% FUNCIONAL

---

## 1. Introducción

Este documento establece las **Reglas de Negocio** del sistema PastisserieDeluxe. Las reglas de negocio definen cómo el sistema debe comportarse en situaciones específicas del dominio del negocio, complementando los requisitos funcionales documentados en `especificacion-requisitos.md`.

---

## 2. Módulo: Autenticación y Usuarios

### RN-001: Registro de Usuarios

| Regla | Descripción |
|-------|-------------|
| RN-001.1 | El email debe ser único en todo el sistema |
| RN-001.2 | La contraseña debe tener mínimo 6 caracteres |
| RN-001.3 | Al registrarse, el usuario recibe el rol "Usuario" por defecto |
| RN-001.4 | El teléfono es opcional pero se valida si se ingresa (formato básico) |
| RN-001.5 | Las contraseñas se almacenan con hash BCrypt (cost factor 11) |

**Validaciones**:
```
- Email: formato válido (contiene @ y dominio)
- Nombre: mínimo 2 caracteres, máximo 100
- Contraseña: mínimo 6 caracteres
- Teléfono: opcional, máximo 20 caracteres
```

### RN-002: Inicio de Sesión

| Regla | Descripción |
|-------|-------------|
| RN-002.1 | El sistema genera un token JWT válido por 24 horas |
| RN-002.2 | Si las credenciales son incorrectas, se muestra mensaje genérico "Email o contraseña incorrectos" |
| RN-002.3 | Si la cuenta está inactiva (Activo = false), no puede iniciar sesión |
| RN-002.4 | El token JWT contiene: UserId, Email, Rol como claims |

**Expiración del Token**:
- Duración: 1440 minutos (24 horas)
- Al expirar, el usuario debe iniciar sesión nuevamente

### RN-002: Recuperación de Contraseña

| Regla | Descripción |
|-------|-------------|
| RN-002.5 | El sistema envía un email con enlace de recuperación |
| RN-002.6 | El enlace de recuperación expira en 1 hora |
| RN-002.7 | El token de recuperación es de un solo uso |
| RN-002.8 | Al cambiar la contraseña, se invalidan todas las sesiones anteriores |

---

## 3. Módulo: Catálogo de Productos

### RN-003: Gestión de Productos

| Regla | Descripción |
|-------|-------------|
| RN-003.1 | Solo los productos con `Activo = true` aparecen en el catálogo público |
| RN-003.2 | Un producto con `StockIlimitado = true` no valida stock al agregar al carrito |
| RN-003.3 | Un producto sin stock (Stock = 0 Y StockIlimitado = false) NO aparece en el catálogo |
| RN-003.4 | Los productos pueden tener una categoría (FK a CategoriaProducto) |
| RN-003.5 | Al eliminar un producto, se hace soft-delete (Activo = false) |
| RN-003.6 | Las imágenes se almacenan en Azure Blob Storage |

**Estados del Producto**:
| Estado | Condición | Visible en Catálogo |
|--------|-----------|---------------------|
| Activo con stock | Activo = true AND (Stock > 0 OR StockIlimitado = true) | ✅ Sí |
| Activo sin stock | Activo = true AND Stock = 0 AND StockIlimitado = false | ❌ No |
| Inactivo | Activo = false | ❌ No |

### RN-004: Categorías de Productos

| Regla | Descripción |
|-------|-------------|
| RN-004.1 | Las categorías tienen nombre único |
| RN-004.2 | Una categoría puede estar activa o inactiva |
| RN-004.3 | Un producto puede belongecer a una categoría (nullable) |
| RN-004.4 | Al eliminar una categoría, los productos asociados quedan con CategoriaId = null |

---

## 4. Módulo: Carrito de Compras

### RN-005: Gestión del Carrito

| Regla | Descripción |
|-------|-------------|
| RN-005.1 | Cada usuario tiene un único CarritoCompra (relación 1:1) |
| RN-005.2 | Un CarritoItem debe tener ProductoId O PromocionId, nunca ambos |
| RN-005.3 | El precio unitario se guarda como snapshot al agregar (no se actualiza si cambia el precio del producto) |
| RN-005.4 | La cantidad mínima por item es 1 |
| RN-005.5 | La cantidad máxima por item es 99 |
| RN-005.6 | Al actualizar cantidad, se valida que no exceda el stock disponible |

**Validaciones de Stock al Agregar**:
```
SI Producto.StockIlimitado = true
    → Permitir agregar (sin límite)
SINO
    SI CarritoItem.Cantidad + cantidadSolicitada > Producto.Stock
        → Rechazar con error "Stock insuficiente"
    SINO
        → Permitir agregar
```

---

## 5. Módulo: Pedidos y Checkout

### RN-006: Creación de Pedidos

| Regla | Descripción |
|-------|-------------|
| RN-006.1 | El pedido mínimo es de 15.000 COP (configurable en ConfiguracionTienda) |
| RN-006.2 | Solo se pueden crear pedidos si la tienda está abierta |
| RN-006.3 | Solo se aceptan comunas: "Guayabal" y "Belén" |
| RN-006.4 | El costo de envío para Guayabal es 5.000 COP |
| RN-006.5 | El costo de envío para Belén es 6.000 COP |
| RN-006.6 | El stock NO se descuenta al crear el pedido (solo al confirmar pago) |
| RN-006.7 | El estado inicial de un pedido es "Pendiente" |

**Fórmula de Total**:
```
Total = Subtotal + CostoEnvio
Subtotal = Σ(PrecioUnitario × Cantidad) de cada item
```

### RN-007: Estados del Pedido

| Estado | Descripción | Transiciones válidas |
|--------|-------------|----------------------|
| Pendiente | Esperando pago | → Confirmado, → Cancelado |
| Espera | Usuario en página de pago | → Confirmado, → Fallido |
| Confirmado | Pago exitoso | → EnProceso, → Cancelado |
| EnProceso | Preparando pedido | → Listo |
| Listo | Listo para entrega | → EnCamino |
| EnCamino | En ruta de entrega | → Entregado, → NoEntregado |
| Entregado | Entrega exitosa | (Estado final) |
| NoEntregado | No se pudo entregar | (Estado final) |
| Cancelado | Cancelado por cliente/admin | (Estado final) |

### RN-008: Cancelación de Pedidos

| Regla | Descripción |
|-------|-------------|
| RN-008.1 | Solo se puede cancelar si el estado es "Pendiente" o "Confirmado" |
| RN-008.2 | Al cancelar un pedido "Confirmado", se restaura el stock |
| RN-008.3 | Al cancelar, se crea registro en PedidoHistorial |
| RN-008.4 | El cliente solo puede cancelar sus propios pedidos |

---

## 6. Módulo: Pagos

### RN-009: Sistema de Pago (Simulado)

| Regla | Descripción |
|-------|-------------|
| RN-009.1 | El número de tarjeta debe tener exactamente 16 dígitos numéricos |
| RN-009.2 | El CVV debe tener exactamente 3 dígitos numéricos |
| RN-009.3 | La fecha de expiración debe ser futura (MM/YY) |
| RN-009.4 | El nombre del titular debe tener al menos 3 caracteres |
| RN-009.5 | El sistema acepta cualquier tarjeta con formato válido (simulación) |
| RN-009.6 | Al confirmar pago exitoso: |
| | - Descontar stock de productos (excepto StockIlimitado = true) |
| | - Cambiar estado del pedido a "Confirmado" |
| | - Vaciar el carrito del usuario |
| | - Crear notificación para el cliente |

**Métodos de Pago Soportados**:
| Método | Descripción |
|--------|-------------|
| Tarjeta | Pago con tarjeta de crédito/débito (simulado) |
| Efectivo | Pago en efectivo al delivery |
| Nequi | Pago mediante Nequi (simulado) |

---

## 7. Módulo: Promociones

### RN-010: Gestión de Promociones

| Regla | Descripción |
|-------|-------------|
| RN-010.1 | Las promociones pueden ser vinculadas a un producto o independientes |
| RN-010.2 | Las promociones vinculadas usan el stock del producto original |
| RN-010.3 | Las promociones independientes tienen stock propio |
| RN-010.4 | Solo se muestran promociones vigentes (FechaInicio <= Now <= FechaFin) |
| RN-010.5 | El tipo de descuento puede ser "Porcentaje" o "MontoFijo" |
| RN-010.6 | Si el descuento es porcentaje, debe estar entre 1 y 100 |

**Cálculo de Precio con Descuento**:
```
SI TipoDescuento = "Porcentaje"
    PrecioFinal = PrecioOriginal × (1 - Descuento/100)
SINO (MontoFijo)
    PrecioFinal = PrecioOriginal - Descuento
```

---

## 8. Módulo: Reseñas (Reviews)

### RN-011: Sistema de Reseñas

| Regla | Descripción |
|-------|-------------|
| RN-011.1 | Solo usuarios que han comprado el producto pueden reseñarlo |
| RN-011.2 | Cada usuario puede hacer una sola reseña por producto |
| RN-011.3 | Las reseñas se crean con `Aprobada = false` (requieren moderación) |
| RN-011.4 | Solo el Admin puede aprobar o rechazar reseñas |
| RN-011.5 | Las reseñas no aprobadas no aparecen en el catálogo |
| RN-011.6 | El promedio de calificación se calcula con las reseñas aprobadas |

**Validación para Crear Reseña**:
```
1. Verificar que el usuario tenga un PedidoItem con ese ProductoId
2. Verificar que el Pedido tenga Aprobado = true
3. Verificar que NO exista una reseña previa del mismo usuario para el mismo producto
4. Si todo válido → Crear reseña (Aprobada = false)
```

---

## 9. Módulo: Reclamaciones

### RN-012: Gestión de Reclamaciones

| Regla | Descripción |
|-------|-------------|
| RN-012.1 | El número de ticket se genera automáticamente (formato: REC-XXXXXX) |
| RN-012.2 | Las reclamaciones pueden estar asociadas a un pedido o ser generales |
| RN-012.3 | Estados: Pendiente → EnRevision → Resuelta / Rechazada |
| RN-012.4 | Al resolver, el Admin debe proporcionar una respuesta |
| RN-012.5 | Se envía notificación al cliente cuando cambia el estado |

**Estados de Reclamación**:
| Estado | Descripción |
|--------|-------------|
| Pendiente | Recién creada, esperando revisión |
| EnRevision | Admin está analizando |
| Resuelta | Problema solucionado (con respuesta) |
| Rechazada | Reclamación no procede (con justificación) |

---

## 10. Módulo: Configuración de Tienda

### RN-013: Horario y Disponibilidad

| Regla | Descripción |
|-------|-------------|
| RN-013.1 | Si `SistemaActivoManual = false`, la tienda está cerrada (independiente del horario) |
| RN-013.2 | Si `UsarControlHorario = false`, la tienda está siempre abierta |
| RN-013.3 | Si `UsarControlHorario = true`, se valida contra HorarioDia |
| RN-013.4 | Cada día de la semana puede tener horario diferente |
| RN-013.5 | Si un día está marcado como Cerrado, la tienda no abre ese día |
| RN-013.6 | El checkout solo permite crear pedidos si la tienda está abierta |

**Validación de Tienda Abierta**:
```
1. Si SistemaActivoManual = false → CERRADA
2. Si UsarControlHorario = false → ABIERTA
3. Obtener día actual (Lunes, Martes, etc.)
4. Buscar en HorarioDia para ese día
5. Si no existe o Cerrado = true → CERRADA
6. Si existe y Cerrado = false:
   - Si hora actual entre HoraApertura y HoraCierre → ABIERTA
   - SINO → CERRADA
```

---

## 11. Módulo: Notificaciones

### RN-014: Sistema de Notificaciones

| Regla | Descripción |
|-------|-------------|
| RN-014.1 | Las notificaciones se crean automáticamente al cambiar estado de pedido |
| RN-014.2 | Las notificaciones pueden estar asociadas a un enlace (ruta) |
| RN-014.3 | El usuario puede marcar notificaciones como leídas |
| RN-014.4 | Las notificaciones no leídas muestran badge en el navbar |
| RN-014.5 | Las notificaciones se ordenan por FechaCreacion DESC |

**Tipos de Notificación**:
| Tipo | Descripción |
|------|-------------|
| Pedido | Cambios de estado, asignaciones |
| Promocion | Nuevas promociones destacadas |
| Sistema | Actualizaciones, mantenimiento |
| Repartidor | Pedidos asignados |

---

## 12. Módulo: Roles y Permisos

### RN-015: Sistema de Roles

| Regla | Descripción |
|-------|-------------|
| RN-015.1 | Los roles del sistema son: Admin, Usuario, Repartidor |
| RN-015.2 | Un usuario puede tener múltiples roles |
| RN-015.3 | Los permisos se gestionan mediante atributos [Authorize] |
| RN-015.4 | El Admin tiene acceso completo a todos los endpoints |
| RN-015.5 | El Repartidor solo ve pedidos asignados |
| RN-015.6 | El Usuario solo ve sus propios datos |

---

## 13. Resumen de Validaciones Críticas

| Módulo | Validación Crítica | Acción si Falla |
|--------|-------------------|------------------|
| Autenticación | Email único | Error "El email ya está registrado" |
| Carrito | Stock disponible | Error "Stock insuficiente" |
| Checkout | Compra mínima 15k | Error "El pedido mínimo es de 15.000 COP" |
| Checkout | Tienda abierta | Error "La tienda está cerrada" |
| Checkout | Comuna válida | Error "Comuna no válida para delivery" |
| Pagos | Formato tarjeta | Error "Datos de tarjeta inválidos" |
| Pagos | Pago exitoso | Actualizar pedido, descontar stock, vaciar carrito |
| Reseñas | Usuario comprador | Error "Debes comprar el producto para reseñarlo" |
| Reseñas | Una sola reseña | Error "Ya has reseñado este producto" |

---

## 14. Anexos

### 14.1 Tablas Involucradas en las Reglas

| Regla | Entidades Involucradas |
|-------|------------------------|
| RN-001 a RN-002 | User, UserRol, Rol |
| RN-003 a RN-004 | Producto, CategoriaProducto |
| RN-005 | CarritoCompra, CarritoItem |
| RN-006 a RN-008 | Pedido, PedidoItem, PedidoHistorial, DireccionEnvio |
| RN-009 | RegistroPago |
| RN-010 | Promocion, Producto |
| RN-011 | Review, Producto, PedidoItem |
| RN-012 | Reclamacion, Pedido, Notificacion |
| RN-013 | ConfiguracionTienda, HorarioDia |
| RN-014 | Notificacion |
| RN-015 | User, UserRol, Rol |

---

*Documento generado el 03/04/2026 como parte del proyecto PastisserieDeluxe - SENA Ficha 3035528*