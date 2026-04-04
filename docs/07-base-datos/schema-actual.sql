-- =============================================
-- SCHEMA ACTUAL - PastisserieDB
-- Generado: 03/04/2026
-- Estado: 85-90% FUNCIONAL
-- =============================================

USE PastisserieDB;
GO

-- =============================================
-- TABLA: ROLES
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles')
BEGIN
    CREATE TABLE Roles (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Nombre NVARCHAR(50) NOT NULL,
        Descripcion NVARCHAR(200) NULL,
        CONSTRAINT UQ_Roles_Nombre UNIQUE (Nombre)
    );

    -- Seed data
    INSERT INTO Roles (Nombre, Descripcion) VALUES 
    ('Admin', 'Administrador de la tienda'),
    ('Usuario', 'Cliente registrado'),
    ('Repartidor', 'Repartidor de pedidos');
END
GO

-- =============================================
-- TABLA: USERS
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Nombre NVARCHAR(100) NOT NULL,
        Email NVARCHAR(255) NOT NULL,
        PasswordHash NVARCHAR(255) NOT NULL,
        Telefono NVARCHAR(20) NULL,
        Activo BIT DEFAULT 1,
        FechaCreacion DATETIME2 DEFAULT GETUTCDATE(),
        FechaActualizacion DATETIME2 NULL,
        CONSTRAINT UQ_Users_Email UNIQUE (Email)
    );

    -- Índice para búsqueda
    CREATE INDEX IX_Users_Activo ON Users(Activo);
END
GO

-- =============================================
-- TABLA: USERROLES (Relación muchos a muchos)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserRoles')
BEGIN
    CREATE TABLE UserRoles (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        RolId INT NOT NULL,
        CONSTRAINT FK_UserRoles_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
        CONSTRAINT FK_UserRoles_Roles FOREIGN KEY (RolId) REFERENCES Roles(Id),
        CONSTRAINT UQ_UserRoles_User_Rol UNIQUE (UserId, RolId)
    );

    CREATE INDEX IX_UserRoles_UserId ON UserRoles(UserId);
    CREATE INDEX IX_UserRoles_RolId ON UserRoles(RolId);
END
GO

-- =============================================
-- TABLA: CATEGORIAPRODUCTO
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CategoriaProducto')
BEGIN
    CREATE TABLE CategoriaProducto (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Nombre NVARCHAR(100) NOT NULL,
        Descripcion NVARCHAR(500) NULL,
        Activa BIT DEFAULT 1,
        FechaCreacion DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT UQ_CategoriaProducto_Nombre UNIQUE (Nombre)
    );
END
GO

-- =============================================
-- TABLA: PRODUCTO
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Productos')
BEGIN
    CREATE TABLE Productos (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Nombre NVARCHAR(200) NOT NULL,
        Descripcion NVARCHAR(1000) NULL,
        Precio DECIMAL(18,2) NOT NULL,
        Stock INT DEFAULT 0,
        StockIlimitado BIT DEFAULT 0,  -- Nuevo: 02/04/2026
        ImagenUrl NVARCHAR(500) NULL,
        Activo BIT DEFAULT 1,
        CategoriaProductoId INT NULL,
        EsPersonalizable BIT DEFAULT 0,
        FechaCreacion DATETIME2 DEFAULT GETUTCDATE(),
        FechaActualizacion DATETIME2 NULL,
        CONSTRAINT FK_Productos_Categoria FOREIGN KEY (CategoriaProductoId) 
            REFERENCES CategoriaProducto(Id) ON DELETE SET NULL
    );

    CREATE INDEX IX_Productos_Activo ON Productos(Activo);
    CREATE INDEX IX_Productos_CategoriaId ON Productos(CategoriaProductoId);
    CREATE INDEX IX_Productos_Activo_Categoria ON Productos(Activo, CategoriaProductoId);
END
GO

