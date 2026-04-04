# Diagrama Entidad-Relación - PASTISSERIE'S DELUXE

Este diagrama representa el modelo de base de datos SQL Server con las 18 tablas actuales y sus relaciones.

```mermaid
erDiagram
    Users ||--o{ UserRoles : "tiene"
    Roles ||--o{ UserRoles : "asignado_a"
    Users ||--o| CarritoCompra : "posee"
    Users ||--o{ Pedidos : "realiza"
    Users ||--o{ Pedidos : "reparte_como_repartidor"
    Users ||--o{ Reviews : "escribe"
    Users ||--o{ Notificaciones : "recibe"
    Users ||--o{ DireccionEnvio : "tiene"
    
    CategoriaProducto ||--o{ Productos : "contiene"
    Productos ||--o{ Reviews : "tiene_reviews"
    Productos ||--o{ PedidoItems : "incluido_en"
    Productos ||--o{ CarritoItems : "agregado_a"
    Productos ||--o{ Promociones : "tiene_promocion"
    
    CarritoCompra ||--o{ CarritoItems : "contiene"
    CarritoItems }o--o| Promociones : "aplica"
    
    Pedidos ||--o{ PedidoItems : "contiene"
    Pedidos ||--o{ PedidoHistorial : "registra_cambios"
    Pedidos }o--o| DireccionEnvio : "entrega_en"
    Pedidos ||--o{ Reclamaciones : "genera"
    Pedidos ||--o{ RegistroPago : "tiene_pagos"
    PedidoItems }o--o| Promociones : "aplica"
    
    Reclamaciones }o--o| Users : "gestionada_por_domiciliario"
    
    ConfiguracionTienda ||--o{ HorarioDia : "tiene_horarios"
    
    Users {
        int Id PK
        string Nombre
        string Email UK
        string PasswordHash
        string Telefono
        bool Activo
        datetime FechaCreacion
        datetime FechaActualizacion
    }
    
    Roles {
        int Id PK
        string Nombre UK
        string Descripcion
    }
    
    UserRoles {
        int Id PK
        int UserId FK
        int RolId FK
        datetime FechaAsignacion
    }
    
    Productos {
        int Id PK
        string Nombre
        string Descripcion
        decimal Precio
        int Stock
        bool StockIlimitado
        int CategoriaProductoId FK
        string ImagenUrl
        bool EsPersonalizable
        bool Activo
        datetime FechaCreacion
        datetime FechaActualizacion
    }
    
    CategoriaProducto {
        int Id PK
        string Nombre UK
        string Descripcion
        bool Activa
        datetime FechaCreacion
    }
    
    CarritoCompra {
        int Id PK
        int UsuarioId FK
        datetime FechaCreacion
        datetime FechaActualizacion
    }
    
    CarritoItems {
        int Id PK
        int CarritoCompraId FK
        int ProductoId FK
        int PromocionId FK
        int Cantidad
        decimal PrecioUnitario
    }
    
    Pedidos {
        int Id PK
        int UsuarioId FK
        datetime FechaPedido
        string Estado
        string MetodoPago
        int DireccionEnvioId FK
        decimal Subtotal
        decimal CostoEnvio
        decimal Total
        bool Aprobado
        datetime FechaAprobacion
        datetime FechaEntregaEstimada
        datetime FechaEntrega
        string NotasCliente
        datetime FechaCreacion
        datetime FechaActualizacion
        int RepartidorId FK
        string MotivoNoEntrega
        datetime FechaNoEntrega
    }
    
    PedidoItems {
        int Id PK
        int PedidoId FK
        int ProductoId FK
        int PromocionId FK
        int Cantidad
        decimal PrecioUnitario
        decimal Subtotal
    }
    
    PedidoHistorial {
        int Id PK
        int PedidoId FK
        string EstadoAnterior
        string EstadoNuevo
        datetime FechaCambio
        int CambiadoPorId FK
    }
    
    DireccionEnvio {
        int Id PK
        int UsuarioId FK
        string NombreCompleto
        string Direccion
        string Barrio
        string Referencia
        string Comuna
        string Telefono
        bool EsPredeterminada
        datetime FechaCreacion
        float Latitud
        float Longitud
    }
    
    Reviews {
        int Id PK
        int UsuarioId FK
        int ProductoId FK
        int Calificacion
        string Comentario
        bool Aprobada
        datetime FechaCreacion
        datetime FechaAprobacion
    }
    
    Promociones {
        int Id PK
        string Titulo
        string Descripcion
        int ProductoId FK
        decimal PrecioOriginal
        string TipoDescuento
        decimal Descuento
        int Stock
        string ImagenUrl
        datetime FechaInicio
        datetime FechaFin
        bool Activa
        datetime FechaCreacion
    }
    
    Notificaciones {
        int Id PK
        int UsuarioId FK
        string Titulo
        string Mensaje
        string Tipo
        string Enlace
        bool Leida
        datetime FechaCreacion
    }
    
    Reclamaciones {
        int Id PK
        int UsuarioId FK
        int PedidoId FK
        string NumeroTicket UK
        string Asunto
        string Descripcion
        string Estado
        string RespuestaAdmin
        datetime FechaCreacion
        datetime FechaActualizacion
        int DomiciliarioId FK
    }
    
    RegistroPago {
        int Id PK
        int PedidoId FK
        int UsuarioId FK
        string Estado
        datetime FechaIntento
        datetime FechaConfirmacion
        string MensajeError
        string ReferenciaExterna
    }
    
    ConfiguracionTienda {
        int Id PK
        string NombreTienda
        string Telefono
        string Email
        string Direccion
        bool SistemaActivoManual
        bool UsarControlHorario
        time HoraApertura
        time HoraCierre
        int TiempoEntregaEstimadoHoras
        decimal PedidoMinimoCompra
        datetime FechaActualizacion
    }
    
    HorarioDia {
        int Id PK
        string DiaSemana UK
        bool Cerrado
        time HoraApertura
        time HoraCierre
    }
```

