# Casos de Uso - PastisserieDeluxe

**Proyecto**: PASTISSERIE'S DELUXE  
**Código**: SENA Ficha 3035528  
**Versión**: 2.0  
**Fecha**: 03/04/2026

---

## 1. Actores del Sistema

| Actor | Descripción | Rol en JWT |
|-------|-------------|-------------|
| **Cliente (Usuario)** | Cliente registrado que compra productos | Usuario |
| **Administrador** | Gestiona productos, pedidos, usuarios y configuración | Admin |
| **Repartidor** | Entrega los pedidos asignados | Repartidor |
| **Usuario Anónimo** | Navega por el catálogo sin autenticación | (Sin rol) |

---

## 2. Casos de Uso por Actor

---

## 2.1 CASOS DE USO: CLIENTE (USUARIO)

### UC-01: Registrarse en el Sistema

| Campo | Detalle |
|-------|---------|
| **ID** | UC-01 |
| **Actor** | Usuario Anónimo |
| **Descripción** | El usuario se registra en la plataforma creando una cuenta |
| **Precondiciones** | - No estar autenticado |
| | - No tener una cuenta con el mismo email |
| **Flujo Principal** | 1. El usuario accede a la página de registro |
| | 2. Ingresa: Nombre, Email, Contraseña, Teléfono |
| | 3. El sistema valida los datos (FluentValidation) |
| | 4. El sistema crea el usuario en la BD con hash BCrypt |
| | 5. El sistema asigna el rol "Usuario" por defecto |
| | 6. El sistema retorna mensaje de éxito |
| **Flujo Alternativo** | Si el email ya existe, mostrar error "El email ya está registrado" |
| **Postcondiciones** | Usuario creado en BD, puede iniciar sesión |

---

### UC-02: Iniciar Sesión

| Campo | Detalle |
|-------|---------|
| **ID** | UC-02 |
| **Actor** | Cliente |
| **Descripción** | El usuario autenticado accede a su cuenta |
| **Precondiciones** | - Tener cuenta registrada |
| **Flujo Principal** | 1. El usuario ingresa email y contraseña |
| | 2. El sistema valida credenciales contra BD |
| | 3. El sistema genera token JWT (24h de validez) |
| | 4. El frontend guarda el token en localStorage |
| | 5. El sistema retorna datos del usuario y rol |
| **Flujo Alternativo** | Si credenciales incorrectas, mostrar error "Email o contraseña incorrectos" |
| **Postcondiciones** | Usuario autenticado, puede acceder a funcionalidades protegidas |

---

### UC-03: Recuperar Contraseña

| Campo | Detalle |
|-------|---------|
| **ID** | UC-03 |
| **Actor** | Cliente |
| **Descripción** | El usuario recupera su contraseña mediante email |
| **Precondiciones** | - Tener cuenta registrada con email válido |
| **Flujo Principal** | 1. El usuario ingresa su email |
| | 2. El sistema verifica que existe |
| | 3. El sistema genera token de recuperación |
| | 4. El sistema envía email con enlace de recuperación |
| | 5. El usuario hace clic en el enlace |
| | 6. El usuario ingresa nueva contraseña |
| | 7. El sistema actualiza el hash de la contraseña |
| **Postcondiciones** | Contraseña actualizada, usuario puede iniciar sesión |

---

### UC-04: Ver Catálogo de Productos

| Campo | Detalle |
|-------|---------|
| **ID** | UC-04 |
| **Actor** | Usuario Anónimo / Cliente |
| **Descripción** | El usuario navega por el catálogo de productos |
| **Precondiciones** | Ninguna |
| **Flujo Principal** | 1. El usuario accede a /catalogo |
| | 2. El sistema consulta productos con Activo = true |
| | 3. El sistema filtra productos con stock disponible (o StockIlimitado = true) |
| | 4. El frontend muestra grid de productos |
| | 5. El usuario puede filtrar por categoría |
| | 6. El usuario puede buscar por nombre/descripción |
| **Postcondiciones** | Catálogo displayed with filtering options |

