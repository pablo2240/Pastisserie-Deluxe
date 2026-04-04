# Estado Actual de la Base de Datos

**Última actualización**: 03/04/2026  
**Versión del sistema**: 1.0  

## Resumen Ejecutivo

La base de datos contiene **18 entidades activas** definidas en el modelo de Entity Framework Core. El sistema está en **85-90% funcional** con todas las entidades correctamente vinculadas y en uso productivo. Se han eliminado elementos redundantes y tablas fantasma en migraciones recientes (marzo 2026).

---

## Tablas/Entidades por Área Funcional

### 1. Usuarios y Autenticación (✅ FUNCIONANDO 100%)

| Entidad | Estado | Notas |
|---------|--------|-------|
| `Users` | ✅ En uso | Tabla principal de usuarios con autenticación JWT |
| `UserRoles` | ✅ En uso | Relación muchos a muchos Users-Roles |
| `Roles` | ✅ En uso | 3 roles activos: Usuario, Admin, Repartidor |

**Campos importantes en Users:**
- `PasswordHash` - Hash BCrypt para seguridad
- `Estado` - Activo/Bloqueado (control de acceso)
- `FechaCreacion` - Auditoría de registro
- `Telefono` - Para contacto en entregas

### 2. Productos y Catálogo (✅ FUNCIONANDO 100%)

| Entidad | Estado | Notas |
|---------|--------|-------|
| `Productos` | ✅ En uso | Catálogo completo con imágenes en Azure Blob Storage |
| `Reviews` | ✅ En uso | Reseñas con sistema de aprobación manual (Admin) |
| `CategoriaProducto` | ✅ En uso | Categorías separadas correctamente |

**Cambios recientes (marzo-abril 2026):**
- **Stock Ilimitado**: Nuevo campo `StockIlimitado` (bool) — si está activo, el producto nunca se agota
- **Azure Blob Storage**: Imágenes se suben a Azure (antes eran archivos locales)
- **Categorías activas**: Tortas, Postres, Galletas, Panes, Bebidas

**Estructura de Producto:**
- `Nombre`, `Descripcion`, `Precio` (decimal en COP)
- `Stock` (int, ignorado si `StockIlimitado = true`)
- `ImagenUrl` (string, URL completa de Azure Blob Storage)
- `CategoriaId` (FK a CategoriaProducto)
- `Activo` (bool, para desactivar productos sin eliminarlos)

### 3. Carrito y Compras (✅ FUNCIONANDO 100%)

| Entidad | Estado | Notas |
|---------|--------|-------|
| `CarritoCompra` | ✅ En uso | Un carrito persistente por usuario autenticado |
| `CarritoItem` | ✅ En uso | Items con cantidad editable |

**Características:**
- Carrito **persistente** — se guarda en BD, disponible en todas las sesiones
- Solo usuarios autenticados pueden añadir productos
- Soporte para múltiples productos con cantidades individuales
- Validación automática de stock disponible al modificar cantidades

### 4. Pedidos (✅ FUNCIONANDO 100%)

| Entidad | Estado | Notas |
|---------|--------|-------|
| `Pedido` | ✅ En uso | Estados: Pendiente → Aprobado → En Camino → Entregado / Cancelado |
| `PedidoItem` | ✅ En uso | Items del pedido con precio congelado al momento de compra |
| `PedidoHistorial` | ✅ En uso | Registro completo de cambios de estado (auditoría) |
| `DireccionEnvio` | ✅ En uso | Dirección capturada en checkout con soporte GPS |
| `RegistrosPagos` | ✅ En uso | Tracking de intentos de pago |

**Cambios importantes (marzo-abril 2026):**
- **GPS en DireccionEnvio**: Campos `Latitud` y `Longitud` para ubicación exacta
- **Método de pago simplificado**: Campo `MetodoPago` (string) — "Efectivo", "Tarjeta de Crédito", "Tarjeta de Débito", "Transferencia"
- **Eliminadas**: Tablas `Factura`, `Envios`, `MetodosPagoUsuario`, `TiposMetodoPago` (simplificación del sistema)

**Flujo de estados:**
```
Pendiente (creado por cliente)
    ↓
Aprobado (admin confirma y descuenta stock)
    ↓
En Camino (asignado a repartidor)
    ↓
Entregado (repartidor confirma entrega)

Cancelado (admin o sistema rechaza)
```

