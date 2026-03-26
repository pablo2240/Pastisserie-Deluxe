# Funcionamiento Actual del Sistema

## Resumen

El sistema PastisserieDeluxe es una tienda online de repostería con un flujo completo de e-commerce: autenticación, catálogo, carrito, checkout, pedidos y panel de administración. A continuación se documenta qué partes están funcionando correctamente y cómo interactúan los componentes.

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

#### Backend (Funcionando ✅)
- **ProductosController**:
  - `GET /api/productos` - Listar todos
  - `GET /api/productos/{id}` - Ver detalle con reviews
  - `POST /api/productos` - Crear (Admin)
  - `PUT /api/productos/{id}` - Actualizar (Admin)
  - `DELETE /api/productos/{id}` - Eliminar (Admin)
  - `GET /api/productos/activos` - Solo activos

- **ProductoService**:
  - Paginación
  - Filtros por categoría
  - Reviews incluidas

#### Frontend (Funcionando ✅)
- `/productos` - Catálogo con filtros (categoría, precio, búsqueda)
- `/productos/{id}` - Detalle del producto con reviews
- `ProductCard.tsx` - Componente de tarjeta
- `ProductReviews.tsx` - Componente de reseñas

#### Base de Datos (Funcionando ✅)
- Tablas: `Productos`, `Reviews`
- Productos tienen campo `Categoria` (string, NO relacionado a CategoriaProducto)

#### Integración
```
Frontend (catalogo.tsx)
  → API: GET /api/productos
  → Backend: ProductoService.GetAllAsync()
  → DB: SELECT * FROM Productos WHERE Activo = 1
  → Frontend: Muestra grid de ProductCard
```

---

### 3. Carrito de Compras

#### Backend (Funcionando ✅)
- **CarritoController**:
  - `GET /api/carrito` - Ver carrito del usuario
  - `POST /api/carrito/agregar` - Agregar item
  - `PUT /api/carrito/actualizar` - Actualizar cantidad
  - `DELETE /api/carrito/{itemId}` - Eliminar item
  - `DELETE /api/carrito/vaciar` - Vaciar carrito

- **CarritoService**:
  - Gestión de items con soporte para promociones
  - Cálculo automático de totales

#### Frontend (Funcionando ✅)
- `CartContext.tsx` - Estado global del carrito
- `/carrito` - Página de carrito
- `CartSidebar.tsx` - Sidebar flotante
- Actualización en tiempo real del contador

#### Base de Datos (Funcionando ✅)
- Tablas: `CarritoCompra`, `CarritoItem`
- Un carrito por usuario (relación 1:1)
- CarritoItem soporta: ProductoId nullable, PromocionId nullable, PrecioOriginal

#### Integración
```
Frontend (ProductCard - "Agregar al carrito")
  → API: POST /api/carrito/agregar
  → Backend: CarritoService.AddItemAsync()
  → DB: INSERT CarritoItems
  → Frontend: CartContext actualiza estado
  → Sidebar muestra nuevo total
```

---

### 4. Checkout y Creación de Pedidos

#### Backend (Funcionando ✅)
- **PedidoService.CreateAsync()**:
  1. Valida horario laboral
  2. Obtiene carrito del usuario
  3. Valida stock (sin descontar aún)
  4. Crea dirección de envío (nueva entidad)
  5. Mapea items del carrito a PedidoItems
  6. Calcula totales (sin IVA, costo envío por comuna)
  7. Crea pedido en estado "Pendiente"
  8. NO descuenta stock (se hace al confirmar pago)

- **Campos importantes en CreatePedidoRequestDto**:
  - `Direccion`, `Comuna`, `Telefono`, `Notas`
  - `MetodoPago` (simulado)

- **Costos de envío** (hardcodeados en PedidoService):
  - Guayabal: 5000 COP
  - Belén: 6000 COP

#### Frontend (Funcionando ✅)
- `/checkout` - Flujo de 3 pasos:
  1. **Shipping**: Datos de envío (autocompletado desde perfil)
  2. **Summary**: Resumen del pedido
  3. **Payment**: Formulario de tarjeta (inline, no redirige)

- **Validaciones**:
  - Compra mínima: 15000 COP
  - Comuna válida: Solo Guayabal o Belén
  - Tienda abierta (verificado con useTiendaStatus)

#### Base de Datos (Funcionando ✅)
- Tablas: `Pedido`, `PedidoItem`, `DireccionEnvio`
- Pedido referenciado a: Usuario, MetodoPago, DireccionEnvio
- DireccionEnvio creada staticamente con datos del checkout

