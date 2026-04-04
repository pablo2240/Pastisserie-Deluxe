# Especificación de Requisitos - PastisserieDeluxe

**Proyecto**: PASTISSERIE'S DELUXE  
**Código**: SENA Ficha 3035528  
**Versión**: 2.0  
**Fecha**: 03/04/2026  
**Estado**: 85-90% FUNCIONAL

---

## 1. Resumen del Proyecto

### 1.1 Descripción General

**PastisserieDeluxe** es una plataforma de e-commerce especializada en la venta de productos de repostería artesanal. El sistema permite a los clientes explorar un catálogo de productos, gestionar su carrito de compras, realizar pedidos con múltiples opciones de pago simulado, y recibir notificaciones sobre el estado de sus pedidos.

### 1.2 Alcance del Sistema

| Tipo | Descripción |
|------|-------------|
| **Backend** | ASP.NET Core 8.0 con Clean Architecture |
| **Frontend** | React 19 + TypeScript + Vite + Tailwind CSS v4 |
| **Base de Datos** | SQL Server 2022 con Entity Framework Core 8.0 |
| **Despliegue** | Azure App Service (frontend estático) + Azure SQL |
| **Almacenamiento** | Azure Blob Storage para imágenes |

---

## 2. Requisitos Funcionales (RF)

### RF-01: Gestión de Usuarios y Autenticación

| ID | Requisito | Prioridad | Estado |
|----|-----------|----------|--------|
| RF-01.01 | El sistema debe permitir el registro de nuevos usuarios con nombre, email, contraseña y teléfono | Alta | ✅ |
| RF-01.02 | El sistema debe permitir el inicio de sesión mediante email y contraseña | Alta | ✅ |
| RF-01.03 | El sistema debe generar un token JWT válido por 24 horas tras login exitoso | Alta | ✅ |
| RF-01.04 | El sistema debe permitir la recuperación de contraseña mediante email | Media | ✅ |
| RF-01.05 | El sistema debe permitir al usuario actualizar su perfil (nombre, teléfono) | Alta | ✅ |
| RF-01.06 | El sistema debe permitir cambiar la contraseña con validación de contraseña actual | Media | ✅ |
| RF-01.07 | El sistema debe soportar 3 roles: Admin, Usuario, Repartidor | Alta | ✅ |

### RF-02: Catálogo de Productos

| ID | Requisito | Prioridad | Estado |
|----|-----------|----------|--------|
| RF-02.01 | El sistema debe mostrar un catálogo de productos activos con imagen, nombre, precio y stock | Alta | ✅ |
| RF-02.02 | El sistema debe permitir filtrar productos por categoría | Alta | ✅ |
| RF-02.03 | El sistema debe permitir buscar productos por nombre o descripción | Alta | ✅ |
| RF-02.04 | El sistema debe mostrar el detalle de un producto con todas sus reseñas aprobadas | Alta | ✅ |
| RF-02.05 | El sistema debe permitir al Admin crear, editar y eliminar productos | Alta | ✅ |
| RF-02.06 | El sistema debe almacenar imágenes en Azure Blob Storage | Alta | ✅ |
| RF-02.07 | El sistema debe soportar productos con stock ilimitado (StockIlimitado = true) | Alta | ✅ |

### RF-03: Gestión de Categorías

| ID | Requisito | Prioridad | Estado |
|----|-----------|----------|--------|
| RF-03.01 | El sistema debe permitir crear categorías de productos | Alta | ✅ |
| RF-03.02 | El sistema debe permitir asignar categorías a productos (FK CategoriaProductoId) | Alta | ✅ |
| RF-03.03 | El sistema debe permitir editar y eliminar categorías | Alta | ✅ |

### RF-04: Carrito de Compras

| ID | Requisito | Prioridad | Estado |
|----|-----------|----------|--------|
| RF-04.01 | El sistema debe permitir agregar productos al carrito con cantidad | Alta | ✅ |
| RF-04.02 | El sistema debe permitir actualizar la cantidad de items en el carrito | Alta | ✅ |
| RF-04.03 | El sistema debe permitir eliminar items individuales del carrito | Alta | ✅ |
| RF-04.04 | El sistema debe permitir vaciar el carrito completo | Alta | ✅ |
| RF-04.05 | El sistema debe mostrar un sidebar flotante con resumen del carrito | Alta | ✅ |
| RF-04.06 | El sistema debe persistir el carrito en la base de datos por usuario | Alta | ✅ |

### RF-05: Proceso de Checkout y Pedidos