**Campos eliminados (26-03-2026):**
- ❌ `Pedido.IVA` — Eliminado (no se aplica IVA)
- ❌ `Pedido.MetodoPagoId` — Reemplazado por string directo



### 5. Promociones (✅ FUNCIONANDO 100%)

| Entidad | Estado | Notas |
|---------|--------|-------|
| `Promociones` | ✅ En uso | Descuentos automáticos con fechas de vigencia |

**Tipos de descuento:**
- **Porcentual**: Descuento en % (ej: 20% de descuento)
- **Fijo**: Descuento en monto COP (ej: $5000 de descuento)
- **2x1**: Paga uno, lleva dos (calculado automáticamente)

**Características:**
- Asignación a múltiples productos
- Fechas de inicio y fin configurables
- Aplicación automática en el checkout
- Estados: Activa / Próximamente / Expirada





### 6. Configuración de Tienda (✅ FUNCIONANDO 100%)

| Entidad | Estado | Notas |
|---------|--------|-------|
| `ConfiguracionTienda` | ✅ En uso | Key-value store para configuración general |
| `HorarioDia` | ✅ En uso | Horarios de atención (Lunes-Domingo) |

**Configuraciones activas:**
- `NombreTienda`: "Pâtisserie Deluxe"
- `Telefono`, `Email`, `Direccion`: Datos de contacto
- `MontoMinimoPedido`: Monto mínimo en COP (default: 20000)
- `TiempoEntregaEstimado`: Tiempo en minutos (default: 60)

**HorarioDia:**
- Configuración por día de la semana
- `HoraApertura`, `HoraCierre` (TimeSpan)
- Campo `Cerrado` (bool) para días no laborables

### 7. Notificaciones y Reclamaciones (✅ FUNCIONANDO 100%)

| Entidad | Estado | Notas |
|---------|--------|-------|
| `Notificaciones` | ✅ En uso | Notificaciones internas del sistema |
| `Reclamaciones` | ✅ En uso | Sistema de quejas y reclamaciones |

**Notificaciones:**
- Generadas automáticamente en eventos clave (aprobación de pedidos, asignación de repartidor, etc.)
- Marcadas como leídas/no leídas
- Asociadas a usuarios específicos

**Reclamaciones:**
- Estados: Pendiente → En Revisión → Resuelta / Rechazada
- Tipos: Producto dañado, Producto incorrecto, Entrega tardía, etc.
- Soporte para evidencia adjunta (futuro: imágenes)
- Respuesta del administrador registrada

---

## Resumen de Entidades (18 Activas)

| # | Entidad | Descripción | Relaciones Principales |
|---|---------|-------------|------------------------|
| 1 | `Users` | Usuarios del sistema | → Pedidos, Reviews, Carrito, Direcciones |
| 2 | `Roles` | Roles de autorización | ← UserRoles |
| 3 | `UserRoles` | Relación Users-Roles | Users ←→ Roles |
| 4 | `Productos` | Catálogo de productos | → Reviews, PedidoItems, CarritoItems |
| 5 | `CategoriaProducto` | Categorías de productos | ← Productos |
| 6 | `Reviews` | Reseñas de productos | → Users, Productos |
| 7 | `CarritoCompra` | Carrito persistente | → Users, CarritoItems |
| 8 | `CarritoItem` | Items del carrito | → CarritoCompra, Productos |
| 9 | `Pedidos` | Pedidos/órdenes de compra | → Users, PedidoItems, DireccionEnvio |
| 10 | `PedidoItem` | Items de cada pedido | → Pedidos, Productos |
| 11 | `PedidoHistorial` | Auditoría de cambios | → Pedidos |
| 12 | `DireccionEnvio` | Direcciones de entrega | → Users, Pedidos |
| 13 | `RegistrosPagos` | Tracking de pagos | → Pedidos |
| 14 | `Promociones` | Descuentos y ofertas | → Productos (M:N) |
| 15 | `ConfiguracionTienda` | Configuración general | Key-value store |
| 16 | `HorarioDia` | Horarios de atención | Por día de semana |
| 17 | `Notificaciones` | Notificaciones internas | → Users |
| 18 | `Reclamaciones` | Quejas y reclamaciones | → Users, Pedidos |

---

## Relaciones Entre Entidades

### Diagrama Simplificado