---

### UC-05: Ver Detalle de Producto

| Campo | Detalle |
|-------|---------|
| **ID** | UC-05 |
| **Actor** | Usuario Anónimo / Cliente |
| **Descripción** | El usuario ve los detalles de un producto específico |
| **Precondiciones** | El producto existe y está activo |
| **Flujo Principal** | 1. El usuario hace clic en un producto del catálogo |
| | 2. El sistema carga los datos del producto |
| | 3. El sistema carga las reseñas aprobadas del producto |
| | 4. El sistema calcula el promedio de calificación |
| | 5. El frontend muestra: imagen, precio, descripción, stock, reseñas |
| **Postcondiciones** | Detail page displayed con reseñas aprovadas |

---

### UC-06: Agregar Producto al Carrito

| Campo | Detalle |
|-------|---------|
| **ID** | UC-06 |
| **Actor** | Cliente |
| **Descripción** | El usuario agrega un producto a su carrito de compras |
| **Precondiciones** | - Estar autenticado |
| | - El producto tener stock disponible (o StockIlimitado = true) |
| **Flujo Principal** | 1. El usuario hace clic en "Agregar al Carrito" |
| | 2. El sistema verifica disponibilidad de stock |
| | 3. El sistema obtiene o crea el CarritoCompra del usuario |
| | 4. El sistema inserta o actualiza el CarritoItem |
| | 5. El sistema actualiza FechaActualizacion del carrito |
| | 6. El frontend actualiza el badge del carrito |
| **Flujo Alternativo** | Si no hay stock, mostrar error "Producto sin stock disponible" |
| **Postcondiciones** | Producto agregado al carrito en BD |

---

### UC-07: Gestionar Carrito (Ver, Actualizar, Eliminar)

| Campo | Detalle |
|-------|---------|
| **ID** | UC-07 |
| **Actor** | Cliente |
| **Descripción** | El usuario gestiona los items de su carrito |
| **Precondiciones** | - Estar autenticado |
| | - Tener items en el carrito |
| **Flujo Principal** | **Ver Carrito**: |
| | 1. El usuario accede a /carrito |
| | 2. El sistema retorna los CarritoItems del usuario |
| | 3. El frontend muestra lista con precios y cantidades |
| | **Actualizar Cantidad**: |
| | 1. El usuario cambia la cantidad (+/-) |
| | 2. El sistema valida stock disponible |
| | 3. El sistema actualiza la cantidad en BD |
| | **Eliminar Item**: |
| | 1. El usuario hace clic en eliminar |
| | 2. El sistema elimina el CarritoItem |
| | **Vaciar Carrito**: |
| | 1. El usuario hace clic en "Vaciar Carrito" |
| | 2. El sistema elimina todos los CarritoItems |
| **Postcondiciones** | Carrito actualizado en BD |

---

### UC-08: Completar Checkout y Crear Pedido

| Campo | Detalle |
|-------|---------|
| **ID** | UC-08 |
| **Actor** | Cliente |
| **Descripción** | El usuario completa el proceso de compra creando un pedido |
| **Precondiciones** | - Estar autenticado |
| | - Tener items en el carrito |
| | - La tienda debe estar abierta |
| | - El total debe ser >= 15.000 COP |
| **Flujo Principal** | 1. El usuario accede al checkout (/checkout) |
| | 2. El usuario completa datos de envío (dirección, comuna, teléfono) |
| | 3. (Opcional) El usuario ingresa coordenadas GPS |
| | 4. El sistema valida: tienda abierta, compra mínima, comuna válida |
| | 5. El sistema crea DireccionEnvio con los datos |
| | 6. El sistema crea el Pedido en estado "Pendiente" |
| | 7. El sistema crea los PedidoItems desde el CarritoItems |
| | 8. El sistema calcula: Subtotal, CostoEnvio, Total |
| | 9. El usuario selecciona método de pago |
| | 10. El usuario procede al paso de pago |
| **Flujo Alternativo** | Si la tienda está cerrada, mostrar error y bloquear checkout |
| **Postcondiciones** | Pedido creado en BD con estado "Pendiente" |

