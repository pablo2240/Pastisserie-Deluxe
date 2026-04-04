# Diagramas de Secuencia - PASTISSERIE'S DELUXE

Este documento contiene los diagramas de secuencia de los flujos principales del sistema.

## 1. Flujo de Registro e Inicio de Sesión

```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend
    participant AuthController
    participant AuthService
    participant UnitOfWork
    participant Database
    participant JwtHelper
    
    %% REGISTRO
    Usuario->>Frontend: Ingresa datos de registro
    Frontend->>AuthController: POST /api/auth/register
    AuthController->>AuthService: RegisterAsync(RegisterRequestDto)
    AuthService->>UnitOfWork: Users.ExistsByEmailAsync(email)
    UnitOfWork->>Database: SELECT * FROM Users WHERE Email = ?
    Database-->>UnitOfWork: null (no existe)
    UnitOfWork-->>AuthService: false
    AuthService->>AuthService: HashPassword(password)
    AuthService->>UnitOfWork: Users.AddAsync(newUser)
    AuthService->>UnitOfWork: Roles.GetByNameAsync("Usuario")
    UnitOfWork->>Database: SELECT * FROM Roles WHERE Nombre = 'Usuario'
    Database-->>UnitOfWork: Rol{ Id: 1, Nombre: "Usuario" }
    AuthService->>UnitOfWork: UserRoles.AddAsync(newUserRol)
    AuthService->>UnitOfWork: SaveChangesAsync()
    UnitOfWork->>Database: BEGIN TRANSACTION
    UnitOfWork->>Database: INSERT INTO Users...
    UnitOfWork->>Database: INSERT INTO UserRoles...
    UnitOfWork->>Database: COMMIT
    Database-->>UnitOfWork: OK
    UnitOfWork-->>AuthService: User saved
    AuthService-->>AuthController: UserResponseDto
    AuthController-->>Frontend: 201 Created + user data
    Frontend-->>Usuario: "Registro exitoso"
    
    %% LOGIN
    Usuario->>Frontend: Ingresa email + password
    Frontend->>AuthController: POST /api/auth/login
    AuthController->>AuthService: LoginAsync(LoginRequestDto)
    AuthService->>UnitOfWork: Users.GetByEmailWithRolesAsync(email)
    UnitOfWork->>Database: SELECT * FROM Users JOIN UserRoles JOIN Roles...
    Database-->>UnitOfWork: User{ Id, Email, PasswordHash, Roles: [Usuario] }
    UnitOfWork-->>AuthService: User
    AuthService->>AuthService: VerifyPassword(password, PasswordHash)
    AuthService->>AuthService: OK
    AuthService->>UnitOfWork: Users.Update(user) [UltimoAcceso]
    AuthService->>UnitOfWork: SaveChangesAsync()
    AuthService->>JwtHelper: GenerateToken(user)
    JwtHelper-->>AuthService: JWT token
    AuthService-->>AuthController: LoginResponseDto{ Token, User }
    AuthController-->>Frontend: 200 OK + token + user
    Frontend->>Frontend: localStorage.setItem('token', token)
    Frontend-->>Usuario: Redirección a dashboard
```

## 2. Flujo de Compra Completo (Cliente)

