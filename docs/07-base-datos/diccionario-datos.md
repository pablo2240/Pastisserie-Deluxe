# Diccionario de Datos - PastisserieDeluxe

**Proyecto**: PASTISSERIE'S DELUXE  
**Código**: SENA Ficha 3035528  
**Versión**: 2.0  
**Fecha**: 03/04/2026  
**Estado**: 85-90% FUNCIONAL

---

## 1. Introducción

Este documento describe cada tabla de la base de datos del sistema PastisserieDeluxe, incluyendo sus campos, tipos de datos, restricciones y relaciones. La base de datos cuenta con **18 tablas activas**.

---

## 2. Catálogo de Tablas

| # | Tabla | Descripción |
|---|-------|-------------|
| 1 | Users | Usuarios registrados del sistema |
| 2 | Roles | Roles del sistema (Admin, Usuario, Repartidor) |
| 3 | UserRoles | Relación muchos a muchos entre usuarios y roles |
| 4 | CategoriaProducto | Categorías para clasificar productos |
| 5 | Productos | Catálogo de productos |
| 6 | Reviews | Reseñas de productos |
| 7 | CarritoCompra | Carrito de compras por usuario |
| 8 | CarritoItems | Items del carrito |
| 9 | Promociones | Promociones vigentes |
| 10 | DireccionEnvio | Direcciones de entrega con GPS |
| 11 | Pedidos | Pedidos realizados |
| 12 | PedidoItems | Items de cada pedido |
| 13 | PedidoHistorial | Historial de cambios de estado |
| 14 | RegistroPago | Registro de intentos de pago |
| 15 | Notificaciones | Notificaciones para usuarios |
| 16 | ConfiguracionTienda | Configuración global |
| 17 | HorarioDia | Horario por día de la semana |
| 18 | Reclamaciones | Reclamaciones de usuarios |

---

## 3. Descripción de Tablas

### 3.1 Tabla: Users

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| Id | INT | No | IDENTITY(1,1) | Clave primaria |
| Nombre | NVARCHAR(100) | No | - | Nombre completo del usuario |
| Email | NVARCHAR(255) | No | - | Email único del usuario |
| PasswordHash | NVARCHAR(255) | No | - | Hash BCrypt de la contraseña |
| Telefono | NVARCHAR(20) | Sí | NULL | Teléfono de contacto |
| Activo | BIT | No | 1 | Usuario activo/inactivo |
| FechaCreacion | DATETIME2 | No | GETUTCDATE() | Fecha de registro |
| FechaActualizacion | DATETIME2 | Sí | NULL | Última modificación |

**Índices**:
- PK: Id
- UQ: Email
- IX: Activo

**Relaciones**:
- 1:N con Pedidos
- 1:N con CarritoCompra
- 1:N con DireccionEnvio
- 1:N con Notificaciones
- 1:N con Reclamaciones
- 1:N con Reviews
- N:M con Roles (vía UserRoles)

---

### 3.2 Tabla: Roles

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| Id | INT | No | IDENTITY(1,1) | Clave primaria |
| Nombre | NVARCHAR(50) | No | - | Nombre del rol (Admin, Usuario, Repartidor) |
| Descripcion | NVARCHAR(200) | Sí | NULL | Descripción del rol |

**Índices**:
- PK: Id
- UQ: Nombre

**Seed Data**:
```sql
INSERT INTO Roles (Nombre, Descripcion) VALUES 
('Admin', 'Administrador de la tienda'),
('Usuario', 'Cliente registrado'),
('Repartidor', 'Repartidor de pedidos');
```

---

### 3.3 Tabla: UserRoles

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| Id | INT | No | IDENTITY(1,1) | Clave primaria |
| UserId | INT | No | - | FK a Users |
| RolId | INT | No | - | FK a Roles |

**Índices**:
- PK: Id
- IX: UserId
- IX: RolId
- UQ: UserId + RolId (cada usuario tiene cada rol una vez)

**Relaciones**:
- FK → Users(Id) ON DELETE CASCADE
- FK → Roles(Id)

---