---

### UC-09: Procesar Pago (Simulado)

| Campo | Detalle |
|-------|---------|
| **ID** | UC-09 |
| **Actor** | Cliente |
| **Descripción** | El usuario completa el pago de su pedido |
| **Precondiciones** | - Tener un pedido creado en estado "Pendiente" |
| **Flujo Principal** | 1. El usuario ingresa datos de tarjeta (número, nombre, expiración, CVV) |
| | 2. El sistema valida formato de tarjeta |
| | 3. El sistema crea RegistroPago con estado "Espera" |
| | 4. El sistema simula procesamiento (acepta cualquier tarjeta válida) |
| | 5. El sistema actualiza Pedido: Estado = "Confirmado", Aprobado = true |
| | 6. El sistema descuenta stock de productos (excepto StockIlimitado) |
| | 7. El sistema actualiza RegistroPago: Estado = "Exitoso" |
| | 8. El sistema vacía el carrito (elimina CarritoItems) |
| | 9. El sistema crea notificación para el usuario |
| | 10. El frontend redirige a página de éxito |
| **Flujo Alternativo** | Si la tarjeta no tiene formato válido, mostrar error |
| **Postcondiciones** | Pedido confirmado, stock descontado, carrito vacío |

---

### UC-10: Ver Mis Pedidos

| Campo | Detalle |
|-------|---------|
| **ID** | UC-10 |
| **Actor** | Cliente |
| **Descripción** | El usuario visualiza su historial de pedidos |
| **Precondiciones** | - Estar autenticado |
| **Flujo Principal** | 1. El usuario accede a /perfil (sección "Mis Pedidos") |
| | 2. El sistema retorna los Pedidos del usuario ordenados por fecha DESC |
| | 3. El frontend muestra lista con: ID, fecha, estado (badge), total |
| | 4. El usuario puede hacer clic en un pedido para ver detalles |
| **Postcondiciones** | Lista de pedidos displayed |

---

### UC-11: Cancelar Pedido

| Campo | Detalle |
|-------|---------|
| **ID** | UC-11 |
| **Actor** | Cliente |
| **Descripción** | El usuario cancela un pedido que aún no ha sido procesado |
| **Precondiciones** | - Estar autenticado |
| | - El pedido debe estar en estado "Pendiente" o "Confirmado" |
| **Flujo Principal** | 1. El usuario accede a los detalles de su pedido |
| | 2. El usuario hace clic en "Cancelar Pedido" |
| | 3. El sistema confirma la cancelación |
| | 4. Si el pedido estaba confirmado: el sistema restaura el stock |
| | 5. El sistema actualiza el estado a "Cancelado" |
| | 6. El sistema crea notificación de cancelación |
| **Flujo Alternativo** | Si el pedido ya está en proceso, no permite cancelar |
| **Postcondiciones** | Pedido cancelado, stock restaurado si aplica |

---

### UC-12: Crear Reseña de Producto

| Campo | Detalle |
|-------|---------|
| **ID** | UC-12 |
| **Actor** | Cliente |
| **Descripción** | El usuario crea una reseña de un producto que compró |
| **Precondiciones** | - Estar autenticado |
| | - Haber comprado el producto (tener PedidoItem con ese ProductoId y pedido aprobado) |
| | - No haber reseñado ese producto anteriormente |
| **Flujo Principal** | 1. El usuario accede a la página del producto |
| | 2. El usuario hace clic en "Crear Reseña" |
| | 3. El usuario selecciona calificación (1-5 estrellas) |
| | 4. El usuario ingresa un comentario |
| | 5. El sistema valida que el usuario haya comprado el producto |
| | 6. El sistema crea la reseña con Aprobada = false |
| | 7. El frontend muestra "Reseña enviada, pendiente de aprobación" |
| **Flujo Alternativo** | Si no ha comprado el producto, mostrar error |
| **Postcondiciones** | Reseña creada en BD con estado "pendiente de aprobación" |