```mermaid
sequenceDiagram
    actor Cliente
    participant Frontend
    participant ProductoController
    participant CarritoController
    participant PedidoController
    participant NotificacionService
    participant Database
    
    %% VER CATÁLOGO
    Cliente->>Frontend: Navega a catálogo
    Frontend->>ProductoController: GET /api/producto
    ProductoController->>Database: SELECT * FROM Productos WHERE Activo = true
    Database-->>ProductoController: List<Producto>
    ProductoController-->>Frontend: 200 OK + productos
    Frontend-->>Cliente: Muestra catálogo
    
    %% AGREGAR AL CARRITO
    Cliente->>Frontend: Click "Agregar al carrito"
    Frontend->>CarritoController: POST /api/carrito/agregar
    CarritoController->>Database: SELECT CarritoId FROM CarritoCompra WHERE UsuarioId = ?
    Database-->>CarritoController: CarritoCompra{ Id: 1 }
    CarritoController->>Database: INSERT INTO CarritoItem (CarritoId, ProductoId, Cantidad)
    Database-->>CarritoController: OK
    CarritoController-->>Frontend: 200 OK
    Frontend-->>Cliente: "Producto agregado al carrito"
    
    %% VER CARRITO
    Cliente->>Frontend: Click "Ver carrito"
    Frontend->>CarritoController: GET /api/carrito
    CarritoController->>Database: SELECT * FROM CarritoCompra JOIN CarritoItem JOIN Producto...
    Database-->>CarritoController: CarritoCompra{ Items: [...] }
    CarritoController-->>Frontend: 200 OK + carrito con items
    Frontend-->>Cliente: Muestra carrito con subtotal
    
    %% CREAR PEDIDO (CHECKOUT)
    Cliente->>Frontend: Click "Proceder al pago"
    Frontend->>Frontend: Valida dirección de envío
    Frontend->>PedidoController: POST /api/pedido/crear
    PedidoController->>Database: BEGIN TRANSACTION
    PedidoController->>Database: SELECT * FROM CarritoCompra WHERE UsuarioId = ?
    Database-->>PedidoController: CarritoCompra + Items
    PedidoController->>PedidoController: Calcula Subtotal + CostoEnvio + Total
    PedidoController->>Database: INSERT INTO Pedidos (UsuarioId, Total, Estado='Pendiente'...)
    PedidoController->>Database: INSERT INTO PedidoItems (PedidoId, ProductoId, Cantidad...)
    PedidoController->>Database: UPDATE Productos SET Stock = Stock - Cantidad (si no StockIlimitado)
    PedidoController->>Database: DELETE FROM CarritoItems WHERE CarritoId = ?
    PedidoController->>NotificacionService: CrearNotificacion(UsuarioId, "Pedido creado")
    NotificacionService->>Database: INSERT INTO Notificaciones...
    PedidoController->>Database: COMMIT
    Database-->>PedidoController: OK
    PedidoController-->>Frontend: 201 Created + Pedido
    Frontend-->>Cliente: "Pedido creado exitosamente"
    Frontend->>Frontend: Redirección a Mis Pedidos
```

## 3. Flujo de Gestión de Pedido (Admin)

```mermaid
sequenceDiagram
    actor Admin
    participant Frontend
    participant PedidoController
    participant NotificacionService
    participant Database
    
    %% VER PEDIDOS PENDIENTES
    Admin->>Frontend: Navega a "Gestión de Pedidos"
    Frontend->>PedidoController: GET /api/pedido/todos?estado=Pendiente
    PedidoController->>Database: SELECT * FROM Pedidos WHERE Estado = 'Pendiente'
    Database-->>PedidoController: List<Pedido>
    PedidoController-->>Frontend: 200 OK + pedidos
    Frontend-->>Admin: Muestra lista de pedidos pendientes
    
    %% APROBAR PEDIDO
    Admin->>Frontend: Click "Aprobar pedido #123"
    Frontend->>PedidoController: PUT /api/pedido/123/aprobar
    PedidoController->>Database: BEGIN TRANSACTION
    PedidoController->>Database: SELECT * FROM Pedidos WHERE Id = 123
    Database-->>PedidoController: Pedido{ Estado: "Pendiente" }
    PedidoController->>Database: INSERT INTO PedidoHistorial (EstadoAnterior='Pendiente', EstadoNuevo='Aprobado')
    PedidoController->>Database: UPDATE Pedidos SET Estado='Aprobado', Aprobado=true, FechaAprobacion=NOW()
    PedidoController->>NotificacionService: CrearNotificacion(UsuarioId, "Pedido aprobado")
    NotificacionService->>Database: INSERT INTO Notificaciones...
    PedidoController->>Database: COMMIT
    Database-->>PedidoController: OK
    PedidoController-->>Frontend: 200 OK
    Frontend-->>Admin: "Pedido aprobado exitosamente"
    
    %% ASIGNAR REPARTIDOR
    Admin->>Frontend: Selecciona repartidor para pedido #123
    Frontend->>PedidoController: PUT /api/pedido/123/asignar-repartidor
    PedidoController->>Database: UPDATE Pedidos SET RepartidorId = ?, Estado='EnCamino'
    PedidoController->>Database: INSERT INTO PedidoHistorial (EstadoAnterior='Aprobado', EstadoNuevo='EnCamino')
    PedidoController->>NotificacionService: CrearNotificacion(RepartidorId, "Pedido asignado")
    PedidoController->>NotificacionService: CrearNotificacion(UsuarioId, "Pedido en camino")
    Database-->>PedidoController: OK
    PedidoController-->>Frontend: 200 OK
    Frontend-->>Admin: "Repartidor asignado"
```