#### Integración
```
Frontend (checkout.tsx - "Confirmar y Pagar")
  → API: POST /api/pedidos
  → Backend: PedidoService.CreateAsync()
  → DB: INSERT Pedido, PedidoItems, DireccionEnvio
  → Frontend: setStep('payment') 
  → Usuario ingresa datos de tarjeta
```

---

### 5. Sistema de Pago (Simulado)

#### Backend (Funcionando ✅)
- **PagosController**:
  - `POST /api/pagos/{pedidoId}/simular` - Simular pago
  - `PATCH /api/pagos/{pedidoId}/registrar-intento` - Registrar entrada a pago
  - `PATCH /api/pagos/{pedidoId}/abandonar` - Registrar abandono
  - `PATCH /api/pagos/{pedidoId}/confirmar` - Confirmar éxito

- **Lógica**:
  1. Al entrar a payment → registrar intento (estado "Espera")
  2. Al confirmar pago → descontar stock, cambiar estado a "Confirmado"
  3. Al abandonar → estado "Fallido", stock no afectado

#### Frontend (Funcionando ✅)
- Formulario de tarjeta en paso 3 del checkout
- Validación de: número (16 dígitos), nombre, expiración, CVV (3 dígitos)
- Simulación de procesamiento (loader)
- Redirección a página de éxito

#### Base de Datos (Funcionando ✅)
- Tabla: `RegistroPago`
- Campos: PedidoId, UsuarioId, Estado, FechaIntento, ReferenciaExterna

#### Integración
```
Frontend (checkout.tsx - "Pagar")
  → API: POST /api/pagos/1/simular
  → Backend: Valida datos, marca pedido aprobado
  → DB: UPDATE Pedido SET Estado='Confirmado', Aprobado=1
  → Descuenta stock de productos
  → Frontend: clearCart(), navigate('/checkout?success=true')
```

---

### 6. Gestión de Pedidos

#### Backend (Funcionando ✅)
- **PedidosController**:
  - `GET /api/pedidos` - Listar todos (Admin)
  - `GET /api/pedidos/mis-pedidos` - Del usuario actual
  - `GET /api/pedidos/{id}` - Ver detalle
  - `PATCH /api/pedidos/{id}/estado` - Cambiar estado
  - `POST /api/pedidos/{id}/asignar-repartidor` - Asignar repartidor
  - `DELETE /api/pedidos/{id}` - Eliminar (restaurar stock)

- **Estados de pedido**: Pendiente, Confirmado, EnProceso, Listo, EnCamino, Entregado, NoEntregado, Cancelado

- **Notificaciones**: Se crean automáticamente al cambiar estado

#### Frontend (Funcionando ✅)
- `/perfil` - "Mis Pedidos" con lista y detalles
- `/admin/pedidos` - Panel admin con todos los pedidos
- Estados visualizados con badges de color
- Opción de cancelar (solo si no ha sido procesado)

#### Base de Datos (Funcionando ✅)
- Tablas: `Pedido`, `PedidoItem`, `PedidoHistorial`
- PedidoHistorial se crea pero no se consume en frontend

#### Integración
```
Frontend (/perfil - "Ver detalles")
  → API: GET /api/pedidos/1
  → Backend: PedidoService.GetByIdAsync()
  → DB: SELECT * FROM Pedido WHERE Id = 1 (con Includes)
  → Frontend: Muestra detalle con items, dirección, totales
```

---

### 7. Promociones

#### Backend (Funcionando ✅)
- **PromocionesController**:
  - `GET /api/promociones` - Listar vigentes (público) o todas (admin)
  - `GET /api/promociones/{id}` - Ver detalle
  - `POST /api/promociones` - Crear (Admin)
  - `PUT /api/promociones/{id}` - Actualizar (Admin)
  - `DELETE /api/promociones/{id}` - Eliminar (Admin)

- **Tipos de promoción**:
  - **Vinculada a producto**: ProductoId != null, usa precio del producto
  - **Independiente**: ProductoId == null, tiene PrecioOriginal e ImagenUrl propios

- **Descuentos**: Porcentaje o MontoFijo

#### Frontend (Funcionando ✅)
- `/promociones` - Página de promociones vigentes
- Banner en home
- Se muestran en catálogo con precio tachado
- Stock para independientes (se descuenta al comprar)

#### Base de Datos (Funcionando ✅)
- Tabla: `Promociones`
- Campos clave: ProductoId (nullable), Stock (nullable), PrecioOriginal, ImagenUrl

