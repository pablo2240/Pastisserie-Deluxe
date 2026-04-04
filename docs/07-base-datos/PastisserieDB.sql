-- DROP SCHEMA dbo;

CREATE SCHEMA dbo;
-- PastisserieDB.dbo.CategoriasProducto definition

-- Drop table

-- DROP TABLE PastisserieDB.dbo.CategoriasProducto;

CREATE TABLE PastisserieDB.dbo.CategoriasProducto (
	Id int IDENTITY(1,1) NOT NULL,
	Nombre nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Descripcion nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Activa bit NOT NULL,
	CONSTRAINT PK_CategoriasProducto PRIMARY KEY (Id)
);


-- PastisserieDB.dbo.ConfiguracionTienda definition

-- Drop table

-- DROP TABLE PastisserieDB.dbo.ConfiguracionTienda;

CREATE TABLE PastisserieDB.dbo.ConfiguracionTienda (
	Id int IDENTITY(1,1) NOT NULL,
	NombreTienda nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Direccion nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Telefono nvarchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	EmailContacto nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CostoEnvio decimal(18,2) NOT NULL,
	Moneda nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	MensajeBienvenida nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	FechaActualizacion datetime2 NOT NULL,
	FacebookUrl nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	HorarioActivo bit DEFAULT CONVERT([bit],(0)) NOT NULL,
	HorarioApertura nvarchar(5) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT N'' NOT NULL,
	HorarioCierre nvarchar(5) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT N'' NOT NULL,
	InstagramUrl nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	WhatsappUrl nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	HoraApertura time DEFAULT '00:00:00' NOT NULL,
	HoraCierre time DEFAULT '00:00:00' NOT NULL,
	SistemaActivoManual bit DEFAULT CONVERT([bit],(0)) NOT NULL,
	UsarControlHorario bit DEFAULT CONVERT([bit],(0)) NOT NULL,
	DiasLaborales nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT N'' NOT NULL,
	CompraMinima decimal(18,2) DEFAULT 0.0 NOT NULL,
	LimitarUnidadesPorProducto bit DEFAULT CONVERT([bit],(0)) NOT NULL,
	MaxUnidadesPorProducto int DEFAULT 0 NOT NULL,
	CostosEnvioPorComuna nvarchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_ConfiguracionTienda PRIMARY KEY (Id)
);


-- PastisserieDB.dbo.Roles definition

-- Drop table

-- DROP TABLE PastisserieDB.dbo.Roles;

CREATE TABLE PastisserieDB.dbo.Roles (
	Id int IDENTITY(1,1) NOT NULL,
	Nombre nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Activo bit NOT NULL,
	CONSTRAINT PK_Roles PRIMARY KEY (Id)
);


-- PastisserieDB.dbo.TiposMetodoPago definition

-- Drop table

-- DROP TABLE PastisserieDB.dbo.TiposMetodoPago;

CREATE TABLE PastisserieDB.dbo.TiposMetodoPago (
	Id int IDENTITY(1,1) NOT NULL,
	Nombre nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Descripcion nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Activo bit NOT NULL,
	CONSTRAINT PK_TiposMetodoPago PRIMARY KEY (Id)
);


-- PastisserieDB.dbo.Users definition

-- Drop table

-- DROP TABLE PastisserieDB.dbo.Users;