## Descripción de Tablas

### Módulo de Autenticación y Usuarios

#### Users
Tabla principal de usuarios del sistema.

**Constraints**:
- `PK_Users`: Clave primaria en `Id`
- `UK_Users_Email`: Índice único en `Email` (no puede haber emails duplicados)
- `CHK_Users_Email`: CHECK que valida formato de email

**Índices**:
- `IX_Users_Email`: Índice para búsquedas rápidas por email
- `IX_Users_Activo`: Índice para filtrar usuarios activos

**Valores por defecto**:
- `EmailVerificado`: false
- `Activo`: true
- `FechaRegistro`: GETUTCDATE()
- `FechaCreacion`: GETUTCDATE()

#### Roles
Catálogo de roles del sistema (3 registros semilla).

**Datos semilla**:
```sql
INSERT INTO Roles (Id, Nombre, Activo) VALUES
(1, 'Usuario', 1),
(2, 'Admin', 1),
(3, 'Repartidor', 1);
```

**Constraints**:
- `PK_Roles`: Clave primaria en `Id`
- `UK_Roles_Nombre`: Índice único en `Nombre`

#### UserRoles
Tabla intermedia para relación muchos-a-muchos entre Users y Roles.

**Constraints**:
- `PK_UserRoles`: Clave primaria en `Id`
- `FK_UserRoles_Users`: Clave foránea a `Users.Id` (ON DELETE CASCADE)
- `FK_UserRoles_Roles`: Clave foránea a `Roles.Id` (ON DELETE CASCADE)
- `UK_UserRoles_UsuarioId_RolId`: Índice único compuesto (un usuario no puede tener el mismo rol dos veces)

**Índices**:
- `IX_UserRoles_UsuarioId`: Búsquedas rápidas de roles por usuario
- `IX_UserRoles_RolId`: Búsquedas rápidas de usuarios por rol

### Módulo de Catálogo

#### Productos
Productos disponibles en la tienda.

**Constraints**:
- `PK_Productos`: Clave primaria en `Id`
- `FK_Productos_CategoriasProducto`: Clave foránea a `CategoriasProducto.Id` (ON DELETE SET NULL)
- `CHK_Productos_Precio`: CHECK que valida `Precio > 0`
- `CHK_Productos_Stock`: CHECK que valida `Stock >= 0`

**Índices**:
- `IX_Productos_Activo`: Filtrar productos activos
- `IX_Productos_CategoriaProductoId`: Búsquedas por categoría

**Campos especiales**:
- `StockIlimitado`: Si es true, ignora validación de Stock en carrito/pedidos

#### CategoriasProducto
Clasificación de productos.

**Constraints**:
- `PK_CategoriasProducto`: Clave primaria en `Id`
- `UK_CategoriasProducto_Nombre`: Índice único en `Nombre`

### Módulo de Carrito de Compras

