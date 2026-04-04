# Funcionalidades Activas (End-to-End)

Este documento detalla las funcionalidades que funcionan completamente desde el Frontend hasta la Base de Datos.

---

## 1. Autenticación de Usuarios

### Flujo Completo
```
Frontend (React) → API (AuthController) → EF Core → SQL Server
```

### Archivos Involucrados

**Frontend:**
- [`pastisserie-front/src/pages/login.tsx`](pastisserie-front/src/pages/login.tsx)
- [`pastisserie-front/src/pages/register.tsx`](pastisserie-front/src/pages/register.tsx)
- [`pastisserie-front/src/pages/forgotPassword.tsx`](pastisserie-front/src/pages/forgotPassword.tsx)
- [`pastisserie-front/src/pages/resetPassword.tsx`](pastisserie-front/src/pages/resetPassword.tsx)
- [`pastisserie-front/src/context/AuthContext.tsx`](pastisserie-front/src/context/AuthContext.tsx)
- [`pastisserie-front/src/api/axios.ts`](pastisserie-front/src/api/axios.ts)

**Backend:**
- [`PastisserieAPI.API/Controllers/AuthController.cs`](PastisserieAPI.API/Controllers/AuthController.cs)
- [`PastisserieAPI.Services/Services/AuthService.cs`](PastisserieAPI.Services/Services/AuthService.cs)
- [`PastisserieAPI.Infrastructure/Repositories/UserRepository.cs`](PastisserieAPI.Infrastructure/Repositories/UserRepository.cs)

### Endpoints Funcionales
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registro de nuevos usuarios |
| POST | `/api/auth/login` | Inicio de sesión |
| POST | `/api/auth/forgot-password` | Solicitud de recuperación |
| POST | `/api/auth/reset-password` | Restablecer contraseña |
| GET | `/api/auth/profile` | Obtener perfil (requiere auth) |
| PUT | `/api/auth/profile` | Actualizar perfil |

---

## 2. Catálogo de Productos

### Flujo Completo
```
Frontend (React) → API (ProductosController) → EF Core → SQL Server
```

### Archivos Involucrados

**Frontend:**
- [`pastisserie-front/src/pages/catalogo.tsx`](pastisserie-front/src/pages/catalogo.tsx)
- [`pastisserie-front/src/pages/productDetail.tsx`](pastisserie-front/src/pages/productDetail.tsx)
- [`pastisserie-front/src/components/ProductCard.tsx`](pastisserie-front/src/components/ProductCard.tsx)
- [`pastisserie-front/src/services/productService.ts`](pastisserie-front/src/services/productService.ts)

**Backend:**
- [`PastisserieAPI.API/Controllers/ProductosController.cs`](PastisserieAPI.API/Controllers/ProductosController.cs)
- [`PastisserieAPI.Infrastructure/Repositories/ProductoRepository.cs`](PastisserieAPI.Infrastructure/Repositories/ProductoRepository.cs)

### Endpoints Funcionales
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/productos` | Listar todos los productos |
| GET | `/api/productos/{id}` | Obtener producto por ID |
| GET | `/api/productos/activos` | Listar productos activos |

---

## 3. Carrito de Compras

### Flujo Completo
```
Frontend (CartContext) → API (CarritoController) → EF Core → SQL Server
```

### Archivos Involucrados

**Frontend:**
- [`pastisserie-front/src/context/CartContext.tsx`](pastisserie-front/src/context/CartContext.tsx)
- [`pastisserie-front/src/pages/carrito.tsx`](pastisserie-front/src/pages/carrito.tsx)
- [`pastisserie-front/src/components/CartSidebar.tsx`](pastisserie-front/src/components/CartSidebar.tsx)
- [`pastisserie-front/src/services/cartService.ts`](pastisserie-front/src/services/cartService.ts)

**Backend:**
- [`PastisserieAPI.API/Controllers/CarritoController.cs`](PastisserieAPI.API/Controllers/CarritoController.cs)
- [`PastisserieAPI.Services/Services/CarritoService.cs`](PastisserieAPI.Services/Services/CarritoService.cs)

### Endpoints Funcionales
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/carrito` | Obtener carrito del usuario |
| POST | `/api/carrito/items` | Agregar producto al carrito |
| PUT | `/api/carrito/items/{id}` | Actualizar cantidad |
| DELETE | `/api/carrito/items/{id}` | Eliminar item |
| DELETE | `/api/carrito/clear` | Vaciar carrito |