---

### UC-13: Ver Mis Reseñas

| Campo | Detalle |
|-------|---------|
| **ID** | UC-13 |
| **Actor** | Cliente |
| **Descripción** | El usuario visualiza sus reseñas creadas |
| **Precondiciones** | - Estar autenticado |
| **Flujo Principal** | 1. El usuario accede a /perfil |
| | 2. El sistema retorna las reseñas del usuario |
| | 3. El frontend muestra lista con: producto, calificación, estado (aprobada/pendiente) |
| **Postcondiciones** | Lista de reseñas displayed |

---

### UC-14: Ver Mis Notificaciones

| Campo | Detalle |
|-------|---------|
| **ID** | UC-14 |
| **Actor** | Cliente |
| **Descripción** | El usuario visualiza sus notificaciones |
| **Precondiciones** | - Estar autenticado |
| **Flujo Principal** | 1. El usuario hace clic en el icono de campana en el navbar |
| | 2. El sistema retorna las notificaciones del usuario |
| | 3. El frontend muestra la lista con badge de no leídas |
| | 4. El usuario puede marcar una como leída |
| | 5. El usuario puede hacer clic para ir al enlace asociado |
| **Postcondiciones** | Notificaciones visualizadas |

---

### UC-15: Gestionar Mis Direcciones

| Campo | Detalle |
|-------|---------|
| **ID** | UC-15 |
| **Actor** | Cliente |
| **Descripción** | El usuario gestiona sus direcciones de envío |
| **Precondiciones** | - Estar autenticado |
| **Flujo Principal** | **Ver Direcciones**: |
| | 1. El usuario accede a /perfil/direcciones |
| | 2. El sistema retorna las DireccionEnvio del usuario |
| | **Crear Dirección**: |
| | 1. El usuario ingresa: nombre completo, dirección, barrio, comuna, teléfono, referencia |
| | 2. El sistema crea la dirección en BD |
| | **Editar Dirección**: |
| | 1. El usuario modifica los datos |
| | 2. El sistema actualiza en BD |
| | **Eliminar Dirección**: |
| | 1. El usuario elimina una dirección |
| | 2. El sistema elimina de BD |
| **Postcondiciones** | Direcciones actualizadas en BD |

---

### UC-16: Crear Reclamación

| Campo | Detalle |
|-------|---------|
| **ID** | UC-16 |
| **Actor** | Cliente |
| **Descripción** | El usuario crea una reclamación sobre un pedido |
| **Precondiciones** | - Estar autenticado |
| **Flujo Principal** | 1. El usuario accede a /reclamaciones |
| | 2. El usuario selecciona (opcional) el pedido relacionado |
| | 3. El usuario ingresa: asunto, descripción |
| | 4. El sistema genera número de ticket único (REC-XXXX) |
| | 5. El sistema crea la reclamación con estado "Pendiente" |
| | 6. El frontend muestra el número de ticket |
| **Postcondiciones** | Reclamación creada en BD |

---

### UC-17: Ver Mis Reclamaciones

| Campo | Detalle |
|-------|---------|
| **ID** | UC-17 |
| **Actor** | Cliente |
| **Descripción** | El usuario visualiza sus reclamaciones |
| **Precondiciones** | - Estar autenticado |
| **Flujo Principal** | 1. El usuario accede a /perfil (sección reclamaciones) |
| | 2. El sistema retorna las Reclamaciones del usuario |
| | 3. El frontend muestra lista con: ticket, asunto, estado, fecha |
| | 4. El usuario puede ver detalles incluyendo respuesta del admin |
| **Postcondiciones** | Lista de reclamaciones displayed |

---

### UC-18: Actualizar Perfil

| Campo | Detalle |
|-------|---------|
| **ID** | UC-18 |
| **Actor** | Cliente |
| **Descripción** | El usuario actualiza su información personal |
| **Precondiciones** | - Estar autenticado |
| **Flujo Principal** | 1. El usuario accede a /perfil |
| | 2. El usuario modifica: nombre, teléfono |
| | 3. El sistema actualiza en BD |
| | 4. El frontend muestra mensaje de éxito |
| **Postcondiciones** | Datos del usuario actualizados en BD |

