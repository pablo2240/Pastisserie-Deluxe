# Roles del Sistema - Permisos y Funcionalidades

**Última actualización**: 03/04/2026  
**Versión**: 2.0  
**Estado**: ✅ **85-90% FUNCIONAL**

## Resumen de Roles

El sistema PastisserieDeluxe tiene **3 roles principales** definidos en la base de datos y utilizados en la autenticación JWT:

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| `Admin` | Administrador de la tienda | Panel completo, CRUD total |
| `Usuario` (Cliente) | Cliente registrado | Su propia cuenta, pedidos, carrito |
| `Repartidor` | Repartidor de pedidos | Pedidos asignados únicamente |

---

## 1. Rol: Admin

### 1.1 Permisos en Backend

| Endpoint | Método | Acción |
|----------|--------|--------|
| `/api/dashboard/admin` | GET | ✅ Estadísticas completas del dashboard |
| `/api/dashboard/repartidor` | GET | ✅ Dashboard del repartidor |
| `/api/productos` | GET, POST, PUT, DELETE | ✅ CRUD completo de productos |
| `/api/productos/activos` | GET | ✅ Ver productos activos |
| `/api/pedidos` | GET | ✅ Ver todos los pedidos (no cancelados) |
| `/api/pedidos/todos` | GET | ✅ Ver todos los pedidos incluyendo cancelados |
| `/api/pedidos/{id}/estado` | PUT | ✅ Cambiar estado de cualquier pedido |
| `/api/pedidos/{id}/asignar-repartidor` | PATCH | ✅ Asignar repartidor |
| `/api/pedidos/{id}` | DELETE | ✅ Eliminar cualquier pedido |
| `/api/promociones` | GET, POST, PUT, DELETE | ✅ CRUD completo de promociones |
| `/api/promociones?mostrarTodas=true` | GET | ✅ Ver todas las promociones (vigentes y no vigentes) |
| `/api/usuarios` | GET | ✅ Ver todos los usuarios |
| `/api/usuarios/{id}` | GET, PUT, DELETE | ✅ Gestionar usuario específico |
| `/api/categorias` | GET, POST, PUT, DELETE | ✅ CRUD de categorías |
| `/api/reviews` | GET | ✅ Ver todas las reseñas |
| `/api/reviews/{id}/aprobar` | PATCH | ✅ Aprobar/rechazar reseñas |
| `/api/configuracion` | GET, PUT | ✅ Configuración de la tienda |
| `/api/reclamaciones` | GET | ✅ Ver todas las reclamaciones |
| `/api/reclamaciones/{id}/estado` | PATCH | ✅ Cambiar estado de reclamación |
| `/api/envios` | GET | ✅ Ver envíos |
| `/api/pedidos/{id}/factura` | GET | ✅ Generar factura PDF |

### 1.2 Permisos en Frontend

| Ruta | Componente | Acceso |
|------|------------|--------|
| `/admin` | Dashboard | ✅ KPIs, gráficos, pedidos recientes |
| `/admin/productos` | ProductosAdmin | ✅ CRUD completo |
| `/admin/pedidos` | AdminOrders | ✅ Lista y gestión de pedidos |
| `/admin/usuarios` | UsuariosAdmin | ✅ Gestionar usuarios |
| `/admin/promociones` | PromocionesAdmin | ✅ CRUD completo |
| `/admin/configuracion` | Configuracion | ✅ Configurar tienda |
| `/admin/resenas` | ResenasAdmin | ✅ Aprobar reseñas |
| `/admin/reportes` | ReportesAdmin | ✅ Ver reportes |

### 1.3 Acceso a Base de Datos

| Tabla | Permiso |
|-------|---------|
| `Users` | SELECT, INSERT, UPDATE, DELETE |
| `Roles` | SELECT |
| `UserRoles` | SELECT, INSERT, DELETE |
| `Productos` | SELECT, INSERT, UPDATE, DELETE |
| `CategoriaProducto` | SELECT, INSERT, UPDATE, DELETE |
| `Reviews` | SELECT, UPDATE |
| `Pedido` | SELECT, UPDATE, DELETE |
| `PedidoItem` | SELECT, UPDATE, DELETE |
| `PedidoHistorial` | SELECT |
| `Promociones` | SELECT, INSERT, UPDATE, DELETE |
| `CarritoCompra` | SELECT |
| `CarritoItems` | SELECT |
| `DireccionEnvio` | SELECT, INSERT, UPDATE, DELETE |
| `RegistroPago` | SELECT |
| `ConfiguracionTienda` | SELECT, UPDATE |
| `HorarioDia` | SELECT, INSERT, UPDATE, DELETE |
| `Notificaciones` | SELECT |
| `Reclamaciones` | SELECT, UPDATE |