---

## 4. Checkout y Pagos (ePayco)

### Flujo Completo
```
Frontend (checkout.tsx) → API (PedidosController + PagosController) → ePayco → Webhook → EF Core → SQL Server
```

### Archivos Involucrados

**Frontend:**
- [`pastisserie-front/src/pages/checkout.tsx`](pastisserie-front/src/pages/checkout.tsx)
- [`pastisserie-front/src/pages/ResultadoPago.tsx`](pastisserie-front/src/pages/ResultadoPago.tsx)
- [`pastisserie-front/src/services/orderService.ts`](pastisserie-front/src/services/orderService.ts)

**Backend:**
- [`PastisserieAPI.API/Controllers/PedidosController.cs`](PastisserieAPI.API/Controllers/PedidosController.cs)
- [`PastisserieAPI.API/Controllers/PagosController.cs`](PastisserieAPI.API/Controllers/PagosController.cs)
- [`PastisserieAPI.Services/Services/PedidoService.cs`](PastisserieAPI.Services/Services/PedidoService.cs)
- [`PastisserieAPI.Services/Services/EpaycoService.cs`](PastisserieAPI.Services/Services/EpaycoService.cs)

### Endpoints Funcionales
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/pedidos` | Crear nuevo pedido |
| POST | `/api/pagos/epayco/checkout-data/{pedidoId}` | Generar datos de pago ePayco |
| GET | `/api/pagos/epayco/confirmar/{refPayco}` | Confirmar transacción (público) |
| GET | `/api/pagos/epayco/validar/{refPayco}` | Validar transacción (auth) |
| GET | `/api/pedidos/mis-pedidos` | Listar pedidos del usuario |

---

## 5. Dashboard Administrador

### Flujo Completo
```
Frontend (admin/dashboard.tsx) → API (DashboardController) → EF Core → SQL Server
```

### Archivos Involucrados

**Frontend:**
- [`pastisserie-front/src/pages/admin/dashboard.tsx`](pastisserie-front/src/pages/admin/dashboard.tsx)
- [`pastisserie-front/src/services/dashboardService.ts`](pastisserie-front/src/services/dashboardService.ts)

**Backend:**
- [`PastisserieAPI.API/Controllers/DashboardController.cs`](PastisserieAPI.API/Controllers/DashboardController.cs)

### Endpoints Funcionales
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/dashboard/admin` | Estadísticas completas del admin |
| GET | `/api/dashboard/earnings-history` | Historial de ganancias |

### Datos que Retorna
- Ganancias totales, del día, semana, mes, año
- Pedidos por estado
- Productos más/menos vendidos
- Ventas por día de la semana
- Pedidos retrasados (>30 min)
- Alertas críticas (stock bajo, reclamaciones pendientes)

---

## 6. Gestión de Pedidos (Admin)

### Flujo Completo
```
Frontend (admin/pedidosAdmin.tsx) → API (PedidosController) → EF Core → SQL Server
```

### Archivos Involucrados

**Frontend:**
- [`pastisserie-front/src/pages/admin/pedidosAdmin.tsx`](pastisserie-front/src/pages/admin/pedidosAdmin.tsx)
- [`pastisserie-front/src/pages/admin/adminOrders.tsx`](pastisserie-front/src/pages/admin/adminOrders.tsx)

**Backend:**
- [`PastisserieAPI.API/Controllers/PedidosController.cs`](PastisserieAPI.API/Controllers/PedidosController.cs)