---

## 2.2 CASOS DE USO: ADMINISTRADOR

### UC-20: Acceder al Dashboard Admin

| Campo | Detalle |
|-------|---------|
| **ID** | UC-20 |
| **Actor** | Administrador |
| **Descripción** | El admin accede al panel de administración |
| **Precondiciones** | - Estar autenticado con rol Admin |
| **Flujo Principal** | 1. El admin accede a /admin |
| | 2. El sistema retorna KPIs: ventas hoy, pedidos hoy, productos bajo stock, usuarios nuevos |
| | 3. El sistema retorna datos para gráfico de ventas (7/30 días) |
| | 4. El sistema retorna top 5 productos |
| | 5. El sistema retorna pedidos recientes |
| | 6. El frontend muestra el dashboard con gráficos y métricas |
| **Postcondiciones** | Dashboard displayed con datos actualizados |

---

### UC-21: CRUD Productos (Admin)

| Campo | Detalle |
|-------|---------|
| **ID** | UC-21 |
| **Actor** | Administrador |
| **Descripción** | El admin gestiona los productos del catálogo |
| **Precondiciones** | - Estar autenticado con rol Admin |
| **Flujo Principal** | **Crear Producto**: |
| | 1. El admin accede a /admin/productos |
| | 2. El admin hace clic en "Nuevo Producto" |
| | 3. El admin ingresa: nombre, descripción, precio, stock, categoría, imagen |
| | 4. El sistema valida los datos |
| | 5. El sistema sube la imagen a Azure Blob Storage |
| | 6. El sistema crea el producto en BD |
| | **Editar Producto**: |
| | 1. El admin hace clic en editar |
| | 2. El admin modifica los datos |
| | 3. El sistema actualiza en BD |
| | **Eliminar Producto (Soft Delete)**: |
| | 1. El admin hace clic en eliminar |
| | 2. El sistema marca Activo = false |
| **Postcondiciones** | Producto creado/editado/eliminado en BD |

---

### UC-22: CRUD Categorías (Admin)

| Campo | Detalle |
|-------|---------|
| **ID** | UC-22 |
| **Actor** | Administrador |
| **Descripción** | El admin gestiona las categorías de productos |
| **Precondiciones** | - Estar autenticado con rol Admin |
| **Flujo Principal** | 1. El admin accede a /admin/categorias |
| | 2. El admin puede crear, editar o eliminar categorías |
| | 3. Las categorías se pueden asignar a productos |
| **Postcondiciones** | Categoría creada/editada/eliminada en BD |

---

### UC-23: CRUD Promociones (Admin)

| Campo | Detalle |
|-------|---------|
| **ID** | UC-23 |
| **Actor** | Administrador |
| **Descripción** | El admin gestiona las promociones |
| **Precondiciones** | - Estar autenticado con rol Admin |
| **Flujo Principal** | **Crear Promoción Vinculada**: |
| | 1. El admin selecciona un producto |
| | 2. El admin define tipo de descuento (% o monto fijo) y valor |
| | 3. El admin define vigencia (fecha inicio/fin) |
| | **Crear Promoción Independiente**: |
| | 1. El admin define nombre, descripción, precio original |
| | 2. El admin define descuento, stock propio, imagen |
| | 3. El admin define vigencia |
| **Postcondiciones** | Promoción creada en BD |

---

### UC-24: Gestionar Pedidos (Admin)