#### CarritoCompra
Carrito persistente por usuario (relación 1:1 con Users).

**Constraints**:
- `PK_CarritoCompra`: Clave primaria en `Id`
- `FK_CarritoCompra_Users`: Clave foránea a `Users.Id` (ON DELETE CASCADE)
- `UK_CarritoCompra_UsuarioId`: Índice único (un usuario solo puede tener un carrito)

#### CarritoItems
Ítems dentro del carrito.

**Constraints**:
- `PK_CarritoItems`: Clave primaria en `Id`
- `FK_CarritoItems_CarritoCompra`: Clave foránea a `CarritoCompra.Id` (ON DELETE CASCADE)
- `FK_CarritoItems_Productos`: Clave foránea a `Productos.Id` (ON DELETE SET NULL)
- `FK_CarritoItems_Promociones`: Clave foránea a `Promociones.Id` (ON DELETE SET NULL)
- `CHK_CarritoItems_Cantidad`: CHECK que valida `Cantidad > 0`

**Índices**:
- `IX_CarritoItems_CarritoCompraId`: Búsquedas rápidas de items por carrito

**Campos nullable**:
- `ProductoId`: Puede ser NULL si el item es una promoción independiente
- `PromocionId`: NULL si no tiene promoción aplicada

### Módulo de Pedidos

#### Pedidos
Órdenes de compra.

**Constraints**:
- `PK_Pedidos`: Clave primaria en `Id`
- `FK_Pedidos_Users_UsuarioId`: Clave foránea a `Users.Id` (cliente) (ON DELETE NO ACTION)
- `FK_Pedidos_Users_RepartidorId`: Clave foránea a `Users.Id` (repartidor) (ON DELETE NO ACTION)
- `FK_Pedidos_DireccionesEnvio`: Clave foránea a `DireccionesEnvio.Id` (ON DELETE SET NULL)
- `CHK_Pedidos_Total`: CHECK que valida `Total > 0`
- `CHK_Pedidos_Estado`: CHECK que valida estado en valores permitidos

**Índices**:
- `IX_Pedidos_UsuarioId`: Búsquedas de pedidos por cliente
- `IX_Pedidos_RepartidorId`: Búsquedas de pedidos por repartidor
- `IX_Pedidos_Estado`: Filtrar pedidos por estado
- `IX_Pedidos_FechaPedido`: Ordenar por fecha

**Estados permitidos**:
- Pendiente, Aprobado, EnCamino, Entregado, Cancelado, NoEntregado

**Campos nullable**:
- `DireccionEnvioId`: NULL si es retiro en tienda
- `RepartidorId`: NULL hasta que se asigne
- `FechaAprobacion`, `FechaEntregaEstimada`, `FechaEntrega`: NULL hasta que ocurran
- `NotasCliente`: Opcional
- `MotivoNoEntrega`, `FechaNoEntrega`: NULL excepto en estado NoEntregado

#### PedidoItems
Líneas de detalle del pedido.

**Constraints**:
- `PK_PedidoItems`: Clave primaria en `Id`
- `FK_PedidoItems_Pedidos`: Clave foránea a `Pedidos.Id` (ON DELETE CASCADE)
- `FK_PedidoItems_Productos`: Clave foránea a `Productos.Id` (ON DELETE SET NULL)
- `FK_PedidoItems_Promociones`: Clave foránea a `Promociones.Id` (ON DELETE SET NULL)
- `CHK_PedidoItems_Cantidad`: CHECK que valida `Cantidad > 0`
- `CHK_PedidoItems_PrecioUnitario`: CHECK que valida `PrecioUnitario > 0`

**Índices**:
- `IX_PedidoItems_PedidoId`: Búsquedas de items por pedido

**Campos nullable**:
- `ProductoId`: Puede ser NULL si es promoción independiente
- `PromocionId`: NULL si no tiene promoción aplicada

**Snapshot de precio**:
- `PrecioUnitario` se guarda al momento de crear el pedido (no cambia si el producto sube/baja de precio después)

#### PedidoHistorial
Auditoría de cambios de estado del pedido.

**Constraints**:
- `PK_PedidoHistorial`: Clave primaria en `Id`
- `FK_PedidoHistorial_Pedidos`: Clave foránea a `Pedidos.Id` (ON DELETE CASCADE)

**Índices**:
- `IX_PedidoHistorial_PedidoId`: Búsquedas de historial por pedido
- `IX_PedidoHistorial_FechaCambio`: Ordenar por fecha

