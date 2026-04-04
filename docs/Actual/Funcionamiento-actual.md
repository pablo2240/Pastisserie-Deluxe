# Funcionamiento Actual del Sistema

**Última actualización**: 03/04/2026  
**Versión del sistema**: 1.0  
**Estado general**: ✅ **85-90% FUNCIONAL**

## Resumen

El sistema **PASTISSERIE'S DELUXE** es una plataforma completa de e-commerce para repostería con arquitectura moderna (ASP.NET Core 8.0 + React 19). Implementa todos los flujos críticos: autenticación JWT, catálogo con Azure Blob Storage, carrito persistente, checkout con GPS, gestión de pedidos, promociones automáticas, sistema de reviews con moderación, y dashboards administrativos con gráficos.

**Tecnologías principales**:
- Backend: ASP.NET Core 8.0, Entity Framework Core 8.0, SQL Server 2022
- Frontend: React 19, TypeScript, Vite, Tailwind CSS v4
- Servicios externos: Azure Blob Storage, Gmail SMTP
- Seguridad: JWT, BCrypt, CORS, validación de DTOs con FluentValidation

---

## Flujo Completo: Base de Datos → Backend → Frontend

### 1. Autenticación y Usuarios

#### Backend (Funcionando ✅)
- **Registro**: `AuthController.Register` → `AuthService.RegisterAsync`
- **Login**: `AuthController.Login` → `AuthService.LoginAsync` → JWT
- **Perfil**: `UsersController.GetProfile`, `UpdateProfile`
- **Cambio contraseña**: Forgot/Reset password con tokens

#### Frontend (Funcionando ✅)
- `/login` - Formulario de login
- `/registro` - Formulario de registro
- `/perfil` - Ver y editar perfil
- `/forgot-password` y `/reset-password` - Recuperación

#### Base de Datos (Funcionando ✅)
- Tablas: `Users`, `UserRoles`, `Roles`
- JWT token almacenado en localStorage del frontend

#### Integración
```
Frontend (login.tsx) 
  → API: POST /api/auth/login 
  → Backend: AuthService valida credenciales 
  → Genera JWT 
  → Frontend: Guarda token en AuthContext
```

---

### 2. Catálogo de Productos

#### Backend (✅ Funcionando 100%)
- **ProductosController**:
  - `GET /api/productos` - Listar todos (soporte paginación)
  - `GET /api/productos/{id}` - Ver detalle con reviews aprobadas
  - `POST /api/productos` - Crear con imagen Azure Blob (Admin)
  - `PUT /api/productos/{id}` - Actualizar (Admin)
  - `DELETE /api/productos/{id}` - Eliminar (Admin) + elimina imagen de Azure
  - `GET /api/productos/activos` - Solo productos activos
  - `GET /api/productos/categoria/{categoriaId}` - Filtro por categoría

- **ProductoService**:
  - Subida de imágenes a **Azure Blob Storage**
  - Validación de stock (respeta `StockIlimitado`)
  - Filtros por categoría (FK a CategoriaProducto)
  - Búsqueda por nombre/descripción

#### Frontend (✅ Funcionando 100%)
- `/catalogo` - Grid responsive con filtros (categoría, búsqueda, ordenamiento)
- `/producto/{id}` - Detalle del producto con:
  - Galería de imágenes
  - Precio y stock disponible
  - Botón "Añadir al Carrito" (validación de stock)
  - Sección de reseñas aprobadas
  - Promedio de calificación (estrellas)
- `ProductCard.tsx` - Tarjeta con drag & drop para añadir al carrito
- `ProductReviews.tsx` - Componente de reseñas con paginación

#### Base de Datos (✅ Funcionando 100%)
- Tablas: `Productos`, `CategoriaProducto`, `Reviews`
- **Cambios recientes**:
  - Campo `StockIlimitado` (bool) — productos que nunca se agotan
  - Campo `ImagenUrl` (string) — URL completa de Azure Blob Storage
  - Relación correcta: `Productos.CategoriaId` → `CategoriaProducto.Id`

#### Integración
```
Frontend (catalogo.tsx)
  → API: GET /api/productos?categoria=1&busqueda=chocolate
  → Backend: ProductoService.GetAllAsync() con filtros
  → DB: SELECT * FROM Productos 
        INNER JOIN CategoriaProducto 
        WHERE Activo = 1 AND (StockIlimitado = 1 OR Stock > 0)
  → Frontend: Muestra grid de ProductCard con lazy loading
```

**Novedad (03/04/2026)**: Imágenes se suben a Azure Blob Storage en tiempo real con drag & drop.

---

### 3. Carrito de Compras

#### Backend (✅ Funcionando 100%)
- **CarritoController**:
  - `GET /api/carrito` - Ver carrito del usuario autenticado
  - `POST /api/carrito/agregar` - Agregar item (producto o promoción)
  - `PUT /api/carrito/actualizar` - Actualizar cantidad de un item
  - `DELETE /api/carrito/{itemId}` - Eliminar item específico
  - `DELETE /api/carrito/vaciar` - Vaciar carrito completo

- **CarritoService**:
  - Gestión de items con validación de stock (respeta `StockIlimitado`)
  - Soporte para **productos** y **promociones** en el mismo carrito
  - Cálculo automático de subtotales y total
  - Persistencia en base de datos (relación 1:1 Usuario-Carrito)

#### Frontend (✅ Funcionando 100%)
- **Contexto global**: `CartContext.tsx` con React Context API
- **Páginas**:
  - `/carrito` - Página completa del carrito con:
    - Lista de items con imagen, nombre, precio unitario, cantidad
    - Controles de cantidad (+/-)
    - Botón eliminar individual
    - Resumen de totales
    - Botón "Proceder al Checkout"
  - `CartSidebar.tsx` - Mini carrito flotante (slide-in desde la derecha)
    - Badge con contador de items en navbar
    - Resumen rápido sin salir de la página actual

- **Funcionalidades**:
  - Actualización en tiempo real del contador en navbar
  - Validación de stock al agregar (muestra error si excede disponible)
  - Persistencia: carrito sobrevive al refrescar página (almacenado en backend)
  - Drag & drop para agregar desde ProductCard (opcional)

#### Base de Datos (✅ Funcionando 100%)
- Tablas: `CarritoCompra` (1:1 con Usuario), `CarritoItems` (N:1 con Carrito)
- **CarritoCompra**: `Id`, `UsuarioId`, `FechaCreacion`, `FechaActualizacion`
- **CarritoItems**: 
  - `ProductoId` (nullable) - Si es producto normal
  - `PromocionId` (nullable) - Si es promoción
  - `Cantidad`, `PrecioUnitario` (snapshot del precio al agregar)

#### Integración
```
Frontend (ProductCard - "Agregar al carrito")
  → API: POST /api/carrito/agregar { ProductoId: 5, Cantidad: 2 }
  → Backend: CarritoService.AddItemAsync()
    → Valida stock disponible
    → Obtiene o crea CarritoCompra del usuario
    → Inserta o actualiza CarritoItem
  → DB: INSERT/UPDATE CarritoItems, UPDATE CarritoCompra.FechaActualizacion
  → Frontend: CartContext.fetchCart() → actualiza estado local
  → Sidebar muestra nuevo total y badge actualizado
```

---

### 4. Checkout y Creación de Pedidos

#### Backend (✅ Funcionando 100%)
- **PedidosController**:
  - `POST /api/pedidos` - Crear pedido desde carrito (Usuario autenticado)

- **PedidoService.CreateAsync()** - Flujo completo:
  1. **Valida horario laboral**: Consulta `ConfiguracionTienda` y `HorarioDia`
  2. **Obtiene carrito**: Verifica que el usuario tenga items en `CarritoCompra`
  3. **Valida stock**: Para cada item, verifica disponibilidad (respeta `StockIlimitado`)
  4. **Crea DireccionEnvio**: Nueva entidad con datos del request + **GPS (Latitud/Longitud)** (añadido 02/04/2026)
  5. **Mapea items del carrito a PedidoItems**: Copia ProductoId, PromocionId, Cantidad, Precio
  6. **Calcula totales**:
     - Subtotal = Σ(Precio × Cantidad)
     - CostoEnvio = según comuna (hardcoded en servicio)
     - **NO calcula IVA** (campo eliminado 26/03/2026)
     - Total = Subtotal + CostoEnvio
  7. **Crea pedido** en estado `"Pendiente"` con `Aprobado = false`
  8. **NO descuenta stock** (se descuenta al confirmar pago)
  9. **NO vacía carrito** (se vacía desde frontend tras pago exitoso)