| Campo | Detalle |
|-------|---------|
| **ID** | UC-24 |
| **Actor** | Administrador |
| **Descripción** | El admin gestiona todos los pedidos del sistema |
| **Precondiciones** | - Estar autenticado con rol Admin |
| **Flujo Principal** | **Ver Todos los Pedidos**: |
| | 1. El admin accede a /admin/pedidos |
| | 2. El sistema retorna todos los pedidos |
| | **Cambiar Estado**: |
| | 1. El admin selecciona un pedido |
| | 2. El admin cambia el estado (Pendiente → Confirmado → EnProceso → Listo → EnCamino → Entregado) |
| | 3. El sistema actualiza el estado |
| | 4. El sistema crea notificación para el cliente |
| | 5. El sistema registra en PedidoHistorial |
| | **Asignar Repartidor**: |
| | 1. El admin selecciona un repartidor |
| | 2. El sistema actualiza RepartidorId |
| | 3. El sistema cambia estado a "EnCamino" |
| | **Eliminar Pedido**: |
| | 1. El admin elimina un pedido (solo si no está confirmado) |
| | 2. El sistema elimina de BD |
| **Postcondiciones** | Pedido gestionado, notificaciones creadas |

---

### UC-25: Aprobar/Rechazar Reseñas (Admin)

| Campo | Detalle |
|-------|---------|
| **ID** | UC-25 |
| **Actor** | Administrador |
| **Descripción** | El admin modera las reseñas de productos |
| **Precondiciones** | - Estar autenticado con rol Admin |
| **Flujo Principal** | 1. El admin accede a /admin/resenas |
| | 2. El sistema retorna reseñas pendientes |
| | 3. El admin revisa el contenido |
| | 4. El admin hace clic en "Aprobar" o "Rechazar" |
| | 5. El sistema actualiza el campo Aprobada |
| | 6. El sistema registra FechaAprobacion |
| **Postcondiciones** | Reseña approved/rejected in BD |

---

### UC-26: Gestionar Reclamaciones (Admin)

| Campo | Detalle |
|-------|---------|
| **ID** | UC-26 |
| **Actor** | Administrador |
| **Descripción** | El admin atiende las reclamaciones de usuarios |
| **Precondiciones** | - Estar autenticado con rol Admin |
| **Flujo Principal** | 1. El admin accede a /admin/reclamaciones |
| | 2. El admin ve la lista de reclamaciones |
| | 3. El admin selecciona una reclamación |
| | 4. El admin cambia el estado a "EnRevision" |
| | 5. El admin investiga y escribe respuesta |
| | 6. El admin cambia estado a "Resuelta" o "Rechazada" |
| | 7. El sistema crea notificación para el usuario |
| **Postcondiciones** | Reclamación handled, notification sent |

---

### UC-27: Gestionar Usuarios (Admin)

| Campo | Detalle |
|-------|---------|
| **ID** | UC-27 |
| **Actor** | Administrador |
| **Descripción** | El admin gestiona los usuarios del sistema |
| **Precondiciones** | - Estar autenticado con rol Admin |
| **Flujo Principal** | **Ver Usuarios**: |
| | 1. El admin accede a /admin/usuarios |
| | 2. El sistema retorna todos los usuarios |
| | **Cambiar Rol**: |
| | 1. El admin selecciona un usuario |
| | 2. El admin cambia el rol (Usuario → Repartidor, etc.) |
| | 3. El sistema actualiza en UserRoles |
| | **Activar/Desactivar**: |
| | 1. El admin togglea el estado Activo |
| | 2. El sistema actualiza en BD |
| **Postcondiciones** | Usuario gestionado en BD |

---

### UC-28: Configurar Tienda (Admin)

| Campo | Detalle |
|-------|---------|
| **ID** | UC-28 |
| **Actor** | Administrador |
| **Descripción** | El admin configura los parámetros de la tienda |
| **Precondiciones** | - Estar autenticado con rol Admin |
| **Flujo Principal** | 1. El admin accede a /admin/configuracion |
| | 2. El admin configura: nombre, teléfono, email, dirección |
| | 3. El admin activa/desactiva SistemaActivoManual |
| | 4. El admin activa/desactiva UsarControlHorario |
| | 5. El admin configura hora de apertura y cierre |
| | 6. El admin configura pedido mínimo y costos de envío |
| | 7. El sistema guarda en ConfiguracionTienda |
| | 8. El admin configura horarios por día (HorarioDia) |
| **Postcondiciones** | Configuración guardada en BD |