| ID | Requisito | Prioridad | Estado |
|----|-----------|----------|--------|
| RF-05.01 | El sistema debe permitir crear un pedido desde el carrito | Alta | ✅ |
| RF-05.02 | El sistema debe validar la compra mínima de 15.000 COP | Alta | ✅ |
| RF-05.03 | El sistema debe validar que la tienda esté abierta antes de crear pedido | Alta | ✅ |
| RF-05.04 | El sistema debe permitir ingresar dirección de envío con GPS (Latitud/Longitud) | Alta | ✅ |
| RF-05.05 | El sistema debe calcular el costo de envío según la comuna (Guayabal: 5000, Belén: 6000) | Alta | ✅ |
| RF-05.06 | El sistema debe validar el stock antes de crear el pedido | Alta | ✅ |
| RF-05.07 | El sistema debe guardar la dirección de envío en DireccionEnvio | Alta | ✅ |
| RF-05.08 | El sistema debe permitir seleccionar método de pago simulado (Tarjeta simulada, Efectivo, Nequi simulado) | Alta | ✅ |

### RF-06: Sistema de Pago (Simulado)

| ID | Requisito | Prioridad | Estado |
|----|-----------|----------|--------|
| RF-06.01 | El sistema debe simular el procesamiento de pago con tarjeta | Alta | ✅ |
| RF-06.02 | El sistema debe validar formato de tarjeta (16 dígitos, CVV 3 dígitos) | Alta | ✅ |
| RF-06.03 | El sistema debe descontar stock al confirmar pago exitoso | Alta | ✅ |
| RF-06.04 | El sistema debe vaciar el carrito tras pago exitoso | Alta | ✅ |
| RF-06.05 | El sistema debe registrar el intento de pago en RegistroPago | Alta | ✅ |

### RF-07: Gestión de Pedidos

| ID | Requisito | Prioridad | Estado |
|----|-----------|----------|--------|
| RF-07.01 | El sistema debe mostrar el historial de pedidos del usuario | Alta | ✅ |
| RF-07.02 | El sistema debe permitir al Admin ver todos los pedidos | Alta | ✅ |
| RF-07.03 | El sistema debe permitir cambiar el estado del pedido | Alta | ✅ |
| RF-07.04 | El sistema debe permitir asignar un repartidor a un pedido | Alta | ✅ |
| RF-07.05 | El sistema debe crear notificaciones automáticas al cambiar estado | Alta | ✅ |
| RF-07.06 | El sistema debe registrar el historial de cambios de estado | Alta | ✅ |
| RF-07.07 | El sistema debe permitir cancelar pedidos (restaurar stock) | Media | ✅ |

### RF-08: Promociones

| ID | Requisito | Prioridad | Estado |
|----|-----------|----------|--------|
| RF-08.01 | El sistema debe permitir crear promociones vinculadas a productos | Alta | ✅ |
| RF-08.02 | El sistema debe permitir crear promociones independientes | Alta | ✅ |
| RF-08.03 | El sistema debe soportar descuentos en porcentaje o monto fijo | Alta | ✅ |
| RF-08.04 | El sistema debe validar vigencia (fecha inicio/fin) | Alta | ✅ |
| RF-08.05 | El sistema debe mostrar precio tachado para productos en promoción | Alta | ✅ |

### RF-09: Sistema de Reseñas (Reviews)

| ID | Requisito | Prioridad | Estado |
|----|-----------|----------|--------|
| RF-09.01 | El sistema debe permitir a usuarios crear reseñas de productos comprados | Alta | ✅ |
| RF-09.02 | El sistema debe mostrar solo reseñas aprobadas en el catálogo | Alta | ✅ |
| RF-09.03 | El sistema debe permitir al Admin aprobar o rechazar reseñas | Alta | ✅ |
| RF-09.04 | El sistema debe calcular el promedio de calificación del producto | Alta | ✅ |
| RF-09.05 | El sistema debe evitar que un usuario reseñe el mismo producto dos veces | Alta | ✅ |

### RF-10: Reclamaciones

| ID | Requisito | Prioridad | Estado |
|----|-----------|----------|--------|
| RF-10.01 | El sistema debe permitir crear reclamaciones sobre pedidos | Alta | ✅ |
| RF-10.02 | El sistema debe generar un número de ticket único por reclamación | Alta | ✅ |
| RF-10.03 | El sistema debe permitir al Admin cambiar el estado de la reclamación | Alta | ✅ |
| RF-10.04 | El sistema debe enviar notificaciones al cliente al resolver | Alta | ✅ |

### RF-11: Notificaciones

| ID | Requisito | Prioridad | Estado |
|----|-----------|----------|--------|
| RF-11.01 | El sistema debe crear notificaciones automáticas por cambio de estado de pedido | Alta | ✅ |
| RF-11.02 | El sistema debe mostrar un indicador de notificaciones no leídas | Alta | ✅ |
| RF-11.03 | El sistema debe permitir marcar notificaciones como leídas | Alta | ✅ |
| RF-11.04 | El sistema debe permitir eliminar notificaciones | Media | ✅ |