- **CreatePedidoRequestDto** - Campos requeridos:
  - Datos de envío: `NombreCompleto`, `Direccion`, `Barrio`, `Comuna`, `Telefono`, `Referencia`
  - GPS (opcional): `Latitud`, `Longitud`
  - Pago: `MetodoPago` (string, ej: "Tarjeta", "Efectivo", "Nequi")
  - Opcional: `NotasCliente`

- **Costos de envío** (hardcodeados en PedidoService):
  - **Guayabal**: 5000 COP
  - **Belén**: 6000 COP
  - Otras comunas: rechazo con error 400

#### Frontend (✅ Funcionando 100%)
- **Ruta**: `/checkout`
- **Flujo de 3 pasos** (wizard step-by-step):
  1. **Shipping**: 
     - Formulario de dirección (autocompletado desde `Users.Direccion` si existe)
     - Selector de comuna (dropdown: Guayabal, Belén)
     - Campo de referencia (opcional)
     - **Integración con Google Maps** (opcional): pin para obtener Latitud/Longitud
  2. **Summary**: 
     - Lista de items del carrito
     - Subtotal, costo de envío, total
     - Botón "Continuar a Pago"
  3. **Payment**: 
     - Formulario de tarjeta (inline, NO redirige a pasarela externa)
     - Validaciones: número 16 dígitos, expiración futura, CVV 3 dígitos
     - Botón "Pagar Ahora" (llama a API de pagos)

- **Validaciones pre-checkout**:
  - Compra mínima: **15000 COP** (si no, muestra error)
  - Comuna válida: Solo Guayabal o Belén (validado tanto en frontend como backend)
  - Tienda abierta: Hook `useTiendaStatus` consulta `/api/tienda/configuracion` (bloquea checkout si cerrada)
  - Carrito no vacío

#### Base de Datos (✅ Funcionando 100%)
- **Tablas**: `Pedido`, `PedidoItem`, `DireccionEnvio`
- **Pedido**:
  - Campos: `UsuarioId`, `FechaPedido`, `Estado`, `MetodoPago` (string, no FK), `DireccionEnvioId`, `Subtotal`, `CostoEnvio`, `Total`, `Aprobado`, `NotasCliente`, `RepartidorId`, `FechaEntregaEstimada`
  - **ELIMINADO** (26/03): `IVA`, `MetodoPagoId` (FK a tabla TiposMetodoPago que ya no existe)
- **DireccionEnvio**:
  - Campos: `UsuarioId`, `NombreCompleto`, `Direccion`, `Barrio`, `Comuna`, `Telefono`, `Referencia`, `EsPredeterminada`, `Latitud`, `Longitud`
  - **AÑADIDO** (02/04): `Latitud`, `Longitud` (GPS para tracking de repartidor)
- **PedidoItem**:
  - Campos: `PedidoId`, `ProductoId` (nullable), `PromocionId` (nullable), `Cantidad`, `PrecioUnitario`, `Subtotal`

#### Integración
```
Frontend (checkout.tsx - Paso 3: "Pagar Ahora")
  → Paso previo: POST /api/pedidos (crea pedido en estado "Pendiente")
    → Backend: PedidoService.CreateAsync()
      → Valida horario, stock, comuna
      → INSERT DireccionEnvio (con GPS si se envió)
      → INSERT Pedido (Pendiente, Aprobado=false)
      → INSERT PedidoItems (copia de CarritoItems)
    → DB: 3 inserts (DireccionEnvio, Pedido, N × PedidoItems)
  → Frontend recibe pedidoId → setStep('payment')
  → Usuario completa formulario de tarjeta
  → Click "Pagar" → Continúa a flujo de Pagos (sección 5)
```

**Cambios recientes**:
- **02/04/2026**: GPS en DireccionEnvio (Latitud/Longitud) para mejorar tracking
- **26/03/2026**: Simplificación de pagos — `MetodoPago` ahora es string (antes FK a tabla eliminada)

---

### 5. Sistema de Pago (Simulado)

#### Backend (✅ Funcionando 100%)
- **PagosController**:
  - `POST /api/pagos/{pedidoId}/simular` - **Simular pago exitoso** (flujo principal)
  - `PATCH /api/pagos/{pedidoId}/registrar-intento` - Registrar que usuario entró a página de pago
  - `PATCH /api/pagos/{pedidoId}/abandonar` - Registrar que usuario salió sin pagar
  - `PATCH /api/pagos/{pedidoId}/confirmar` - Confirmar pago exitoso (alternativa a simular)

- **Flujo de pago**:
  1. **Al entrar a paso "Payment"**: Frontend llama `registrar-intento`
     - Crea `RegistroPago` con estado `"Espera"`
     - Actualiza `Pedido.Estado` a `"Espera"`
  2. **Al completar pago**: Frontend llama `simular` con datos de tarjeta
     - Valida formato de tarjeta (16 dígitos, CVV 3 dígitos, expiración válida)
     - **Descuenta stock** de cada producto (excepto si `StockIlimitado = true`)
     - Actualiza `Pedido`: `Estado = "Confirmado"`, `Aprobado = true`, `FechaAprobacion = NOW`
     - Actualiza `RegistroPago`: `Estado = "Exitoso"`, `FechaConfirmacion = NOW`
     - **Vacía carrito** del usuario (DELETE CarritoItems)
     - Genera `ReferenciaExterna` (GUID simulado)
  3. **Al abandonar**: Si usuario sale del checkout sin pagar
     - Actualiza `RegistroPago.Estado = "Fallido"`
     - `Pedido.Estado` permanece en `"Espera"` (puede reintentarlo)
     - Stock NO afectado

- **Validaciones**:
  - Número de tarjeta: exactamente 16 dígitos numéricos
  - CVV: exactamente 3 dígitos numéricos
  - Fecha expiración: formato MM/YY, año >= actual
  - Nombre titular: al menos 3 caracteres
  - Pedido debe existir y pertenecer al usuario autenticado

#### Frontend (✅ Funcionando 100%)
- **Componente**: Formulario en paso 3 del checkout (`/checkout?step=payment`)
- **Campos**:
  - Número de tarjeta (input con máscara XXXX-XXXX-XXXX-XXXX)
  - Nombre del titular
  - Fecha de expiración (MM/YY)
  - CVV (input type password, 3 dígitos)
- **Validaciones en tiempo real**:
  - Número: solo dígitos, max 16
  - CVV: solo dígitos, max 3
  - Expiración: autoformato MM/YY
  - Nombre: solo letras y espacios
- **Flujo**:
  1. Usuario completa formulario → click "Pagar Ahora"
  2. Frontend valida campos
  3. Muestra loader ("Procesando pago...")
  4. Llama `POST /api/pagos/{pedidoId}/simular`
  5. Si éxito (200):
     - Limpia carrito local (context)
     - Redirige a `/checkout?success=true` (página de confirmación)
  6. Si fallo (400/500):
     - Muestra toast de error
     - Permite reintentar

#### Base de Datos (✅ Funcionando 100%)
- **Tabla**: `RegistroPago`
- **Campos**:
  - `PedidoId` (FK a Pedido, 1:N - permite reintentos)
  - `UsuarioId` (FK a User)
  - `Estado` (string): `"Espera"`, `"Exitoso"`, `"Fallido"`
  - `FechaIntento` (DateTime): momento en que entró a payment
  - `FechaConfirmacion` (DateTime?): momento del pago exitoso
  - `MensajeError` (string?): mensaje si falló
  - `ReferenciaExterna` (string?): GUID generado si exitoso

- **Cambios en Pedido al pagar**:
  - `Estado`: `"Pendiente"` → `"Espera"` (al entrar) → `"Confirmado"` (al pagar)
  - `Aprobado`: `false` → `true`
  - `FechaAprobacion`: `null` → `DateTime.UtcNow`

- **Cambios en Productos al pagar**:
  - Para cada `PedidoItem` con `ProductoId != null`:
    - Si `Producto.StockIlimitado = false` → `Stock -= Cantidad`
    - Si `StockIlimitado = true` → NO se descuenta

#### Integración
```
Frontend (checkout.tsx - Paso 3: "Pagar Ahora")
  → Validaciones cliente (formato tarjeta)
  → API: POST /api/pagos/123/simular
    {
      numeroTarjeta: "4111111111111111",
      nombreTitular: "Juan Perez",
      fechaExpiracion: "12/28",
      cvv: "123"
    }
  → Backend: PagosController.SimularPago()
    → Valida formato de tarjeta
    → Inicia transacción de BD:
      1. UPDATE Pedido SET Estado='Confirmado', Aprobado=1, FechaAprobacion=NOW
      2. UPDATE RegistroPago SET Estado='Exitoso', FechaConfirmacion=NOW
      3. Para cada item: UPDATE Productos SET Stock = Stock - Cantidad (si aplica)
      4. DELETE FROM CarritoItems WHERE CarritoCompra.UsuarioId = X
    → Commit transacción
  → Frontend: 
    → clearCart() (limpia context local)
    → navigate('/checkout?success=true')
    → Muestra mensaje "¡Pedido #123 confirmado!"
```