> **Nota** (03/04/2026): Las tablas `MetodosPagoUsuario`, `Envios`, `Factura` fueron eliminadas el 26/03/2026 — ya no existen en la base de datos.

### 1.4 Funcionalidades del Admin

- **Dashboard**: Estadísticas de ventas, pedidos, productos, usuarios
- **Gestión de Productos**: Crear, editar, eliminar, activar/desactivar
- **Gestión de Pedidos**: Ver todos, cambiar estados, asignar repartidor, cancelar
- **Gestión de Promociones**: Crear promociones vinculadas o independientes
- **Gestión de Usuarios**: Ver, editar roles, desactivar usuarios
- **Gestión de Reseñas**: Aprobar o rechazar reseñas de productos
- **Gestión de Reclamaciones**: Atender y resolver reclamaciones
- **Configuración**: Horario laboral, costos de envío, compra mínima, textos
- **Reportes**: Estadísticas y métricas

---

## 2. Rol: Usuario (Cliente)

### 2.1 Permisos en Backend

| Endpoint | Método | Acción |
|----------|--------|--------|
| `/api/auth/register` | POST | ✅ Registrarse |
| `/api/auth/login` | POST | ✅ Iniciar sesión |
| `/api/auth/perfil` | GET | ✅ Ver perfil propio |
| `/api/auth/perfil` | PUT | ✅ Actualizar perfil |
| `/api/auth/change-password` | POST | ✅ Cambiar contraseña |
| `/api/auth/forgot-password` | POST | ✅ Solicitar recuperación |
| `/api/auth/reset-password` | POST | ✅ Restablecer contraseña |
| `/api/productos` | GET | ✅ Ver catálogo |
| `/api/productos/{id}` | GET | ✅ Ver detalle de producto |
| `/api/productos/activos` | GET | ✅ Ver productos activos |
| `/api/promociones` | GET | ✅ Ver promociones vigentes |
| `/api/carrito` | GET | ✅ Ver carrito propio |
| `/api/carrito/agregar` | POST | ✅ Agregar al carrito |
| `/api/carrito/actualizar` | PUT | ✅ Actualizar cantidad |
| `/api/carrito/{itemId}` | DELETE | ✅ Eliminar item del carrito |
| `/api/carrito/vaciar` | DELETE | ✅ Vaciar carrito |
| `/api/pedidos` | POST | ✅ Crear pedido |
| `/api/pedidos/mis-pedidos` | GET | ✅ Ver mis pedidos |
| `/api/pedidos/{id}` | GET | ✅ Ver detalle de pedido |
| `/api/pedidos/{id}/factura` | GET | ✅ Descargar factura PDF |
| `/api/pedidos/{id}` | DELETE | ✅ Eliminar mi propio pedido (si aplica) |
| `/api/direcciones` | GET | ✅ Ver mis direcciones |
| `/api/direcciones` | POST | ✅ Agregar dirección |
| `/api/direcciones/{id}` | PUT, DELETE | ✅ Editar/eliminar dirección |
| `/api/reviews` | POST | ✅ Crear reseña |
| `/api/reviews/producto/{id}` | GET | ✅ Ver reseñas de producto |
| `/api/reclamaciones/mis-reclamaciones` | GET | ✅ Ver mis reclamaciones |
| `/api/reclamaciones` | POST | ✅ Crear reclamación |
| `/api/notificaciones` | GET | ✅ Ver mis notificaciones |
| `/api/notificaciones/{id}/leida` | PATCH | ✅ Marcar como leída |

### 2.2 Permisos en Frontend

| Ruta | Componente | Acceso |
|------|------------|--------|
| `/` | Home | ✅ |
| `/productos` | Catalogo | ✅ |
| `/productos/{id}` | ProductDetail | ✅ |
| `/promociones` | Promociones | ✅ |
| `/contacto` | Contacto | ✅ |
| `/login` | Login | ✅ |
| `/registro` | Register | ✅ |
| `/forgot-password` | ForgotPassword | ✅ |
| `/carrito` | Carrito | ✅ |
| `/checkout` | Checkout | ✅ (requiere auth) |
| `/perfil` | Perfil | ✅ (requiere auth) |
| `/perfil/direcciones` | Direcciones | ✅ (requiere auth) |
| `/reclamaciones` | Reclamaciones | ✅ (requiere auth) |

### 2.3 Acceso a Base de Datos