### RF-12: Dashboard Admin

| ID | Requisito | Prioridad | Estado |
|----|-----------|----------|--------|
| RF-12.01 | El sistema debe mostrar KPIs de ventas hoy, pedidos hoy, productos bajo stock | Alta | ✅ |
| RF-12.02 | El sistema debe mostrar gráfico de ventas de los últimos 7/30 días | Alta | ✅ |
| RF-12.03 | El sistema debe mostrar los productos más vendidos | Alta | ✅ |
| RF-12.04 | El sistema debe mostrar los pedidos recientes | Alta | ✅ |

### RF-13: Configuración de Tienda

| ID | Requisito | Prioridad | Estado |
|----|-----------|----------|--------|
| RF-13.01 | El sistema debe permitir configurar horario de apertura/cierre | Alta | ✅ |
| RF-13.02 | El sistema debe permitir cerrar la tienda manualmente | Alta | ✅ |
| RF-13.03 | El sistema debe validar si la tienda está abierta antes de permitir compras | Alta | ✅ |
| RF-13.04 | El sistema debe permitir configurar costos de envío por comuna | Alta | ✅ |
| RF-13.05 | El sistema debe permitir configurar el pedido mínimo | Alta | ✅ |

### RF-14: Panel Repartidor

| ID | Requisito | Prioridad | Estado |
|----|-----------|----------|--------|
| RF-14.01 | El sistema debe mostrar los pedidos asignados al repartidor | Alta | ✅ |
| RF-14.02 | El sistema debe permitir cambiar estado a "EnCamino", "Entregado", "NoEntregado" | Alta | ✅ |
| RF-14.03 | El sistema debe mostrar la ubicación GPS de la dirección de entrega | Alta | ✅ |

---

## 3. Requisitos No Funcionales (RNF)

### RNF-01: Rendimiento

| ID | Requisito | Valor Objetivo |
|----|-----------|----------------|
| RNF-01.01 | Tiempo de respuesta del homepage | < 2 segundos |
| RNF-01.02 | Tiempo de respuesta de consultas de catálogo | < 1 segundo |
| RNF-01.03 | Tiempo de carga de imágenes | < 3 segundos |
| RNF-01.04 | Soporte concurrent users | 50 usuarios simultáneos |

### RNF-02: Seguridad

| ID | Requisito |
|----|-----------|
| RNF-02.01 | Contraseñas almacenadas con hash BCrypt |
| RNF-02.02 | Tokens JWT con expiración de 24 horas |
| RNF-02.03 | Validación de DTOs con FluentValidation |
| RNF-02.04 | Protección CORS configurada |
| RNF-02.05 | Validación de acceso a nivel de servicio (solo datos propios) |

### RNF-03: Usabilidad

| ID | Requisito |
|----|-----------|
| RNF-03.01 | Interfaz responsive (mobile, tablet, desktop) |
| RNF-03.02 | Navegación intuitiva con menú claro |
| RNF-03.03 | Mensajes de error claros y en español |
| RNF-03.04 | Feedback visual (toasts) en todas las acciones |

### RNF-04: Mantenibilidad

| ID | Requisito |
|----|-----------|
| RNF-04.01 | Arquitectura Clean Architecture (Core → Infrastructure → Services → API) |
| RNF-04.02 | Código organizado por capas |
| RNF-04.03 | Documentación actualizada (este documento) |

### RNF-05: Disponibilidad

| ID | Requisito |
|----|-----------|
| RNF-05.01 | Sistema desplegado en Azure App Service |
| RNF-05.02 | Base de datos en Azure SQL |
| RNF-05.03 | Imágenes almacenadas en Azure Blob Storage |

---

## 4. Reglas de Negocio (RN)

### RN-01: Autenticación y Usuarios

| ID | Regla |
|----|-------|
| RN-01.01 | El email debe ser único en el sistema |
| RN-01.02 | La contraseña debe tener al menos 6 caracteres |
| RN-01.03 | Un usuario puede tener múltiples roles (Admin, Usuario, Repartidor) |
| RN-01.04 | El token JWT expira en 24 horas |

### RN-02: Productos y Catálogo

| ID | Regla |
|----|-------|
| RN-02.01 | Solo productos con `Activo = true` aparecen en el catálogo público |
| RN-02.02 | Un producto con `StockIlimitado = true` no valida stock al agregar al carrito |
| RN-02.03 | Un producto sin stock (Stock = 0 y StockIlimitado = false) no aparece en catálogo |
| RN-02.04 | Cada producto puede tener una categoría (FK a CategoriaProducto) |

### RN-03: Carrito de Compras

| ID | Regla |
|----|-------|
| RN-03.01 | Un usuario tiene un solo CarritoCompra (relación 1:1) |
| RN-03.02 | Cada item del carrito debe tener ProductoId O PromocionId (no ambos) |
| RN-03.03 | El precio unitario se guarda como snapshot al agregar al carrito |