### Endpoints Funcionales
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/pedidos/todos` | Listar todos los pedidos (Admin) |
| PUT | `/api/pedidos/{id}/estado` | Actualizar estado del pedido |
| PATCH | `/api/pedidos/{id}/asignar-repartidor` | Asignar repartidor |
| DELETE | `/api/pedidos/{id}` | Eliminar pedido |

---

## 7. Gestión de Productos (Admin)

### Flujo Completo
```
Frontend (admin/productosAdmin.tsx) → API (ProductosController) → EF Core → SQL Server
```

### Archivos Involucrados

**Frontend:**
- [`pastisserie-front/src/pages/admin/productosAdmin.tsx`](pastisserie-front/src/pages/admin/productosAdmin.tsx)

**Backend:**
- [`PastisserieAPI.API/Controllers/ProductosController.cs`](PastisserieAPI.API/Controllers/ProductosController.cs)

### Endpoints Funcionales
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/productos` | Crear producto |
| PUT | `/api/productos/{id}` | Actualizar producto |
| DELETE | `/api/productos/{id}` | Eliminar producto |

---

## 8. Gestión de Usuarios (Admin)

### Flujo Completo
```
Frontend (admin/usuariosAdmin.tsx) → API (UsersController) → EF Core → SQL Server
```

### Archivos Involucrados

**Frontend:**
- [`pastisserie-front/src/pages/admin/usuariosAdmin.tsx`](pastisserie-front/src/pages/admin/usuariosAdmin.tsx)

**Backend:**
- [`PastisserieAPI.API/Controllers/UsersController.cs`](PastisserieAPI.API/Controllers/UsersController.cs)

---

## 9. Dashboard Repartidor

### Flujo Completo
```
Frontend (repartidor/dashboard.tsx) → API (DashboardController) → EF Core → SQL Server
```

### Archivos Involucrados

**Frontend:**
- [`pastisserie-front/src/pages/repartidor/dashboard.tsx`](pastisserie-front/src/pages/repartidor/dashboard.tsx)

**Backend:**
- [`PastisserieAPI.API/Controllers/DashboardController.cs`](PastisserieAPI.API/Controllers/DashboardController.cs)

### Endpoints Funcionales
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/dashboard/repartidor` | Dashboard del repartidor |
| GET | `/api/pedidos/repartidor` | Pedidos asignados al repartidor |

---

## 10. Categorías

### Flujo Completo
```
Frontend → API (CategoriasController) → EF Core → SQL Server
```

### Archivos Involucrados

**Frontend:**
- [`pastisserie-front/src/api/categoriasService.ts`](pastisserie-front/src/api/categoriasService.ts)

**Backend:**
- [`PastisserieAPI.API/Controllers/CategoriasController.cs`](PastisserieAPI.API/Controllers/CategoriasController.cs)

---

## 11. Reviews/Reseñas

### Flujo Completo
```
Frontend → API (ReviewsController) → EF Core → SQL Server
```

### Archivos Involucrados

**Frontend:**
- [`pastisserie-front/src/components/ProductReviews.tsx`](pastisserie-front/src/components/ProductReviews.tsx)
- [`pastisserie-front/src/services/reviewService.ts`](pastisserie-front/src/services/reviewService.ts)

**Backend:**
- [`PastisserieAPI.API/Controllers/ReviewsController.cs`](PastisserieAPI.API/Controllers/ReviewsController.cs)

---

## 12. Configuración de Tienda

### Flujo Completo
```
Frontend → API (ConfiguracionController) → EF Core → SQL Server
```

### Archivos Involucrados

**Frontend:**
- [`pastisserie-front/src/pages/admin/Configuracion.tsx`](pastisserie-front/src/pages/admin/Configuracion.tsx)
- [`pastisserie-front/src/services/configuracionService.ts`](pastisserie-front/src/services/configuracionService.ts)
- [`pastisserie-front/src/hooks/useTiendaStatus.ts`](pastisserie-front/src/hooks/useTiendaStatus.ts)

**Backend:**
- [`PastisserieAPI.API/Controllers/ConfiguracionController.cs`](PastisserieAPI.API/Controllers/ConfiguracionController.cs)
- [`PastisserieAPI.API/Controllers/TiendaController.cs`](PastisserieAPI.API/Controllers/TiendaController.cs)