#### Integración
```
Frontend (promociones.tsx)
  → GET /api/promociones
  → Backend: PromocionesService.GetAllAsync() (solo vigentes)
  → Frontend: Muestra grid de promociones
```

---

### 8. Reviews/Reseñas

#### Backend (Funcionando ✅)
- **ReviewsController**:
  - `GET /api/reviews/producto/{productoId}` - Reseñas de un producto
  - `POST /api/reviews` - Crear reseñ;a (usuario autenticado)
  - `PATCH /api/reviews/{id}/aprobar` - Aprobar (Admin)

- **Campo importante**: `Aprobada` - Las reseñas requieren aprobación admin

#### Frontend (Funcionando ✅)
- En `/productos/{id}`: Lista de reviews aprobadas
- Promedio de calificación calculado
- En admin: `/admin/resenas` para aprobar/rechazar

#### Base de Datos (Funcionando ✅)
- Tabla: `Reviews`
- Relación: Usuario, Producto

---

### 9. Dashboard Admin

#### Backend (Funcionando ✅)
- **DashboardController**:
  - `GET /api/dashboard/estadisticas` - KPIs
  - `GET /api/dashboard/ventas` - Datos para gráfico
  - `GET /api/dashboard/top-productos` - Productos más vendidos
  - `GET /api/dashboard/pedidos-recientes` - Últimos pedidos

#### Frontend (Funcionando ✅)
- `/admin` - Dashboard con:
  - KPIs: Ventas hoy, pedidos hoy, productos bajos stock, usuarios nuevos
  - Gráfico de ventas (barras por día)
  - Top 5 productos
  - Lista de pedidos recientes
- `/admin/productos` - CRUD de productos
- `/admin/usuarios` - Gestión de usuarios
- `/admin/promociones` - CRUD de promociones
- `/admin/resenas` - Aprobar reseñas
- `/admin/configuracion` - Configurar tienda
- `/admin/reportes` - Reportes

#### Base de Datos (Funcionando ✅)
- Consultas agregadas sobre Pedidos, Productos, Users

---

### 10. Sistema de Notificaciones

#### Backend (Funcionando ✅)
- **NotificacionService**:
  - `CrearNotificacionAsync()` - Crear notificación
  - `GetByUsuarioAsync()` - Obtener del usuario

- **Triggers**:
  - Cambio de estado de pedido
  - Asignación de repartidor
  - Pedido no entregado

#### Frontend (Funcionando ✅)
- `Notificaciones.tsx` - Componente en navbar
- Badge con contador de no leídas
- Lista desplegable con notificaciones

#### Base de Datos (Funcionando ✅)
- Tabla: `Notificaciones`
- Campos: UsuarioId, Titulo, Tipo, Mensaje, Enlace, Leida

---

### 11. Reclamaciones

#### Backend (Funcionando ✅)
- **ReclamacionesController**:
  - `GET /api/reclamaciones/mis-reclamaciones` - Del usuario
  - `GET /api/reclamaciones` - Todas (Admin)
  - `POST /api/reclamaciones` - Crear
  - `PATCH /api/reclamaciones/{id}/estado` - Actualizar estado

#### Frontend (Funcionando ✅)
- `/reclamaciones` - Formulario para crear reclamación
- En perfil: historial de reclamaciones

#### Base de Datos (Funcionando ✅)
- Tabla: `Reclamaciones`
- Estados: Pendiente, EnRevision, Resuelta, Rechazada

---

### 12. Control de Horario de Tienda

#### Backend (Funcionando ✅)
- **TiendaService**:
  - `GetConfiguracionAsync()` - Obtener configuración
  - `EstaAbierto()` - Verificar si la tienda está abierta

- **Validaciones**:
  - SistemaActivoManual (cierre manual)
  - UsarControlHorario (validar horario)
  - HoraApertura, HoraCierre
  - DiasLaborales

#### Frontend (Funcionando ✅)
- `useTiendaStatus` hook
- Bloquea checkout cuando está cerrado
- Muestra banner en catálogo

#### Base de Datos (Funcionando ✅)
- Tablas: `ConfiguracionTienda`, `HorarioDia`

---

## Componentes que NO están funcionando o están incompletos

| Componente | Estado | Notas |
|------------|--------|-------|
| Pasteles personalizados | ❌ Incompleto | Entidades definidas pero no integradas |
| Envío real (seguimiento) | ⚠️ Parcial | Se crea registro pero no se actualiza |
| Sistema de facturación real | ⚠️ PDF básico | Solo PDF, no integración con Dian |
| Integración con procesador real | ❌ No | Solo simulado |
| CategoriaProducto | ⚠️ Fantasma | Entidad sin uso |

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