**Notas importantes**:
- **NO hay integración con pasarela real** (ePayco, PayU, etc.) — código obsoleto eliminado 26/03/2026
- **Pago simulado** acepta cualquier número de tarjeta que cumpla formato
- Para producción: reemplazar `SimularPago()` con integración de procesador real (mantener mismo contrato de DTO)
- El descuento de stock es **transaccional** — si falla algún paso, rollback completo

---

### 6. Gestión de Pedidos

#### Backend (✅ Funcionando 100%)
- **PedidosController**:
  - `GET /api/pedidos` - Listar todos los pedidos (Admin)
  - `GET /api/pedidos/mis-pedidos` - Pedidos del usuario autenticado (Usuario, Repartidor)
  - `GET /api/pedidos/{id}` - Ver detalle completo de un pedido (con validación de propiedad)
  - `PATCH /api/pedidos/{id}/estado` - Cambiar estado del pedido (Admin, Repartidor limitado)
  - `POST /api/pedidos/{id}/asignar-repartidor` - Asignar repartidor a pedido (Admin)
  - `DELETE /api/pedidos/{id}` - Eliminar pedido y **restaurar stock** (Admin, solo si no confirmado)

- **PedidoService** - Lógica de negocio:
  - **Estados del pedido** (string, enum-like):
    - `"Pendiente"` - Recién creado, esperando pago
    - `"Espera"` - Usuario en página de pago
    - `"Confirmado"` - Pago exitoso, por procesar
    - `"EnProceso"` - Cocinero preparando
    - `"Listo"` - Pedido terminado, listo para envío
    - `"EnCamino"` - Repartidor en ruta
    - `"Entregado"` - Entrega exitosa
    - `"NoEntregado"` - Intento fallido (ej: cliente no estaba)
    - `"Cancelado"` - Cancelado por cliente/admin

  - **Cambio de estado**:
    - Valida transiciones lógicas (ej: no se puede pasar de "Entregado" a "Pendiente")
    - Crea `Notificacion` automática para el usuario al cambiar estado
    - Registra cambio en `PedidoHistorial` (tabla no consumida en frontend aún)
    - Si cancela pedido confirmado → restaura stock (UPDATE Productos SET Stock = Stock + Cantidad)

  - **Asignación de repartidor**:
    - Solo usuarios con rol "Repartidor" pueden ser asignados
    - Actualiza `Pedido.RepartidorId`
    - Cambia estado a `"EnCamino"` automáticamente
    - Crea notificación para repartidor y cliente

  - **Eliminación de pedido**:
    - Solo permitido si estado es "Pendiente" o "Cancelado"
    - Restaura stock de productos (si estaba confirmado)
    - Elimina PedidoItems en cascada (configurado en EF)

#### Frontend (✅ Funcionando 100%)
- **Panel de usuario** (`/perfil`):
  - Sección "Mis Pedidos" con lista paginada
  - Card por pedido: número, fecha, estado (badge de color), total
  - Click en card → modal con detalle completo:
    - Items del pedido (nombre, cantidad, precio)
    - Dirección de envío (con mapa si tiene GPS)
    - Método de pago
    - Totales (subtotal, envío, total)
    - Estado actual y fecha estimada de entrega
    - Botón "Cancelar pedido" (solo si estado es "Pendiente" o "Confirmado")

- **Panel de admin** (`/admin/pedidos`):
  - Tabla con todos los pedidos (ordenados por fecha descendente)
  - Filtros: por estado, fecha, usuario
  - Acciones por fila:
    - Ver detalle (modal)
    - Cambiar estado (dropdown → llama API)
    - Asignar repartidor (modal con lista de repartidores)
    - Eliminar (confirmación, solo si aplica)
  - Indicadores visuales:
    - Estados con badges de colores (Pendiente=gris, Confirmado=azul, EnCamino=amarillo, Entregado=verde, etc.)
    - Pedidos urgentes (>24h en "Confirmado") resaltados

- **Panel de repartidor** (`/repartidor/pedidos`):
  - Lista de pedidos asignados al repartidor
  - Botones rápidos: "Marcar en camino", "Marcar entregado", "No entregado"
  - Vista de mapa con GPS de direcciones (si disponible)

#### Base de Datos (✅ Funcionando 100%)
- **Tablas**: `Pedido`, `PedidoItem`, `PedidoHistorial`
- **Pedido** - Campos clave:
  - `Estado` (string, 50 chars)
  - `RepartidorId` (nullable FK a User)
  - `FechaEntregaEstimada` (calculado: +48h desde confirmación)
  - `FechaEntrega` (cuando se marca "Entregado")
  - `MotivoNoEntrega` (si estado "NoEntregado")
  - `FechaNoEntrega`

- **PedidoHistorial** (log de cambios):
  - `PedidoId`, `EstadoAnterior`, `EstadoNuevo`, `FechaCambio`, `CambiadoPorId`
  - Tabla creada y poblada automáticamente pero **NO consumida en frontend** (funcionalidad pendiente)

- **Relaciones**:
  - `Pedido → User` (cliente, 1:N)
  - `Pedido → User` (repartidor, 1:N nullable)
  - `Pedido → DireccionEnvio` (1:1)
  - `Pedido → PedidoItems` (1:N)
  - `Pedido → PedidoHistorial` (1:N)

#### Integración
```
Frontend (/perfil - "Ver detalles del pedido #45")
  → API: GET /api/pedidos/45
  → Backend: PedidoService.GetByIdAsync(45)
    → Valida que el pedido pertenezca al usuario autenticado (o que sea Admin)
  → DB: SELECT * FROM Pedido 
        WHERE Id = 45
        INCLUDE (Items.Producto, Items.Promocion, DireccionEnvio, Repartidor)
  → Frontend: Muestra modal con:
    - Lista de items (nombre, cantidad, precio)
    - Dirección completa (+ mapa si hay GPS)
    - Estado con badge
    - Timeline de estados (basado en fechas)
    - Botón "Cancelar" (si aplica)

Frontend (/admin/pedidos - "Cambiar estado a 'EnProceso'")
  → API: PATCH /api/pedidos/45/estado
    { nuevoEstado: "EnProceso" }
  → Backend: PedidoService.UpdateEstadoAsync()
    → UPDATE Pedido SET Estado='EnProceso', FechaActualizacion=NOW
    → INSERT PedidoHistorial (...)
    → INSERT Notificacion para usuario: "Tu pedido está en preparación"
  → Frontend: Refresca tabla, muestra toast "Estado actualizado"
```

**Notas**:
- **PedidoHistorial** existe en BD pero no se muestra en UI (pendiente: timeline visual)
- **GPS en DireccionEnvio** (desde 02/04/2026) permite vista de mapa para repartidor
- **Restauración de stock** es automática al cancelar/eliminar pedidos confirmados

---

### 7. Promociones

#### Backend (✅ Funcionando 100%)
- **PromocionesController**:
  - `GET /api/promociones` - Listar promociones vigentes (público) o todas (Admin con query param)
  - `GET /api/promociones/{id}` - Ver detalle de una promoción
  - `POST /api/promociones` - Crear nueva promoción (Admin)
  - `PUT /api/promociones/{id}` - Actualizar promoción existente (Admin)
  - `DELETE /api/promociones/{id}` - Eliminar promoción (Admin)

- **PromocionService** - Lógica de negocio:
  - **Tipos de promoción**:
    1. **Vinculada a producto** (`ProductoId != null`):
       - Aplica descuento sobre un producto existente
       - Usa `ImagenUrl` y datos del producto original
       - Al agregar al carrito: crea `CarritoItem` con `PromocionId`
       - **NO tiene stock propio** (usa el del producto)
    2. **Independiente** (`ProductoId == null`):
       - Producto promocional único (ej: "Pack de 6 cupcakes")
       - Requiere `PrecioOriginal` e `ImagenUrl` propios
       - **Tiene stock propio** (nullable, se descuenta al comprar)
       - Se comporta como producto normal en carrito/pedido

  - **Tipos de descuento**:
    - **Porcentaje** (`TipoDescuento = "Porcentaje"`, `Descuento` = ej: 20):
      - Precio final = PrecioOriginal × (1 - Descuento/100)
    - **Monto fijo** (`TipoDescuento = "MontoFijo"`, `Descuento` = ej: 5000):
      - Precio final = PrecioOriginal - Descuento

  - **Vigencia**:
    - `FechaInicio`, `FechaFin` (DateTime)
    - Filtro de vigentes: `WHERE FechaInicio <= NOW AND FechaFin >= NOW`
    - Campo `Activa` (bool) para pausar manualmente