### RN-04: Pedidos

| ID | Regla |
|----|-------|
| RN-04.01 | El pedido mínimo es de 15.000 COP |
| RN-04.02 | Solo se pueden crear pedidos si la tienda está abierta |
| RN-04.03 | Solo se aceptan comunas: Guayabal (5000 COP) y Belén (6000 COP) |
| RN-04.04 | El stock se descuenta SOLO al confirmar pago exitoso |
| RN-04.05 | Al cancelar un pedido confirmado, se restaura el stock |
| RN-04.06 | El estado inicial de un pedido es "Pendiente" |

### RN-05: Pagos

| ID | Regla |
|----|-------|
| RN-05.01 | El número de tarjeta debe tener exactamente 16 dígitos numéricos |
| RN-05.02 | El CVV debe tener exactamente 3 dígitos numéricos |
| RN-05.03 | El pago simulado acepta cualquier tarjeta con formato válido |
| RN-05.04 | Al pagar exitosamente, el pedido cambia a estado "Confirmado" |

### RN-06: Promociones

| ID | Regla |
|----|-------|
| RN-06.01 | Las promociones vinculadas usan el stock del producto original |
| RN-06.02 | Las promociones independientes tienen stock propio |
| RN-06.03 | Solo se muestran promociones vigentes (FechaInicio <= Now <= FechaFin) |

### RN-07: Reseñas

| ID | Regla |
|----|-------|
| RN-07.01 | Solo usuarios que han comprado un producto pueden reseñarlo |
| RN-07.02 | Cada usuario puede hacer una sola reseña por producto |
| RN-07.03 | Las reseñas requieren aprobación del Admin antes de ser públicas |

### RN-08: Reclamaciones

| ID | Regla |
|----|-------|
| RN-08.01 | El número de ticket se genera automáticamente (REC-XXXX) |
| RN-08.02 | Estados: Pendiente → EnRevision → Resuelta/Rechazada |
| RN-08.03 | Al resolver, el Admin debe ingresar una respuesta |

### RN-09: Horario de Tienda

| ID | Regla |
|----|-------|
| RN-09.01 | Si SistemaActivoManual = false, la tienda está cerrada |
| RN-09.02 | Si UsarControlHorario = false, la tienda está siempre abierta |
| RN-09.03 | El horario se valida contra HorarioDia (configurable por día) |

---

## 5. Requisitos de Información (RI)

### RI-01: Entities del Sistema

| Entity | Descripción | Tabla BD |
|--------|-------------|----------|
| User | Usuario del sistema con autenticación JWT | Users |
| Rol | Roles del sistema (Admin, Usuario, Repartidor) | Roles |
| CategoriaProducto | Categorías para clasificar productos | CategoriaProducto |
| Producto | Productos del catálogo con stock e imágenes | Productos |
| Review | Reseñas de productos con moderación | Reviews |
| CarritoCompra | Carrito asociado a un usuario | CarritoCompra |
| CarritoItem | Items del carrito (producto o promoción) | CarritoItems |
| Promoción | Promociones vigentes (vinculadas o independientes) | Promociones |
| Pedido | Pedidos con estados y totales | Pedidos |
| PedidoItem | Items de un pedido | PedidoItems |
| PedidoHistorial | Historial de cambios de estado | PedidoHistorial |
| DireccionEnvio | Direcciones con GPS | DireccionEnvio |
| RegistroPago | Registro de intentos de pago | RegistroPago |
| Notificación | Notificaciones para usuarios | Notificaciones |
| ConfiguracionTienda | Configuración global de la tienda | ConfiguracionTienda |
| HorarioDia | Horario específico por día de la semana | HorarioDia |
| Reclamación | Reclamaciones de usuarios | Reclamaciones |

### RI-02: Integraciones Externas

| Servicio | Propósito |
|----------|-----------|
| Azure Blob Storage | Almacenamiento de imágenes de productos |
| Gmail SMTP | Envío de emails (recuperación de contraseña) |
| Google Maps API | Geocodificación de direcciones (opcional) |

---

## 6. Resumen de Trazabilidad

| Fase SDD | Artefacto | Estado |
|----------|-----------|--------|
| Exploración | Análisis inicial del codebase | ✅ Completado |
| Propuesta | Plan de documentación 7 fases | ✅ Completado |
| Spec | Este documento (RF, RNF, RN, RI) | ✅ Completado |
| Design | Arquitectura definida | ✅ En docs/03-arquitectura/ |
| Tasks | - | Pendiente |
| Apply | - | Pendiente |
| Verify | - | Pendiente |
| Archive | - | Pendiente |

---

*Documento generado el 03/04/2026 como parte del proyecto PastisserieDeluxe - SENA Ficha 3035528*