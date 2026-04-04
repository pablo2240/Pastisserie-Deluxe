INSERT INTO PastisserieDB.dbo.CarritoItems (CarritoId,ProductoId,Cantidad,FechaAgregado,PrecioOriginal,PromocionId) VALUES
	 (3003,17,1,'2026-03-26 17:03:21.0564692',NULL,NULL),
	 (3003,21,1,'2026-03-26 17:03:37.9730089',NULL,NULL),
	 (3003,3,2,'2026-03-26 17:06:22.9178787',NULL,NULL);
INSERT INTO PastisserieDB.dbo.Carritos (UsuarioId,FechaCreacion,FechaActualizacion) VALUES
	 (1,'2026-03-17 00:32:50.1732988','2026-03-27 03:00:22.0552389'),
	 (1001,'2026-03-17 20:43:10.6809523','2026-03-27 00:38:51.4536528'),
	 (1002,'2026-03-17 21:29:34.4074462',NULL),
	 (2001,'2026-03-19 21:52:20.0812985','2026-03-19 21:53:23.8669159'),
	 (2002,'2026-03-20 17:13:53.0586512','2026-03-25 18:31:26.3955491'),
	 (3002,'2026-03-26 16:54:51.5656542','2026-03-26 17:06:48.7259203');
INSERT INTO PastisserieDB.dbo.CategoriasProducto (Nombre,Descripcion,Activa) VALUES
	 (N'Tortas',N'Tortas y pasteles',1),
	 (N'Panes',N'Variedad de panes artesanales',1),
	 (N'Postres',N'Postres y dulces',1),
	 (N'Galletas',N'Galletas caseras',1),
	 (N'Bebidas',N'Cafés de especialidad y bebidas naturales',1),
	 (N'Salados',N'Opciones saladas y quiches',1),
	 (N'Promociones',N'Combos y ofertas especiales',1);
INSERT INTO PastisserieDB.dbo.ConfiguracionTienda (NombreTienda,Direccion,Telefono,EmailContacto,CostoEnvio,Moneda,MensajeBienvenida,FechaActualizacion,FacebookUrl,HorarioActivo,HorarioApertura,HorarioCierre,InstagramUrl,WhatsappUrl,HoraApertura,HoraCierre,SistemaActivoManual,UsarControlHorario,DiasLaborales,CompraMinima,LimitarUnidadesPorProducto,MaxUnidadesPorProducto,CostosEnvioPorComuna) VALUES
	 (N'Pâtisserie Deluxe',N'Calle 123 # 45 - 67, Medellín',N'300 123 45672',N'contactos@pastisseriedeluxe.com',5000.00,N'COP',N'Bienvenido a la mejor pastelería artesanal','2026-03-25 18:49:20.4386990',N'https://www.facebook.com/pastisseriedeluxe',1,N'08:00',N'18:00',N'https://www.instagram.com/pastisseriedeluxe',N'https://wa.me/573001234567','08:00:00.0000000','18:00:00.0000000',1,0,N'1,2,3,4,5,6',14000.00,1,10,NULL);
INSERT INTO PastisserieDB.dbo.DireccionesEnvio (UsuarioId,NombreCompleto,Direccion,Barrio,Referencia,Telefono,EsPredeterminada,FechaCreacion,Comuna) VALUES
	 (1,N'Admin Deluxe',N'Calle 30',NULL,N'Telefono: 3125431231 | Notas: notas',N'3125431231',0,'2026-03-25 21:34:51.7855970',N'Guayabal'),
	 (1,N'Admin Deluxe',N'Calle 123 # 45 - 67',NULL,N'Telefono: 3125431231 | Notas: Casa en la escalas puerta roja',N'3125431231',0,'2026-03-25 21:41:32.3631034',N'Guayabal'),
	 (1,N'Admin Deluxe',N'Cl. 28 #81-17',NULL,N'Telefono: 3125431231 | Notas: La casa esta a lado de la tienda pollo brosty',N'3125431231',0,'2026-03-26 10:50:39.9899239',N'Belen');
INSERT INTO PastisserieDB.dbo.HorariosPorDia (ConfiguracionTiendaId,DiaSemana,Abierto,HoraApertura,HoraCierre) VALUES
	 (1,0,0,'08:00:00.0000000','18:00:00.0000000'),
	 (1,1,1,'08:00:00.0000000','23:59:00.0000000'),
	 (1,2,1,'08:00:00.0000000','23:59:00.0000000'),
	 (1,3,1,'08:00:00.0000000','23:59:00.0000000'),
	 (1,4,1,'00:00:00.0000000','18:00:00.0000000'),
	 (1,5,1,'08:00:00.0000000','18:00:00.0000000'),
	 (1,6,1,'08:00:00.0000000','18:00:00.0000000');
INSERT INTO PastisserieDB.dbo.MetodosPagoUsuario (UsuarioId,TipoMetodoPagoId,TokenPago,UltimosDigitos,FechaExpiracion,EsPredeterminado,FechaCreacion,EstaActivo,IdentificacionTitular,NombreTitular,PaymentMethodId) VALUES
	 (1,2,N'EPAYCO_PENDING',N'0000',NULL,1,'2026-03-16 19:36:40.8058187',1,NULL,NULL,NULL),
	 (1001,2,N'EPAYCO_PENDING',N'0000',NULL,1,'2026-03-17 16:50:15.5118272',1,NULL,NULL,NULL),
	 (2001,2,N'EPAYCO_PENDING',N'0000',NULL,1,'2026-03-19 16:56:18.0086365',1,NULL,NULL,NULL),
	 (2002,2,N'EPAYCO_PENDING',N'0000',NULL,1,'2026-03-20 13:12:30.3940483',1,NULL,NULL,NULL);