### 3.4 Tabla: CategoriaProducto

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| Id | INT | No | IDENTITY(1,1) | Clave primaria |
| Nombre | NVARCHAR(100) | No | - | Nombre único de la categoría |
| Descripcion | NVARCHAR(500) | Sí | NULL | Descripción de la categoría |
| Activa | BIT | No | 1 | Categoría activa/inactiva |
| FechaCreacion | DATETIME2 | No | GETUTCDATE() | Fecha de creación |

**Índices**:
- PK: Id
- UQ: Nombre

**Relaciones**:
- 1:N con Productos (FK: CategoriaProductoId)

---

### 3.5 Tabla: Productos

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| Id | INT | No | IDENTITY(1,1) | Clave primaria |
| Nombre | NVARCHAR(200) | No | - | Nombre del producto |
| Descripcion | NVARCHAR(1000) | Sí | NULL | Descripción detallada |
| Precio | DECIMAL(18,2) | No | - | Precio unitario |
| Stock | INT | No | 0 | Cantidad en inventario |
| StockIlimitado | BIT | No | 0 | Producto sin límite de stock (02/04/2026) |
| ImagenUrl | NVARCHAR(500) | Sí | NULL | URL de imagen en Azure Blob |
| Activo | BIT | No | 1 | Producto activo/inactivo |
| CategoriaProductoId | INT | Sí | NULL | FK a CategoriaProducto |
| EsPersonalizable | BIT | No | 0 | Permite personalización |
| FechaCreacion | DATETIME2 | No | GETUTCDATE() | Fecha de creación |
| FechaActualizacion | DATETIME2 | Sí | NULL | Última modificación |

**Índices**:
- PK: Id
- IX: Activo
- IX: CategoriaProductoId
- IX: Activo + CategoriaProductoId (compuesto)

**Relaciones**:
- FK → CategoriaProducto(Id) ON DELETE SET NULL
- 1:N con Reviews
- 1:N con CarritoItems
- 1:N with Promociones (nullable FK)
- 1:N with PedidoItems

---

### 3.6 Tabla: Reviews

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| Id | INT | No | IDENTITY(1,1) | Clave primaria |
| ProductoId | INT | No | - | FK a Productos |
| UsuarioId | INT | No | - | FK a Users |
| Calificacion | INT | No | - | Calificación 1-5 |
| Comentario | NVARCHAR(1000) | Sí | NULL | Texto de la reseña |
| Aprobada | BIT | No | 0 | Requiere aprobación admin |
| FechaCreacion | DATETIME2 | No | GETUTCDATE() | Fecha de creación |
| FechaAprobacion | DATETIME2 | Sí | NULL | Fecha de aprobación |

**Restricciones**:
- CHECK (Calificacion BETWEEN 1 AND 5)

**Índices**:
- PK: Id
- IX: ProductoId + Aprobada (compuesto)
- IX: Aprobada
- UQ: ProductoId + UsuarioId (una reseña por usuario por producto)

**Relaciones**:
- FK → Productos(Id) ON DELETE CASCADE
- FK → Users(Id)

---

### 3.7 Tabla: CarritoCompra

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| Id | INT | No | IDENTITY(1,1) | Clave primaria |
| UsuarioId | INT | No | - | FK a Users (único) |
| FechaCreacion | DATETIME2 | No | GETUTCDATE() | Fecha de creación |
| FechaActualizacion | DATETIME2 | Sí | NULL | Última modificación |

**Índices**:
- PK: Id
- IX: UsuarioId (único)

**Relaciones**:
- FK → Users(Id) ON DELETE CASCADE
- 1:N con CarritoItems

---

### 3.8 Tabla: CarritoItems

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| Id | INT | No | IDENTITY(1,1) | Clave primaria |
| CarritoCompraId | INT | No | - | FK a CarritoCompra |
| ProductoId | INT | Sí | NULL | FK a Productos |
| PromocionId | INT | Sí | NULL | FK a Promociones |
| Cantidad | INT | No | 1 | Cantidad del item |
| PrecioUnitario | DECIMAL(18,2) | No | - | Precio snapshot |

**Restricciones**:
- CHECK: (ProductoId IS NOT NULL AND PromocionId IS NULL) OR (ProductoId IS NULL AND PromocionId IS NOT NULL)

**Índices**:
- PK: Id
- IX: CarritoCompraId