**Uso**:
- Cada cambio de estado genera un registro automáticamente
- `CambiadoPorId` es opcional (NULL si fue automático)

### Módulo de Entregas

#### DireccionEnvio
Direcciones de envío de los usuarios.

**Constraints**:
- `PK_DireccionEnvio`: Clave primaria en `Id`
- `FK_DireccionEnvio_Users`: Clave foránea a `Users.Id` (ON DELETE CASCADE)

**Índices**:
- `IX_DireccionEnvio_UsuarioId`: Búsquedas de direcciones por usuario

**Campos GPS** (agregados 02/04/2026):
- `Latitud`: Coordenada GPS (float)
- `Longitud`: Coordenada GPS (float)

**Validación de dirección predeterminada**:
- Un usuario solo puede tener una dirección con `EsPredeterminada = true`
- Al marcar una como predeterminada, las demás se desmarcan automáticamente (lógica en Service)

### Módulo de Reviews

#### Reviews
Reseñas de productos escritas por usuarios.

**Constraints**:
- `PK_Reviews`: Clave primaria en `Id`
- `FK_Reviews_Users`: Clave foránea a `Users.Id` (ON DELETE CASCADE)
- `FK_Reviews_Productos`: Clave foránea a `Productos.Id` (ON DELETE CASCADE)
- `CHK_Reviews_Calificacion`: CHECK que valida `Calificacion BETWEEN 1 AND 5`
- `UK_Reviews_UsuarioId_ProductoId`: Índice único compuesto (un usuario solo puede hacer una review por producto)

**Índices**:
- `IX_Reviews_ProductoId`: Búsquedas de reviews por producto
- `IX_Reviews_UsuarioId`: Búsquedas de reviews por usuario
- `IX_Reviews_Aprobada`: Filtrar reviews aprobadas

**Moderación**:
- `Aprobada` es false por defecto
- Solo reviews aprobadas se muestran al público

### Módulo de Promociones

#### Promociones
Descuentos aplicables a productos o como promociones independientes.

**Constraints**:
- `PK_Promociones`: Clave primaria en `Id`
- `FK_Promociones_Productos`: Clave foránea a `Productos.Id` (ON DELETE CASCADE)
- `CHK_Promociones_Valor`: CHECK que valida `Valor > 0`
- `CHK_Promociones_TipoDescuento`: CHECK que valida tipo en ('Porcentaje', 'MontoFijo')
- `CHK_Promociones_FechaFin`: CHECK que valida `FechaFin > FechaInicio`

**Índices**:
- `IX_Promociones_Activo`: Filtrar promociones activas
- `IX_Promociones_ProductoId`: Búsquedas de promociones por producto
- `IX_Promociones_FechaInicio`: Ordenar por fecha

**Campos nullable**:
- `ProductoId`: NULL si es promoción independiente (usa `ImagenUrl` propia)
- `Stock`: NULL si la promoción se asocia a un producto (se usa el stock del producto)
- `PrecioOriginal`: NULL si se asocia a un producto (se usa el precio del producto)
- `ImagenUrl`: NULL si se asocia a un producto (se usa la imagen del producto)

**Validación de vigencia**:
- Método `EstaVigente()` valida: `Activo = true` AND `NOW() BETWEEN FechaInicio AND FechaFin`

### Módulo de Notificaciones

#### Notificaciones
Alertas enviadas a usuarios.

**Constraints**:
- `PK_Notificaciones`: Clave primaria en `Id`
- `FK_Notificaciones_Users`: Clave foránea a `Users.Id` (ON DELETE CASCADE)

**Índices**:
- `IX_Notificaciones_UsuarioId`: Búsquedas de notificaciones por usuario
- `IX_Notificaciones_Leida`: Filtrar notificaciones no leídas
- `IX_Notificaciones_FechaCreacion`: Ordenar por fecha

**Tipos de notificación**:
- Pedido: Cambios de estado en pedidos
- Sistema: Mensajes del administrador
- Promocion: Nuevas promociones

### Módulo de Reclamaciones

#### Reclamaciones
Quejas o reportes sobre pedidos.

