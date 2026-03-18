# Mapa del Sistema — PastisserieDeluxe

---

## Backend
- Controllers:
  - Auth, Carrito, Categorias, Configuracion, Dashboard, Envios, Notificaciones, Pagos, Pedidos, Productos, Promociones, Reclamaciones, Reviews, Tienda, Upload, Users.
- Services:
  - AuthService, CarritoService, EmailService, EnvioService, EpaycoService, InvoiceService, NotificacionService, PedidoService, ProductoService, ReclamacionService, ReviewService, TiendaService.
- Repositories:
  - CarritoRepository, EnvioRepository, PedidoRepository, ProductoRepository, ReviewRepository, UnitOfWork, UserRepository, Repository.
- Entities:
  - Users, Roles, UserRoles, Productos, Reviews, Promociones, Pedidos, PedidoItems, PedidoHistoriales, Facturas, CarritoCompra, CarritoItem, DireccionEnvio, Envio, Notificacion, ConfiguracionTienda, HorarioDia, Reclamacion, PersonalizadoConfig, Ingrediente, TipoMetodoPago, MetodoPagoUsuario, CategoriaProducto, PersonalizadoConfigIngrediente.

## Frontend
- Pages:
  - login, register, forgotPassword, resetPassword, perfil, productDetail, catalogo, carrito, checkout, promociones, reclamaciones, contacto, ResultadoPago, home, admin/*, repartidor/*
- Services:
  - authService, cartService, configuracionService, dashboardService, enviosService, orderService, productService, promocionesService, reclamacionesService, reviewService, tiendaService
- Context:
  - AuthContext, CartContext
- Hooks:
  - useTiendaStatus
- Utils/API:
  - format, seeder, axios, categoriasService, notificacionService

## Base de Datos
- Tablas:
  - Users, Roles, UserRoles, Productos, Reviews, Promociones, Pedidos, PedidoItems, PedidoHistoriales, Facturas, CarritoCompra, CarritoItem, DireccionEnvio, Envio, Notificacion, ConfiguracionTienda, HorarioDia, Reclamacion, PersonalizadoConfig, Ingrediente, TipoMetodoPago, MetodoPagoUsuario, CategoriaProducto, PersonalizadoConfigIngrediente
- Relaciones:
  - Detalladas en ApplicationDbContext.cs, con configuraciones especiales de cascada, restricción y null en claves foráneas

---

## Integración
Flujo end-to-end: usuario → UI (React) → servicios (frontend) → API Controllers (backend) → Services → Repositories → Entities → DB/tablas.

Validaciones, feedback y sincronización se realizan en cada etapa para asegurar integridad y funcionamiento.