**Relaciones**:
- FK → CarritoCompra(Id) ON DELETE CASCADE
- FK → Productos(Id) ON DELETE SET NULL
- FK → Promociones(Id) ON DELETE SET NULL

---

### 3.9 Tabla: Promociones

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| Id | INT | No | IDENTITY(1,1) | Clave primaria |
| Titulo | NVARCHAR(200) | No | - | Título de la promoción |
| Descripcion | NVARCHAR(1000) | Sí | NULL | Descripción |
| ProductoId | INT | Sí | NULL | FK a Productos (vinculada) |
| PrecioOriginal | DECIMAL(18,2) | Sí | NULL | Precio para independientes |
| TipoDescuento | NVARCHAR(20) | No | - | "Porcentaje" o "MontoFijo" |
| Descuento | DECIMAL(18,2) | No | - | Valor del descuento |
| Stock | INT | Sí | NULL | Stock para independientes |
| ImagenUrl | NVARCHAR(500) | Sí | NULL | Imagen para independientes |
| FechaInicio | DATETIME2 | No | - | Inicio de vigencia |
| FechaFin | DATETIME2 | No | - | Fin de vigencia |
| Activa | BIT | No | 1 | Promoción activa |
| FechaCreacion | DATETIME2 | No | GETUTCDATE() | Fecha de creación |

**Índices**:
- PK: Id
- IX: Fechas (FechaInicio, FechaFin)
- IX: Activa
- IX: ProductoId

**Relaciones**:
- FK → Productos(Id) ON DELETE SET NULL

---

### 3.10 Tabla: DireccionEnvio

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| Id | INT | No | IDENTITY(1,1) | Clave primaria |
| UsuarioId | INT | No | - | FK a Users |
| NombreCompleto | NVARCHAR(200) | No | - | Nombre del destinatario |
| Direccion | NVARCHAR(500) | No | - | Dirección textual |
| Barrio | NVARCHAR(100) | Sí | NULL | Barrio |
| Referencia | NVARCHAR(500) | Sí | NULL | Referencia adicional |
| Comuna | NVARCHAR(100) | Sí | NULL | Comuna (Guayabal/Belén) |
| Telefono | NVARCHAR(20) | No | - | Teléfono de contacto |
| EsPredeterminada | BIT | No | 0 | Dirección por defecto |
| FechaCreacion | DATETIME2 | No | GETUTCDATE() | Fecha de creación |
| Latitud | FLOAT | Sí | NULL | Coordenada GPS (02/04/2026) |
| Longitud | FLOAT | Sí | NULL | Coordenada GPS (02/04/2026) |

**Índices**:
- PK: Id
- IX: UsuarioId

**Relaciones**:
- FK → Users(Id) ON DELETE CASCADE

---

### 3.11 Tabla: Pedidos

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| Id | INT | No | IDENTITY(1,1) | Clave primaria |
| UsuarioId | INT | No | - | FK a Users |
| FechaPedido | DATETIME2 | No | GETUTCDATE() | Fecha de creación |
| Estado | NVARCHAR(50) | No | 'Pendiente' | Estado del pedido |
| MetodoPago | NVARCHAR(100) | No | 'Efectivo' | Método de pago |
| DireccionEnvioId | INT | Sí | NULL | FK a DireccionEnvio |
| Subtotal | DECIMAL(18,2) | No | - | Subtotal sin envío |
| CostoEnvio | DECIMAL(18,2) | No | 0 | Costo de envío |
| Total | DECIMAL(18,2) | No | - | Total (Subtotal + Envío) |
| Aprobado | BIT | No | 0 | Pago confirmado |
| FechaAprobacion | DATETIME2 | Sí | NULL | Fecha de confirmación |
| FechaEntregaEstimada | DATETIME2 | Sí | NULL | Fecha estimada |
| FechaEntrega | DATETIME2 | Sí | NULL | Fecha de entrega real |
| NotasCliente | NVARCHAR(1000) | Sí | NULL | Notas del cliente |
| FechaCreacion | DATETIME2 | No | GETUTCDATE() | Fecha de creación |
| FechaActualizacion | DATETIME2 | Sí | NULL | Última modificación |
| RepartidorId | INT | Sí | NULL | FK a Users (repartidor) |
| MotivoNoEntrega | NVARCHAR(500) | Sí | NULL | Si no entregado |
| FechaNoEntrega | DATETIME2 | Sí | NULL | Fecha de no entrega |