---

### UC-29: Ver Reportes (Admin)

| Campo | Detalle |
|-------|---------|
| **ID** | UC-29 |
| **Actor** | Administrador |
| **Descripción** | El admin visualiza reportes del sistema |
| **Precondiciones** | - Estar autenticado con rol Admin |
| **Flujo Principal** | 1. El admin accede a /admin/reportes |
| | 2. El admin puede exportar datos (Excel/PDF) |
| | 3. El sistema genera el reporte solicitado |
| **Postcondiciones** | Reporte generado |

---

## 2.3 CASOS DE USO: REPARTIDOR

### UC-30: Acceder al Dashboard Repartidor

| Campo | Detalle |
|-------|---------|
| **ID** | UC-30 |
| **Actor** | Repartidor |
| **Descripción** | El repartidor accede a su panel de trabajo |
| **Precondiciones** | - Estar autenticado con rol Repartidor |
| **Flujo Principal** | 1. El repartidor accede a /repartidor |
| | 2. El sistema retorna los pedidos asignados |
| | 3. El frontend muestra la lista de entregas |
| **Postcondiciones** | Dashboard displayed |

---

### UC-31: Actualizar Estado de Entrega

| Campo | Detalle |
|-------|---------|
| **ID** | UC-31 |
| **Actor** | Repartidor |
| **Descripción** | El repartidor actualiza el estado de un pedido asignado |
| **Precondiciones** | - Estar autenticado con rol Repartidor |
| | - Tener pedidos asignados |
| **Flujo Principal** | 1. El repartidor selecciona un pedido |
| | 2. El repartidor hace clic en "Marcar En Camino" |
| | 3. El sistema actualiza estado a "EnCamino" |
| | 4. Cuando entrega: "Marcar Entregado" → estado "Entregado" |
| | 5. Si no puede entregar: "No Entregado" → estado "NoEntregado", requiere justificación |
| | 6. El sistema crea notificación para el cliente |
| **Postcondiciones** | Estado del pedido actualizado, notification sent |

---

### UC-32: Ver Detalles de Entrega

| Campo | Detalle |
|-------|---------|
| **ID** | UC-32 |
| **Actor** | Repartidor |
| **Descripción** | El repartidor ve los detalles de la entrega |
| **Precondiciones** | - Estar autenticado con rol Repartidor |
| **Flujo Principal** | 1. El repartidor selecciona un pedido |
| | 2. El sistema retorna: datos del cliente, dirección, teléfono |
| | 3. Si la dirección tiene GPS (Latitud/Longitud), mostrar en mapa |
| | 4. El repartidor puede llamar al cliente |
| **Postcondiciones** | Delivery details displayed |

---

## 2.4 CASOS DE USO: USUARIO ANÓNIMO

### UC-40: Navegar por el Catálogo

| Campo | Detalle |
|-------|---------|
| **ID** | UC-40 |
| **Actor** | Usuario Anónimo |
| **Descripción** | El usuario no registrado navega por el catálogo |
| **Precondiciones** | Ninguna |
| **Flujo Principal** | 1. El usuario accede a la página principal |
| | 2. El usuario ve el banner de promociones |
| | 3. El usuario navega al catálogo |
| | 4. El usuario puede buscar y filtrar productos |
| **Restricciones** | No puede agregar al carrito, no puede hacer pedidos |
| **Postcondiciones** | Catálogo visualizado |

---

### UC-41: Ver Detalle de Producto

| Campo | Detalle |
|-------|---------|
| **ID** | UC-41 |
| **Actor** | Usuario Anónimo |
| **Descripción** | El usuario no registrado ve los detalles de un producto |
| **Precondiciones** | Ninguna |
| **Flujo Principal** | 1. El usuario hace clic en un producto |
| | 2. Ve la información del producto y reseñas aprobadas |
| | 3. No puede agregar al carrito (botón deshabilitado con mensaje) |
| **Postcondiciones** | Producto detail viewed |

---

### UC-42: Contactar con la Tienda

