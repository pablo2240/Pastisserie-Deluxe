# Flujos Principales — PastisserieDeluxe

---

## 1. Registro y Autenticación
- Frontend: login/register/resetPassword/perfil.tsx
- Backend: AuthController/UsersController/AuthService
- DB: Users, UserRoles, Roles
- Estado: JWT, gestión de sesiones, roles y feedback.

## 2. Productos y Catálogo
- Frontend: catalogo.tsx, productDetail.tsx, promociones.tsx
- Backend: ProductosController, ProductoService, PromocionesService
- DB: Productos, Reviews, Promociones
- Lógica: Validación de stock, promociones vigentes, CRUD productos.

## 3. Carrito y Checkout
- Frontend: carrito.tsx, checkout.tsx, CartContext
- Backend: CarritoController, CarritoService
- DB: CarritoCompra, CarritoItem
- Validaciones: Stock, cantidad máxima, promociones.

## 4. Pedidos
- Frontend: checkout.tsx, perfil.tsx
- Backend: PedidosController, PedidoService
- DB: Pedido, PedidoItem
- Estado: Flujo end-to-end, validaciones, historial y factura.

## 5. Pagos
- Frontend: checkout.tsx, ResultadoPago.tsx
- Backend: PagosController, EpaycoService
- DB: Factura, Pedido
- Validaciones: Configuración, estado pago, feedback UI.

## 6. Envíos
- Frontend: checkout.tsx, enviosService.ts (admin)
- Backend: EnviosController, EnvioService
- DB: DireccionEnvio, Envio
- Exclusivo admin, estados de envío, relación con repartidor.

## 7. Promociones y Reclamaciones
- Frontend: promociones.tsx, reclamaciones.tsx
- Backend: PromocionesController, ReclamacionesController
- DB: Promocion, Reclamacion
- Validaciones: Vigencia, stock promo, razones reclamación.

## 8. Reviews y Notificaciones
- Frontend: productDetail.tsx, perfil.tsx
- Backend: ReviewsController, NotificacionesController
- DB: Review, Notificacion
- Estado: CRUD completo, feedback real al usuario.

## 9. Configuración y Reportes
- Frontend: admin/Configuracion.tsx, admin/reportesAdmin.tsx
- Backend: ConfiguracionController, DashboardController
- DB: ConfiguracionTienda, HorarioDia
- Estado: Sincronización, validaciones, logs, reportes.

---

Todos los flujos cubren rutas, lógica y persistencia real con validaciones de negocio y feedback UI/backend.