## 4. Flujo de Entrega (Repartidor)

```mermaid
sequenceDiagram
    actor Repartidor
    participant Frontend
    participant PedidoController
    participant ReclamacionService
    participant NotificacionService
    participant Database
    
    %% VER PEDIDOS ASIGNADOS
    Repartidor->>Frontend: Navega a "Mis entregas"
    Frontend->>PedidoController: GET /api/pedido/mis-asignaciones
    PedidoController->>Database: SELECT * FROM Pedidos WHERE RepartidorId = ? AND Estado='EnCamino'
    Database-->>PedidoController: List<Pedido>
    PedidoController-->>Frontend: 200 OK + pedidos
    Frontend-->>Repartidor: Muestra mapa con direcciones (Latitud/Longitud)
    
    %% MARCAR COMO ENTREGADO
    Repartidor->>Frontend: Click "Marcar como entregado" pedido #123
    Frontend->>PedidoController: PUT /api/pedido/123/marcar-entregado
    PedidoController->>Database: BEGIN TRANSACTION
    PedidoController->>Database: INSERT INTO PedidoHistorial (EstadoAnterior='EnCamino', EstadoNuevo='Entregado')
    PedidoController->>Database: UPDATE Pedidos SET Estado='Entregado', FechaEntrega=NOW()
    PedidoController->>NotificacionService: CrearNotificacion(UsuarioId, "Pedido entregado")
    PedidoController->>Database: COMMIT
    Database-->>PedidoController: OK
    PedidoController-->>Frontend: 200 OK
    Frontend-->>Repartidor: "Pedido marcado como entregado"
    
    %% MARCAR COMO NO ENTREGADO (genera Reclamación automática)
    Repartidor->>Frontend: Click "No pude entregar" + ingresa motivo
    Frontend->>PedidoController: PUT /api/pedido/123/marcar-no-entregado
    PedidoController->>Database: BEGIN TRANSACTION
    PedidoController->>Database: INSERT INTO PedidoHistorial (EstadoAnterior='EnCamino', EstadoNuevo='NoEntregado')
    PedidoController->>Database: UPDATE Pedidos SET Estado='NoEntregado', MotivoNoEntrega=?, FechaNoEntrega=NOW()
    PedidoController->>ReclamacionService: CrearReclamacionAutomatica(PedidoId, RepartidorId, Motivo)
    ReclamacionService->>Database: INSERT INTO Reclamaciones (PedidoId, UsuarioId, MotivoDomiciliario, DomiciliarioId, Estado='Pendiente')
    PedidoController->>NotificacionService: CrearNotificacion(UsuarioId, "Pedido no entregado")
    PedidoController->>NotificacionService: CrearNotificacion(AdminId, "Nueva reclamación automática")
    PedidoController->>Database: COMMIT
    Database-->>PedidoController: OK
    PedidoController-->>Frontend: 200 OK
    Frontend-->>Repartidor: "Pedido marcado como no entregado. Se creó una reclamación."
```