| Campo | Detalle |
|-------|---------|
| **ID** | UC-42 |
| **Actor** | Usuario Anónimo |
| **Descripción** | El usuario contacta a la tienda |
| **Precondiciones** | Ninguna |
| **Flujo Principal** | 1. El usuario accede a /contacto |
| | 2. El usuario completa formulario: nombre, email, mensaje |
| | 3. El sistema envía email a la tienda |
| | 4. El frontend muestra mensaje de confirmación |
| **Postcondiciones** | Mensaje enviado |

---

## 3. Resumen de Casos de Uso

| Actor | Total | Descripción |
|-------|-------|-------------|
| Cliente (Usuario) | 18 | Registro, login, catálogo, carrito, checkout, pago, pedidos, reseñas, notificaciones, direcciones, reclamaciones, perfil |
| Administrador | 10 | Dashboard, productos, categorías, promociones, pedidos, reseñas, reclamaciones, usuarios, configuración, reportes |
| Repartidor | 3 | Dashboard, actualizar estado, ver detalles de entrega |
| Usuario Anónimo | 3 | Navegar catálogo, ver detalle, contactar |

**Total: 34 Casos de Uso**

---

## 4. Diagrama de Casos de Uso (Resumen)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USUARIO ANÓNIMO                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                      │
│  │   UC-40     │  │   UC-41     │  │   UC-42     │                      │
│  │  Navegar    │  │   Ver       │  │  Contactar  │                      │
│  │  Catálogo   │  │  Producto   │  │   Tienda    │                      │
│  └─────────────┘  └─────────────┘  └─────────────┘                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENTE (USUARIO)                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  UC-01   │  │  UC-02   │  │  UC-03   │  │  UC-04   │  │  UC-05   │   │
│  │Registrarse│  │   Login  │  │Recuperar │  │  Ver     │  │  Ver     │   │
│  │          │  │          │  │Password  │  │ Catálogo │  │ Producto │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  UC-06   │  │  UC-07   │  │  UC-08   │  │  UC-09   │  │  UC-10   │   │
│  │Agregar   │  │ Gestionar│  │ Checkout │  │  Pago    │  │   Ver    │   │
│  │Carrito   │  │ Carrito  │  │          │  │ Simulado │  │ Pedidos  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  UC-11   │  │  UC-12   │  │  UC-13   │  │  UC-14   │  │  UC-15   │   │
│  │Cancelar  │  │  Crear   │  │  Ver      │  │  Ver     │  │Gestionar │   │
│  │ Pedido   │  │ Reseña   │  │ Reseñas  │  │Notificac.│  │Direcciones│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                               │
│  │  UC-16   │  │  UC-17   │  │  UC-18   │                               │
│  │  Crear   │  │  Ver      │  │Actualizar│                               │
│  │Reclamac. │  │Reclamac. │  │ Perfil   │                               │
│  └──────────┘  └──────────┘  └──────────┘                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         ADMINISTRADOR                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  UC-20   │  │  UC-21   │  │  UC-22   │  │  UC-23   │  │  UC-24   │   │
│  │Dashboard │  │   CRUD   │  │   CRUD   │  │   CRUD   │  │ Gestionar│   │
│  │  Admin   │  │Productos │  │Categorías│  │Promociones│ │ Pedidos  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  UC-25   │  │  UC-26   │  │  UC-27   │  │  UC-28   │  │  UC-29   │   │
│  │  Aprobar │  │Gestionar │  │Gestionar │  │ Config   │  │ Reportes │   │
│  │ Reseñas  │  │Reclamac. │  │ Usuarios │  │ Tienda   │  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          REPARTIDOR                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                               │
│  │  UC-30   │  │  UC-31   │  │  UC-32   │                               │
│  │Dashboard │  │Actualizar│  │  Ver     │                               │
│  │ Repartidor│ │Estado   │  │Detalles   │                               │
│  └──────────┘  └──────────┘  └──────────┘                               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

*Documento generado el 03/04/2026 como parte del proyecto PastisserieDeluxe - SENA Ficha 3035528*