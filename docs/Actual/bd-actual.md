# Estado Actual de la Base de Datos

## Resumen Ejecutivo

La base de datos contiene **24 entidades** definidas en el modelo de Entity Framework Core. La mayoría están correctamente vinculadas y en uso, pero existen elementos redundantes, relaciones faltantes y entidades sin uso aparente.

---

## Tablas/Entidades por Área Funcional

### 1. Usuarios y Autenticación (FUNCIONANDO)

| Entidad | Estado | Notas |
|---------|--------|-------|
| `Users` | ✅ En uso | Tabla principal de usuarios |
| `UserRoles` | ✅ En uso | Relación muchos a muchos Users-Roles |
| `Roles` | ✅ En uso | Definición de roles (Admin, Cliente, Repartidor) |

**Campos noteworthy en Users:**
- `Direccion` - Agregado en migración reciente (20260326010006)
- `EmailVerificado` - Definido pero no hay proceso de verificación
- `UltimoAcceso` - Se actualiza pero no se muestra en frontend

### 2. Productos y Catálogo (PARCIALMENTE EN USO)

| Entidad | Estado | Notas |
|---------|--------|-------|
| `Productos` | ✅ En uso | Catálogo principal |
| `Reviews` | ✅ En uso | Reseñas de productos |
| `CategoriaProducto` | ⚠️ FANTASMA | Existe pero NO se usa - categoría es string en Producto |

**Problemas identificados:**
- La entidad `CategoriaProducto` está definida en el DbContext pero no se utiliza
- Los productos usan el campo `Categoria` (string) en lugar de relación a `CategoriaProducto`
- Esto crea una redundancia: tabla sin uso que ocupa espacio en migrations

### 3. Carrito y Compras (FUNCIONANDO)

| Entidad | Estado | Notas |
|---------|--------|-------|
| `CarritoCompra` | ✅ En uso | Un carrito por usuario |
| `CarritoItem` | ✅ En uso | Items con soporte para promociones |

**Estructura correcta:**
- Soporte para productos y promociones (independientes o vinculadas)
- Campo `PrecioOriginal` para mostrar descuentos

### 4. Pedidos (FUNCIONANDO)

| Entidad | Estado | Notas |
|---------|--------|-------|
| `Pedido` | ✅ En uso | Pedido principal |
| `PedidoItem` | ✅ En uso | Items del pedido |
| `PedidoHistorial` | ⚠️ Parcial | Se crea pero no se consume en frontend |
| `DireccionEnvio` | ✅ En uso | Dirección capturada en checkout |
| `Factura` | ✅ En uso | Generación de PDF |

**Nota importante:**
- El campo `IVA` está siempre en 0 (no se aplica IVA)
- El campo `CostoEnvio` se calcula por comuna (Guayabal: 5000, Belén: 6000)

### 5. Personalización (NO IMPLEMENTADO/INCOMPLETO)

| Entidad | Estado | Notas |
|---------|--------|-------|
| `PersonalizadoConfig` | ❌ Incompleto | Definido pero funcionalidad no integrada |
| `Ingrediente` | ❌ Sin uso | Tabla vacía/sin datos |
| `PersonalizadoConfigIngrediente` | ❌ Sin uso | Relación sin populate |

**Problema:** La funcionalidad de pasteles personalizados está定義da en el modelo pero no se utiliza en el flujo de compra.

### 6. Promociones (FUNCIONANDO)

| Entidad | Estado | Notas |
|---------|--------|-------|
| `Promociones` | ✅ En uso | two tipos: vinculadas a producto e independientes |

**Funcionalidad completa:**
- Descuentos por porcentaje o monto fijo
- Stock para promociones independientes
- Fechas de vigencia

### 7. Pagos (FUNCIONANDO - SIMULADO)

| Entidad | Estado | Notas |
|---------|--------|-------|
| `TipoMetodoPago` | ✅ En uso | Definición de tipos |
| `MetodoPagoUsuario` | ✅ En uso | Métodos guardados por usuario |
| `RegistroPago` | ✅ En uso | Tracking de intentos de pago |

**Notas:**
- El sistema usa pago simulado, no integración real con procesador
- ePayco fue eliminado pero quedan referencias en código

### 8. Envíos (PARCIALMENTE EN USO)

| Entidad | Estado | Notas |
|---------|--------|-------|
| `Envio` | ⚠️ Parcial | Creado con el pedido pero no actualizado |
| `HorarioDia` | ✅ En uso | Horarios por día para control de tienda |

**Problema:** La entidad `Envio` se crea pero el seguimiento de estado no está completamente integrado.

### 9. Configuración (FUNCIONANDO)

| Entidad | Estado | Notas |
|---------|--------|-------|
| `ConfiguracionTienda` | ✅ En uso | Configuración general de la tienda |
| `HorarioDia` | ✅ En uso | Horario laboral |

**Campos importantes:**
- `SistemaActivoManual` - Para cerrar manualmente
- `UsarControlHorario` - Validar horario automáticamente
- `CompraMinima` - 15000 COP por defecto
- Comunas limitadas: Guayabal, Belén