## 5. Flujo de Review con Moderación

```mermaid
sequenceDiagram
    actor Cliente
    actor Admin
    participant Frontend
    participant ReviewController
    participant NotificacionService
    participant Database
    
    %% CREAR REVIEW
    Cliente->>Frontend: Escribe review de producto (5 estrellas + comentario)
    Frontend->>ReviewController: POST /api/review
    ReviewController->>Database: BEGIN TRANSACTION
    ReviewController->>Database: INSERT INTO Reviews (UsuarioId, ProductoId, Calificacion, Comentario, Aprobada=false)
    ReviewController->>NotificacionService: CrearNotificacion(AdminId, "Nueva review pendiente de aprobación")
    ReviewController->>Database: COMMIT
    Database-->>ReviewController: OK
    ReviewController-->>Frontend: 201 Created
    Frontend-->>Cliente: "Review enviada. Pendiente de aprobación por un administrador."
    
    %% ADMIN APRUEBA REVIEW
    Admin->>Frontend: Navega a "Moderar Reviews"
    Frontend->>ReviewController: GET /api/review/pendientes
    ReviewController->>Database: SELECT * FROM Reviews WHERE Aprobada = false
    Database-->>ReviewController: List<Review>
    ReviewController-->>Frontend: 200 OK + reviews pendientes
    Frontend-->>Admin: Muestra lista de reviews
    
    Admin->>Frontend: Click "Aprobar" review #45
    Frontend->>ReviewController: PUT /api/review/45/aprobar
    ReviewController->>Database: UPDATE Reviews SET Aprobada = true WHERE Id = 45
    ReviewController->>NotificacionService: CrearNotificacion(UsuarioId, "Tu review fue aprobada")
    Database-->>ReviewController: OK
    ReviewController-->>Frontend: 200 OK
    Frontend-->>Admin: "Review aprobada"
    
    %% CLIENTE VE REVIEW PUBLICADA
    Cliente->>Frontend: Navega a producto
    Frontend->>ReviewController: GET /api/review/producto/10
    ReviewController->>Database: SELECT * FROM Reviews WHERE ProductoId = 10 AND Aprobada = true
    Database-->>ReviewController: List<Review>
    ReviewController-->>Frontend: 200 OK + reviews aprobadas
    Frontend-->>Cliente: Muestra reviews públicas
```

## 6. Flujo de Subida de Imagen a Azure Blob Storage

```mermaid
sequenceDiagram
    actor Admin
    participant Frontend
    participant UploadController
    participant BlobStorageService
    participant AzureBlobStorage
    participant Database
    
    %% SUBIR IMAGEN DE PRODUCTO
    Admin->>Frontend: Drag & drop imagen en formulario de producto
    Frontend->>Frontend: Validación cliente (tamaño, formato)
    Frontend->>UploadController: POST /api/upload/producto (multipart/form-data)
    UploadController->>UploadController: Validación servidor (extensión, tamaño < 5MB)
    UploadController->>BlobStorageService: UploadImageAsync(file, "productos/")
    BlobStorageService->>BlobStorageService: Genera nombre único (GUID + extensión)
    BlobStorageService->>AzureBlobStorage: Upload blob to container "productos"
    AzureBlobStorage-->>BlobStorageService: Blob URL
    BlobStorageService-->>UploadController: "https://storage.blob.core.windows.net/productos/{guid}.jpg"
    UploadController-->>Frontend: 200 OK + { url: "..." }
    Frontend->>Frontend: Actualiza preview + guarda URL en estado
    Frontend->>ProductoController: POST /api/producto (con ImagenUrl)
    ProductoController->>Database: INSERT INTO Productos (Nombre, Precio, ImagenUrl=?)
    Database-->>ProductoController: OK
    ProductoController-->>Frontend: 201 Created
    Frontend-->>Admin: "Producto creado exitosamente"
```