**Constraints**:
- `PK_Reclamaciones`: Clave primaria en `Id`
- `FK_Reclamaciones_Pedidos`: Clave foránea a `Pedidos.Id` (ON DELETE CASCADE)
- `FK_Reclamaciones_Users_UsuarioId`: Clave foránea a `Users.Id` (cliente) (ON DELETE NO ACTION)
- `FK_Reclamaciones_Users_DomiciliarioId`: Clave foránea a `Users.Id` (repartidor) (ON DELETE SET NULL)
- `CHK_Reclamaciones_Estado`: CHECK que valida estado en valores permitidos

**Índices**:
- `IX_Reclamaciones_PedidoId`: Búsquedas de reclamaciones por pedido
- `IX_Reclamaciones_UsuarioId`: Búsquedas de reclamaciones por usuario
- `IX_Reclamaciones_Estado`: Filtrar reclamaciones por estado

**Estados permitidos**:
- Pendiente, EnRevision, Resuelta, Rechazada

**Creación automática**:
- Cuando un repartidor marca un pedido como "NoEntregado", se crea automáticamente una reclamación con:
  - `MotivoDomiciliario`: Motivo ingresado por el repartidor
  - `FechaNoEntrega`: Fecha del evento
  - `DomiciliarioId`: ID del repartidor
  - `Estado`: Pendiente

### Módulo de Pagos

#### RegistroPago
Log de intentos de pago y confirmaciones.

**Constraints**:
- `PK_RegistroPago`: Clave primaria en `Id`
- `FK_RegistroPago_Pedidos`: Clave foránea a `Pedidos.Id` (ON DELETE CASCADE)
- `FK_RegistroPago_Users`: Clave foránea a `Users.Id` (ON DELETE NO ACTION)
- `CHK_RegistroPago_Estado`: CHECK que valida estado en valores permitidos

**Índices**:
- `IX_RegistroPago_PedidoId`: Búsquedas de pagos por pedido
- `IX_RegistroPago_Estado`: Filtrar pagos por estado

**Estados permitidos**:
- Espera, Exitoso, Fallido

**Campos nullable**:
- `FechaConfirmacion`: NULL hasta que se confirme el pago
- `MensajeError`: NULL si el pago fue exitoso
- `ReferenciaExterna`: NULL si no hay referencia de pasarela externa

### Módulo de Configuración

#### ConfiguracionTienda
Configuración global del sistema (tabla singleton - solo 1 registro con Id = 1).

**Constraints**:
- `PK_ConfiguracionTienda`: Clave primaria en `Id`
- `CHK_ConfiguracionTienda_PedidoMinimo`: CHECK que valida `PedidoMinimoCompra > 0`

**Datos semilla**:
```sql
INSERT INTO ConfiguracionTienda (Id, NombreTienda, PedidoMinimoCompra) VALUES
(1, 'PASTISSERIE''S DELUXE', 15000.00);
```

**Horarios**:
- `HoraApertura` y `HoraCierre`: TimeSpan (ej: 08:00:00)
- `SistemaActivoManual`: Cierre manual de tienda
- `UsarControlHorario`: Activar validación de horarios

#### HorarioDia
Horarios específicos por día de la semana.

**Constraints**:
- `PK_HorarioDia`: Clave primaria en `Id`
- `UK_HorarioDia_DiaSemana`: Índice único en `DiaSemana`

**Índices**:
- `UK_HorarioDia_DiaSemana`: Un día solo puede tener un horario

**DiaSemana**:
- Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo

## Relaciones (Foreign Keys)

### 1:1 (One-to-One)
- `Users` ↔ `CarritoCompra`: Un usuario tiene un solo carrito

### 1:N (One-to-Many)
- `Users` → `UserRoles`: Un usuario puede tener múltiples roles
- `Roles` → `UserRoles`: Un rol puede estar asignado a múltiples usuarios
- `Users` → `Pedidos` (UsuarioId): Un usuario puede tener múltiples pedidos como cliente
- `Users` → `Pedidos` (RepartidorId): Un repartidor puede tener múltiples pedidos asignados
- `Users` → `Reviews`: Un usuario puede escribir múltiples reviews
- `Users` → `Notificaciones`: Un usuario puede recibir múltiples notificaciones
- `Users` → `DireccionEnvio`: Un usuario puede tener múltiples direcciones
- `CategoriaProducto` → `Productos`: Una categoría contiene múltiples productos
- `Productos` → `Reviews`: Un producto puede tener múltiples reviews
- `Productos` → `PedidoItems`: Un producto puede estar en múltiples pedidos
- `Productos` → `CarritoItems`: Un producto puede estar en múltiples carritos
- `Productos` → `Promociones`: Un producto puede tener múltiples promociones
- `CarritoCompra` → `CarritoItems`: Un carrito contiene múltiples items
- `Pedidos` → `PedidoItems`: Un pedido contiene múltiples items
- `Pedidos` → `PedidoHistorial`: Un pedido registra múltiples cambios de estado
- `Pedidos` → `Reclamaciones`: Un pedido puede generar múltiples reclamaciones
- `Pedidos` → `RegistroPago`: Un pedido puede tener múltiples intentos de pago
- `DireccionEnvio` → `Pedidos`: Una dirección puede usarse en múltiples pedidos
- `Promociones` → `CarritoItems`: Una promoción puede aplicarse a múltiples items de carrito
- `Promociones` → `PedidoItems`: Una promoción puede aplicarse a múltiples items de pedido
- `ConfiguracionTienda` → `HorarioDia`: Una tienda tiene múltiples horarios (uno por día)