```
Users 1────→ * Pedidos
Users 1────→ * Reviews
Users 1────→ * Notificaciones
Users 1────→ * Reclamaciones
Users 1────→ 1 CarritoCompra
Users 1────→ * DireccionEnvio
Users *────* Roles (via UserRoles)

Pedidos 1────→ * PedidoItems
Pedidos 1────→ * PedidoHistorial
Pedidos 1────→ 1 DireccionEnvio
Pedidos 1────→ * RegistrosPagos

Productos 1────→ * Reviews
Productos 1────→ * PedidoItems
Productos 1────→ * CarritoItems
Productos *────→ 1 CategoriaProducto
Productos *────* Promociones (M:N)

CarritoCompra 1────→ * CarritoItems
```

---

## Migraciones Aplicadas (33 Total)

### Migraciones Clave por Fecha

| Fecha | Migration | Descripción |
|-------|-----------|-------------|
| **26/02/2026** | `InitialCreate` | Creación inicial de tablas base |
| **26/02/2026** | `AddConfiguracionTienda` | Sistema de configuración |
| **26/02/2026** | `AddNotificaciones` | Notificaciones internas |
| **08/03/2026** | `AddPromocionesSupport` | Sistema de promociones |
| **20/03/2026** | `AddReclamaciones` | Sistema de reclamaciones |
| **26/03/2026** | `RemoveUnusedEntities` | Eliminación de Factura, Envios, MetodosPagoUsuario |
| **02/04/2026** | `AddStockIlimitado` | Campo `StockIlimitado` en Productos |
| **02/04/2026** | `AddGPSCoordinates` | Campos `Latitud` y `Longitud` en DireccionEnvio |
| **03/04/2026** | `AddAzureBlobStorage` | Soporte para Azure Blob Storage (ImagenUrl) |

### Columnas Eliminadas (26/03/2026)

Las siguientes columnas fueron eliminadas para simplificar el sistema:

- ❌ `Pedido.IVA` — No se aplica IVA
- ❌ `Pedido.MetodoPagoId` — Reemplazado por string `MetodoPago`
- ❌ `Users.Direccion` — Direcciones ahora en tabla separada `DireccionEnvio`
- ❌ `Reviews.AprobadaPor` — Auditoría simplificada

### Tablas Eliminadas (26/03/2026)

Las siguientes entidades fueron eliminadas del modelo:

- ❌ `Factura` — Funcionalidad de facturación removida
- ❌ `Envios` — Tracking simplificado vía PedidoHistorial
- ❌ `MetodosPagoUsuario` — Métodos de pago simplificados a string
- ❌ `TiposMetodoPago` — Enum reemplazado por string libre
- ❌ `PersonalizadoConfig` — Funcionalidad no implementada
- ❌ `Ingrediente` — Funcionalidad no implementada
- ❌ `PersonalizadoConfigIngrediente` — Funcionalidad no implementada

**Total de migraciones**: 33  
**Estado**: Todas aplicadas correctamente en desarrollo y producción

---

## Cambios Recientes (Marzo - Abril 2026)

### ✅ Funcionalidades Nuevas

1. **Stock Ilimitado (02/04/2026)**
   - Campo `StockIlimitado` en `Productos`
   - Si está activo, el producto nunca se agota
   - Permite vender servicios o productos bajo pedido

2. **GPS en Direcciones (02/04/2026)**
   - Campos `Latitud` y `Longitud` en `DireccionEnvio`
   - Integración con Google Maps para repartidores
   - Mejora precisión en entregas

3. **Azure Blob Storage (03/04/2026)**
   - Imágenes de productos se suben a Azure
   - `ImagenUrl` ahora es URL completa de Azure Blob Storage
   - Eliminación de archivos locales al actualizar/eliminar productos

### ❌ Elementos Eliminados

1. **Simplificación de Pagos (26/03/2026)**
   - Eliminadas tablas `MetodosPagoUsuario` y `TiposMetodoPago`
   - Campo `MetodoPago` ahora es string directo en `Pedido`
   - Valores aceptados: "Efectivo", "Tarjeta de Crédito", "Tarjeta de Débito", "Transferencia Bancaria"

2. **Eliminación de IVA (26/03/2026)**
   - Columna `IVA` eliminada de `Pedido`
   - No se aplica IVA en el sistema

3. **Limpieza de Funcionalidades No Implementadas**
   - Eliminadas entidades de Personalización (no se usaban)
   - Eliminada tabla `Factura` (funcionalidad removida)
   - Eliminada tabla `Envios` (reemplazada por PedidoHistorial)