-- =============================================
-- TABLA: REVIEW (Reseñas)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Reviews')
BEGIN
    CREATE TABLE Reviews (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        ProductoId INT NOT NULL,
        UsuarioId INT NOT NULL,
        Calificacion INT NOT NULL CHECK (Calificacion BETWEEN 1 AND 5),
        Comentario NVARCHAR(1000) NULL,
        Aprobada BIT DEFAULT 0,
        FechaCreacion DATETIME2 DEFAULT GETUTCDATE(),
        FechaAprobacion DATETIME2 NULL,
        CONSTRAINT FK_Reviews_Producto FOREIGN KEY (ProductoId) REFERENCES Productos(Id) ON DELETE CASCADE,
        CONSTRAINT FK_Reviews_Usuario FOREIGN KEY (UsuarioId) REFERENCES Users(Id),
        CONSTRAINT UQ_Reviews_Producto_Usuario UNIQUE (ProductoId, UsuarioId)
    );

    CREATE INDEX IX_Reviews_ProductoId_Aprobada ON Reviews(ProductoId, Aprobada);
    CREATE INDEX IX_Reviews_Aprobada ON Reviews(Aprobada);
END
GO

-- =============================================
-- TABLA: CARRITOCOMPRA
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CarritoCompra')
BEGIN
    CREATE TABLE CarritoCompra (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UsuarioId INT NOT NULL UNIQUE,
        FechaCreacion DATETIME2 DEFAULT GETUTCDATE(),
        FechaActualizacion DATETIME2 NULL,
        CONSTRAINT FK_CarritoCompra_Usuario FOREIGN KEY (UsuarioId) REFERENCES Users(Id) ON DELETE CASCADE
    );

    CREATE INDEX IX_CarritoCompra_UsuarioId ON CarritoCompra(UsuarioId);
END
GO

-- =============================================
-- TABLA: CARRITOITEM
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CarritoItems')
BEGIN
    CREATE TABLE CarritoItems (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        CarritoCompraId INT NOT NULL,
        ProductoId INT NULL,
        PromocionId INT NULL,
        Cantidad INT NOT NULL DEFAULT 1,
        PrecioUnitario DECIMAL(18,2) NOT NULL,
        CONSTRAINT FK_CarritoItems_Carrito FOREIGN KEY (CarritoCompraId) REFERENCES CarritoCompra(Id) ON DELETE CASCADE,
        CONSTRAINT FK_CarritoItems_Producto FOREIGN KEY (ProductoId) REFERENCES Productos(Id) ON DELETE SET NULL,
        CONSTRAINT FK_CarritoItems_Promocion FOREIGN KEY (PromocionId) REFERENCES Promociones(Id) ON DELETE SET NULL,
        CONSTRAINT CK_CarritoItems_Producto_Promocion CHECK (
            (ProductoId IS NOT NULL AND PromocionId IS NULL) OR
            (ProductoId IS NULL AND PromocionId IS NOT NULL)
        )
    );

    CREATE INDEX IX_CarritoItems_CarritoId ON CarritoItems(CarritoCompraId);
END
GO

-- =============================================
-- TABLA: PROMOCION
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Promociones')
BEGIN
    CREATE TABLE Promociones (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Titulo NVARCHAR(200) NOT NULL,
        Descripcion NVARCHAR(1000) NULL,
        ProductoId INT NULL,
        PrecioOriginal DECIMAL(18,2) NULL,
        TipoDescuento NVARCHAR(20) NOT NULL, -- 'Porcentaje' o 'MontoFijo'
        Descuento DECIMAL(18,2) NOT NULL,
        Stock INT NULL,
        ImagenUrl NVARCHAR(500) NULL,
        FechaInicio DATETIME2 NOT NULL,
        FechaFin DATETIME2 NOT NULL,
        Activa BIT DEFAULT 1,
        FechaCreacion DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT FK_Promociones_Producto FOREIGN KEY (ProductoId) REFERENCES Productos(Id) ON DELETE SET NULL
    );

    CREATE INDEX IX_Promociones_Fechas ON Promociones(FechaInicio, FechaFin);
    CREATE INDEX IX_Promociones_Activa ON Promociones(Activa);
    CREATE INDEX IX_Promociones_ProductoId ON Promociones(ProductoId);
