-- Script para crear la tabla MetodoPagoUsuario y tabla de tipos de pago
-- Ejecutar en SQL Server

PRINT '========================================';
PRINT 'Iniciando creacion de tablas de pago';
PRINT '========================================';

-- =============================================
-- CREAR TABLA TIPO METODO PAGO (si no existe)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TipoMetodoPago')
BEGIN
    CREATE TABLE TipoMetodoPago (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Nombre NVARCHAR(100) NOT NULL,
        Descripcion NVARCHAR(500) NULL,
        Activo BIT NOT NULL DEFAULT 1,
        FechaCreacion DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
    PRINT 'Tabla TipoMetodoPago creada correctamente';
    
    -- Insertar tipos de pago por defecto
    INSERT INTO TipoMetodoPago (Nombre, Descripcion, Activo)
    VALUES 
        ('Efectivo', 'Pago en efectivo al momento de entrega', 1);
    PRINT 'Tipos de metodo de pago insertados';
END
ELSE
BEGIN
    PRINT 'La tabla TipoMetodoPago ya existe';
    
    -- Verificar si ya existen los tipos de metodo de pago
    IF NOT EXISTS (SELECT * FROM TipoMetodoPago WHERE Nombre = 'Efectivo')
    BEGIN
        INSERT INTO TipoMetodoPago (Nombre, Descripcion, Activo)
        VALUES 
            ('Efectivo', 'Pago en efectivo al momento de entrega', 1);
        PRINT 'Tipos de metodo de pago insertados';
    END
    ELSE
    BEGIN
        PRINT 'Los tipos de metodo de pago ya existen';
    END
END
GO

-- =============================================
-- CREAR TABLA METODO PAGO USUARIO
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MetodoPagoUsuario')
BEGIN
    CREATE TABLE MetodoPagoUsuario (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UsuarioId INT NOT NULL,
        TipoMetodoPagoId INT NOT NULL,
        TokenPago NVARCHAR(500) NULL,
        
        -- Campos del metodo de pago
        PaymentMethodId NVARCHAR(50) NULL,  -- visa, master, etc.
        UltimosDigitos NVARCHAR(10) NULL,
        FechaExpiracion DATETIME2 NULL,
        NombreTitular NVARCHAR(200) NULL,
        IdentificacionTitular NVARCHAR(50) NULL,
        
        EsPredeterminado BIT NOT NULL DEFAULT 0,
        EstaActivo BIT NOT NULL DEFAULT 1,
        FechaCreacion DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT FK_MetodoPagoUsuario_Usuario FOREIGN KEY (UsuarioId) REFERENCES Users(Id),
        CONSTRAINT FK_MetodoPagoUsuario_TipoMetodoPago FOREIGN KEY (TipoMetodoPagoId) REFERENCES TipoMetodoPago(Id)
    );
    
    PRINT 'Tabla MetodoPagoUsuario creada correctamente';
END
ELSE
BEGIN
    PRINT 'La tabla MetodoPagoUsuario ya existe';
END
GO

-- =============================================
-- VERIFICAR CAMPOS EN METODO PAGO USUARIO
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('MetodoPagoUsuario') AND name = 'PaymentMethodId')
BEGIN
    ALTER TABLE MetodoPagoUsuario ADD PaymentMethodId NVARCHAR(50) NULL;
    PRINT 'Campo PaymentMethodId agregado';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('MetodoPagoUsuario') AND name = 'NombreTitular')
BEGIN
    ALTER TABLE MetodoPagoUsuario ADD NombreTitular NVARCHAR(200) NULL;
    PRINT 'Campo NombreTitular agregado';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('MetodoPagoUsuario') AND name = 'IdentificacionTitular')
BEGIN
    ALTER TABLE MetodoPagoUsuario ADD IdentificacionTitular NVARCHAR(50) NULL;
    PRINT 'Campo IdentificacionTitular agregado';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('MetodoPagoUsuario') AND name = 'EstaActivo')
BEGIN
    ALTER TABLE MetodoPagoUsuario ADD EstaActivo BIT NOT NULL DEFAULT 1;
    PRINT 'Campo EstaActivo agregado';
END
GO

PRINT '========================================';
PRINT 'Script ejecutado correctamente';
PRINT '========================================';
GO