| Tabla | Permiso |
|-------|---------|
| `Users` | SELECT, UPDATE (propio registro) |
| `Pedido` | SELECT (propios), INSERT, DELETE (propios si aplica) |
| `PedidoItem` | SELECT (propios) |
| `CarritoCompra` | SELECT, INSERT, UPDATE (propio) |
| `CarritoItems` | SELECT, INSERT, UPDATE, DELETE (propio) |
| `DireccionEnvio` | SELECT, INSERT, UPDATE, DELETE (propias) |
| `Reviews` | INSERT (propias), SELECT (todas aprobadas) |
| `Reclamaciones` | INSERT (propias), SELECT (propias) |
| `Notificaciones` | SELECT (propias), UPDATE (propias) |
| `RegistroPago` | SELECT (propios) |

> **Nota** (03/04/2026): Las tablas `MetodosPagoUsuario`, `Factura` fueron eliminadas el 26/03/2026.

### 2.4 Funcionalidades del Usuario

- **Catálogo**: Navegar, buscar, filtrar productos
- **Carrito**: Agregar, actualizar quantities, eliminar items
- **Checkout**: Completar compra con datos de envío y pago
- **Pedidos**: Ver historial, detalles, descargar facturas
- **Perfil**: Editar información personal, dirección, teléfono
- **Direcciones**: Gestionar múltiples direcciones de envío
- **Reseñas**: Reseñar productos comprados
- **Reclamaciones**: Crear reclamaciones sobre pedidos
- **Notificaciones**: Recibir alertas sobre estado de pedidos

### 2.5 Restricciones del Usuario

- ❌ No puede ver pedidos de otros usuarios
- ❌ No puede acceder al panel de administración
- ❌ No puede gestionar productos
- ❌ No puede gestionar otros usuarios
- ❌ No puede crear promociones
- ❌ No puede aprobar reseñas
- ❌ No puede ver estadísticas del dashboard

---

## 3. Rol: Repartidor

### 3.1 Permisos en Backend

| Endpoint | Método | Acción |
|----------|--------|--------|
| `/api/auth/login` | POST | ✅ Iniciar sesión |
| `/api/auth/perfil` | GET | ✅ Ver perfil propio |
| `/api/auth/perfil` | PUT | ✅ Actualizar perfil propio |
| `/api/dashboard/repartidor` | GET | ✅ Dashboard del repartidor |
| `/api/pedidos/repartidor` | GET | ✅ Ver pedidos asignados |
| `/api/pedidos/{id}/estado` | PUT | ✅ Actualizar estado de pedidos asignados |
| `/api/notificaciones` | GET | ✅ Ver notificaciones |

### 3.2 Permisos en Frontend

| Ruta | Componente | Acceso |
|------|------------|--------|
| `/repartidor` | RepartidorDashboard | ✅ (requiere auth) |

### 3.3 Acceso a Base de Datos

| Tabla | Permiso |
|-------|---------|
| `Users` | SELECT, UPDATE (propio) |
| `Pedido` | SELECT (asignados), UPDATE (asignados) |
| `PedidoItem` | SELECT (de pedidos asignados) |
| `DireccionEnvio` | SELECT (de pedidos asignados, incluye GPS Latitud/Longitud) |
| `Notificaciones` | SELECT (propias) |

> **Nota** (03/04/2026): La tabla `Envios` fue eliminada el 26/03/2026 — el seguimiento de envíos ahora usa GPS en `DireccionEnvio`.

### 3.4 Funcionalidades del Repartidor

- **Dashboard**: Ver pedidos asignados, métricas personales
- **Lista de Pedidos**: Ver pedidos asignados (estado EnCamino, Confirmado)
- **Actualizar Estado**: Marcar pedidos como "Entregado" o "NoEntregado"
- **Ver Detalles**: Dirección de entrega, datos del cliente, teléfono

### 3.5 Restricciones del Repartidor

- ❌ No puede ver todos los pedidos del sistema
- ❌ No puede crear ni eliminar pedidos
- ❌ No puede gestionar productos
- ❌ No puede gestionar usuarios
- ❌ No puede acceder al panel de administración
- ❌ No puede crear promociones
- ❌ No puede aprobar reseñas
- ❌ No puede gestionar configuración

---

## 4. Comparación de Permisos por Rol