END
GO

-- =============================================
-- TABLA: DIRECCIONENVIO
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DireccionEnvio')
BEGIN
    CREATE TABLE DireccionEnvio (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UsuarioId INT NOT NULL,
        NombreCompleto NVARCHAR(200) NOT NULL,
        Direccion NVARCHAR(500) NOT NULL,
        Barrio NVARCHAR(100) NULL,
        Referencia NVARCHAR(500) NULL,
        Comuna NVARCHAR(100) NULL,
        Telefono NVARCHAR(20) NOT NULL,
        EsPredeterminada BIT DEFAULT 0,
        FechaCreacion DATETIME2 DEFAULT GETUTCDATE(),
        -- Nuevos campos GPS: 02/04/2026
        Latitud FLOAT NULL,
        Longitud FLOAT NULL,
        CONSTRAINT FK_DireccionEnvio_Usuario FOREIGN KEY (UsuarioId) REFERENCES Users(Id) ON DELETE CASCADE
    );

    CREATE INDEX IX_DireccionEnvio_UsuarioId ON DireccionEnvio(UsuarioId);
END
GO

-- =============================================
-- TABLA: PEDIDO
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Pedidos')
BEGIN
    CREATE TABLE Pedidos (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UsuarioId INT NOT NULL,
        FechaPedido DATETIME2 DEFAULT GETUTCDATE(),
        Estado NVARCHAR(50) NOT NULL DEFAULT 'Pendiente',
        MetodoPago NVARCHAR(100) NOT NULL DEFAULT 'Efectivo',
        DireccionEnvioId INT NULL,
        Subtotal DECIMAL(18,2) NOT NULL,
        CostoEnvio DECIMAL(18,2) NOT NULL DEFAULT 0,
        Total DECIMAL(18,2) NOT NULL,
        Aprobado BIT DEFAULT 0,
        FechaAprobacion DATETIME2 NULL,
        FechaEntregaEstimada DATETIME2 NULL,
        FechaEntrega DATETIME2 NULL,
        NotasCliente NVARCHAR(1000) NULL,
        FechaCreacion DATETIME2 DEFAULT GETUTCDATE(),
        FechaActualizacion DATETIME2 NULL,
        RepartidorId INT NULL,
        MotivoNoEntrega NVARCHAR(500) NULL,
        FechaNoEntrega DATETIME2 NULL,
        CONSTRAINT FK_Pedidos_Usuario FOREIGN KEY (UsuarioId) REFERENCES Users(Id),
        CONSTRAINT FK_Pedidos_DireccionEnvio FOREIGN KEY (DireccionEnvioId) REFERENCES DireccionEnvio(Id),
        CONSTRAINT FK_Pedidos_Repartidor FOREIGN KEY (RepartidorId) REFERENCES Users(Id)
    );

    CREATE INDEX IX_Pedidos_UsuarioId ON Pedidos(UsuarioId);
    CREATE INDEX IX_Pedidos_Estado ON Pedidos(Estado);
    CREATE INDEX IX_Pedidos_FechaPedido ON Pedidos(FechaPedido);
    CREATE INDEX IX_Pedidos_Aprobado ON Pedidos(Aprobado);
    CREATE INDEX IX_Pedidos_RepartidorId ON Pedidos(RepartidorId);
END
GO

-- =============================================
-- TABLA: PEDIDOITEM
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PedidoItems')
BEGIN
    CREATE TABLE PedidoItems (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        PedidoId INT NOT NULL,
        ProductoId INT NULL,
        PromocionId INT NULL,
        Cantidad INT NOT NULL,
        PrecioUnitario DECIMAL(18,2) NOT NULL,
        Subtotal DECIMAL(18,2) NOT NULL,
        CONSTRAINT FK_PedidoItems_Pedido FOREIGN KEY (PedidoId) REFERENCES Pedidos(Id) ON DELETE CASCADE,
        CONSTRAINT FK_PedidoItems_Producto FOREIGN KEY (ProductoId) REFERENCES Productos(Id) ON DELETE SET NULL,
        CONSTRAINT FK_PedidoItems_Promocion FOREIGN KEY (PromocionId) REFERENCES Promociones(Id) ON DELETE SET NULL
    );

    CREATE INDEX IX_PedidoItems_PedidoId ON PedidoItems(PedidoId);
    CREATE INDEX IX_PedidoItems_ProductoId ON PedidoItems(ProductoId);