**Estados**: Pendiente, Espera, Confirmado, EnProceso, Listo, EnCamino, Entregado, NoEntregado, Cancelado

**Índices**:
- PK: Id
- IX: UsuarioId
- IX: Estado
- IX: FechaPedido
- IX: Aprobado
- IX: RepartidorId

**Relaciones**:
- FK → Users(Id) (cliente)
- FK → DireccionEnvio(Id)
- FK → Users(Id) (repartidor)
- 1:N con PedidoItems
- 1:N con PedidoHistorial
- 1:N con RegistroPago

---

### 3.12 Tabla: PedidoItems

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| Id | INT | No | IDENTITY(1,1) | Clave primaria |
| PedidoId | INT | No | - | FK a Pedidos |
| ProductoId | INT | Sí | NULL | FK a Productos |
| PromocionId | INT | Sí | NULL | FK a Promociones |
| Cantidad | INT | No | - | Cantidad |
| PrecioUnitario | DECIMAL(18,2) | No | - | Precio snapshot |
| Subtotal | DECIMAL(18,2) | No | - | Cantidad × Precio |

**Índices**:
- PK: Id
- IX: PedidoId
- IX: ProductoId

**Relaciones**:
- FK → Pedidos(Id) ON DELETE CASCADE
- FK → Productos(Id) ON DELETE SET NULL
- FK → Promociones(Id) ON DELETE SET NULL

---

### 3.13 Tabla: PedidoHistorial

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| Id | INT | No | IDENTITY(1,1) | Clave primaria |
| PedidoId | INT | No | - | FK a Pedidos |
| EstadoAnterior | NVARCHAR(50) | Sí | NULL | Estado anterior |
| EstadoNuevo | NVARCHAR(50) | No | - | Nuevo estado |
| FechaCambio | DATETIME2 | No | GETUTCDATE() | Fecha del cambio |
| CambiadoPorId | INT | Sí | NULL | FK a Users |

**Índices**:
- PK: Id
- IX: PedidoId

**Relaciones**:
- FK → Pedidos(Id) ON DELETE CASCADE
- FK → Users(Id)

---

### 3.14 Tabla: RegistroPago

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| Id | INT | No | IDENTITY(1,1) | Clave primaria |
| PedidoId | INT | No | - | FK a Pedidos |
| UsuarioId | INT | No | - | FK a Users |
| Estado | NVARCHAR(20) | No | 'Espera' | Estado del pago |
| FechaIntento | DATETIME2 | No | GETUTCDATE() | Fecha de intento |
| FechaConfirmacion | DATETIME2 | Sí | NULL | Fecha de confirmación |
| MensajeError | NVARCHAR(500) | Sí | NULL | Mensaje si falló |
| ReferenciaExternal | NVARCHAR(100) | Sí | NULL | Referencia del procesador |

**Estados**: Espera, Exitoso, Fallido

**Índices**:
- PK: Id
- IX: PedidoId
- IX: UsuarioId
- IX: Estado

**Relaciones**:
- FK → Pedidos(Id)
- FK → Users(Id)

---

### 3.15 Tabla: Notificaciones

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| Id | INT | No | IDENTITY(1,1) | Clave primaria |
| UsuarioId | INT | No | - | FK a Users |
| Titulo | NVARCHAR(200) | No | - | Título de la notificación |
| Mensaje | NVARCHAR(1000) | Sí | NULL | Contenido |
| Tipo | NVARCHAR(50) | Sí | NULL | Tipo (Pedido, Promocion, Sistema, Repartidor) |
| Enlace | NVARCHAR(500) | Sí | NULL | Ruta de navegación |
| Leida | BIT | No | 0 | Leída o no |
| FechaCreacion | DATETIME2 | No | GETUTCDATE() | Fecha de creación |

**Índices**:
- PK: Id
- IX: UsuarioId
- IX: Leida
- IX: UsuarioId + Leida (compuesto)

**Relaciones**:
- FK → Users(Id) ON DELETE CASCADE

---