- **PromocionRequestDto** - Campos para crear/actualizar:
  - `Titulo` (requerido)
  - `Descripcion`
  - `ProductoId` (nullable - si vinculada)
  - `PrecioOriginal` (requerido si independiente)
  - `TipoDescuento` ("Porcentaje" o "MontoFijo")
  - `Descuento` (decimal)
  - `Stock` (nullable - solo para independientes)
  - `ImagenUrl` (requerido si independiente)
  - `FechaInicio`, `FechaFin`
  - `Activa` (default: true)

#### Frontend (✅ Funcionando 100%)
- **Página pública** (`/promociones`):
  - Grid de promociones vigentes (similar a catálogo)
  - Card por promoción:
    - Imagen (Azure Blob Storage si es independiente)
    - Título y descripción
    - Precio original tachado + precio con descuento
    - Badge de descuento ("20% OFF" o "-$5000")
    - Stock disponible (si es independiente)
    - Botón "Agregar al carrito"
  - Filtros: por vigencia, tipo de descuento
  - Orden: por fecha de inicio descendente

- **Vista en catálogo** (`/catalogo`):
  - Productos con promoción vinculada muestran:
    - Badge "¡PROMOCIÓN!" en esquina
    - Precio original tachado
    - Precio promocional resaltado
    - Click lleva a detalle del producto (no de la promoción)

- **Banner en home** (`/`):
  - Carousel con promociones destacadas
  - Click redirige a `/promociones` o `/producto/{id}` según tipo

- **Panel de admin** (`/admin/promociones`):
  - CRUD completo de promociones
  - Tabla con lista de todas (vigentes y vencidas)
  - Formulario de creación/edición:
    - Toggle: "Vinculada a producto" vs "Independiente"
    - Si vinculada: selector de producto
    - Si independiente: campos de precio, stock, imagen
    - Selector de tipo de descuento
    - Date pickers para vigencia
  - Acciones: Editar, Eliminar, Activar/Desactivar

#### Base de Datos (✅ Funcionando 100%)
- **Tabla**: `Promociones`
- **Campos**:
  - `Id` (PK)
  - `Titulo` (string 200)
  - `Descripcion` (string 1000)
  - `ProductoId` (nullable FK a Productos)
  - `PrecioOriginal` (decimal, nullable)
  - `TipoDescuento` (string: "Porcentaje", "MontoFijo")
  - `Descuento` (decimal)
  - `Stock` (int nullable - solo para independientes)
  - `ImagenUrl` (string 500, nullable)
  - `FechaInicio`, `FechaFin` (DateTime)
  - `Activa` (bool, default: true)
  - `FechaCreacion` (DateTime)

- **Relaciones**:
  - `Promociones → Productos` (N:1, nullable)
  - `CarritoItems → Promociones` (N:1, nullable)
  - `PedidoItems → Promociones` (N:1, nullable)

#### Integración
```
Frontend (promociones.tsx)
  → API: GET /api/promociones
  → Backend: PromocionesService.GetAllAsync()
    → Filtra por vigencia: WHERE FechaInicio <= NOW AND FechaFin >= NOW AND Activa = 1
  → DB: SELECT * FROM Promociones 
        LEFT JOIN Productos ON Promociones.ProductoId = Productos.Id
        WHERE vigencia válida
  → Backend: Calcula precio final para cada promoción
  → Frontend: 
    → Muestra grid de promociones
    → Click "Agregar al carrito" (promoción independiente):
      → POST /api/carrito/agregar { PromocionId: 7, Cantidad: 1 }
      → Valida stock (si aplica)
      → INSERT CarritoItems (ProductoId=null, PromocionId=7)

Frontend (catalogo.tsx - producto con promoción)
  → API: GET /api/productos
  → Backend: Incluye promociones vigentes vinculadas al producto
  → Frontend: 
    → Muestra precio tachado y precio promocional
    → Click "Agregar al carrito":
      → POST /api/carrito/agregar { PromocionId: 5, Cantidad: 2 }
      → (No usa ProductoId, usa PromocionId para aplicar descuento)
```

**Casos de uso**:
- **Promoción vinculada**: "20% OFF en Torta de Chocolate" (usa imagen/datos del producto)
- **Promoción independiente**: "Pack de 6 Cupcakes por $15000" (producto único promocional con stock propio)

**Notas**:
- Al comprar promoción vinculada: descuenta stock del **producto original**
- Al comprar promoción independiente: descuenta stock de la **promoción**
- PedidoItems almacena `PromocionId` para auditoría (saber qué precio se aplicó)
- Promociones vencidas NO se eliminan (quedan para historial de pedidos)

---

### 8. Reviews/Reseñas

#### Backend (✅ Funcionando 100%)
- **ReviewsController**:
  - `GET /api/reviews/producto/{productoId}` - Obtener reseñas aprobadas de un producto
  - `POST /api/reviews` - Crear nueva reseña (usuario autenticado)
  - `PATCH /api/reviews/{id}/aprobar` - Aprobar reseña (Admin)
  - `PATCH /api/reviews/{id}/rechazar` - Rechazar reseña (Admin) - marca como no aprobada
  - `GET /api/reviews/pendientes` - Listar reseñas pendientes de aprobación (Admin)

- **ReviewService** - Lógica de negocio:
  - **Creación de reseña**:
    - Valida que el usuario haya comprado el producto (verifica en PedidoItems)
    - Valida calificación entre 1 y 5 estrellas
    - Crea con `Aprobada = false` (requiere moderación)
    - Un usuario puede dejar solo UNA reseña por producto

  - **Aprobación/Rechazo**:
    - Solo Admin puede aprobar/rechazar
    - Al aprobar: `UPDATE Reviews SET Aprobada = true, FechaAprobacion = NOW`
    - Al rechazar: permanece `Aprobada = false` (se puede eliminar después)

  - **Consulta pública**:
    - Solo devuelve reseñas con `Aprobada = true`
    - Incluye datos del usuario (nombre, avatar)
    - Calcula promedio de calificación del producto

- **ReviewRequestDto** - Campos para crear:
  - `ProductoId` (requerido)
  - `Calificacion` (int, 1-5)
  - `Comentario` (string, max 1000 chars)

#### Frontend (✅ Funcionando 100%)
- **Vista en detalle de producto** (`/producto/{id}`):
  - Componente `ProductReviews.tsx`:
    - **Resumen**: 
      - Promedio de calificación (ej: 4.5/5 estrellas)
      - Total de reseñas aprobadas
      - Distribución de estrellas (gráfico de barras)
    - **Lista de reseñas**:
      - Avatar y nombre del usuario
      - Calificación (estrellas)
      - Comentario
      - Fecha de publicación (relativa: "hace 2 días")
      - Paginación (10 por página)
    - **Formulario** (si usuario logueado y compró el producto):
      - Selector de estrellas (1-5)
      - Textarea para comentario
      - Botón "Enviar Reseña"
      - Mensaje de confirmación: "Reseña enviada, pendiente de aprobación"

- **Panel de admin** (`/admin/resenas`):
  - Tabla de reseñas pendientes:
    - Producto, usuario, calificación, comentario (truncado)
    - Fecha de creación
    - Acciones: "Aprobar" (verde), "Rechazar" (rojo)
  - Filtros: por producto, calificación, fecha
  - Contador de pendientes en navbar admin

#### Base de Datos (✅ Funcionando 100%)
- **Tabla**: `Reviews`
- **Campos**:
  - `Id` (PK)
  - `ProductoId` (FK a Productos)
  - `UsuarioId` (FK a Users)
  - `Calificacion` (int, 1-5)
  - `Comentario` (string 1000)
  - `Aprobada` (bool, default: false)
  - `FechaCreacion` (DateTime)
  - `FechaAprobacion` (DateTime?, nullable)

- **Relaciones**:
  - `Reviews → Productos` (N:1)
  - `Reviews → Users` (N:1)

- **Índices**:
  - Compuesto en (ProductoId, UsuarioId) - para garantizar una reseña por usuario por producto
  - Índice en Aprobada - para consultas rápidas de reviews públicas

- **Cambio reciente** (26/03/2026):
  - ❌ **Eliminado campo**: `AprobadaPor` (FK a User Admin que aprobó)
  - Razón: simplificación del modelo, no se usaba en frontend