END
GO

-- =============================================
-- TABLA: PEDIDOHISTORIAL
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PedidoHistorial')
BEGIN
    CREATE TABLE PedidoHistorial (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        PedidoId INT NOT NULL,
        EstadoAnterior NVARCHAR(50) NULL,
        EstadoNuevo NVARCHAR(50) NOT NULL,
        FechaCambio DATETIME2 DEFAULT GETUTCDATE(),
        CambiadoPorId INT NULL,
        CONSTRAINT FK_PedidoHistorial_Pedido FOREIGN KEY (PedidoId) REFERENCES Pedidos(Id) ON DELETE CASCADE,
        CONSTRAINT FK_PedidoHistorial_CambiadoPor FOREIGN KEY (CambiadoPorId) REFERENCES Users(Id)
    );

    CREATE INDEX IX_PedidoHistorial_PedidoId ON PedidoHistorial(PedidoId);
END
GO

-- =============================================
-- TABLA: REGISTROPAGO
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RegistroPago')
BEGIN
    CREATE TABLE RegistroPago (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        PedidoId INT NOT NULL,
        UsuarioId INT NOT NULL,
        Estado NVARCHAR(20) NOT NULL DEFAULT 'Espera', -- 'Espera', 'Exitoso', 'Fallido'
        FechaIntento DATETIME2 DEFAULT GETUTCDATE(),
        FechaConfirmacion DATETIME2 NULL,
        MensajeError NVARCHAR(500) NULL,
        ReferenciaExterna NVARCHAR(100) NULL,
        CONSTRAINT FK_RegistroPago_Pedido FOREIGN KEY (PedidoId) REFERENCES Pedidos(Id),
        CONSTRAINT FK_RegistroPago_Usuario FOREIGN KEY (UsuarioId) REFERENCES Users(Id)
    );

    CREATE INDEX IX_RegistroPago_PedidoId ON RegistroPago(PedidoId);
    CREATE INDEX IX_RegistroPago_UsuarioId ON RegistroPago(UsuarioId);
    CREATE INDEX IX_RegistroPago_Estado ON RegistroPago(Estado);
END
GO

-- =============================================
-- TABLA: NOTIFICACION
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Notificaciones')
BEGIN
    CREATE TABLE Notificaciones (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UsuarioId INT NOT NULL,
        Titulo NVARCHAR(200) NOT NULL,
        Mensaje NVARCHAR(1000) NULL,
        Tipo NVARCHAR(50) NULL, -- 'Pedido', 'Promocion', 'Sistema', 'Repartidor'
        Enlace NVARCHAR(500) NULL,
        Leida BIT DEFAULT 0,
        FechaCreacion DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT FK_Notificaciones_Usuario FOREIGN KEY (UsuarioId) REFERENCES Users(Id) ON DELETE CASCADE
    );

    CREATE INDEX IX_Notificaciones_UsuarioId ON Notificaciones(UsuarioId);
    CREATE INDEX IX_Notificaciones_Leida ON Notificaciones(Leida);
    CREATE INDEX IX_Notificaciones_UsuarioId_Leida ON Notificaciones(UsuarioId, Leida);
END
GO

