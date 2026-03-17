-- Script para agregar campos de MercadoPago a las tablas Pedidos y MetodoPagoUsuario
-- Ejecutar en SQL Server

-- =============================================
-- AGREGAR CAMPOS A LA TABLA PEDIDOS
-- =============================================

-- Verificar si la columna ya existe antes de agregarla
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Pedidos') AND name = 'MercadoPagoPaymentId')
BEGIN
    ALTER TABLE Pedidos ADD MercadoPagoPaymentId NVARCHAR(100) NULL;
    PRINT 'Columna MercadoPagoPaymentId agregada a Pedidos';
END
ELSE
BEGIN
    PRINT 'La columna MercadoPagoPaymentId ya existe en Pedidos';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Pedidos') AND name = 'MercadoPagoStatus')
BEGIN
    ALTER TABLE Pedidos ADD MercadoPagoStatus NVARCHAR(50) NULL;
    PRINT 'Columna MercadoPagoStatus agregada a Pedidos';
END
ELSE
BEGIN
    PRINT 'La columna MercadoPagoStatus ya existe en Pedidos';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Pedidos') AND name = 'MercadoPagoStatusDetail')
BEGIN
    ALTER TABLE Pedidos ADD MercadoPagoStatusDetail NVARCHAR(100) NULL;
    PRINT 'Columna MercadoPagoStatusDetail agregada a Pedidos';
END
ELSE
BEGIN
    PRINT 'La columna MercadoPagoStatusDetail ya existe en Pedidos';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Pedidos') AND name = 'MercadoPagoPaymentMethodId')
BEGIN
    ALTER TABLE Pedidos ADD MercadoPagoPaymentMethodId NVARCHAR(50) NULL;
    PRINT 'Columna MercadoPagoPaymentMethodId agregada a Pedidos';
END
ELSE
BEGIN
    PRINT 'La columna MercadoPagoPaymentMethodId ya existe en Pedidos';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Pedidos') AND name = 'MercadoPagoCardLastFourDigits')
BEGIN
    ALTER TABLE Pedidos ADD MercadoPagoCardLastFourDigits NVARCHAR(10) NULL;
    PRINT 'Columna MercadoPagoCardLastFourDigits agregada a Pedidos';
END
ELSE
BEGIN
    PRINT 'La columna MercadoPagoCardLastFourDigits ya existe en Pedidos';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Pedidos') AND name = 'MercadoPagoAmountRefunded')
BEGIN
    ALTER TABLE Pedidos ADD MercadoPagoAmountRefunded DECIMAL(18,2) NULL;
    PRINT 'Columna MercadoPagoAmountRefunded agregada a Pedidos';
END
ELSE
BEGIN
    PRINT 'La columna MercadoPagoAmountRefunded ya existe en Pedidos';
END

-- =============================================
-- AGREGAR CAMPOS A LA TABLA METODOSPAGOUSUARIO
-- =============================================

-- Primero verificamos si la tabla existe
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MetodoPagoUsuario')
BEGIN
    PRINT 'La tabla MetodoPagoUsuario no existe. Ejecuta primero el script CreateMetodoPagoUsuarioTable.sql';
END
ELSE
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('MetodoPagoUsuario') AND name = 'PaymentMethodId')
    BEGIN
        ALTER TABLE MetodoPagoUsuario ADD PaymentMethodId NVARCHAR(50) NULL;
        PRINT 'Columna PaymentMethodId agregada a MetodoPagoUsuario';
    END
    ELSE
    BEGIN
        PRINT 'La columna PaymentMethodId ya existe en MetodoPagoUsuario';
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('MetodoPagoUsuario') AND name = 'NombreTitular')
    BEGIN
        ALTER TABLE MetodoPagoUsuario ADD NombreTitular NVARCHAR(200) NULL;
        PRINT 'Columna NombreTitular agregada a MetodoPagoUsuario';
    END
    ELSE
    BEGIN
        PRINT 'La columna NombreTitular ya existe en MetodoPagoUsuario';
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('MetodoPagoUsuario') AND name = 'IdentificacionTitular')
    BEGIN
        ALTER TABLE MetodoPagoUsuario ADD IdentificacionTitular NVARCHAR(50) NULL;
        PRINT 'Columna IdentificacionTitular agregada a MetodoPagoUsuario';
    END
    ELSE
    BEGIN
        PRINT 'La columna IdentificacionTitular ya existe en MetodoPagoUsuario';
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('MetodoPagoUsuario') AND name = 'EstaActivo')
    BEGIN
        ALTER TABLE MetodoPagoUsuario ADD EstaActivo BIT NOT NULL DEFAULT 1;
        PRINT 'Columna EstaActivo agregada a MetodoPagoUsuario';
    END
    ELSE
    BEGIN
        PRINT 'La columna EstaActivo ya existe en MetodoPagoUsuario';
    END
END

-- =============================================
-- INSERTAR TIPOS DE MÉTODO DE PAGO INICIALES
-- =============================================

-- Verificar si ya existen los tipos de método de pago
IF NOT EXISTS (SELECT * FROM TipoMetodoPago WHERE Nombre LIKE '%MercadoPago%')
BEGIN
    INSERT INTO TipoMetodoPago (Nombre, Descripcion, Activo)
    VALUES 
        ('MercadoPago', 'Pagos a través de MercadoPago', 1),
        ('Efectivo', 'Pago en efectivo al momento de entrega', 1);
    PRINT 'Tipos de método de pago insertados';
END
ELSE
BEGIN
    PRINT 'Los tipos de método de pago ya existen';
END

-- =============================================
-- MENSAJE DE FINALIZACIÓN
-- =============================================
PRINT '========================================';
PRINT 'Script de MercadoPago ejecutado correctamente';
PRINT '========================================';
GO