### 3.16 Tabla: ConfiguracionTienda

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| Id | INT | No | IDENTITY(1,1) | Clave primaria (siempre = 1) |
| NombreTienda | NVARCHAR(200) | Sí | NULL | Nombre de la tienda |
| Telefono | NVARCHAR(20) | Sí | NULL | Teléfono de contacto |
| Email | NVARCHAR(100) | Sí | NULL | Email de contacto |
| Direccion | NVARCHAR(500) | Sí | NULL | Dirección física |
| SistemaActivoManual | BIT | No | 1 | Cierre manual |
| UsarControlHorario | BIT | No | 1 | Usar horario |
| HoraApertura | TIME | No | '08:00:00' | Hora de apertura |
| HoraCierre | TIME | No | '18:00:00' | Hora de cierre |
| TiempoEntregaEstimadoHoras | INT | No | 48 | Horas estimadas |
| PedidoMinimoCompra | DECIMAL(18,2) | No | 15000.00 | Pedido mínimo |
| FechaActualizacion | DATETIME2 | Sí | NULL | Última modificación |

**Nota**: Solo existe un registro en esta tabla (singleton).

---

### 3.17 Tabla: HorarioDia

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| Id | INT | No | IDENTITY(1,1) | Clave primaria |
| DiaSemana | NVARCHAR(20) | No | - | Día (Lunes-Domingo) |
| Cerrado | BIT | No | 0 | Cerrado ese día |
| HoraApertura | TIME | Sí | NULL | Apertura |
| HoraCierre | TIME | Sí | NULL | Cierre |

**Índices**:
- PK: Id
- UQ: DiaSemana

**Seed Data**:
```sql
INSERT INTO HorarioDia (DiaSemana, Cerrado, HoraApertura, HoraCierre) VALUES
('Lunes', 0, '08:00', '18:00'),
('Martes', 0, '08:00', '18:00'),
('Miércoles', 0, '08:00', '18:00'),
('Jueves', 0, '08:00', '18:00'),
('Viernes', 0, '08:00', '18:00'),
('Sábado', 0, '09:00', '14:00'),
('Domingo', 1, NULL, NULL);
```

---

### 3.18 Tabla: Reclamaciones

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| Id | INT | No | IDENTITY(1,1) | Clave primaria |
| UsuarioId | INT | No | - | FK a Users |
| PedidoId | INT | Sí | NULL | FK a Pedidos (opcional) |
| NumeroTicket | NVARCHAR(50) | No | - | Ticket único |
| Asunto | NVARCHAR(200) | No | - | Asunto |
| Descripcion | NVARCHAR(2000) | No | - | Descripción |
| Estado | NVARCHAR(50) | No | 'Pendiente' | Estado |
| RespuestaAdmin | NVARCHAR(2000) | Sí | NULL | Respuesta |
| FechaCreacion | DATETIME2 | No | GETUTCDATE() | Fecha de creación |
| FechaActualizacion | DATETIME2 |Sí | NULL | Última modificación |

**Estados**: Pendiente, EnRevision, Resuelta, Rechazada

**Índices**:
- PK: Id
- IX: UsuarioId
- IX: Estado
- IX: PedidoId
- UQ: NumeroTicket

**Relaciones**:
- FK → Users(Id)
- FK → Pedidos(Id)

---

## 4. Resumen de Relaciones

```
Users (1) ←── (N) UserRoles ──→ (1) Roles
Users (1) ←── (N) Productos
Users (1) ←── (N) Reviews
Users (1) ←── (1) CarritoCompra ←── (N) CarritoItems → (0,1) Productos
Users (1) ←── (N) Pedidos ←── (N) PedidoItems → (0,1) Productos
Users (1) ←── (N) Pedidos ←── (N) PedidoHistorial
Users (1) ←── (N) Pedidos ←── (N) RegistroPago
Users (1) ←── (N) DireccionEnvio
Users (1) ←── (N) Notificaciones
Users (1) ←── (N) Reclamaciones
CategoriaProducto (1) ←── (N) Productos
Productos (1) ←── (N) Reviews
Productos (1) ←── (N) Promociones
```

---

*Documento generado el 03/04/2026 como parte del proyecto PastisserieDeluxe - SENA Ficha 3035528*