-- =============================================
-- TABLA: CONFIGURACIONTIENDA
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ConfiguracionTienda')
BEGIN
    CREATE TABLE ConfiguracionTienda (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        NombreTienda NVARCHAR(200) NULL,
        Telefono NVARCHAR(20) NULL,
        Email NVARCHAR(100) NULL,
        Direccion NVARCHAR(500) NULL,
        SistemaActivoManual BIT DEFAULT 1,
        UsarControlHorario BIT DEFAULT 1,
        HoraApertura TIME DEFAULT '08:00:00',
        HoraCierre TIME DEFAULT '18:00:00',
        TiempoEntregaEstimadoHoras INT DEFAULT 48,
        PedidoMinimoCompra DECIMAL(18,2) DEFAULT 15000.00,
        FechaActualizacion DATETIME2 NULL
    );

    -- Insertar registro único
    INSERT INTO ConfiguracionTienda (NombreTienda, Telefono, Email, SistemaActivoManual, UsarControlHorario)
    VALUES ('Pastisserie''s Deluxe', '+57 300 123 4567', 'contacto@pastisseriedeluxe.com', 1, 1);
END
GO

-- =============================================
-- TABLA: HORARIODIA
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'HorarioDia')
BEGIN
    CREATE TABLE HorarioDia (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        DiaSemana NVARCHAR(20) NOT NULL,
        Cerrado BIT DEFAULT 0,
        HoraApertura TIME NULL,
        HoraCierre TIME NULL,
        CONSTRAINT UQ_HorarioDia_DiaSemana UNIQUE (DiaSemana)
    );

    -- Seed data: Horarios default
    INSERT INTO HorarioDia (DiaSemana, Cerrado, HoraApertura, HoraCierre) VALUES
    ('Lunes', 0, '08:00', '18:00'),
    ('Martes', 0, '08:00', '18:00'),
    ('Miércoles', 0, '08:00', '18:00'),
    ('Jueves', 0, '08:00', '18:00'),
    ('Viernes', 0, '08:00', '18:00'),
    ('Sábado', 0, '09:00', '14:00'),
    ('Domingo', 1, NULL, NULL);
END
GO

-- =============================================
-- TABLA: RECLAMACION
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Reclamaciones')
BEGIN
    CREATE TABLE Reclamaciones (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UsuarioId INT NOT NULL,
        PedidoId INT NULL,
        NumeroTicket NVARCHAR(50) NOT NULL,
        Asunto NVARCHAR(200) NOT NULL,
        Descripcion NVARCHAR(2000) NOT NULL,
        Estado NVARCHAR(50) NOT NULL DEFAULT 'Pendiente', -- 'Pendiente', 'EnRevision', 'Resuelta', 'Rechazada'
        RespuestaAdmin NVARCHAR(2000) NULL,
        FechaCreacion DATETIME2 DEFAULT GETUTCDATE(),
        FechaActualizacion DATETIME2 NULL,
        CONSTRAINT FK_Reclamaciones_Usuario FOREIGN KEY (UsuarioId) REFERENCES Users(Id),
        CONSTRAINT FK_Reclamaciones_Pedido FOREIGN KEY (PedidoId) REFERENCES Pedidos(Id),
        CONSTRAINT UQ_Reclamaciones_NumeroTicket UNIQUE (NumeroTicket)
    );

    CREATE INDEX IX_Reclamaciones_UsuarioId ON Reclamaciones(UsuarioId);
    CREATE INDEX IX_Reclamaciones_Estado ON Reclamaciones(Estado);
    CREATE INDEX IX_Reclamaciones_PedidoId ON Reclamaciones(PedidoId);
END
GO

-- =============================================
-- VERIFICACIÓN FINAL
-- =============================================
SELECT 
    'Tablas creadas correctamente' AS Resultado,
    COUNT(*) AS TotalTablas
FROM sys.tables 
WHERE type = 'U' 
  AND name IN (
    'Users', 'Roles', 'UserRoles', 'CategoriaProducto', 'Productos', 'Reviews',
    'CarritoCompra', 'CarritoItems', 'Promociones', 'DireccionEnvio', 
    'Pedidos', 'PedidoItems', 'PedidoHistorial', 'RegistroPago', 
    'Notificaciones', 'ConfiguracionTienda', 'HorarioDia', 'Reclamaciones'
  );
GO

PRINT 'Schema PastisserieDB creado correctamente - 03/04/2026';
GO