## 7. Flujo de Aplicación de Promoción

```mermaid
sequenceDiagram
    actor Cliente
    participant Frontend
    participant PromocionController
    participant CarritoController
    participant Database
    
    %% VER PROMOCIONES ACTIVAS
    Cliente->>Frontend: Navega a "Promociones"
    Frontend->>PromocionController: GET /api/promocion/activas
    PromocionController->>Database: SELECT * FROM Promociones WHERE Activo=true AND FechaInicio <= NOW() AND FechaFin >= NOW()
    Database-->>PromocionController: List<Promocion>
    PromocionController-->>Frontend: 200 OK + promociones
    Frontend-->>Cliente: Muestra promociones con precio original tachado + descuento
    
    %% AGREGAR PROMOCIÓN AL CARRITO
    Cliente->>Frontend: Click "Agregar al carrito" desde promoción
    Frontend->>CarritoController: POST /api/carrito/agregar-promocion
    CarritoController->>Database: SELECT * FROM Promociones WHERE Id = ?
    Database-->>CarritoController: Promocion{ TipoDescuento, Valor, PrecioOriginal, ProductoId }
    CarritoController->>CarritoController: Calcula precio con descuento
    CarritoController->>Database: INSERT INTO CarritoItem (CarritoId, ProductoId, PromocionId, PrecioOriginal, Cantidad)
    Database-->>CarritoController: OK
    CarritoController-->>Frontend: 200 OK
    Frontend-->>Cliente: "Promoción agregada al carrito"
    
    %% CHECKOUT CON PROMOCIÓN
    Cliente->>Frontend: Procede al pago
    Frontend->>CarritoController: GET /api/carrito
    CarritoController->>Database: SELECT * FROM CarritoCompra JOIN CarritoItem JOIN Promocion...
    Database-->>CarritoController: CarritoCompra{ Items: [{ PromocionId: 1, PrecioOriginal: 50000, PrecioConDescuento: 40000 }] }
    CarritoController-->>Frontend: Carrito con precios descontados
    Frontend-->>Cliente: Muestra subtotal con descuentos aplicados
```

## Notas Técnicas

### Transacciones de Base de Datos
- **BEGIN TRANSACTION** → operaciones críticas → **COMMIT** / **ROLLBACK**
- Usadas en: creación de pedidos, aprobación, cambios de estado, updates de stock

### Autenticación JWT
- Token generado en login, incluye roles del usuario
- Frontend incluye token en header: `Authorization: Bearer {token}`
- Middleware de autenticación valida en cada request a endpoints protegidos

### Validaciones
- **Cliente**: Validación básica de formularios (tamaño archivo, formato email)
- **Servidor**: FluentValidation en DTOs, validaciones de negocio en Services
- **Base de datos**: Constraints (UNIQUE email, FOREIGN KEY, CHECK)

### Notificaciones Automáticas
Eventos que disparan notificaciones:
- Pedido creado → Cliente
- Pedido aprobado → Cliente
- Pedido en camino → Cliente
- Repartidor asignado → Repartidor
- Pedido entregado → Cliente
- Pedido no entregado → Cliente + Admin (vía Reclamación)
- Review aprobada → Cliente
- Nueva review → Admin

### Cálculo de Costos
1. **Subtotal**: Suma de (PrecioUnitario × Cantidad) de cada item
2. **Costo de envío**: Según comuna (desde ConfiguracionTienda.CostosEnvioPorComuna) o valor default
3. **Total**: Subtotal + CostoEnvio

### Estados de Pedido
Pendiente → Aprobado → EnCamino → Entregado / NoEntregado / Cancelado

Cada cambio registra:
- Entrada en `PedidoHistorial`
- Notificación al usuario
- Actualización de `Pedido.FechaActualizacion`

## Generado
- **Fecha**: 03/04/2026
- **Versión**: 1.0
- **Estado**: Refleja flujos actuales al 03/04/2026