#### Integración
```
Frontend (producto/5 - "Enviar Reseña")
  → API: POST /api/reviews
    {
      productoId: 5,
      calificacion: 5,
      comentario: "¡Excelente torta de chocolate!"
    }
  → Backend: ReviewService.CreateAsync()
    → Valida que usuario haya comprado el producto:
      SELECT COUNT(*) FROM PedidoItems 
      WHERE ProductoId = 5 
        AND PedidoId IN (SELECT Id FROM Pedido WHERE UsuarioId = X AND Aprobado = 1)
    → Si válido: INSERT Reviews (Aprobada = false)
  → Frontend: Muestra toast "Reseña enviada, pendiente de aprobación"

Frontend (admin/resenas - "Aprobar")
  → API: PATCH /api/reviews/12/aprobar
  → Backend: ReviewService.AprobarAsync(12)
    → UPDATE Reviews SET Aprobada = true, FechaAprobacion = NOW WHERE Id = 12
  → Frontend: Remueve de tabla de pendientes, muestra toast "Reseña aprobada"

Frontend (producto/5 - carga inicial)
  → API: GET /api/reviews/producto/5
  → Backend: ReviewService.GetByProductoAsync(5)
    → SELECT * FROM Reviews 
      WHERE ProductoId = 5 AND Aprobada = 1 
      ORDER BY FechaCreacion DESC
  → Frontend: 
    → Calcula promedio: AVG(Calificacion)
    → Renderiza lista de reseñas con ProductReviews.tsx
```

**Reglas de negocio**:
- Usuario solo puede reseñar productos que haya comprado
- Solo una reseña por usuario por producto
- Todas las reseñas requieren aprobación admin antes de ser públicas
- No se pueden editar reseñas (solo eliminar y crear nueva)
- Eliminar producto NO elimina sus reseñas (se mantienen para historial)

---

### 9. Dashboard Admin

#### Backend (✅ Funcionando 100%)
- **DashboardController**:
  - `GET /api/dashboard/estadisticas` - KPIs generales del sistema
  - `GET /api/dashboard/ventas` - Datos para gráfico de ventas (últimos 7/30 días)
  - `GET /api/dashboard/top-productos` - Productos más vendidos (top 5-10)
  - `GET /api/dashboard/pedidos-recientes` - Últimos pedidos (10 recientes)

- **DashboardService** - Consultas agregadas:
  - **Estadísticas**:
    - `VentasHoy` (decimal): SUM(Total) de pedidos confirmados hoy
    - `PedidosHoy` (int): COUNT de pedidos creados hoy
    - `ProductosBajoStock` (int): COUNT de productos con Stock < 10 y StockIlimitado = false
    - `UsuariosNuevos` (int): COUNT de usuarios registrados últimos 7 días
    - `TotalVentasMes` (decimal): SUM(Total) del mes actual
    - `TotalPedidosMes` (int): COUNT de pedidos del mes
    - `PromedioVentaDiaria` (decimal): promedio de ventas por día (mes actual)

  - **Ventas** (para gráfico):
    - Array de objetos: `{ fecha: "2026-04-01", total: 125000, pedidos: 8 }`
    - Agrupado por día (últimos 7 o 30 días según query param)

  - **Top Productos**:
    - Array de: `{ productoId, nombre, imagenUrl, cantidadVendida, totalVentas }`
    - Ordenado por cantidadVendida DESC
    - Calculado desde PedidoItems de pedidos confirmados

  - **Pedidos Recientes**:
    - Últimos 10 pedidos con includes: Usuario, Items (productos/promociones)
    - Solo datos relevantes: Id, FechaPedido, Estado, Total, NombreUsuario

#### Frontend (✅ Funcionando 100%)
- **Ruta**: `/admin` (Dashboard principal)
- **Layout**: Grid responsivo con 4 secciones

1. **KPIs** (fila superior):
   - 4 cards con iconos y números grandes:
     - Ventas Hoy: "$125,000" (verde si > meta)
     - Pedidos Hoy: "12 pedidos" (azul)
     - Productos Bajo Stock: "3 productos" (rojo si > 0)
     - Usuarios Nuevos: "8 usuarios" (morado)
   - Comparación con período anterior (ej: "+15% vs ayer")

2. **Gráfico de Ventas** (centro izquierda):
   - Componente `SalesChart.tsx` (React Chart.js 2 o Recharts)
   - Gráfico de barras/líneas:
     - Eje X: Fechas (últimos 7 días)
     - Eje Y: Total de ventas (COP)
     - Tooltip con cantidad de pedidos por día
   - Toggle: "7 días" / "30 días"

3. **Top Productos** (centro derecha):
   - Lista con cards horizontales:
     - Miniatura del producto
     - Nombre
     - Cantidad vendida (ej: "45 unidades")
     - Total generado (ej: "$225,000")
   - Top 5 productos

4. **Pedidos Recientes** (fila inferior):
   - Tabla compacta:
     - Columnas: #Pedido, Cliente, Fecha, Estado (badge), Total, Acciones
     - Click en fila → modal con detalle
     - Botón "Ver todos" → redirige a `/admin/pedidos`

- **Otras páginas de admin**:
  - `/admin/productos` - CRUD de productos (tabla, formularios create/edit, upload imagen a Azure)
  - `/admin/usuarios` - Gestión de usuarios (tabla, cambiar roles, bloquear/desbloquear)
  - `/admin/promociones` - CRUD de promociones
  - `/admin/resenas` - Aprobar/rechazar reseñas pendientes
  - `/admin/configuracion` - Configurar tienda (horarios, nombre, contacto)
  - `/admin/reportes` - Reportes de ventas, productos, usuarios (descarga Excel/PDF)

#### Base de Datos (✅ Funcionando 100%)
- **NO hay tabla específica** de Dashboard (todo son consultas agregadas)
- Consultas sobre: `Pedidos`, `PedidoItems`, `Productos`, `Users`
- Ejemplos de queries:

```sql
-- Ventas hoy
SELECT SUM(Total) FROM Pedidos 
WHERE Aprobado = 1 
  AND CAST(FechaPedido AS DATE) = CAST(GETDATE() AS DATE)

-- Productos bajo stock
SELECT COUNT(*) FROM Productos 
WHERE Stock < 10 
  AND StockIlimitado = 0 
  AND Activo = 1

-- Top productos
SELECT TOP 5 
  p.Id, p.Nombre, p.ImagenUrl,
  SUM(pi.Cantidad) as CantidadVendida,
  SUM(pi.Subtotal) as TotalVentas
FROM PedidoItems pi
INNER JOIN Productos p ON pi.ProductoId = p.Id
INNER JOIN Pedidos ped ON pi.PedidoId = ped.Id
WHERE ped.Aprobado = 1
GROUP BY p.Id, p.Nombre, p.ImagenUrl
ORDER BY CantidadVendida DESC
```

#### Integración
```
Frontend (/admin - carga inicial)
  → Realiza 4 llamadas en paralelo (useEffect):
    1. GET /api/dashboard/estadisticas
    2. GET /api/dashboard/ventas?dias=7
    3. GET /api/dashboard/top-productos?limit=5
    4. GET /api/dashboard/pedidos-recientes
  
  → Backend (para cada endpoint):
    → DashboardService ejecuta queries agregadas
    → Cachea resultados por 5 minutos (opcional)
  
  → Frontend:
    → Renderiza KPIs con animación de números
    → Renderiza gráfico con SalesChart.tsx
    → Renderiza lista de top productos
    → Renderiza tabla de pedidos recientes
```

**Características**:
- **Actualización en tiempo real**: Auto-refresh cada 60 segundos (opcional)
- **Permisos**: Solo accesible para rol "Admin" (middleware `[Authorize(Roles = "Admin")]`)
- **Responsivo**: Grid adapta a mobile (1 columna) y desktop (2-3 columnas)
- **Performance**: Queries optimizadas con índices en FechaPedido, Aprobado, Estado

---

### 10. Sistema de Notificaciones

#### Backend (✅ Funcionando 100%)
- **NotificacionesController**:
  - `GET /api/notificaciones` - Obtener notificaciones del usuario autenticado
  - `PATCH /api/notificaciones/{id}/marcar-leida` - Marcar notificación como leída
  - `PATCH /api/notificaciones/marcar-todas-leidas` - Marcar todas como leídas
  - `DELETE /api/notificaciones/{id}` - Eliminar notificación individual
  - `DELETE /api/notificaciones/eliminar-todas` - Eliminar todas las notificaciones del usuario