### 10. Notificaciones y Reclamaciones (FUNCIONANDO)

| Entidad | Estado | Notas |
|---------|--------|-------|
| `Notificacion` | ✅ En uso | Notificaciones internas |
| `Reclamacion` | ✅ En uso | Sistema de reclamaciones |

---

## Relaciones Entre Entidades

### Relaciones Correctamente Establecidas

```
Users 1----→ * Pedido
Users 1----→ * Review
Users 1----→ * Notificacion
Users 1----1 CarritoCompra
Users 1----→ * DireccionEnvio
Users 1----→ * MetodoPagoUsuario
Users *----* UserRoles ----* Roles

Pedido 1----→ * PedidoItem
Pedido 1----1 Factura
Pedido 1----→ * PedidoHistorial
Pedido 1----1 DireccionEnvio
Pedido 1----1 Envio
Pedido 1----1 MetodoPagoUsuario

Producto 1----→ * Review
Producto 1----→ * PedidoItem
Producto 1----→ * CarritoItem
```

### Relaciones Potencialmente Problemáticas

1. **CategoriaProducto → Producto**: No se usa (categoría es string)
2. **Promocion → Producto**: Opcional, funciona para promociones independientes

---

## Migraciones Existentes

| Migration | Fecha | Descripción |
|-----------|-------|-------------|
| primera | 2026-02-08 | Tablas base |
| AddAdminSeedData | 2026-02-17 | Datos de admin |
| AddPromocionesTable | 2026-02-17 | Sistema de promociones |
| RestoreFullCatalog | 2026-02-26 | Catálogo completo |
| AddMetodosPagoTables | 2026-03-05 | Métodos de pago |
| AddComunaToEnvio | 2026-03-09 | Comuna en envío |
| AddProductoToPromocion | 2026-03-09 | Promociones vinculadas |
| AddPrecioOriginalToPromocion | 2026-03-09 | Precio original |
| PromoCartIntegration | 2026-03-10 | Integración carrito-promociones |
| AddEpaycoPaymentFields | 2026-03-10 | Campos ePayco (ELIMINADO) |
| AddRegistroPago | 2026-03-20 | Tracking de pagos |
| AddDireccionToUser | 2026-03-26 | Campo dirección en usuario |

**Total: 12 migraciones** - algunas contain código obsoleto (ePayco)

---

## Problemas y Observaciones

### 1. Datos Residuales
- Campos de ePayco en Pedido: `PaymentReference`, `PaymentUrl`, `PaymentStatus` - ya no se usan
- Referencia a ePayco en código: strings hardcodeadas "ePayco" en PedidoService.cs

### 2. Inconsistencias de Nombres
- Tabla `CategoriasProducto` (plural) vs entidad `CategoriaProducto` (singular)
- Tabla `Carritos` vs entidad `CarritoCompra`
- Tabla `HorariosPorDia` (plural) vs entidad `HorarioDia`

### 3. Campos Sin Uso
- `Producto.StockMinimo` - definido pero no se utiliza para alertas
- `User.UltimoAcceso` - se actualiza pero no se muestra
- `Pedido.IVA` - siempre 0, no hay lógica de cálculo
- `PedidoHistorial` - se crea pero frontend no lo consume

### 4. Tipo de Dato Inconsistente
- `Producto.Categoria` es string en lugar de foreign key a CategoriaProducto
- Esto hace que CategoriaProducto sea una tabla fantasma

---

## Recomendaciones para Limpieza

1. **Eliminar CategoriaProducto** - Migrar categorías a strings consistentes o eliminar la tabla
2. **Limpiar campos ePayco** - Eliminar referencias y migra that removan columnas innecesarias
3. **Completar PersonalizadoConfig** - Implementar funcionalidad o eliminar las 3 entidades relacionadas
4. **Agregar triggers o jobs** - Para usar StockMinimo en alertas de inventario

---

## Schema Resumido (Entidades Activas)

```
USERS (principal)
  ├─ UserRoles → Roles
  ├─ Pedidos
  ├─ Reviews
  ├─ CarritoCompra → CarritoItems → Productos/Promociones
  ├─ DireccionEnvio
  ├─ MetodoPagoUsuario → TipoMetodoPago
  ├─ Notificaciones
  └─ Reclamaciones

PEDIDOS
  ├─ PedidoItems → Productos/Promociones
  ├─ DireccionEnvio
  ├─ Factura
  ├─ Envio → Users (Repartidor)
  ├─ MetodoPagoUsuario
  └─ PedidoHistorial

TIENDA
  └─ ConfiguracionTienda → HorarioDia

PROMOCIONES (independientes o → Productos)
```

---

## Estado de la Base de Datos: FUNCIONAL CON ELEMENTOS REDUNDANTES

La base de datos está operativa y supporting el flujo completo de compra. Sin embargo, existen elementos que podrían limpiarse para reducir complejidad y mejorar rendimiento.