| Funcionalidad | Admin | Usuario | Repartidor |
|---------------|:-----:|:-------:|:----------:|
| **Catálogo de Productos** | ✅ | ✅ | ✅ |
| **Ver promociones** | ✅ | ✅ | ✅ |
| **Gestión de Carrito** | ❌ | ✅ | ❌ |
| **Crear Pedidos** | ❌ | ✅ | ❌ |
| **Ver todos los Pedidos** | ✅ | ❌ | ❌ |
| **Ver Mis Pedidos** | ✅ | ✅ | ✅ |
| **Ver Pedidos Asignados** | ✅ | ❌ | ✅ |
| **Cambiar Estado Pedido** | ✅ | ❌ | ✅ (asignados) |
| **Asignar Repartidor** | ✅ | ❌ | ❌ |
| **Gestión de Productos (CRUD)** | ✅ | ❌ | ❌ |
| **Gestión de Promociones** | ✅ | ❌ | ❌ |
| **Gestión de Usuarios** | ✅ | ❌ | ❌ |
| **Gestión de Reseñas** | ✅ | ✅ (crear) | ❌ |
| **Aprobar Reseñas** | ✅ | ❌ | ❌ |
| **Gestión de Reclamaciones** | ✅ | ✅ (crear) | ❌ |
| **Ver Dashboard** | ✅ (admin) | ❌ | ✅ (repartidor) |
| **Configuración Tienda** | ✅ | ❌ | ❌ |
| **Gestión de Direcciones** | ❌ | ✅ | ❌ |
| **Crear Reseñas** | ✅ | ✅ | ❌ |
| **Descargar Factura** | ✅ (todos) | ✅ (propios) | ✅ (asignados) |

---

## 5. Implementación Técnica

### 5.1 Backend - Autorización

La autorización se implementa mediante atributos `[Authorize]` y `[Authorize(Roles = "...")]`:

```csharp
// Solo Admin puede acceder
[Authorize(Roles = "Admin")]
[HttpGet]
public IActionResult GetAll() { ... }

// Solo Repartidor puede acceder
[Authorize(Roles = "Repartidor")]
[HttpGet]
public IActionResult GetMisEntregas() { ... }

// Cualquier usuario autenticado
[Authorize]
[HttpGet]
public IActionResult GetMisPedidos() { ... }
```

### 5.2 Frontend - Protección de Rutas

En `ProtectedRoute.tsx`:

```typescript
// Solo Admin
<Route element={<ProtectedRoute adminOnly />}>
  <Route path="/admin" ... />
</Route>

// Solo Repartidor
<Route element={<ProtectedRoute roleRequired="Repartidor" />}>
  <Route path="/repartidor" ... />
</Route>
```

### 5.3 Frontend - Obtención de Rol

El rol se extrae del token JWT en `AuthContext.tsx`:

```typescript
const getRoleFromToken = (token: string): string => {
  // Lee el claim "role" del token
  return payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
    || payload["role"]
    || "Usuario";
};
```

---

## 6. Notas Adicionales

### 6.1 Roles Adicionales (Definidos pero no usados)

En el código hay menciones a otros nombres de rol:
- `Administrador` - Sinónimo de Admin (usado en algunos controladores)
- `Administrator` - Sinónimo de Admin

### 6.2 Estados de Pedido y su Relación con Roles

| Estado | Admin | Usuario | Repartidor |
|--------|:-----:|:-------:|:----------:|
| Pendiente | ✅ cambiar | ❌ | ❌ |
| Confirmado | ✅ cambiar | ❌ | ❌ |
| EnProceso | ✅ cambiar | ❌ | ❌ |
| Listo | ✅ cambiar | ❌ | ❌ |
| EnCamino | ✅ cambiar | ver | ✅ cambiar (asignados) |
| Entregado | ✅ cambiar | ver | ✅ cambiar (asignados) |
| NoEntregado | ✅ cambiar | ver | ✅ cambiar (asignados) |
| Cancelado | ✅ cambiar | ❌ | ❌ |

### 6.3 Seguridad a Nivel de Datos

- **Usuario** solo puede ver/editar sus propios registros (filtrado por `userId` del token)
- **Repartidor** solo puede ver pedidos donde `RepartidorId == userId`
- **Admin** tiene acceso completo a todos los registros

---

## 7. Roles en la Base de Datos

### 7.1 Tabla Roles ( seed data)

El sistema incluye los siguientes roles por defecto:

| Id | Nombre | Descripción |
|----|--------|-------------|
| 1 | Admin | Administrador de la tienda |
| 2 | Usuario | Cliente registrado |
| 3 | Repartidor | Repartidor de pedidos |

### 7.2 Asignación de Roles

Los roles se asignan mediante la tabla `UserRoles` (relación muchos a muchos):

```
Users  ←──→  UserRoles  ←──→  Roles
```

Un usuario puede tener múltiples roles.

---

## Conclusión

| Rol | Funcionalidad Principal |
|-----|-------------------------|
| **Admin** | Control total del sistema, gestión de productos, pedidos, usuarios, configuración |
| **Usuario** | Comprar, gestionar su cuenta, ver historial, crear reseñas y reclamaciones |
| **Repartidor** | Ver y gestionar los pedidos que le son asignados |

La implementación actual usa autorización basada en roles tanto en backend (atributos) como en frontend (rutas protegidas).