- **NotificacionService** - Lógica de negocio:
  - **Creación automática** (triggers):
    1. **Cambio de estado de pedido**: 
       - Evento: `PedidoService.UpdateEstadoAsync()`
       - Título: "Estado de pedido actualizado"
       - Mensaje: "Tu pedido #123 ahora está en estado: {NuevoEstado}"
       - Enlace: `/perfil?pedidoId=123`
       - Tipo: "Pedido"

    2. **Asignación de repartidor**:
       - Evento: `PedidoService.AsignarRepartidorAsync()`
       - Notificaciones dobles:
         - Para cliente: "Repartidor asignado a tu pedido"
         - Para repartidor: "Nuevo pedido asignado #123"
       - Tipo: "Pedido"

    3. **Pedido no entregado**:
       - Evento: `PedidoService.UpdateEstadoAsync()` cuando estado = "NoEntregado"
       - Título: "Pedido no entregado"
       - Mensaje: "Tu pedido #123 no pudo ser entregado. Motivo: {MotivoNoEntrega}"
       - Tipo: "Pedido"

    4. **Promoción nueva** (opcional, manual desde Admin):
       - Evento: Admin crea promoción destacada
       - Envía a todos los usuarios activos
       - Tipo: "Promocion"

  - **Métodos**:
    - `CrearNotificacionAsync(usuarioId, titulo, mensaje, tipo, enlace)` - Crear notificación individual
    - `CrearNotificacionMasivaAsync(titulo, mensaje, tipo)` - Enviar a todos los usuarios
    - `GetByUsuarioAsync(usuarioId, soloNoLeidas)` - Obtener notificaciones (ordenadas por fecha DESC)
    - `MarcarLeidaAsync(notificacionId, usuarioId)` - Marcar como leída (validando propiedad)

#### Frontend (✅ Funcionando 100%)
- **Componente**: `Notificaciones.tsx` (en navbar)
- **Elementos**:
  - **Icono campana** en navbar:
    - Badge con contador de no leídas (ej: "5")
    - Color rojo si hay no leídas, gris si todas leídas
    - Animación de "shake" al recibir nueva (opcional)

  - **Dropdown/Modal** (al click en campana):
    - Lista de últimas 10 notificaciones:
      - Avatar/icono según tipo (🛒 Pedido, 🎉 Promoción, etc.)
      - Título en negrita
      - Mensaje truncado (max 100 chars)
      - Tiempo relativo ("hace 5 minutos")
      - Fondo gris si no leída, blanco si leída
    - Click en notificación:
      - Marca como leída (PATCH request)
      - Redirige al enlace (ej: `/perfil?pedidoId=123`)
    - Botones de acción:
      - "Marcar todas como leídas"
      - "Ver todas" → redirige a `/notificaciones` (página completa)

  - **Página completa** (`/notificaciones`):
    - Lista paginada de todas las notificaciones (50 por página)
    - Filtros: Solo no leídas, Por tipo, Por fecha
    - Acciones: Marcar leída, Eliminar individual, Eliminar todas

- **Polling/WebSockets** (futuro):
  - Actualmente: Frontend hace polling cada 30 segundos (GET /api/notificaciones)
  - Mejora futura: WebSocket/SignalR para push en tiempo real

#### Base de Datos (✅ Funcionando 100%)
- **Tabla**: `Notificaciones`
- **Campos**:
  - `Id` (PK)
  - `UsuarioId` (FK a Users)
  - `Titulo` (string 200)
  - `Mensaje` (string 1000)
  - `Tipo` (string 50): "Pedido", "Promocion", "Sistema", "Repartidor"
  - `Enlace` (string 500, nullable): URL relativa para redirección
  - `Leida` (bool, default: false)
  - `FechaCreacion` (DateTime)

- **Relaciones**:
  - `Notificaciones → Users` (N:1)

- **Índices**:
  - Compuesto en (UsuarioId, Leida) - para consultas rápidas de no leídas
  - Índice en FechaCreacion DESC - para ordenamiento

#### Integración
```
Backend (PedidoService.UpdateEstadoAsync - cambio de estado)
  → UPDATE Pedido SET Estado = 'EnCamino', FechaActualizacion = NOW
  → NotificacionService.CrearNotificacionAsync(
      usuarioId: pedido.UsuarioId,
      titulo: "Pedido en camino",
      mensaje: "Tu pedido #45 está en camino. Repartidor: Juan Pérez",
      tipo: "Pedido",
      enlace: "/perfil?pedidoId=45"
    )
  → INSERT Notificaciones (Leida = false)

Frontend (Navbar - Notificaciones.tsx - useEffect polling cada 30s)
  → API: GET /api/notificaciones?soloNoLeidas=true
  → Backend: NotificacionService.GetByUsuarioAsync()
    → SELECT * FROM Notificaciones 
      WHERE UsuarioId = X AND Leida = 0 
      ORDER BY FechaCreacion DESC
  → Frontend:
    → Actualiza badge: setBadgeCount(response.data.length)
    → Si hay nuevas (count > prevCount): reproduce sonido (opcional)

Frontend (click en notificación #12)
  → API: PATCH /api/notificaciones/12/marcar-leida
  → Backend: UPDATE Notificaciones SET Leida = 1 WHERE Id = 12 AND UsuarioId = X
  → Frontend: 
    → navigate(notificacion.enlace) → "/perfil?pedidoId=45"
    → Refresca lista de notificaciones
```

**Tipos de notificaciones**:
- **Pedido**: Cambios de estado, asignación de repartidor, problemas de entrega
- **Promocion**: Nuevas ofertas, descuentos personalizados
- **Sistema**: Mantenimiento, actualizaciones, cambios de configuración
- **Repartidor**: Notificaciones específicas para repartidores (nuevos pedidos asignados)

**Mejoras futuras**:
- Push notifications del navegador (Web Push API)
- SignalR/WebSocket para notificaciones en tiempo real (eliminar polling)
- Notificaciones por email/SMS para eventos críticos

---

### 11. Reclamaciones

#### Backend (✅ Funcionando 100%)
- **ReclamacionesController**:
  - `GET /api/reclamaciones/mis-reclamaciones` - Reclamaciones del usuario autenticado
  - `GET /api/reclamaciones` - Todas las reclamaciones (Admin)
  - `GET /api/reclamaciones/{id}` - Ver detalle de reclamación (valida propiedad o rol admin)
  - `POST /api/reclamaciones` - Crear nueva reclamación (Usuario autenticado)
  - `PATCH /api/reclamaciones/{id}/estado` - Actualizar estado (Admin)
  - `PATCH /api/reclamaciones/{id}/respuesta` - Agregar respuesta administrativa (Admin)

- **ReclamacionService** - Lógica de negocio:
  - **Creación de reclamación**:
    - Requiere: `PedidoId` (opcional, puede ser reclamación general), `Asunto`, `Descripcion`
    - Si es sobre un pedido: valida que pertenezca al usuario
    - Estado inicial: `"Pendiente"`
    - Genera número de ticket: `"REC-" + DateTime.UtcNow.Ticks.ToString().Substring(10)`

  - **Estados de reclamación**:
    - `"Pendiente"` - Recién creada, esperando revisión
    - `"EnRevision"` - Admin está revisando
    - `"Resuelta"` - Problema solucionado, con respuesta del admin
    - `"Rechazada"` - Reclamación no procede, con justificación

  - **Actualización de estado**:
    - Solo Admin puede cambiar estado
    - Al cambiar a "Resuelta" o "Rechazada": requiere `RespuestaAdmin` (texto)
    - Crea `Notificacion` automática para el usuario al cambiar estado
    - Actualiza `FechaActualizacion`

- **ReclamacionRequestDto** - Campos para crear:
  - `PedidoId` (int?, opcional)
  - `Asunto` (string 200, requerido)
  - `Descripcion` (string 2000, requerido)

- **UpdateEstadoReclamacionDto** - Campos para actualizar:
  - `NuevoEstado` (string: "EnRevision", "Resuelta", "Rechazada")
  - `RespuestaAdmin` (string 2000, opcional - requerido si estado final)

#### Frontend (✅ Funcionando 100%)
- **Página de creación** (`/reclamaciones`):
  - Formulario:
    - Dropdown "Pedido relacionado" (lista de pedidos del usuario, opcional)
    - Input "Asunto" (texto corto)
    - Textarea "Descripción" (hasta 2000 chars)
    - Botón "Enviar Reclamación"
  - Al enviar:
    - POST a API
    - Toast de confirmación con número de ticket
    - Redirige a `/perfil?tab=reclamaciones`