### M:N (Many-to-Many)
- `Users` ↔ `Roles` (a través de `UserRoles`): Muchos usuarios pueden tener muchos roles

## Índices y Performance

### Índices Únicos (UNIQUE)
- `Users.Email`: Evita emails duplicados
- `Roles.Nombre`: Evita roles duplicados
- `UserRoles.UserId + RolId`: Evita asignaciones duplicadas
- `CarritoCompra.UsuarioId`: Un usuario solo puede tener un carrito
- `CategoriaProducto.Nombre`: Evita categorías duplicadas
- `Reviews.UsuarioId + ProductoId`: Un usuario solo puede hacer una review por producto
- `HorarioDia.DiaSemana`: Un día solo puede tener un horario
- `Reclamaciones.NumeroTicket`: Cada ticket es único

### Índices de Búsqueda (Non-unique)
- `Productos.Activo`: Filtrar productos activos (usado en catálogo público)
- `Productos.CategoriaProductoId`: Búsquedas por categoría
- `Pedidos.UsuarioId`: Búsquedas de "Mis Pedidos"
- `Pedidos.RepartidorId`: Búsquedas de "Pedidos Asignados" (repartidor)
- `Pedidos.Estado`: Filtrar pedidos por estado (Admin)
- `Pedidos.FechaPedido`: Ordenar pedidos cronológicamente
- `Reviews.ProductoId`: Búsquedas de reviews por producto
- `Reviews.Aprobada`: Filtrar reviews aprobadas (público)
- `Notificaciones.UsuarioId + Leida`: Búsquedas de notificaciones no leídas
- `Promociones.Activa + FechaInicio`: Búsquedas de promociones vigentes

### Estrategias de Optimización
1. **Índices compuestos**: `(UsuarioId, Leida)` en Notificaciones para query común "notificaciones no leídas del usuario X"
2. **Índices de fecha**: Ordenar por `FechaPedido`, `FechaCreacion` DESC para paginación
3. **Soft delete**: Usar `Activo = false` en lugar de DELETE físico (evita problemas de integridad referencial)

## Migraciones de Base de Datos

### Historial de Migraciones (33 total)
- **01-20**: Construcción inicial del modelo (diciembre 2024 - enero 2026)
- **21-25**: Refactorización de Reviews, eliminación de entidades obsoletas (marzo 2026)
- **26-30**: Simplificación de métodos de pago, ajustes en Pedido (marzo 2026)
- **31-33**: Agregado de StockIlimitado, GPS en DireccionEnvio, ajustes finales (abril 2026)

### Última Migración (03/04/2026)
- Agregado `Producto.StockIlimitado` (bool, default: false)
- Agregado `DireccionEnvio.Latitud` y `Longitud` (float, nullable)

### Entidades Eliminadas (Marzo 2026)
- **Factura**: Datos absorbidos por RegistrosPagos
- **Envios**: Datos absorbidos por Pedidos (RepartidorId, FechaEntrega)
- **MetodosPagoUsuario + TiposMetodoPago**: Simplificado a campo string `MetodoPago` en Pedidos
- **Personalización**: Funcionalidad pospuesta (flag `EsPersonalizable` en Producto)

### Comando para Aplicar Migraciones
```bash
cd PastisserieAPI.API
dotnet ef database update -p ../PastisserieAPI.Infrastructure
```

## Generado
- **Fecha**: 03/04/2026
- **Versión**: 1.0
- **Estado**: Refleja 18 tablas actuales con 33 migraciones aplicadas al 03/04/2026