INSERT INTO PastisserieDB.dbo.Notificaciones (UsuarioId,Tipo,Mensaje,FechaCreacion,Leida,FechaLeida,Titulo,Enlace) VALUES
	 (1,N'Pedido',N'Tu pedido #1 ha sido creado exitosamente. Total: $21.000 COP.','2026-03-17 00:36:41.4163547',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (1,N'Pedido',N'Tu pedido #2 ha sido creado exitosamente. Total: $57.000 COP.','2026-03-17 20:44:39.7837334',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (1,N'Pedido',N'Tu pedido #2 ha sido asignado a un repartidor y está en camino.','2026-03-17 21:00:18.0724409',1,NULL,N'Pedido #2 - En Camino 🚚',N'/history'),
	 (1001,N'Asignacion',N'Se te ha asignado el Pedido #2. Revisa tu panel de entregas.','2026-03-17 21:00:18.2309933',1,NULL,N'Nuevo Pedido Asignado #2 📦',N'/repartidor/pedidos'),
	 (1,N'Reclamacion',N'Tu reclamación para el Pedido #1 ha sido registrada y está en revisión.','2026-03-17 21:05:23.3853451',1,NULL,N'Reclamación Recibida',N'/reclamaciones'),
	 (1,N'Reclamacion',N'El usuario #1 ha creado una reclamación para el Pedido #1.','2026-03-17 21:05:23.4234095',1,NULL,N'Nueva Reclamación ⚠️',N'/admin/reclamaciones'),
	 (1,N'Reclamacion',N'Tu reclamación para el Pedido #1 ha sido actualizada: EnRevision.','2026-03-17 21:06:32.0027798',1,NULL,N'Actualización de Reclamación',N'/reclamaciones'),
	 (1,N'Pedido',N'Tu pedido #1 cambió a En Preparación.','2026-03-17 21:07:23.4791771',1,NULL,N'Pedido #1 - En Preparación',N'/history'),
	 (1,N'Pedido',N'Tu pedido #1 cambió a Enviado.','2026-03-17 21:09:57.8939421',1,NULL,N'Pedido #1 - Enviado',N'/history'),
	 (1,N'Pedido',N'Tu pedido #1 ha sido asignado a un repartidor y está en camino.','2026-03-17 21:10:02.4317567',1,NULL,N'Pedido #1 - En Camino 🚚',N'/history');
INSERT INTO PastisserieDB.dbo.Notificaciones (UsuarioId,Tipo,Mensaje,FechaCreacion,Leida,FechaLeida,Titulo,Enlace) VALUES
	 (1001,N'Asignacion',N'Se te ha asignado el Pedido #1. Revisa tu panel de entregas.','2026-03-17 21:10:02.4966491',1,NULL,N'Nuevo Pedido Asignado #1 📦',N'/repartidor/pedidos'),
	 (1,N'Pedido',N'Tu pedido #1 fue entregado exitosamente ✅.','2026-03-17 21:12:29.8616309',1,NULL,N'Pedido #1 - Entregado',N'/history'),
	 (1,N'Pedido',N'Tu pedido #2 no pudo ser entregado. Por favor contáctanos. ❌.','2026-03-17 21:13:07.1538640',1,NULL,N'Pedido #2 - NoEntregado',N'/history'),
	 (1,N'Pedido',N'El pedido #2 no pudo ser entregado. Motivo: No se pudo contactar al cliente.','2026-03-17 21:13:07.1815700',1,NULL,N'Alerta: Pedido Fallido ❌',N'/admin/pedidos'),
	 (1,N'Reclamacion',N'Tu reclamación para el Pedido #1 ha sido actualizada: Resuelta.','2026-03-17 21:15:48.7737903',1,NULL,N'Actualización de Reclamación',N'/reclamaciones'),
	 (1,N'Pedido',N'Tu pedido #3 ha sido creado exitosamente. Total: $32.700 COP.','2026-03-17 21:19:49.6592372',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (1,N'Pedido',N'Tu pedido #4 ha sido creado exitosamente. Total: $401.000 COP.','2026-03-17 21:24:22.2746659',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (1001,N'Pedido',N'Tu pedido #5 ha sido creado exitosamente. Total: $21.500 COP.','2026-03-17 21:50:15.6104253',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (1001,N'Pedido',N'Tu pedido #6 ha sido creado exitosamente. Total: $40.000 COP.','2026-03-17 21:51:51.6440704',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (1001,N'Reclamacion',N'Tu reclamación para el Pedido #5 ha sido registrada y está en revisión.','2026-03-17 21:52:51.5160404',1,NULL,N'Reclamación Recibida',N'/reclamaciones');
INSERT INTO PastisserieDB.dbo.Notificaciones (UsuarioId,Tipo,Mensaje,FechaCreacion,Leida,FechaLeida,Titulo,Enlace) VALUES
	 (1,N'Reclamacion',N'El usuario #1001 ha creado una reclamación para el Pedido #5.','2026-03-17 21:52:51.5341276',1,NULL,N'Nueva Reclamación ⚠️',N'/admin/reclamaciones'),
	 (1001,N'Reclamacion',N'Tu reclamación para el Pedido #5 ha sido actualizada: EnRevision.','2026-03-17 21:54:10.1919056',1,NULL,N'Actualización de Reclamación',N'/reclamaciones'),
	 (1001,N'Pedido',N'Tu pedido #5 cambió a En Preparación.','2026-03-17 21:55:36.9103967',1,NULL,N'Pedido #5 - En Preparación',N'/history'),
	 (1001,N'Pedido',N'Tu pedido #5 cambió a Enviado.','2026-03-17 21:55:52.3515079',1,NULL,N'Pedido #5 - Enviado',N'/history'),
	 (1001,N'Pedido',N'Tu pedido #5 ha sido asignado a un repartidor y está en camino.','2026-03-17 21:56:08.6311243',1,NULL,N'Pedido #5 - En Camino 🚚',N'/history'),
	 (1001,N'Asignacion',N'Se te ha asignado el Pedido #5. Revisa tu panel de entregas.','2026-03-17 21:56:08.6603003',1,NULL,N'Nuevo Pedido Asignado #5 📦',N'/repartidor/pedidos'),
	 (1001,N'Pedido',N'Tu pedido #5 fue entregado exitosamente ✅.','2026-03-17 21:56:23.3623159',1,NULL,N'Pedido #5 - Entregado',N'/history'),
	 (1001,N'Reclamacion',N'Tu reclamación para el Pedido #5 ha sido actualizada: Resuelta.','2026-03-17 21:57:01.6458998',1,NULL,N'Actualización de Reclamación',N'/reclamaciones'),
	 (1001,N'Reclamacion',N'Tu reclamación para el Pedido #6 ha sido registrada y está en revisión.','2026-03-17 21:57:26.8792035',1,NULL,N'Reclamación Recibida',N'/reclamaciones'),
	 (1,N'Reclamacion',N'El usuario #1001 ha creado una reclamación para el Pedido #6.','2026-03-17 21:57:26.8919542',1,NULL,N'Nueva Reclamación ⚠️',N'/admin/reclamaciones');
INSERT INTO PastisserieDB.dbo.Notificaciones (UsuarioId,Tipo,Mensaje,FechaCreacion,Leida,FechaLeida,Titulo,Enlace) VALUES
	 (1001,N'Pedido',N'Tu pedido #6 ha sido asignado a un repartidor y está en camino.','2026-03-17 21:58:12.8956327',1,NULL,N'Pedido #6 - En Camino 🚚',N'/history'),
	 (1001,N'Asignacion',N'Se te ha asignado el Pedido #6. Revisa tu panel de entregas.','2026-03-17 21:58:12.9596382',1,NULL,N'Nuevo Pedido Asignado #6 📦',N'/repartidor/pedidos'),
	 (1001,N'Pedido',N'Tu pedido #6 fue entregado exitosamente ✅.','2026-03-17 22:00:06.2654114',1,NULL,N'Pedido #6 - Entregado',N'/history'),
	 (1001,N'Reclamacion',N'Tu reclamación para el Pedido #6 ha sido actualizada: Rechazada.','2026-03-17 22:00:36.1111732',1,NULL,N'Actualización de Reclamación',N'/reclamaciones'),
	 (1001,N'Reclamacion',N'Tu reclamación para el Pedido #6 ha sido actualizada: Resuelta.','2026-03-17 22:00:43.9849590',1,NULL,N'Actualización de Reclamación',N'/reclamaciones'),
	 (1,N'Pedido',N'Tu pedido #1002 ha sido creado exitosamente. Total: $47.998 COP.','2026-03-18 23:58:39.1192200',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (1,N'Pedido',N'Tu pedido #2002 ha sido creado exitosamente. Total: $47.998 COP.','2026-03-19 17:43:14.5802722',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (1,N'Pedido',N'Tu pedido #2003 ha sido creado exitosamente. Total: $30.996 COP.','2026-03-19 17:44:14.9184562',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (1,N'Pedido',N'Tu pedido #2004 ha sido creado exitosamente. Total: $32.998 COP.','2026-03-19 18:44:08.0397060',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (1,N'Pedido',N'Tu pedido #2005 ha sido creado exitosamente. Total: $32.998 COP.','2026-03-19 20:02:26.2714601',1,NULL,N'Pedido Recibido 🍰',N'/history');
INSERT INTO PastisserieDB.dbo.Notificaciones (UsuarioId,Tipo,Mensaje,FechaCreacion,Leida,FechaLeida,Titulo,Enlace) VALUES
	 (1,N'Pedido',N'Tu pedido #2006 ha sido creado exitosamente. Total: $23.500 COP.','2026-03-19 20:04:26.2885054',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (1,N'Pedido',N'Tu pedido #2006 cambió a En Preparación.','2026-03-19 20:08:09.9244970',1,NULL,N'Pedido #2006 - En Preparación',N'/history'),
	 (1,N'Pedido',N'Tu pedido #2004 fue cancelado 🚫.','2026-03-19 20:09:14.6560409',1,NULL,N'Pedido #2004 - Cancelado',N'/history'),
	 (1,N'Pedido',N'Tu pedido #2006 ha sido asignado a un repartidor y está en camino.','2026-03-19 20:10:29.7354709',1,NULL,N'Pedido #2006 - En Camino 🚚',N'/history'),
	 (1001,N'Asignacion',N'Se te ha asignado el Pedido #2006. Revisa tu panel de entregas.','2026-03-19 20:10:29.7454933',1,NULL,N'Nuevo Pedido Asignado #2006 📦',N'/repartidor/pedidos'),
	 (1,N'Pedido',N'Tu pedido #2003 fue cancelado 🚫.','2026-03-19 20:10:56.5840289',1,NULL,N'Pedido #2003 - Cancelado',N'/history'),
	 (1,N'Pedido',N'Tu pedido #2006 fue entregado exitosamente ✅.','2026-03-19 20:15:04.6453412',1,NULL,N'Pedido #2006 - Entregado',N'/history'),
	 (1,N'Pedido',N'Tu pedido #2007 ha sido creado exitosamente. Total: $30.996 COP.','2026-03-19 20:18:35.9105199',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (2001,N'Pedido',N'Tu pedido #2008 ha sido creado exitosamente. Total: $48.000 COP.','2026-03-19 21:56:18.6384827',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (1,N'Pedido',N'Tu pedido #2007 ha sido asignado a un repartidor y está en camino.','2026-03-19 21:59:05.3349926',1,NULL,N'Pedido #2007 - En Camino 🚚',N'/history');
INSERT INTO PastisserieDB.dbo.Notificaciones (UsuarioId,Tipo,Mensaje,FechaCreacion,Leida,FechaLeida,Titulo,Enlace) VALUES
	 (1001,N'Asignacion',N'Se te ha asignado el Pedido #2007. Revisa tu panel de entregas.','2026-03-19 21:59:05.3701242',1,NULL,N'Nuevo Pedido Asignado #2007 📦',N'/repartidor/pedidos'),
	 (1,N'Pedido',N'Tu pedido #2007 no pudo ser entregado. Por favor contáctanos. ❌.','2026-03-19 22:01:54.6565298',1,NULL,N'Pedido #2007 - NoEntregado',N'/history'),
	 (1,N'Pedido',N'El pedido #2007 no pudo ser entregado. Motivo: Dirección incorrecta.','2026-03-19 22:01:54.7226635',1,NULL,N'Alerta: Pedido Fallido ❌',N'/admin/pedidos'),
	 (1,N'Pedido',N'Tu pedido #2007 no pudo ser entregado. Por favor contáctanos. ❌.','2026-03-19 22:01:55.6853147',1,NULL,N'Pedido #2007 - NoEntregado',N'/history'),
	 (1,N'Pedido',N'El pedido #2007 no pudo ser entregado. Motivo: Dirección incorrecta.','2026-03-19 22:01:55.7112017',1,NULL,N'Alerta: Pedido Fallido ❌',N'/admin/pedidos'),
	 (1,N'Pedido',N'Tu pedido #2007 no pudo ser entregado. Por favor contáctanos. ❌.','2026-03-19 22:01:57.8545512',1,NULL,N'Pedido #2007 - NoEntregado',N'/history'),
	 (1,N'Pedido',N'El pedido #2007 no pudo ser entregado. Motivo: Dirección incorrecta.','2026-03-19 22:01:57.8791010',1,NULL,N'Alerta: Pedido Fallido ❌',N'/admin/pedidos'),
	 (1,N'Pedido',N'Tu pedido #2007 no pudo ser entregado. Por favor contáctanos. ❌.','2026-03-19 22:01:58.0381141',1,NULL,N'Pedido #2007 - NoEntregado',N'/history'),
	 (1,N'Pedido',N'El pedido #2007 no pudo ser entregado. Motivo: Dirección incorrecta.','2026-03-19 22:01:58.0625283',1,NULL,N'Alerta: Pedido Fallido ❌',N'/admin/pedidos'),
	 (2001,N'Pedido',N'Tu pedido #2008 ha sido asignado a un repartidor y está en camino.','2026-03-19 22:04:16.8455730',0,NULL,N'Pedido #2008 - En Camino 🚚',N'/history');
INSERT INTO PastisserieDB.dbo.Notificaciones (UsuarioId,Tipo,Mensaje,FechaCreacion,Leida,FechaLeida,Titulo,Enlace) VALUES
	 (1001,N'Asignacion',N'Se te ha asignado el Pedido #2008. Revisa tu panel de entregas.','2026-03-19 22:04:16.8635117',1,NULL,N'Nuevo Pedido Asignado #2008 📦',N'/repartidor/pedidos'),
	 (2001,N'Pedido',N'Tu pedido #2008 fue entregado exitosamente ✅.','2026-03-19 22:05:27.1638059',0,NULL,N'Pedido #2008 - Entregado',N'/history'),
	 (1,N'Pedido',N'Tu pedido #2002 cambió a En Preparación.','2026-03-19 22:06:17.9809539',1,NULL,N'Pedido #2002 - En Preparación',N'/history'),
	 (1001,N'Pedido',N'Tu pedido #2009 ha sido creado exitosamente. Total: $30.996 COP.','2026-03-19 22:08:32.0216167',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (1,N'Pedido',N'Tu pedido #2010 ha sido creado exitosamente. Total: $78.000 COP.','2026-03-19 23:30:44.8860105',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (1,N'Pedido',N'Tu pedido #2010 cambió a En Preparación.','2026-03-19 23:34:17.7970202',1,NULL,N'Pedido #2010 - En Preparación',N'/history'),
	 (1,N'Pedido',N'Tu pedido #3010 ha sido creado exitosamente. Total: $25.500 COP.','2026-03-20 15:35:21.1151027',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (1,N'Pedido',N'Tu pedido #3012 ha sido confirmado exitosamente. Total: $22.000 COP.','2026-03-20 17:08:14.3632281',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (1,N'Pedido',N'Tu pedido #3014 ha sido confirmado exitosamente. Total: $22.000 COP.','2026-03-20 17:09:39.5031856',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (1,N'Pedido',N'Tu pedido #3011 cambió a En Preparación.','2026-03-20 17:10:29.3533070',1,NULL,N'Pedido #3011 - En Preparación',N'/history');
INSERT INTO PastisserieDB.dbo.Notificaciones (UsuarioId,Tipo,Mensaje,FechaCreacion,Leida,FechaLeida,Titulo,Enlace) VALUES
	 (1,N'Pedido',N'Tu pedido #3010 cambió a Enviado.','2026-03-20 17:10:49.1890363',1,NULL,N'Pedido #3010 - Enviado',N'/history'),
	 (1001,N'Reclamacion',N'Tu reclamación para el Pedido #5 ha sido actualizada: EnRevision.','2026-03-20 17:20:05.6847728',1,NULL,N'Actualización de Reclamación',N'/reclamaciones'),
	 (1001,N'Reclamacion',N'Tu reclamación para el Pedido #5 ha sido actualizada: Resuelta.','2026-03-20 17:20:09.5105397',1,NULL,N'Actualización de Reclamación',N'/reclamaciones'),
	 (1,N'Pedido',N'Tu pedido #3017 ha sido confirmado exitosamente. Total: $29.000 COP.','2026-03-20 17:55:32.0719486',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (2002,N'Pedido',N'Tu pedido #3019 ha sido confirmado exitosamente. Total: $32.998 COP.','2026-03-20 18:14:13.4380028',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (2002,N'Pedido',N'Tu pedido #3020 ha sido confirmado exitosamente. Total: $90.500 COP.','2026-03-20 18:15:31.6252607',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (2002,N'Pedido',N'Tu pedido #3020 cambió a En Preparación.','2026-03-20 18:55:42.1639444',1,NULL,N'Pedido #3020 - En Preparación',N'/history'),
	 (1,N'Pedido',N'Tu pedido #3016 fue cancelado 🚫.','2026-03-20 18:55:57.8693679',1,NULL,N'Pedido #3016 - Cancelado',N'/history'),
	 (1,N'Pedido',N'Tu pedido #3015 fue cancelado 🚫.','2026-03-20 18:56:02.2322451',1,NULL,N'Pedido #3015 - Cancelado',N'/history'),
	 (2002,N'Pedido',N'Tu pedido #3020 ha sido asignado a un repartidor y está en camino.','2026-03-20 18:56:59.2552939',1,NULL,N'Pedido #3020 - En Camino 🚚',N'/history');
INSERT INTO PastisserieDB.dbo.Notificaciones (UsuarioId,Tipo,Mensaje,FechaCreacion,Leida,FechaLeida,Titulo,Enlace) VALUES
	 (1001,N'Asignacion',N'Se te ha asignado el Pedido #3020. Revisa tu panel de entregas.','2026-03-20 18:56:59.2748295',1,NULL,N'Nuevo Pedido Asignado #3020 📦',N'/repartidor/pedidos'),
	 (1,N'Pedido',N'Tu pedido #1002 fue cancelado 🚫.','2026-03-20 18:57:14.5222833',1,NULL,N'Pedido #1002 - Cancelado',N'/history'),
	 (2002,N'Pedido',N'Tu pedido #3020 fue entregado exitosamente ✅.','2026-03-20 18:58:48.8332595',1,NULL,N'Pedido #3020 - Entregado',N'/history'),
	 (1001,N'Pedido',N'Tu pedido #3021 ha sido creado exitosamente. Total: $33.998 COP.','2026-03-20 19:00:01.0559669',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (1001,N'Pedido',N'Tu pedido #3022 ha sido creado exitosamente. Total: $23.000 COP.','2026-03-20 19:04:22.1488737',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (2002,N'Pedido',N'Tu pedido #3023 ha sido creado exitosamente. Total: $22.000 COP.','2026-03-20 19:04:57.7385057',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (1,N'Pedido',N'Tu pedido #3024 ha sido creado exitosamente. Total: $28.000 COP.','2026-03-20 19:22:21.3391190',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (2002,N'Pedido',N'Tu pedido #3025 ha sido confirmado exitosamente. Total: $22.000 COP.','2026-03-20 19:40:58.7320268',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (2002,N'Pedido',N'Tu pedido #3027 ha sido confirmado exitosamente. Total: $25.500 COP.','2026-03-20 20:11:19.2484268',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (1,N'Pedido',N'Tu pedido #3029 fue cancelado 🚫.','2026-03-25 03:50:59.3800560',1,NULL,N'Pedido #3029 - Cancelado',N'/history');
INSERT INTO PastisserieDB.dbo.Notificaciones (UsuarioId,Tipo,Mensaje,FechaCreacion,Leida,FechaLeida,Titulo,Enlace) VALUES
	 (1001,N'Pedido',N'Tu pedido #3030 ha sido confirmado exitosamente. Total: $29.000 COP.','2026-03-26 00:12:57.3125808',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (1,N'Pedido',N'Tu pedido #3031 ha sido confirmado exitosamente. Total: $25.500 COP.','2026-03-26 00:41:37.0082537',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (1,N'Pedido',N'Tu pedido #3032 ha sido confirmado exitosamente. Total: $27.000 COP.','2026-03-26 00:49:44.7505847',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (1,N'Pedido',N'Tu pedido #3033 ha sido confirmado exitosamente. Total: $21.000 COP.','2026-03-26 02:35:01.5780547',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (1,N'Pedido',N'Tu pedido #3034 ha sido confirmado exitosamente. Total: $20.000 COP.','2026-03-26 02:41:44.1063919',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (1,N'Pedido',N'Tu pedido #3034 ha sido asignado a un repartidor y está en camino.','2026-03-26 02:48:29.1475720',1,NULL,N'Pedido #3034 - En Camino 🚚',N'/history'),
	 (1001,N'Asignacion',N'Se te ha asignado el Pedido #3034. Revisa tu panel de entregas.','2026-03-26 02:48:29.3552556',1,NULL,N'Nuevo Pedido Asignado #3034 📦',N'/repartidor/pedidos'),
	 (1,N'Pedido',N'Tu pedido #4030 ha sido confirmado exitosamente. Total: $20.000 COP.','2026-03-26 15:50:52.2405048',1,NULL,N'Pedido Recibido 🍰',N'/history'),
	 (1,N'Pedido',N'Tu pedido #4030 ha sido asignado a un repartidor y está en camino.','2026-03-26 15:52:01.4986847',1,NULL,N'Pedido #4030 - En Camino 🚚',N'/history'),
	 (1001,N'Asignacion',N'Se te ha asignado el Pedido #4030. Revisa tu panel de entregas.','2026-03-26 15:52:01.5481621',1,NULL,N'Nuevo Pedido Asignado #4030 📦',N'/repartidor/pedidos');
INSERT INTO PastisserieDB.dbo.PedidoItems (PedidoId,ProductoId,Cantidad,PrecioUnitario,Subtotal,PrecioOriginal,PromocionId) VALUES
	 (5,20,1,3500.00,3500.00,NULL,NULL),
	 (5,12,2,6500.00,13000.00,NULL,NULL),
	 (1002,2,1,12998.00,12998.00,38000.00,1003),
	 (1002,NULL,2,15000.00,30000.00,20000.00,1002),
	 (2002,NULL,2,15000.00,30000.00,20000.00,1002),
	 (2002,2,1,12998.00,12998.00,38000.00,1003),
	 (2003,2,2,12998.00,25996.00,38000.00,1003),
	 (2004,2,1,12998.00,12998.00,38000.00,1003),
	 (2004,NULL,1,15000.00,15000.00,20000.00,1002),
	 (2006,21,1,18500.00,18500.00,NULL,NULL);
INSERT INTO PastisserieDB.dbo.PedidoItems (PedidoId,ProductoId,Cantidad,PrecioUnitario,Subtotal,PrecioOriginal,PromocionId) VALUES
	 (2007,2,2,12998.00,25996.00,38000.00,1003),
	 (2008,3,1,35000.00,35000.00,NULL,NULL),
	 (2008,7,1,8000.00,8000.00,NULL,NULL),
	 (2009,2,2,12998.00,25996.00,38000.00,1003),
	 (3010,7,2,8000.00,16000.00,NULL,NULL),
	 (3010,17,1,4500.00,4500.00,NULL,NULL),
	 (3012,7,1,8000.00,8000.00,NULL,NULL),
	 (3012,17,2,4500.00,9000.00,NULL,NULL),
	 (3015,7,3,8000.00,24000.00,NULL,NULL),
	 (3016,7,3,8000.00,24000.00,NULL,NULL);
INSERT INTO PastisserieDB.dbo.PedidoItems (PedidoId,ProductoId,Cantidad,PrecioUnitario,Subtotal,PrecioOriginal,PromocionId) VALUES
	 (3017,7,3,8000.00,24000.00,NULL,NULL),
	 (3019,13,1,15000.00,15000.00,NULL,NULL),
	 (3019,2,1,12998.00,12998.00,38000.00,1003),
	 (3020,20,1,3500.00,3500.00,NULL,NULL),
	 (3020,10,1,9000.00,9000.00,NULL,NULL),
	 (3020,3,1,35000.00,35000.00,NULL,NULL),
	 (3020,2,1,38000.00,38000.00,NULL,NULL),
	 (3021,NULL,1,15000.00,15000.00,20000.00,1002),
	 (3021,2,1,12998.00,12998.00,38000.00,1003),
	 (3022,7,1,8000.00,8000.00,NULL,NULL);
INSERT INTO PastisserieDB.dbo.PedidoItems (PedidoId,ProductoId,Cantidad,PrecioUnitario,Subtotal,PrecioOriginal,PromocionId) VALUES
	 (3022,17,2,4500.00,9000.00,NULL,NULL),
	 (3023,7,1,8000.00,8000.00,NULL,NULL),
	 (3023,17,2,4500.00,9000.00,NULL,NULL),
	 (3024,NULL,1,15000.00,15000.00,20000.00,1002),
	 (3024,7,1,8000.00,8000.00,NULL,NULL),
	 (3025,7,1,8000.00,8000.00,NULL,NULL),
	 (3025,17,2,4500.00,9000.00,NULL,NULL),
	 (3026,7,1,8000.00,8000.00,NULL,NULL),
	 (3026,20,1,3500.00,3500.00,NULL,NULL),
	 (3026,10,1,9000.00,9000.00,NULL,NULL);
INSERT INTO PastisserieDB.dbo.PedidoItems (PedidoId,ProductoId,Cantidad,PrecioUnitario,Subtotal,PrecioOriginal,PromocionId) VALUES
	 (3027,7,1,8000.00,8000.00,NULL,NULL),
	 (3027,20,1,3500.00,3500.00,NULL,NULL),
	 (3027,10,1,9000.00,9000.00,NULL,NULL),
	 (3028,7,2,8000.00,16000.00,NULL,NULL),
	 (3029,7,2,8000.00,16000.00,NULL,NULL),
	 (3030,NULL,2,12000.00,24000.00,24000.00,2002),
	 (3031,7,2,8000.00,16000.00,NULL,NULL),
	 (3031,17,1,4500.00,4500.00,NULL,NULL),
	 (3032,21,1,18500.00,18500.00,NULL,NULL),
	 (3032,14,1,3500.00,3500.00,NULL,NULL);
INSERT INTO PastisserieDB.dbo.PedidoItems (PedidoId,ProductoId,Cantidad,PrecioUnitario,Subtotal,PrecioOriginal,PromocionId) VALUES
	 (3033,7,2,8000.00,16000.00,NULL,NULL),
	 (3034,7,1,8000.00,8000.00,NULL,NULL),
	 (3034,9,2,3500.00,7000.00,NULL,NULL),
	 (4030,9,4,3500.00,14000.00,NULL,NULL);
INSERT INTO PastisserieDB.dbo.Pedidos (UsuarioId,FechaPedido,Estado,MetodoPagoId,DireccionEnvioId,Subtotal,CostoEnvio,Total,Aprobado,FechaAprobacion,FechaEntregaEstimada,NotasCliente,FechaCreacion,FechaActualizacion,RepartidorId,FechaEntrega,FechaNoEntrega,MotivoNoEntrega) VALUES
	 (1001,'2026-03-17 16:50:15.4880376',N'Entregado',2,NULL,16500.00,5000.00,21500.00,0,NULL,NULL,N'Telefono: 300 123 4567 | Notas: trerte
---
Direccion: Cra. 85 # 30-29, Medellín
Comuna: Comuna 15 - Guayabal
Pago: ePayco','2026-03-17 16:50:15.4880392','2026-03-17 21:56:23.3373905',1001,'2026-03-17 16:56:23.3372793',NULL,NULL),
	 (1,'2026-03-18 18:58:38.8004354',N'Cancelado',1,NULL,42998.00,5000.00,47998.00,0,NULL,NULL,N'Telefono: 3001234567
---
Direccion: Calle 70 Sur40d 23r
Comuna: Comuna 15 - Guayabal
Pago: ePayco','2026-03-18 18:58:38.8004464','2026-03-20 18:57:14.5126071',NULL,NULL,NULL,NULL),
	 (1,'2026-03-19 12:43:13.8850374',N'En Preparación',1,NULL,42998.00,5000.00,47998.00,1,'2026-03-19 17:43:27.0670471',NULL,N'Telefono: 3001234567 | Notas: 1234222
---
Direccion: Cra. 74 #31-35
Comuna: Comuna 15 - Guayabal
Pago: ePayco','2026-03-19 12:43:13.8850410','2026-03-19 22:06:17.8686195',NULL,NULL,NULL,NULL),
	 (1,'2026-03-19 12:44:14.7852071',N'Cancelado',1,NULL,25996.00,5000.00,30996.00,0,NULL,NULL,N'Telefono: 1244431
---
Direccion: Cra. 74 #31-35
Comuna: Comuna 15 - Guayabal
Pago: ePayco','2026-03-19 12:44:14.7852094','2026-03-19 20:10:56.5733889',NULL,NULL,NULL,NULL),
	 (1,'2026-03-19 13:44:07.5797812',N'Cancelado',1,NULL,27998.00,5000.00,32998.00,0,NULL,NULL,N'Telefono: 3001234567 | Notas: 12344536
---
Direccion: Cra. 74 #31-35
Comuna: Comuna 15 - Guayabal
Pago: ePayco','2026-03-19 13:44:07.5797909','2026-03-19 20:09:14.6193182',NULL,NULL,NULL,NULL),
	 (1,'2026-03-19 15:04:26.1181591',N'Entregado',1,NULL,18500.00,5000.00,23500.00,1,'2026-03-19 20:05:55.4017004',NULL,N'Telefono: 3001234567 | Notas: casa de dos piso
---
Direccion: Cra. 74 #31-35
Comuna: Comuna 15 - Guayabal
Pago: ePayco','2026-03-19 15:04:26.1181629','2026-03-19 20:15:04.5320840',1001,'2026-03-19 15:15:04.5313544',NULL,NULL),
	 (1,'2026-03-19 15:18:35.8377169',N'NoEntregado',1,NULL,25996.00,5000.00,30996.00,0,NULL,NULL,N'Telefono: 3001234567
---
Direccion: Cra. 74 #31-35
Comuna: Comuna 15 - Guayabal
Pago: ePayco','2026-03-19 15:18:35.8377191','2026-03-19 22:01:58.0056796',1001,NULL,'2026-03-19 17:01:58.0053203',N'Dirección incorrecta'),
	 (2001,'2026-03-19 16:56:17.8705026',N'Entregado',1002,NULL,43000.00,5000.00,48000.00,1,'2026-03-19 21:57:18.3337436',NULL,N'Telefono: 3001234567 | Notas: were
---
Direccion: rrwerwer
Comuna: Comuna 15 - Guayabal
Pago: ePayco','2026-03-19 16:56:17.8705056','2026-03-19 22:05:27.1270880',1001,'2026-03-19 17:05:27.1267274',NULL,NULL),
	 (1001,'2026-03-19 17:08:31.8416963',N'Pendiente',2,NULL,25996.00,5000.00,30996.00,0,NULL,NULL,N'Telefono: 3001234567
---
Direccion: Cra. 74 #31-35
Comuna: Comuna 15 - Guayabal
Pago: ePayco','2026-03-19 17:08:31.8416982','2026-03-19 22:08:31.9360206',NULL,NULL,NULL,NULL),
	 (1,'2026-03-20 10:35:20.6088485',N'Enviado',1,NULL,20500.00,5000.00,25500.00,0,NULL,NULL,N'Telefono: 300 123 4567 | Notas: 123123
---
Direccion: Cra. 85 # 30-29
Comuna: Comuna 15 - Guayabal
Pago: ePayco','2026-03-20 10:35:20.6089591','2026-03-20 17:10:49.1799457',NULL,NULL,NULL,NULL);
INSERT INTO PastisserieDB.dbo.Pedidos (UsuarioId,FechaPedido,Estado,MetodoPagoId,DireccionEnvioId,Subtotal,CostoEnvio,Total,Aprobado,FechaAprobacion,FechaEntregaEstimada,NotasCliente,FechaCreacion,FechaActualizacion,RepartidorId,FechaEntrega,FechaNoEntrega,MotivoNoEntrega) VALUES
	 (1,'2026-03-20 12:07:18.9534359',N'Confirmado',1,NULL,17000.00,5000.00,22000.00,1,'2026-03-20 12:08:14.3096357',NULL,N'Telefono: 300 123 4567
---
Direccion: Cra. 85 # 30-29
Comuna: Comuna 15 - Guayabal
Pago: ePayco','2026-03-20 12:07:18.9534414','2026-03-20 17:08:14.3363092',NULL,NULL,NULL,NULL),
	 (1,'2026-03-20 12:54:29.1072808',N'Cancelado',1,NULL,24000.00,5000.00,29000.00,0,NULL,NULL,N'Telefono: 300 123 4567
---
Direccion: Calle 123 # 45 - 67, Medellín
Comuna: Comuna 15 - Guayabal
Pago: ePayco','2026-03-20 12:54:29.1073842','2026-03-20 18:56:02.2163981',NULL,NULL,NULL,NULL),
	 (1,'2026-03-20 12:54:49.5397144',N'Cancelado',1,NULL,24000.00,5000.00,29000.00,0,NULL,NULL,N'Telefono: 300 123 4567
---
Direccion: Calle 123 # 45 - 67, Medellín
Comuna: Comuna 15 - Guayabal
Pago: ePayco','2026-03-20 12:54:49.5397245','2026-03-20 18:55:57.8512341',NULL,NULL,NULL,NULL),
	 (1,'2026-03-20 12:55:05.5219559',N'Confirmado',1,NULL,24000.00,5000.00,29000.00,1,'2026-03-20 12:55:31.8175470',NULL,N'Telefono: 300 123 4567
---
Direccion: Calle 123 # 45 - 67
Comuna: Comuna 15 - Guayabal
Pago: ePayco','2026-03-20 12:55:05.5219666','2026-03-20 17:55:32.0003002',NULL,NULL,NULL,NULL),
	 (2002,'2026-03-20 13:13:56.5887495',N'Confirmado',1003,NULL,27998.00,5000.00,32998.00,1,'2026-03-20 13:14:13.3875175',NULL,N'Telefono: 300 123 4567 | Notas: 1253332
---
Direccion: Cra. 74 #31-35
Comuna: Comuna 15 - Guayabal
Pago: ePayco','2026-03-20 13:13:56.5887604','2026-03-20 18:14:13.3965025',NULL,NULL,NULL,NULL),
	 (2002,'2026-03-20 13:15:01.3234019',N'Entregado',1003,NULL,85500.00,5000.00,90500.00,1,'2026-03-20 13:15:31.5790756',NULL,N'Telefono: 234234234 | Notas: 234324
---
Direccion: Calle 70 Sur40d 23r
Comuna: Comuna 15 - Guayabal
Pago: ePayco','2026-03-20 13:15:01.3234129','2026-03-20 18:58:48.7985182',1001,'2026-03-20 13:58:48.7968962',NULL,NULL),
	 (1001,'2026-03-20 14:00:00.8513656',N'Pendiente',2,NULL,27998.00,6000.00,33998.00,0,NULL,NULL,N'Telefono: 300 123 4567
---
Direccion: Cra. 85 # 30-29
Comuna: Comuna 16 - Belén
Pago: ePayco','2026-03-20 14:00:00.8513750','2026-03-20 19:00:00.9892876',NULL,NULL,NULL,NULL),
	 (1001,'2026-03-20 14:04:22.0716022',N'Pendiente',2,NULL,17000.00,6000.00,23000.00,0,NULL,NULL,N'Telefono: 300 123 4567
---
Direccion: Calle 123 # 45 - 67, Medellín
Comuna: Comuna 16 - Belén
Pago: ePayco','2026-03-20 14:04:22.0716129','2026-03-20 19:04:22.1226442',NULL,NULL,NULL,NULL),
	 (2002,'2026-03-20 14:04:57.6516680',N'Pendiente',1003,NULL,17000.00,5000.00,22000.00,0,NULL,NULL,N'Telefono: 1244431
---
Direccion: Calle 70 Sur40d 23r
Comuna: Comuna 15 - Guayabal
Pago: ePayco','2026-03-20 14:04:57.6516835','2026-03-20 19:04:57.6989206',NULL,NULL,NULL,NULL),
	 (1,'2026-03-20 14:22:21.2536801',N'Pendiente',1,NULL,23000.00,5000.00,28000.00,0,NULL,NULL,N'Telefono: 300 123 4567
---
Direccion: Calle 123 # 45 - 67, Medellín
Comuna: Comuna 15 - Guayabal
Pago: ePayco','2026-03-20 14:22:21.2536882','2026-03-20 19:22:21.3099715',NULL,NULL,NULL,NULL);
INSERT INTO PastisserieDB.dbo.Pedidos (UsuarioId,FechaPedido,Estado,MetodoPagoId,DireccionEnvioId,Subtotal,CostoEnvio,Total,Aprobado,FechaAprobacion,FechaEntregaEstimada,NotasCliente,FechaCreacion,FechaActualizacion,RepartidorId,FechaEntrega,FechaNoEntrega,MotivoNoEntrega) VALUES
	 (2002,'2026-03-20 14:40:31.5352582',N'Confirmado',1003,NULL,17000.00,5000.00,22000.00,1,'2026-03-20 14:40:58.6724189',NULL,N'Telefono: 1244431
---
Direccion: Cra. 74 #31-35
Comuna: Comuna 15 - Guayabal
Pago: ePayco','2026-03-20 14:40:31.5352977','2026-03-20 19:40:58.7052650',NULL,NULL,NULL,NULL),
	 (2002,'2026-03-20 15:10:25.3503820',N'Pendiente',1003,NULL,20500.00,5000.00,25500.00,0,NULL,NULL,N'Telefono: 3001234567
---
Direccion: Calle 123 # 45 - 67, Medellín
Comuna: Comuna 15 - Guayabal
Pago: ePayco','2026-03-20 15:10:25.3503932','2026-03-20 20:10:25.3914216',NULL,NULL,NULL,NULL),
	 (2002,'2026-03-20 15:10:53.4786445',N'Confirmado',1003,NULL,20500.00,5000.00,25500.00,1,'2026-03-20 15:11:19.1979028',NULL,N'Telefono: 3001234567
---
Direccion: Calle 123 # 45 - 67, Medellín
Comuna: Comuna 15 - Guayabal
Pago: ePayco','2026-03-20 15:10:53.4786521','2026-03-20 20:11:19.2046863',NULL,NULL,NULL,NULL),
	 (1,'2026-03-20 16:02:57.6237789',N'Pendiente',1,NULL,16000.00,6000.00,22000.00,0,NULL,NULL,N'Telefono: 300 123 4567
---
Direccion: Cra. 85 # 30-29
Comuna: Comuna 16 - Belén
Pago: ePayco','2026-03-20 16:02:57.6238767','2026-03-20 21:02:58.0780090',NULL,NULL,NULL,NULL),
	 (1,'2026-03-20 16:03:14.6489326',N'Cancelado',1,NULL,16000.00,6000.00,22000.00,0,NULL,NULL,N'Telefono: 300 123 4567
---
Direccion: Cra. 85 # 30-29
Comuna: Comuna 16 - Belén
Pago: ePayco','2026-03-20 16:03:14.6489412','2026-03-25 03:50:59.3423609',NULL,NULL,NULL,NULL),
	 (1001,'2026-03-25 19:12:44.7462873',N'Confirmado',2,NULL,24000.00,5000.00,29000.00,1,'2026-03-25 19:12:57.2250887',NULL,N'Telefono: 300 123 4567
---
Direccion: Cra. 85 # 30-29
Comuna: Comuna 15 - Guayabal
Pago: ePayco','2026-03-25 19:12:44.7463649','2026-03-26 00:12:57.2725152',NULL,NULL,NULL,NULL),
	 (1,'2026-03-25 19:41:22.9511854',N'Confirmado',1,NULL,20500.00,5000.00,25500.00,1,'2026-03-25 19:41:36.5616514',NULL,N'Telefono: 300 123 4567 | Notas: detras de un callejon 
---
Direccion: Calle 123 # 45 - 67, Medellín
Comuna: Comuna 15 - Guayabal
Pago: ePayco','2026-03-25 19:41:22.9511975','2026-03-26 00:41:36.8870546',NULL,NULL,NULL,NULL),
	 (1,'2026-03-25 19:49:35.9329096',N'Confirmado',1,NULL,22000.00,5000.00,27000.00,1,'2026-03-25 19:49:44.5758791',NULL,N'Telefono: 3001234567 | Notas: piso 2
---
Direccion: Cra. 74 #31-35
Comuna: Comuna 15 - Guayabal
Pago: ePayco','2026-03-25 19:49:35.9329897','2026-03-26 00:49:44.6905062',NULL,NULL,NULL,NULL),
	 (1,'2026-03-25 21:34:51.7183256',N'Confirmado',1,1,16000.00,5000.00,21000.00,1,'2026-03-25 21:35:01.4767116',NULL,N'Telefono: 3125431231 | Notas: notas
---
Direccion: Calle 30
Comuna: Comuna 15 - Guayabal
Pago: ePayco','2026-03-25 21:34:51.7183793','2026-03-26 02:35:01.5421961',NULL,NULL,NULL,NULL),
	 (1,'2026-03-25 21:41:32.2363165',N'EnCamino',1,2,15000.00,5000.00,20000.00,1,'2026-03-25 21:41:44.0395908',NULL,N'Telefono: 3125431231 | Notas: Casa en la escalas puerta roja
---
Direccion: Calle 123 # 45 - 67
Comuna: Comuna 15 - Guayabal
Pago: ePayco','2026-03-25 21:41:32.2364070','2026-03-26 02:48:28.9626947',1001,NULL,NULL,NULL);
INSERT INTO PastisserieDB.dbo.Pedidos (UsuarioId,FechaPedido,Estado,MetodoPagoId,DireccionEnvioId,Subtotal,CostoEnvio,Total,Aprobado,FechaAprobacion,FechaEntregaEstimada,NotasCliente,FechaCreacion,FechaActualizacion,RepartidorId,FechaEntrega,FechaNoEntrega,MotivoNoEntrega) VALUES
	 (1,'2026-03-26 10:50:39.9561054',N'EnCamino',1,1002,14000.00,6000.00,20000.00,1,'2026-03-26 10:50:52.1273858',NULL,N'Telefono: 3125431231 | Notas: La casa esta a lado de la tienda pollo brosty
---
Direccion: Cl. 28 #81-17
Comuna: Comuna 16 - Belén
Pago: ePayco','2026-03-26 10:50:39.9562170','2026-03-26 15:52:01.4530125',1001,NULL,NULL,NULL);
INSERT INTO PastisserieDB.dbo.Productos (Nombre,Descripcion,Precio,Stock,StockMinimo,Categoria,ImagenUrl,EsPersonalizable,Activo,FechaCreacion,FechaActualizacion,CategoriaProductoId) VALUES
	 (N'Tarta Ópera Real',N'Capas finas de bizcocho de almendra, crema de café y ganache de chocolate 70%.',45000.00,31,NULL,N'Tortas',N'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?q=80&w=800',0,0,'2024-01-01 00:00:00.0000000','2026-03-26 17:11:40.8188751',NULL),
	 (N'Cheesecake de Frutos del Bosque',N'Base de galleta crujiente con crema de queso suave y coulis artesanal de moras.',38000.00,0,NULL,N'Tortas',N'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800',0,1,'2024-01-01 00:00:00.0000000','2026-03-20 19:00:00.9144353',NULL),
	 (N'Mousse de Limón y Merengue',N'Tarta refrescante con crema de limón siciliano y merengue suizo flameado.',35000.00,8,NULL,N'Tortas',N'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?q=80&w=800',0,1,'2024-01-01 00:00:00.0000000','2026-03-20 18:15:31.5906668',NULL),
	 (N'Pastel Red Velvet',N'Clásico terciopelo rojo con capas de crema de queso frosting y un toque de vainilla.',42000.00,15,NULL,N'Tortas',N'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?q=80&w=800',0,0,'2024-01-01 00:00:00.0000000','2026-03-17 21:22:13.0658424',NULL),
	 (N'Tarta de Frutillas con Crema',N'Bizcochos esponjosos rellenos de fresas frescas y crema Chantilly.',34000.00,15,NULL,N'Tortas',N'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=800',0,1,'2024-01-01 00:00:00.0000000',NULL,NULL),
	 (N'Pan de Masa Madre (Sourdough)',N'Pan artesanal de fermentación lenta (48h) con corteza rústica y miga aireada.',6500.00,20,NULL,N'Panes',N'https://images.unsplash.com/photo-1585478259715-876a6a81fc08?q=80&w=800',0,1,'2024-01-01 00:00:00.0000000',NULL,NULL),
	 (N'Brioche de Canela y Nuez',N'Pan dulce francés enriquecido con mantequilla y espirales de canela premium.',8000.00,0,NULL,N'Panes',N'https://images.unsplash.com/photo-1541119638723-c51cbe2262aa?q=80&w=800',0,1,'2024-01-01 00:00:00.0000000','2026-03-26 02:41:44.0738880',NULL),
	 (N'Croissants Clásicos (Pack x4)',N'Hojaldre mantequilloso con múltiples capas, crujiente y dorado.',12000.00,30,NULL,N'Panes',N'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800',0,1,'2024-01-01 00:00:00.0000000',NULL,NULL),
	 (N'Baguette Tradicional',N'La clásica baguette de corteza crujiente y aroma inigualable.',3500.00,34,NULL,N'Panes',N'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?q=80&w=800',0,1,'2024-01-01 00:00:00.0000000','2026-03-26 15:50:52.2041520',NULL),
	 (N'Focaccia de Romero y Sal',N'Pan italiano esponjoso hidratado con aceite de oliva extra virgen.',9000.00,8,NULL,N'Panes',N'https://images.unsplash.com/photo-1573140247632-f8fd7de9d720?q=80&w=800',0,1,'2024-01-01 00:00:00.0000000','2026-03-20 20:11:19.2046834',NULL);
INSERT INTO PastisserieDB.dbo.Productos (Nombre,Descripcion,Precio,Stock,StockMinimo,Categoria,ImagenUrl,EsPersonalizable,Activo,FechaCreacion,FechaActualizacion,CategoriaProductoId) VALUES
	 (N'Caja de Macarons Joya (x12)',N'Surtido gourmet: Pistacho, Lavanda, Sal de Mar, y Chocolate Belga.',25000.00,25,NULL,N'Postres',N'https://images.unsplash.com/photo-1569864358642-9d1619702661?q=80&w=800',1,1,'2024-01-01 00:00:00.0000000',NULL,NULL),
	 (N'Éclairs de Avellana y Caramelo',N'Masa choux rellena de praliné y cubierta con toffee artesanal.',6500.00,18,NULL,N'Postres',N'https://images.unsplash.com/photo-1511018556340-d16986a1c194?q=80&w=800',0,1,'2024-01-01 00:00:00.0000000','2026-03-17 21:50:15.5497383',NULL),
	 (N'Tiramisú de Autor',N'Café de especialidad, mascarpone italiano y cacao amargo de origen.',15000.00,10,NULL,N'Postres',N'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=800',0,1,'2024-01-01 00:00:00.0000000','2026-03-20 18:14:13.3964745',NULL),
	 (N'Cookies Red Velvet y Queso',N'Galletas rojas aterciopeladas rellenas de crema de queso dulce.',3500.00,39,NULL,N'Galletas',N'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=800',0,1,'2024-01-01 00:00:00.0000000','2026-03-26 00:49:44.6904828',NULL),
	 (N'Shortbread de Vainilla Francesa',N'Galletas de mantequilla pura que se deshacen en la boca.',1500.00,1000,NULL,N'Galletas',N'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800',0,0,'2024-01-01 00:00:00.0000000','2026-03-17 22:02:21.1769225',NULL),
	 (N'Cookies Doble Chocolate XXL',N'Cargadas con trozos de chocolate blanco, con leche y amargo.',3500.00,12,NULL,N'Galletas',N'https://images.unsplash.com/photo-1490265246297-3ca9da565b9b?q=80&w=800',0,0,'2024-01-01 00:00:00.0000000','2026-03-17 21:21:46.1720799',NULL),
	 (N'Café Latte de Especialidad',N'Granos de origen único con leche emulsionada y un toque de vainilla.',4500.00,44,NULL,N'Bebidas',N'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?q=80&w=800',0,1,'2024-01-01 00:00:00.0000000','2026-03-26 00:41:36.8870259',NULL),
	 (N'Té Matcha Ceremonial',N'Té verde japonés de grado premium, preparado tradicionalmente.',5500.00,30,NULL,N'Bebidas',N'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?q=80&w=800',0,1,'2024-01-01 00:00:00.0000000',NULL,NULL),
	 (N'Quiche de Espinacas y Brie',N'Masa quebrada artesanal rellena de espinacas frescas y queso brie fundido.',12500.00,10,NULL,N'Salados',N'https://images.unsplash.com/photo-1551404973-7bb6af157822?q=80&w=800',0,1,'2024-01-01 00:00:00.0000000',NULL,NULL),
	 (N'Empanada de Carne Cortada a Cuchillo',N'La tradicional empanada con carne premium y cocción perfecta.',3500.00,57,NULL,N'Salados',N'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?q=80&w=800',0,1,'2024-01-01 00:00:00.0000000','2026-03-20 20:11:19.2046786',NULL);
INSERT INTO PastisserieDB.dbo.Productos (Nombre,Descripcion,Precio,Stock,StockMinimo,Categoria,ImagenUrl,EsPersonalizable,Activo,FechaCreacion,FechaActualizacion,CategoriaProductoId) VALUES
	 (N'Combo Desayuno Dulce',N'1 Cappuccino Grande + 2 Croissants Clásicos + 1 Macaron de regalo.',18500.00,98,NULL,N'Promociones',N'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800',0,1,'2024-01-01 00:00:00.0000000','2026-03-26 00:49:44.6896349',NULL);
INSERT INTO PastisserieDB.dbo.Promociones (Nombre,Descripcion,TipoDescuento,Valor,FechaInicio,FechaFin,Activo,ImagenUrl,FechaCreacion,FechaActualizacion,ProductoId,PrecioOriginal,Stock) VALUES
	 (N'empaandas',N'aprovecha esta gran oferta trae 5 empanadas ',N'MontoFijo',3000.00,'2026-03-16 05:00:00.0000000','2026-03-17 04:59:00.0000000',1,N'/images/products/eebd5748-4330-49c4-8560-3587d2ef48b2.jpg','2026-03-17 00:43:19.7808793','2026-03-17 21:17:55.3585886',NULL,20000.00,15),
	 (N'Cheesecake ofertas',N'aprovecha esta gran promo',N'MontoFijo',5000.00,'2026-03-17 10:00:00.0000000','2026-04-01 00:00:00.0000000',0,N'','2026-03-17 20:56:23.8079871','2026-03-17 20:56:56.3781740',2,NULL,NULL),
	 (N'r4r',N'',N'Porcentaje',44.00,'2026-03-17 05:00:00.0000000','2026-03-18 04:59:00.0000000',0,N'','2026-03-17 20:57:26.7175642',NULL,NULL,444.00,NULL),
	 (N'Cheesecake ',N'Disfruta de esa promo ',N'MontoFijo',2000.00,'2026-03-17 05:00:00.0000000','2026-03-18 04:59:00.0000000',1,N'','2026-03-17 22:27:24.8240399',NULL,2,NULL,NULL),
	 (N'Empanada',N'aprovhecas estas delcias empanads por tan solo 5 de ellas',N'MontoFijo',5000.00,'2026-03-18 10:00:00.0000000','2026-03-26 09:59:00.0000000',0,N'/images/products/fddc97fb-9210-425e-9f92-16bbfadf233b.jpg','2026-03-18 23:54:48.7378532','2026-03-25 03:21:59.9257676',NULL,20000.00,13),
	 (N'Cheesecake de Frutos ',N'2x1 en esta promo',N'MontoFijo',25002.00,'2026-03-18 05:00:00.0000000','2026-04-01 04:59:00.0000000',1,N'','2026-03-18 23:56:02.8029181',NULL,2,NULL,NULL),
	 (N'Empanadas',N'Ricas Empanadas con la cantidad de 7',N'MontoFijo',12000.00,'2026-03-25 05:00:00.0000000','2026-03-28 04:59:00.0000000',1,N'/images/products/51b8e5fa-7360-417a-9c2c-f0a3c2e5d0d8.jpg','2026-03-25 23:59:17.7063248','2026-03-26 00:12:57.2709059',NULL,24000.00,0);
INSERT INTO PastisserieDB.dbo.Reclamaciones (PedidoId,UsuarioId,Fecha,Motivo,Estado) VALUES
	 (5,1001,'2026-03-17 21:52:51.5027994',N'wef wefwe e ',N'Resuelta');
INSERT INTO PastisserieDB.dbo.RegistrosPago (PedidoId,UsuarioId,Estado,FechaIntento,FechaConfirmacion,MensajeError,ReferenciaExterna) VALUES
	 (3012,1,N'Exitoso','2026-03-20 12:07:19.0061304','2026-03-20 12:08:14.3098155',NULL,NULL),
	 (3015,1,N'Fallido','2026-03-20 12:54:29.5050583',NULL,N'Usuario abandonó el proceso de pago',NULL),
	 (3016,1,N'Fallido','2026-03-20 12:54:49.6656409',NULL,N'Usuario abandonó el proceso de pago',NULL),
	 (3017,1,N'Exitoso','2026-03-20 12:55:05.6228767','2026-03-20 12:55:31.8177542',NULL,NULL),
	 (3019,2002,N'Exitoso','2026-03-20 13:13:56.7481096','2026-03-20 13:14:13.3875300',NULL,NULL),
	 (3019,2002,N'Espera','2026-03-20 13:14:13.4515904',NULL,NULL,NULL),
	 (3020,2002,N'Exitoso','2026-03-20 13:15:01.4530956','2026-03-20 13:15:31.5790918',NULL,NULL),
	 (3025,2002,N'Exitoso','2026-03-20 14:40:31.9542650','2026-03-20 14:40:58.6725653',N'Usuario abandonó el proceso de pago',NULL),
	 (3026,2002,N'Fallido','2026-03-20 15:10:25.4737968',NULL,N'Usuario abandonó el proceso de pago',NULL),
	 (3027,2002,N'Fallido','2026-03-20 15:10:53.5867522',NULL,N'Usuario abandonó el proceso de pago',NULL);
INSERT INTO PastisserieDB.dbo.RegistrosPago (PedidoId,UsuarioId,Estado,FechaIntento,FechaConfirmacion,MensajeError,ReferenciaExterna) VALUES
	 (3028,1,N'Fallido','2026-03-20 16:02:58.7657230',NULL,N'Usuario abandonó el proceso de pago',NULL),
	 (3029,1,N'Fallido','2026-03-20 16:03:14.8273389',NULL,N'Usuario abandonó el proceso de pago',NULL),
	 (3030,1001,N'Exitoso','2026-03-25 19:12:45.4216639','2026-03-25 19:12:57.2252636',NULL,NULL),
	 (3031,1,N'Exitoso','2026-03-25 19:41:23.9864010','2026-03-25 19:41:36.5619481',NULL,NULL),
	 (3032,1,N'Exitoso','2026-03-25 19:49:36.5981519','2026-03-25 19:49:44.5761038',N'Usuario abandonó el proceso de pago',NULL),
	 (3033,1,N'Exitoso','2026-03-25 21:34:52.4323500','2026-03-25 21:35:01.4768965',NULL,NULL),
	 (3034,1,N'Exitoso','2026-03-25 21:41:32.7931622','2026-03-25 21:41:44.0398114',NULL,NULL),
	 (4030,1,N'Exitoso','2026-03-26 10:50:40.6646436','2026-03-26 10:50:52.1276174',N'Usuario abandonó el proceso de pago',NULL);
INSERT INTO PastisserieDB.dbo.Reviews (UsuarioId,ProductoId,Calificacion,Comentario,Fecha,Aprobada,AprobadaPor) VALUES
	 (1,5,4,N'Muy Rico','2026-03-17 20:46:10.0334351',1,NULL),
	 (1,6,5,N'No queso, pero lo demás bien mejoro este pedido ','2026-03-17 20:47:41.5085873',1,NULL),
	 (1,21,5,N'muy rico','2026-03-17 20:49:58.6082918',1,NULL),
	 (1001,5,5,N'Muy rica las fresas, ','2026-03-17 20:52:40.6093654',1,NULL),
	 (1001,6,5,N'Me encanto muy suave el pancito','2026-03-17 20:53:17.6755918',1,NULL),
	 (1,20,5,N'me Encanto mucho esa empanda y me recuerda las de mi viaje a Mexico ','2026-03-17 20:58:49.4671630',1,NULL),
	 (2002,21,5,N'muy rico deliciosos','2026-03-20 17:16:46.7744209',1,NULL),
	 (1,1,5,N'La mejor de todas una de mis preferidas','2026-03-25 20:06:11.8293787',1,NULL),
	 (1001,7,5,N'muy rico recomendado con cafecito ','2026-03-25 21:24:33.0465558',1,NULL),
	 (1,7,4,N'Muy rico ','2026-03-25 21:25:21.4093356',1,NULL);
INSERT INTO PastisserieDB.dbo.Reviews (UsuarioId,ProductoId,Calificacion,Comentario,Fecha,Aprobada,AprobadaPor) VALUES
	 (1,14,4,N'Muy ricas esas galletas','2026-03-25 22:36:20.6075896',1,NULL);
INSERT INTO PastisserieDB.dbo.Roles (Nombre,Activo) VALUES
	 (N'Usuario',1),
	 (N'Admin',1),
	 (N'Domiciliario',1),
	 (N'Gerente',1),
	 (N'Repartidor',1);
INSERT INTO PastisserieDB.dbo.TiposMetodoPago (Nombre,Descripcion,Activo) VALUES
	 (N'Efectivo',N'Pago en efectivo contra entrega',1),
	 (N'Tarjeta de Crédito',N'Pago con tarjeta de crédito',1),
	 (N'Tarjeta de Débito',N'Pago con tarjeta de débito',1),
	 (N'Transferencia',N'Transferencia bancaria',1),
	 (N'PSE',N'Pago electrónico PSE',1);
INSERT INTO PastisserieDB.dbo.UserRoles (UsuarioId,RolId,FechaAsignacion) VALUES
	 (1,2,'2024-01-01 00:00:00.0000000'),
	 (1001,1001,'2026-03-17 20:43:20.5087244'),
	 (1002,1,'2026-03-17 21:29:34.4004326'),
	 (2001,1,'2026-03-19 21:52:20.0094669'),
	 (2002,1,'2026-03-20 17:13:53.0375722'),
	 (3002,1,'2026-03-26 16:54:51.5473999');
INSERT INTO PastisserieDB.dbo.Users (Nombre,Email,PasswordHash,Telefono,EmailVerificado,FechaRegistro,UltimoAcceso,Activo,FechaCreacion,FechaActualizacion,Direccion) VALUES
	 (N'Admin Deluxe',N'administrador123@gmail.com',N'$2a$11$uNPojHS7OzaaXFFXlSHQKOMdvw4QGeOWp9kxviN91XTgReEaZQlbG',N'3125431231',1,'2024-01-01 00:00:00.0000000','2026-03-27 02:51:17.6696600',1,'2024-01-01 00:00:00.0000000','2026-03-27 03:00:02.5679341',NULL),
	 (N'alex',N'alex@gmail.com',N'$2a$11$zBNE7Tib18oG/DtNdqOrc.nUE7x2L8XjMAXsNOgYmbVFFbzHAy54i',N'34423423',0,'2026-03-17 20:43:09.9171860','2026-03-27 00:35:33.3568565',1,'2026-03-17 20:43:09.9172695','2026-03-27 00:37:48.3651198',NULL),
	 (N'olex',N'olex@gmail',N'$2a$11$oVkYM14my35psNmIS8U64uVZEAXHDXhMLRirC2cuGh08i3kMwWXsK',NULL,0,'2026-03-17 21:29:33.9866995',NULL,0,'2026-03-17 21:29:33.9866996','2026-03-20 17:21:49.0151960',NULL),
	 (N'Juan Felipe',N'JuanFelipe@gmail.com',N'$2a$11$Ul2Vjc4mY90NuGN/v0HKfO2F9CHqd5EGly4F9aLXjSOeYPA0Z9wmK',N'3200022 ',0,'2026-03-19 21:52:18.6914369','2026-03-19 21:52:23.6325338',1,'2026-03-19 21:52:18.6915324','2026-03-19 21:55:30.1155124',NULL),
	 (N'pablo',N'pabloreyes1022@gmail.com',N'$2a$11$ijQ4OtmmwiBED2v9fOWQQ.a4PBuoAHGGSXe.QJsxhgQGpQraIuQRe',N'',0,'2026-03-20 17:13:52.4914767','2026-03-25 18:29:39.9610503',1,'2026-03-20 17:13:52.4915535','2026-03-25 18:29:40.0227581',NULL),
	 (N'Santiago',N'saretotiyer@gmail.com',N'$2a$11$ydLtodesROjIfCAYO7104uaWSeYP7yM4lRBK0UPI1nQD/dpqislPy',N'3150589185',0,'2026-03-26 16:54:51.2791847','2026-03-26 16:54:54.2552753',1,'2026-03-26 16:54:51.2792629','2026-03-26 17:02:09.9794182',NULL);
INSERT INTO PastisserieDB.dbo.[__EFMigrationsHistory] (MigrationId,ProductVersion) VALUES
	 (N'20260208231108_primera',N'8.0.2'),
	 (N'20260217020357_AddAdminSeedData',N'8.0.2'),
	 (N'20260217023158_AddPromocionesTable',N'8.0.2'),
	 (N'20260226212324_RemoveStaticSeeding',N'8.0.2'),
	 (N'20260226225209_RestoreFullCatalog',N'8.0.2'),
	 (N'20260228002103_AddReclamacionAndHorarioV2',N'8.0.2'),
	 (N'20260228003817_FixSocialMediaNaming',N'8.0.2'),
	 (N'20260228025729_AddNoEntregadoAuditFields',N'8.0.2'),
	 (N'20260228175332_AddProfessionalWorkHours',N'8.0.2'),
	 (N'20260301184545_AddDiasLaborales',N'8.0.2');
INSERT INTO PastisserieDB.dbo.[__EFMigrationsHistory] (MigrationId,ProductVersion) VALUES
	 (N'20260301203131_AddNotificacionEnlaceAndHorarioDia',N'8.0.2'),
	 (N'20260305170408_AddMetodosPagoTables',N'8.0.2'),
	 (N'20260309214155_AddComunaToEnvio',N'8.0.2'),
	 (N'20260309221610_AddProductoToPromocion',N'8.0.2'),
	 (N'20260309233026_AddPrecioOriginalToPromocion',N'8.0.2'),
	 (N'20260310084824_PromoCartIntegration',N'8.0.2'),
	 (N'20260310163031_AddEpaycoPaymentFields',N'8.0.2'),
	 (N'20260311151337_AddBusinessRulesFieldsToConfiguracionTienda',N'8.0.2'),
	 (N'20260311161214_MakeProductoIdNullableInCarritoAndPedido',N'8.0.2'),
	 (N'20260320170454_AddRegistroPago',N'8.0.2');
INSERT INTO PastisserieDB.dbo.[__EFMigrationsHistory] (MigrationId,ProductVersion) VALUES
	 (N'20260326010006_AddDireccionToUser',N'8.0.2'),
	 (N'20260326211321_RemovePersonalizadoAndIVA',N'8.0.2'),
	 (N'20260326220406_AddCostosEnvioPorComuna',N'8.0.2');