- **Vista en perfil** (`/perfil` - tab "Mis Reclamaciones"):
  - Lista de reclamaciones del usuario:
    - Card por reclamación:
      - Número de ticket (ej: "REC-1234567890")
      - Asunto
      - Estado (badge de color: Pendiente=gris, EnRevision=azul, Resuelta=verde, Rechazada=rojo)
      - Fecha de creación
      - Click → modal con detalle
  - Modal de detalle:
    - Asunto, descripción completa
    - Pedido relacionado (si aplica) con enlace
    - Timeline de estados:
      - Pendiente (fecha)
      - EnRevision (fecha, si aplica)
      - Resuelta/Rechazada (fecha, si aplica)
    - Respuesta del administrador (si hay)

- **Panel de admin** (`/admin/reclamaciones`):
  - Tabla con todas las reclamaciones:
    - Columnas: Ticket, Usuario, Asunto, Estado, Fecha, Acciones
    - Filtros: por estado, fecha, usuario
    - Ordenamiento: por fecha DESC (pendientes primero)
  - Acciones por fila:
    - "Ver detalle" → modal con:
      - Datos del usuario
      - Asunto y descripción
      - Pedido relacionado (con detalles si aplica)
      - Historial de cambios de estado
      - Formulario para cambiar estado:
        - Dropdown de estado
        - Textarea "Respuesta administrativa" (requerido si estado final)
        - Botón "Actualizar"
  - Contador de pendientes en navbar admin (badge)

#### Base de Datos (✅ Funcionando 100%)
- **Tabla**: `Reclamaciones`
- **Campos**:
  - `Id` (PK)
  - `UsuarioId` (FK a Users)
  - `PedidoId` (FK a Pedidos, nullable)
  - `NumeroTicket` (string 50, único)
  - `Asunto` (string 200)
  - `Descripcion` (string 2000)
  - `Estado` (string 50): "Pendiente", "EnRevision", "Resuelta", "Rechazada"
  - `RespuestaAdmin` (string 2000, nullable)
  - `FechaCreacion` (DateTime)
  - `FechaActualizacion` (DateTime?)

- **Relaciones**:
  - `Reclamaciones → Users` (N:1)
  - `Reclamaciones → Pedidos` (N:1, nullable)

- **Índices**:
  - Índice único en `NumeroTicket`
  - Índice en (UsuarioId, Estado) - para consultas de usuario
  - Índice en Estado - para filtros de admin

#### Integración
```
Frontend (/reclamaciones - "Enviar Reclamación")
  → API: POST /api/reclamaciones
    {
      pedidoId: 45, // opcional
      asunto: "Producto incorrecto en mi pedido",
      descripcion: "Pedí torta de chocolate pero me llegó de vainilla. Pedido #45 del 02/04/2026."
    }
  → Backend: ReclamacionService.CreateAsync()
    → Valida que pedido pertenezca al usuario (si pedidoId != null)
    → Genera número de ticket: "REC-6478921234"
    → INSERT Reclamaciones (Estado = "Pendiente")
  → Frontend: 
    → Toast: "Reclamación enviada. Ticket: REC-6478921234"
    → navigate('/perfil?tab=reclamaciones')

Frontend (/admin/reclamaciones - "Actualizar estado a Resuelta")
  → API: PATCH /api/reclamaciones/12/estado
    {
      nuevoEstado: "Resuelta",
      respuestaAdmin: "Hemos procesado tu devolución. El producto correcto será enviado mañana con envío gratis."
    }
  → Backend: ReclamacionService.UpdateEstadoAsync()
    → UPDATE Reclamaciones 
      SET Estado = 'Resuelta', 
          RespuestaAdmin = '...', 
          FechaActualizacion = NOW 
      WHERE Id = 12
    → NotificacionService.CrearNotificacionAsync(
        usuarioId: reclamacion.UsuarioId,
        titulo: "Reclamación resuelta",
        mensaje: "Tu reclamación REC-6478921234 ha sido resuelta. Ver respuesta.",
        tipo: "Sistema",
        enlace: "/perfil?tab=reclamaciones"
      )
  → Frontend: 
    → Refresca tabla
    → Toast: "Estado actualizado correctamente"
```

**Flujo típico**:
1. Cliente crea reclamación → Estado "Pendiente"
2. Admin revisa → Cambia a "EnRevision"
3. Admin investiga, contacta cliente (fuera del sistema)
4. Admin resuelve problema → Cambia a "Resuelta" con respuesta
5. Cliente recibe notificación y lee respuesta en perfil

**Reglas de negocio**:
- Solo el usuario propietario puede ver sus reclamaciones
- Admin puede ver todas
- No se pueden editar reclamaciones (solo crear y cambiar estado)
- Reclamaciones no se eliminan (se mantienen para historial)
- Una reclamación puede NO estar asociada a un pedido (ej: reclamo sobre atención al cliente)

---

### 12. Control de Horario de Tienda

#### Backend (✅ Funcionando 100%)
- **TiendaController**:
  - `GET /api/tienda/configuracion` - Obtener configuración general de la tienda (público)
  - `GET /api/tienda/esta-abierto` - Verificar si la tienda está abierta ahora (público)
  - `PUT /api/tienda/configuracion` - Actualizar configuración (Admin)
  - `POST /api/tienda/horario` - Crear/actualizar horario de un día específico (Admin)

- **TiendaService** - Lógica de negocio:
  - **Configuración de tienda**:
    - `NombreTienda` (string 200)
    - `Telefono` (string 20)
    - `Email` (string 100)
    - `Direccion` (string 500)
    - `SistemaActivoManual` (bool) - Switch maestro para cerrar tienda temporalmente
    - `UsarControlHorario` (bool) - Activar validación de horarios laborales
    - `HoraApertura` (TimeSpan, ej: 08:00)
    - `HoraCierre` (TimeSpan, ej: 18:00)
    - `TiempoEntregaEstimadoHoras` (int, default: 48)
    - `PedidoMinimoCompra` (decimal, default: 15000)

  - **Método `EstaAbierto()`** - Algoritmo de validación:
    1. Si `SistemaActivoManual = false` → tienda CERRADA (cierre forzado por admin)
    2. Si `UsarControlHorario = false` → tienda ABIERTA (sin validar horario)
    3. Si `UsarControlHorario = true`:
       - Obtiene día de la semana actual (ej: "Lunes")
       - Consulta `HorarioDia` para ese día
       - Si no existe registro o `Cerrado = true` → tienda CERRADA
       - Si existe y `Cerrado = false`:
         - Valida hora actual entre `HoraApertura` y `HoraCierre` del día
         - Si está en rango → tienda ABIERTA
         - Si no → tienda CERRADA

  - **Horarios por día** (`HorarioDia`):
    - Tabla separada para flexibilidad (ej: Domingo cerrado, Viernes horario extendido)
    - Si no hay registro para un día → asume horario default de `ConfiguracionTienda`

- **ConfiguracionTiendaDto** - Campos para actualizar:
  - Todos los campos de configuración (mencionados arriba)
  - Validaciones: Email válido, teléfono formato correcto, hora cierre > hora apertura

- **HorarioDiaDto** - Campos para crear/actualizar horario de un día:
  - `DiaSemana` (string: "Lunes", "Martes", ..., "Domingo")
  - `Cerrado` (bool) - Si es true, la tienda está cerrada ese día
  - `HoraApertura` (TimeSpan?)
  - `HoraCierre` (TimeSpan?)

#### Frontend (✅ Funcionando 100%)
- **Hook personalizado**: `useTiendaStatus` (React hook)
  - Llama a `GET /api/tienda/esta-abierto` al montar componente
  - Devuelve: `{ estaAbierta: boolean, configuracion: {...}, loading: boolean }`
  - Se reutiliza en múltiples componentes

- **Uso en Catálogo** (`/catalogo`):
  - Si `estaAbierta = false`:
    - Muestra banner superior rojo: "⚠️ Tienda cerrada. Podrás comprar durante el horario laboral: {HoraApertura} - {HoraCierre}"
    - Botones "Agregar al carrito" deshabilitados (opacidad reducida)
    - Tooltip al hover: "La tienda está cerrada temporalmente"

- **Uso en Checkout** (`/checkout`):
  - Valida `estaAbierta` antes de permitir crear pedido
  - Si `estaAbierta = false`:
    - Muestra mensaje de error: "No se puede procesar el pedido fuera del horario laboral"
    - Botón "Proceder a Pago" deshabilitado
    - Sugiere volver más tarde con horario visible