CREATE TABLE PastisserieDB.dbo.Users (
	Id int IDENTITY(1,1) NOT NULL,
	Nombre nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Email nvarchar(150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	PasswordHash nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Telefono nvarchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	EmailVerificado bit NOT NULL,
	FechaRegistro datetime2 NOT NULL,
	UltimoAcceso datetime2 NULL,
	Activo bit NOT NULL,
	FechaCreacion datetime2 NOT NULL,
	FechaActualizacion datetime2 NULL,
	Direccion nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_Users PRIMARY KEY (Id)
);
 CREATE UNIQUE NONCLUSTERED INDEX IX_Users_Email ON PastisserieDB.dbo.Users (  Email ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- PastisserieDB.dbo.[__EFMigrationsHistory] definition

-- Drop table

-- DROP TABLE PastisserieDB.dbo.[__EFMigrationsHistory];

CREATE TABLE PastisserieDB.dbo.[__EFMigrationsHistory] (
	MigrationId nvarchar(150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	ProductVersion nvarchar(32) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK___EFMigrationsHistory PRIMARY KEY (MigrationId)
);


-- PastisserieDB.dbo.Carritos definition

-- Drop table

-- DROP TABLE PastisserieDB.dbo.Carritos;

CREATE TABLE PastisserieDB.dbo.Carritos (
	Id int IDENTITY(1,1) NOT NULL,
	UsuarioId int NOT NULL,
	FechaCreacion datetime2 NOT NULL,
	FechaActualizacion datetime2 NULL,
	CONSTRAINT PK_Carritos PRIMARY KEY (Id),
	CONSTRAINT FK_Carritos_Users_UsuarioId FOREIGN KEY (UsuarioId) REFERENCES PastisserieDB.dbo.Users(Id) ON DELETE CASCADE
);
 CREATE UNIQUE NONCLUSTERED INDEX IX_Carritos_UsuarioId ON PastisserieDB.dbo.Carritos (  UsuarioId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- PastisserieDB.dbo.DireccionesEnvio definition

-- Drop table

-- DROP TABLE PastisserieDB.dbo.DireccionesEnvio;

CREATE TABLE PastisserieDB.dbo.DireccionesEnvio (
	Id int IDENTITY(1,1) NOT NULL,
	UsuarioId int NOT NULL,
	NombreCompleto nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Direccion nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Barrio nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Referencia nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Telefono nvarchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	EsPredeterminada bit NOT NULL,
	FechaCreacion datetime2 NOT NULL,
	Comuna nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_DireccionesEnvio PRIMARY KEY (Id),
	CONSTRAINT FK_DireccionesEnvio_Users_UsuarioId FOREIGN KEY (UsuarioId) REFERENCES PastisserieDB.dbo.Users(Id) ON DELETE CASCADE
);
 CREATE NONCLUSTERED INDEX IX_DireccionesEnvio_UsuarioId ON PastisserieDB.dbo.DireccionesEnvio (  UsuarioId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- PastisserieDB.dbo.HorariosPorDia definition

-- Drop table

-- DROP TABLE PastisserieDB.dbo.HorariosPorDia;

CREATE TABLE PastisserieDB.dbo.HorariosPorDia (
	Id int IDENTITY(1,1) NOT NULL,
	ConfiguracionTiendaId int NOT NULL,
	DiaSemana int NOT NULL,
	Abierto bit NOT NULL,
	HoraApertura time NOT NULL,
	HoraCierre time NOT NULL,
	CONSTRAINT PK_HorariosPorDia PRIMARY KEY (Id),
	CONSTRAINT FK_HorariosPorDia_ConfiguracionTienda_ConfiguracionTiendaId FOREIGN KEY (ConfiguracionTiendaId) REFERENCES PastisserieDB.dbo.ConfiguracionTienda(Id) ON DELETE CASCADE
);
 CREATE NONCLUSTERED INDEX IX_HorariosPorDia_ConfiguracionTiendaId ON PastisserieDB.dbo.HorariosPorDia (  ConfiguracionTiendaId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- PastisserieDB.dbo.MetodosPagoUsuario definition

-- Drop table

-- DROP TABLE PastisserieDB.dbo.MetodosPagoUsuario;

CREATE TABLE PastisserieDB.dbo.MetodosPagoUsuario (
	Id int IDENTITY(1,1) NOT NULL,
	UsuarioId int NOT NULL,
	TipoMetodoPagoId int NOT NULL,
	TokenPago nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	UltimosDigitos nvarchar(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FechaExpiracion datetime2 NULL,
	EsPredeterminado bit NOT NULL,
	FechaCreacion datetime2 NOT NULL,
	EstaActivo bit DEFAULT CONVERT([bit],(0)) NOT NULL,
	IdentificacionTitular nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	NombreTitular nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PaymentMethodId nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_MetodosPagoUsuario PRIMARY KEY (Id),
	CONSTRAINT FK_MetodosPagoUsuario_TiposMetodoPago_TipoMetodoPagoId FOREIGN KEY (TipoMetodoPagoId) REFERENCES PastisserieDB.dbo.TiposMetodoPago(Id) ON DELETE CASCADE,
	CONSTRAINT FK_MetodosPagoUsuario_Users_UsuarioId FOREIGN KEY (UsuarioId) REFERENCES PastisserieDB.dbo.Users(Id) ON DELETE CASCADE
);
 CREATE NONCLUSTERED INDEX IX_MetodosPagoUsuario_TipoMetodoPagoId ON PastisserieDB.dbo.MetodosPagoUsuario (  TipoMetodoPagoId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_MetodosPagoUsuario_UsuarioId ON PastisserieDB.dbo.MetodosPagoUsuario (  UsuarioId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- PastisserieDB.dbo.Notificaciones definition

-- Drop table

-- DROP TABLE PastisserieDB.dbo.Notificaciones;

CREATE TABLE PastisserieDB.dbo.Notificaciones (
	Id int IDENTITY(1,1) NOT NULL,
	UsuarioId int NOT NULL,
	Tipo nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Mensaje nvarchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	FechaCreacion datetime2 NOT NULL,
	Leida bit NOT NULL,
	FechaLeida datetime2 NULL,
	Titulo nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT N'' NOT NULL,
	Enlace nvarchar(300) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_Notificaciones PRIMARY KEY (Id),
	CONSTRAINT FK_Notificaciones_Users_UsuarioId FOREIGN KEY (UsuarioId) REFERENCES PastisserieDB.dbo.Users(Id) ON DELETE CASCADE
);
 CREATE NONCLUSTERED INDEX IX_Notificaciones_UsuarioId ON PastisserieDB.dbo.Notificaciones (  UsuarioId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- PastisserieDB.dbo.Pedidos definition

-- Drop table

-- DROP TABLE PastisserieDB.dbo.Pedidos;

CREATE TABLE PastisserieDB.dbo.Pedidos (
	Id int IDENTITY(1,1) NOT NULL,
	UsuarioId int NOT NULL,
	FechaPedido datetime2 NOT NULL,
	Estado nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT N'Pendiente' NOT NULL,
	MetodoPagoId int NOT NULL,
	DireccionEnvioId int NULL,
	Subtotal decimal(18,2) NOT NULL,
	CostoEnvio decimal(18,2) NOT NULL,
	Total decimal(18,2) NOT NULL,
	Aprobado bit NOT NULL,
	FechaAprobacion datetime2 NULL,
	FechaEntregaEstimada datetime2 NULL,
	NotasCliente nvarchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FechaCreacion datetime2 NOT NULL,
	FechaActualizacion datetime2 NULL,
	RepartidorId int NULL,
	FechaEntrega datetime2 NULL,
	FechaNoEntrega datetime2 NULL,
	MotivoNoEntrega nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_Pedidos PRIMARY KEY (Id),
	CONSTRAINT FK_Pedidos_DireccionesEnvio_DireccionEnvioId FOREIGN KEY (DireccionEnvioId) REFERENCES PastisserieDB.dbo.DireccionesEnvio(Id),
	CONSTRAINT FK_Pedidos_MetodosPagoUsuario_MetodoPagoId FOREIGN KEY (MetodoPagoId) REFERENCES PastisserieDB.dbo.MetodosPagoUsuario(Id) ON DELETE CASCADE,
	CONSTRAINT FK_Pedidos_Users_RepartidorId FOREIGN KEY (RepartidorId) REFERENCES PastisserieDB.dbo.Users(Id),
	CONSTRAINT FK_Pedidos_Users_UsuarioId FOREIGN KEY (UsuarioId) REFERENCES PastisserieDB.dbo.Users(Id)
);
 CREATE NONCLUSTERED INDEX IX_Pedidos_DireccionEnvioId ON PastisserieDB.dbo.Pedidos (  DireccionEnvioId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_Pedidos_Estado ON PastisserieDB.dbo.Pedidos (  Estado ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_Pedidos_FechaPedido ON PastisserieDB.dbo.Pedidos (  FechaPedido ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_Pedidos_MetodoPagoId ON PastisserieDB.dbo.Pedidos (  MetodoPagoId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_Pedidos_RepartidorId ON PastisserieDB.dbo.Pedidos (  RepartidorId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_Pedidos_UsuarioId ON PastisserieDB.dbo.Pedidos (  UsuarioId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- PastisserieDB.dbo.Productos definition

-- Drop table

-- DROP TABLE PastisserieDB.dbo.Productos;

CREATE TABLE PastisserieDB.dbo.Productos (
	Id int IDENTITY(1,1) NOT NULL,
	Nombre nvarchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Descripcion nvarchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Precio decimal(18,2) NOT NULL,
	Stock int DEFAULT 0 NOT NULL,
	StockMinimo int NULL,
	Categoria nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	ImagenUrl nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	EsPersonalizable bit NOT NULL,
	Activo bit NOT NULL,
	FechaCreacion datetime2 NOT NULL,
	FechaActualizacion datetime2 NULL,
	CategoriaProductoId int NULL,
	CONSTRAINT PK_Productos PRIMARY KEY (Id),
	CONSTRAINT FK_Productos_CategoriasProducto_CategoriaProductoId FOREIGN KEY (CategoriaProductoId) REFERENCES PastisserieDB.dbo.CategoriasProducto(Id)
);
 CREATE NONCLUSTERED INDEX IX_Productos_Categoria ON PastisserieDB.dbo.Productos (  Categoria ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_Productos_CategoriaProductoId ON PastisserieDB.dbo.Productos (  CategoriaProductoId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_Productos_Nombre ON PastisserieDB.dbo.Productos (  Nombre ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- PastisserieDB.dbo.Promociones definition

-- Drop table

-- DROP TABLE PastisserieDB.dbo.Promociones;

CREATE TABLE PastisserieDB.dbo.Promociones (
	Id int IDENTITY(1,1) NOT NULL,
	Nombre nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Descripcion nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TipoDescuento nvarchar(20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Valor decimal(18,2) NOT NULL,
	FechaInicio datetime2 NOT NULL,
	FechaFin datetime2 NOT NULL,
	Activo bit NOT NULL,
	ImagenUrl nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	FechaCreacion datetime2 NOT NULL,
	FechaActualizacion datetime2 NULL,
	ProductoId int NULL,
	PrecioOriginal decimal(18,2) NULL,
	Stock int NULL,
	CONSTRAINT PK_Promociones PRIMARY KEY (Id),
	CONSTRAINT FK_Promociones_Productos_ProductoId FOREIGN KEY (ProductoId) REFERENCES PastisserieDB.dbo.Productos(Id) ON DELETE SET NULL
);
 CREATE NONCLUSTERED INDEX IX_Promociones_ProductoId ON PastisserieDB.dbo.Promociones (  ProductoId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- PastisserieDB.dbo.Reclamaciones definition

-- Drop table

-- DROP TABLE PastisserieDB.dbo.Reclamaciones;

CREATE TABLE PastisserieDB.dbo.Reclamaciones (
	Id int IDENTITY(1,1) NOT NULL,
	PedidoId int NOT NULL,
	UsuarioId int NOT NULL,
	Fecha datetime2 NOT NULL,
	Motivo nvarchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	Estado nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	CONSTRAINT PK_Reclamaciones PRIMARY KEY (Id),
	CONSTRAINT FK_Reclamaciones_Pedidos_PedidoId FOREIGN KEY (PedidoId) REFERENCES PastisserieDB.dbo.Pedidos(Id) ON DELETE CASCADE,
	CONSTRAINT FK_Reclamaciones_Users_UsuarioId FOREIGN KEY (UsuarioId) REFERENCES PastisserieDB.dbo.Users(Id)
);
 CREATE NONCLUSTERED INDEX IX_Reclamaciones_PedidoId ON PastisserieDB.dbo.Reclamaciones (  PedidoId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_Reclamaciones_UsuarioId ON PastisserieDB.dbo.Reclamaciones (  UsuarioId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- PastisserieDB.dbo.RegistrosPago definition

-- Drop table

-- DROP TABLE PastisserieDB.dbo.RegistrosPago;

CREATE TABLE PastisserieDB.dbo.RegistrosPago (
	Id int IDENTITY(1,1) NOT NULL,
	PedidoId int NOT NULL,
	UsuarioId int NOT NULL,
	Estado nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	FechaIntento datetime2 NOT NULL,
	FechaConfirmacion datetime2 NULL,
	MensajeError nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ReferenciaExterna nvarchar(MAX) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_RegistrosPago PRIMARY KEY (Id),
	CONSTRAINT FK_RegistrosPago_Pedidos_PedidoId FOREIGN KEY (PedidoId) REFERENCES PastisserieDB.dbo.Pedidos(Id) ON DELETE CASCADE
);
 CREATE NONCLUSTERED INDEX IX_RegistrosPago_PedidoId ON PastisserieDB.dbo.RegistrosPago (  PedidoId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- PastisserieDB.dbo.Reviews definition

-- Drop table

-- DROP TABLE PastisserieDB.dbo.Reviews;

CREATE TABLE PastisserieDB.dbo.Reviews (
	Id int IDENTITY(1,1) NOT NULL,
	UsuarioId int NOT NULL,
	ProductoId int NOT NULL,
	Calificacion int NOT NULL,
	Comentario nvarchar(1000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Fecha datetime2 NOT NULL,
	Aprobada bit NOT NULL,
	AprobadaPor int NULL,
	CONSTRAINT PK_Reviews PRIMARY KEY (Id),
	CONSTRAINT FK_Reviews_Productos_ProductoId FOREIGN KEY (ProductoId) REFERENCES PastisserieDB.dbo.Productos(Id) ON DELETE CASCADE,
	CONSTRAINT FK_Reviews_Users_UsuarioId FOREIGN KEY (UsuarioId) REFERENCES PastisserieDB.dbo.Users(Id)
);
 CREATE NONCLUSTERED INDEX IX_Reviews_ProductoId ON PastisserieDB.dbo.Reviews (  ProductoId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_Reviews_UsuarioId ON PastisserieDB.dbo.Reviews (  UsuarioId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- PastisserieDB.dbo.UserRoles definition

-- Drop table

-- DROP TABLE PastisserieDB.dbo.UserRoles;

CREATE TABLE PastisserieDB.dbo.UserRoles (
	Id int IDENTITY(1,1) NOT NULL,
	UsuarioId int NOT NULL,
	RolId int NOT NULL,
	FechaAsignacion datetime2 NOT NULL,
	CONSTRAINT PK_UserRoles PRIMARY KEY (Id),
	CONSTRAINT FK_UserRoles_Roles_RolId FOREIGN KEY (RolId) REFERENCES PastisserieDB.dbo.Roles(Id) ON DELETE CASCADE,
	CONSTRAINT FK_UserRoles_Users_UsuarioId FOREIGN KEY (UsuarioId) REFERENCES PastisserieDB.dbo.Users(Id) ON DELETE CASCADE
);
 CREATE NONCLUSTERED INDEX IX_UserRoles_RolId ON PastisserieDB.dbo.UserRoles (  RolId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_UserRoles_UsuarioId ON PastisserieDB.dbo.UserRoles (  UsuarioId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- PastisserieDB.dbo.CarritoItems definition

-- Drop table

-- DROP TABLE PastisserieDB.dbo.CarritoItems;

CREATE TABLE PastisserieDB.dbo.CarritoItems (
	Id int IDENTITY(1,1) NOT NULL,
	CarritoId int NOT NULL,
	ProductoId int NULL,
	Cantidad int NOT NULL,
	FechaAgregado datetime2 NOT NULL,
	PrecioOriginal decimal(18,2) NULL,
	PromocionId int NULL,
	CONSTRAINT PK_CarritoItems PRIMARY KEY (Id),
	CONSTRAINT FK_CarritoItems_Carritos_CarritoId FOREIGN KEY (CarritoId) REFERENCES PastisserieDB.dbo.Carritos(Id) ON DELETE CASCADE,
	CONSTRAINT FK_CarritoItems_Productos_ProductoId FOREIGN KEY (ProductoId) REFERENCES PastisserieDB.dbo.Productos(Id),
	CONSTRAINT FK_CarritoItems_Promociones_PromocionId FOREIGN KEY (PromocionId) REFERENCES PastisserieDB.dbo.Promociones(Id)
);
 CREATE NONCLUSTERED INDEX IX_CarritoItems_CarritoId ON PastisserieDB.dbo.CarritoItems (  CarritoId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_CarritoItems_ProductoId ON PastisserieDB.dbo.CarritoItems (  ProductoId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_CarritoItems_PromocionId ON PastisserieDB.dbo.CarritoItems (  PromocionId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- PastisserieDB.dbo.Envios definition

-- Drop table

-- DROP TABLE PastisserieDB.dbo.Envios;

CREATE TABLE PastisserieDB.dbo.Envios (
	Id int IDENTITY(1,1) NOT NULL,
	PedidoId int NOT NULL,
	RepartidorId int NULL,
	NumeroGuia nvarchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Estado nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	FechaDespacho datetime2 NOT NULL,
	FechaEntrega datetime2 NULL,
	FechaActualizacion datetime2 NOT NULL,
	CONSTRAINT PK_Envios PRIMARY KEY (Id),
	CONSTRAINT FK_Envios_Pedidos_PedidoId FOREIGN KEY (PedidoId) REFERENCES PastisserieDB.dbo.Pedidos(Id) ON DELETE CASCADE,
	CONSTRAINT FK_Envios_Users_RepartidorId FOREIGN KEY (RepartidorId) REFERENCES PastisserieDB.dbo.Users(Id)
);
 CREATE UNIQUE NONCLUSTERED INDEX IX_Envios_PedidoId ON PastisserieDB.dbo.Envios (  PedidoId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_Envios_RepartidorId ON PastisserieDB.dbo.Envios (  RepartidorId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- PastisserieDB.dbo.Facturas definition

-- Drop table

-- DROP TABLE PastisserieDB.dbo.Facturas;

CREATE TABLE PastisserieDB.dbo.Facturas (
	Id int IDENTITY(1,1) NOT NULL,
	PedidoId int NOT NULL,
	NumeroFactura nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	FechaEmision datetime2 NOT NULL,
	Subtotal decimal(18,2) NOT NULL,
	IVA decimal(18,2) NOT NULL,
	Total decimal(18,2) NOT NULL,
	RutaArchivo nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_Facturas PRIMARY KEY (Id),
	CONSTRAINT FK_Facturas_Pedidos_PedidoId FOREIGN KEY (PedidoId) REFERENCES PastisserieDB.dbo.Pedidos(Id) ON DELETE CASCADE
);
 CREATE UNIQUE NONCLUSTERED INDEX IX_Facturas_NumeroFactura ON PastisserieDB.dbo.Facturas (  NumeroFactura ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE UNIQUE NONCLUSTERED INDEX IX_Facturas_PedidoId ON PastisserieDB.dbo.Facturas (  PedidoId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- PastisserieDB.dbo.PedidoHistoriales definition

-- Drop table

-- DROP TABLE PastisserieDB.dbo.PedidoHistoriales;

CREATE TABLE PastisserieDB.dbo.PedidoHistoriales (
	Id int IDENTITY(1,1) NOT NULL,
	PedidoId int NOT NULL,
	EstadoAnterior nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	EstadoNuevo nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	FechaCambio datetime2 NOT NULL,
	CambiadoPor int NULL,
	Notas nvarchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK_PedidoHistoriales PRIMARY KEY (Id),
	CONSTRAINT FK_PedidoHistoriales_Pedidos_PedidoId FOREIGN KEY (PedidoId) REFERENCES PastisserieDB.dbo.Pedidos(Id) ON DELETE CASCADE
);
 CREATE NONCLUSTERED INDEX IX_PedidoHistoriales_PedidoId ON PastisserieDB.dbo.PedidoHistoriales (  PedidoId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;


-- PastisserieDB.dbo.PedidoItems definition

-- Drop table

-- DROP TABLE PastisserieDB.dbo.PedidoItems;

CREATE TABLE PastisserieDB.dbo.PedidoItems (
	Id int IDENTITY(1,1) NOT NULL,
	PedidoId int NOT NULL,
	ProductoId int NULL,
	Cantidad int NOT NULL,
	PrecioUnitario decimal(18,2) NOT NULL,
	Subtotal decimal(18,2) NOT NULL,
	PrecioOriginal decimal(18,2) NULL,
	PromocionId int NULL,
	CONSTRAINT PK_PedidoItems PRIMARY KEY (Id),
	CONSTRAINT FK_PedidoItems_Pedidos_PedidoId FOREIGN KEY (PedidoId) REFERENCES PastisserieDB.dbo.Pedidos(Id) ON DELETE CASCADE,
	CONSTRAINT FK_PedidoItems_Productos_ProductoId FOREIGN KEY (ProductoId) REFERENCES PastisserieDB.dbo.Productos(Id),
	CONSTRAINT FK_PedidoItems_Promociones_PromocionId FOREIGN KEY (PromocionId) REFERENCES PastisserieDB.dbo.Promociones(Id)
);
 CREATE NONCLUSTERED INDEX IX_PedidoItems_PedidoId ON PastisserieDB.dbo.PedidoItems (  PedidoId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_PedidoItems_ProductoId ON PastisserieDB.dbo.PedidoItems (  ProductoId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;
 CREATE NONCLUSTERED INDEX IX_PedidoItems_PromocionId ON PastisserieDB.dbo.PedidoItems (  PromocionId ASC  )  
	 WITH (  PAD_INDEX = OFF ,FILLFACTOR = 100  ,SORT_IN_TEMPDB = OFF , IGNORE_DUP_KEY = OFF , STATISTICS_NORECOMPUTE = OFF , ONLINE = OFF , ALLOW_ROW_LOCKS = ON , ALLOW_PAGE_LOCKS = ON  )
	 ON [PRIMARY ] ;