---

## Integridad y Rendimiento

### Índices Aplicados

Los siguientes índices mejoran el rendimiento de consultas frecuentes:

```sql
-- Índices en Users
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Users_Estado ON Users(Estado);

-- Índices en Productos
CREATE INDEX IX_Productos_CategoriaId ON Productos(CategoriaId);
CREATE INDEX IX_Productos_Activo ON Productos(Activo);

-- Índices en Pedidos
CREATE INDEX IX_Pedidos_UsuarioId ON Pedidos(UsuarioId);
CREATE INDEX IX_Pedidos_Estado ON Pedidos(Estado);
CREATE INDEX IX_Pedidos_FechaCreacion ON Pedidos(FechaCreacion);

-- Índices en Reviews
CREATE INDEX IX_Reviews_ProductoId ON Reviews(ProductoId);
CREATE INDEX IX_Reviews_Aprobada ON Reviews(Aprobada);
```

### Restricciones de Integridad

- **ON DELETE CASCADE**: Aplicado en relaciones donde la eliminación debe propagarse (ej: `PedidoItems` al eliminar `Pedido`)
- **ON DELETE RESTRICT**: Aplicado en relaciones críticas (ej: no se puede eliminar un `Producto` con `PedidoItems` existentes)
- **Unique constraints**: Email en `Users`, nombre en `Roles`

### Validaciones a Nivel de Modelo

Todas las entidades implementan validaciones con DataAnnotations:

- `[Required]` en campos obligatorios
- `[MaxLength]` para límites de strings
- `[EmailAddress]` para formato de email
- `[Range]` para valores numéricos válidos

---

## Diagrama E-R Resumido

```
┌─────────────┐
│    USERS    │
└──────┬──────┘
       │
       ├─────→ ROLES (M:N via UserRoles)
       │
       ├─────→ PEDIDOS
       │         └─→ PedidoItems → PRODUCTOS
       │         └─→ PedidoHistorial
       │         └─→ DireccionEnvio
       │         └─→ RegistrosPagos
       │
       ├─────→ CARRITO
       │         └─→ CarritoItems → PRODUCTOS
       │
       ├─────→ REVIEWS → PRODUCTOS
       │
       ├─────→ NOTIFICACIONES
       │
       ├─────→ RECLAMACIONES → PEDIDOS
       │
       └─────→ DIRECCIONESENVIO

┌──────────────┐
│  PRODUCTOS   │
└──────┬───────┘
       │
       ├─────→ CATEGORIAPRODUCTO
       │
       └─────→ PROMOCIONES (M:N)

┌────────────────────┐
│ CONFIGURACIONTIENDA│ (Key-Value Store)
└────────────────────┘

┌──────────────┐
│  HORARIODIA  │ (Lunes-Domingo)
└──────────────┘
```

---

## Estado Final de la Base de Datos

### ✅ FUNCIONAL AL 85-90%

La base de datos está **completamente operativa** y soporta todos los flujos críticos del sistema:

**Flujos Implementados:**
- ✅ Registro y autenticación de usuarios (JWT)
- ✅ Navegación y búsqueda de catálogo
- ✅ Carrito persistente con validación de stock
- ✅ Checkout con direcciones GPS
- ✅ Gestión completa de pedidos (estados, tracking)
- ✅ Sistema de promociones automáticas
- ✅ Reseñas con moderación (aprobación admin)
- ✅ Notificaciones y reclamaciones
- ✅ Dashboard administrativo con reportes
- ✅ Dashboard de repartidor con Google Maps

**Optimizaciones Realizadas:**
- ✅ Eliminación de tablas fantasma
- ✅ Simplificación de métodos de pago
- ✅ Migración a Azure Blob Storage
- ✅ Soporte para stock ilimitado
- ✅ GPS para entregas precisas

**Próximas Mejoras Sugeridas:**
- 🔄 Implementar paginación en consultas grandes (Productos, Pedidos)
- 🔄 Agregar índices compuestos para reportes
- 🔄 Implementar caché de configuración (ConfiguracionTienda)
- 🔄 Agregar soft delete en lugar de eliminar registros críticos

---

**Última revisión**: 03/04/2026  
**Estado**: PRODUCTIVO  
**Migraciones aplicadas**: 33/33  
**Entidades activas**: 18