- **Panel de Admin** (`/admin/configuracion`):
  - **Pestaña "Configuración General"**:
    - Formulario con todos los campos de `ConfiguracionTienda`:
      - Nombre, teléfono, email, dirección (datos de contacto)
      - **Switch "Sistema Activo"**: Permite cerrar tienda temporalmente (ej: vacaciones, mantenimiento)
      - **Checkbox "Usar Control de Horario"**: Activar/desactivar validación de horarios
      - Horario default: Time pickers para HoraApertura y HoraCierre
      - Tiempo de entrega (input numérico en horas)
      - Pedido mínimo (input numérico en COP)
    - Botón "Guardar Cambios" → PUT /api/tienda/configuracion

  - **Pestaña "Horarios por Día"**:
    - Tabla con 7 filas (Lunes a Domingo):
      - Columna "Día"
      - Columna "Estado" (Switch: Abierto/Cerrado)
      - Columnas "Apertura" y "Cierre" (time pickers, deshabilitados si cerrado)
      - Botón "Actualizar" por fila
    - Permite configurar horarios especiales (ej: Sábado 10:00-14:00, Domingo cerrado)

- **Indicador en Navbar** (opcional):
  - Badge verde "ABIERTO" / rojo "CERRADO" junto al logo
  - Solo visible en vista pública (no en admin)

#### Base de Datos (✅ Funcionando 100%)
- **Tabla**: `ConfiguracionTienda`
  - **Campos**:
    - `Id` (PK, único - siempre ID = 1, singleton)
    - `NombreTienda`, `Telefono`, `Email`, `Direccion`
    - `SistemaActivoManual` (bool, default: true)
    - `UsarControlHorario` (bool, default: true)
    - `HoraApertura` (TimeSpan, default: 08:00)
    - `HoraCierre` (TimeSpan, default: 18:00)
    - `TiempoEntregaEstimadoHoras` (int, default: 48)
    - `PedidoMinimoCompra` (decimal, default: 15000.00)
    - `FechaActualizacion` (DateTime)

- **Tabla**: `HorarioDia` (0 a 7 registros)
  - **Campos**:
    - `Id` (PK)
    - `DiaSemana` (string 20, único: "Lunes", "Martes", etc.)
    - `Cerrado` (bool, default: false)
    - `HoraApertura` (TimeSpan?, nullable)
    - `HoraCierre` (TimeSpan?, nullable)

- **Seed inicial** (migración o seed):
  - `ConfiguracionTienda`: 1 registro con valores default
  - `HorarioDia`: 7 registros (Lunes a Viernes abiertos 08:00-18:00, Sábado 09:00-14:00, Domingo cerrado)

#### Integración
```
Frontend (catalogo.tsx - useEffect inicial)
  → Hook: useTiendaStatus()
    → API: GET /api/tienda/esta-abierto
  → Backend: TiendaService.EstaAbierto()
    → Obtiene ConfiguracionTienda (único registro)
    → Si SistemaActivoManual = false → return { estaAbierta: false, motivo: "Cierre manual" }
    → Si UsarControlHorario = false → return { estaAbierta: true }
    → Si UsarControlHorario = true:
      → Obtiene día actual: var dia = DateTime.UtcNow.DayOfWeek.ToString() // "Monday" → "Lunes"
      → Consulta HorarioDia para ese día
      → Si no existe o Cerrado = true → return { estaAbierta: false, motivo: "Día no laboral" }
      → Si existe y Cerrado = false:
        → Valida TimeSpan.Now entre HoraApertura y HoraCierre
        → return { estaAbierta: (hora en rango) }
  → Frontend:
    → Si estaAbierta = false → Muestra banner "Tienda cerrada"
    → Deshabilita botones de compra

Frontend (checkout.tsx - al crear pedido)
  → Validación pre-submit: if (!estaAbierta) → error, no llama API
  → Si pasa validación:
    → API: POST /api/pedidos { ... }
  → Backend: PedidoService.CreateAsync()
    → Valida nuevamente con TiendaService.EstaAbierto()
    → Si cerrada → throw new BadRequestException("Tienda cerrada")
    → Si abierta → continúa con creación

Frontend (/admin/configuracion - "Cerrar tienda temporalmente")
  → Switch SistemaActivoManual → false
  → API: PUT /api/tienda/configuracion { sistemaActivoManual: false, ... }
  → Backend: UPDATE ConfiguracionTienda SET SistemaActivoManual = 0, FechaActualizacion = NOW
  → Frontend: Toast "Tienda cerrada. Los clientes no podrán realizar pedidos"
  → Efecto inmediato: todos los requests a /api/tienda/esta-abierto devuelven false
```

**Casos de uso**:
1. **Cierre por vacaciones**: Admin desactiva `SistemaActivoManual` → tienda cerrada sin importar horario
2. **Cambio de horario temporal**: Admin ajusta `HoraApertura`/`HoraCierre` en `ConfiguracionTienda`
3. **Horario especial por día**: Admin configura en `HorarioDia` (ej: Sábado solo medio día)
4. **Desactivar control de horario**: Admin desactiva `UsarControlHorario` → tienda siempre abierta (útil para e-commerce 24/7)

**Validaciones de seguridad**:
- Validación doble: frontend (UX) + backend (seguridad) - evita bypass manipulando request
- Pedidos creados cuando tienda cerrada son rechazados con error 400

---

## Componentes con Funcionalidad Parcial o Pendiente

| Componente | Estado | Notas |
|------------|--------|-------|
| Pasteles personalizados | ❌ Incompleto | Entidades eliminadas (PersonalizadoConfig, Ingrediente) — funcionalidad no implementada |
| Seguimiento de envíos | ⚠️ Parcial | GPS disponible en DireccionEnvio, pero frontend no muestra tracking en tiempo real |
| Sistema de facturación real | ⚠️ Parcial | Solo PDF básico, no integración con Dian (autorización facturación electrónica) |
| Integración con procesador real | ❌ No | Solo simulado — aceptar cualquier tarjeta con formato válido |
| PedidoHistorial | ⚠️ Parcial | Tabla se puebla automáticamente pero frontend no muestra timeline visual |
| Notificaciones push | ❌ Pendiente | Polling cada 30s, WebSocket/SignalR no implementado |

**Corrección importante** (03/04/2026):
- La entidad **CategoriaProducto NO es "fantasma"** — está activa y correctamente relacionada con Productos mediante FK `Productos.CategoriaId`. Se usa para filtrar productos por categoría en el catálogo. La documentación anterior estaba obsoleta.

---

## Resumen de Cambios Recientes en la Base de Datos

### Tablas Eliminadas (26/03/2026)
- `Factura` — funcionalidad de facturación no implementada
- `Envios` — información de envío integrada en DireccionEnvio
- `MetodosPagoUsuario` — simplificación de pagos
- `TiposMetodoPago` — MetodoPago ahora es string en Pedido
- `PersonalizadoConfig` — personalización de pasteles eliminada
- `Ingrediente` — ingredientes de personalización eliminados
- `PersonalizadoConfigIngrediente` — relación eliminada

### Columnas Eliminadas (26/03/2026)
- `Pedido.IVA` — IVA eliminado (no se calcula)
- `Pedido.MetodoPagoId` — simplificado a string
- `Users.Direccion` — integrada en DireccionEnvio
- `Reviews.AprobadaPor` — simplificación de moderación

### Nuevas Columnas (Abril 2026)
- `Producto.StockIlimitado` (02/04/2026) — boolean para productos sin límite de stock
- `DireccionEnvio.Latitud`, `DireccionEnvio.Longitud` (02/04/2026) — GPS para tracking

---

## Flujo de Datos Resumido

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   FRONTEND  │────▶│    BACKEND   │────▶│      BD     │
└─────────────┘     └──────────────┘     └─────────────┘
      │                   │                    │
      │                   │                    │
 Catalogo ──────────▶ ProductosController ──▶ Productos
 Carrito ────────────▶ CarritoController ───▶ CarritoItems
 Checkout ──────────▶ PedidoService ───────▶ Pedido, Direccion
 Payment ────────────▶ PagosController ─────▶ RegistroPago
 Perfil ────────────▶ UsersController ─────▶ Users
 Admin ────────────▶ DashboardController ──▶ Aggregates
```

---

## Conclusión

**El sistema está FUNCIONANDO** para los flujos principales:
- Registro/Login ✅
- Navegación de catálogo ✅
- Carrito de compras ✅
- Checkout completo ✅
- Pagos simulados ✅
- Pedidos y seguimiento ✅
- Panel de administración ✅
- Promociones ✅
- Notificaciones ✅
- Reclamaciones ✅
- Control de horario ✅

**Áreas a mejorar o completar:**
- Sistema de personalización de pasteles (incompleto)
- Seguimiento de envíos (parcial)
- Facturación electrónica (solo PDF)
- Integración con procesador de pagos real
- Limpieza de código obsoleto (ePayco)
- Consumir PedidoHistorial en frontend