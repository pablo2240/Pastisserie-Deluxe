# Elementos Fantasma y Redundancias del Sistema

## Resumen

Este documento identifica todos los elementos "fantasma" o desconectados del sistema, así como las redundancias que deben eliminarse para simplificar la arquitectura.

---

## 1. ENTIDADES FANTASMA (Definidas pero no usadas)

### 1.1 Base de Datos

| Entidad | Tipo | Estado | Problema |
|---------|------|--------|-----------|
| `CategoriaProducto` | Tabla | FANTASMA | Definida en DbContext pero nunca usada. Los productos usan campo `Categoria` (string) en lugar de relación FK. |
| `Ingrediente` | Tabla | FANTASMA | Entidad creada pero nunca se llena de datos. No hay CRUD ni consumo. |
| `PersonalizadoConfigIngrediente` | Tabla | FANTASMA | Tabla de relación sin uso. Solo existe porque hay entidad hija. |

### 1.2 Campos en Entidades Usadas

| Entidad | Campo | Problema |
|---------|-------|----------|
| `Pedido` | `IVA` | Siempre es 0. No hay lógica que calcule o use este valor. |
| `Pedido` | `PaymentReference` | Residuo de ePayco. Columna sin datos/uso. |
| `Pedido` | `PaymentUrl` | Residuo de ePayco. Columna sin datos/uso. |
| `Pedido` | `PaymentStatus` | Residuo de ePayco. Columna sin datos/uso. |
| `Users` | `UltimoAcceso` | Se actualiza en login pero nunca se muestra al usuario. |
| `Users` | `EmailVerificado` | Campo existe pero no hay proceso de verificación de email. |
| `Producto` | `StockMinimo` | Se define pero no hay lógica de alertas cuando se reacha. |

---

## 2. SERVICIOS FANTASMA

### 2.1 Servicios Definidos pero Incompletos

| Servicio | Estado | Problema |
|----------|--------|----------|
| `EnvioService` | INCOMPLETO | No existe. Solo hay `EnvioRepository`. El envío se crea pero no se gestiona. |
| `PersonalizadoService` | NO EXISTE | Las entidades de personalización existen pero no hay servicio que las gestione. |

### 2.2 Métodos Sin Uso en Servicios Existentes

| Servicio | Método | Notas |
|----------|--------|-------|
| `ProductoService` | `GetProductosBajoStockAsync` | Existe pero no se consume en frontend |
| `TiendaService` | `EstaAbierto()` | Se usa para validar checkout, pero no para mostrar estado en home |

---

## 3. ENDPOINTS FANTASMA O SIN CONSUMO

### 3.1 Endpoints que Existen pero no se Usan

| Endpoint | Controlador | Uso Frontend |
|----------|-------------|--------------|
| `GET /api/productos/bajo-stock` | ProductosController | ❌ No se consume |
| `GET /api/categorias` | CategoriasController | ❌ No implementado completamente |
| `GET /api/pedidos/{id}/historial` | PedidosController | ❌ No se consume |
| `GET /api/envios/{id}` | EnviosController | ❌ No se consume |

### 3.2 Endpoints con Código Obsoleto

| Endpoint | Problema |
|----------|----------|
| `POST /api/pagos/epayco` | ePayco eliminado, verificar si código existe |
| `POST /api/pagos/webpay` | Referencias a WebPay (Colombia) sin implementación real |

---

## 4. CÓDIGO OBSOLETO (ePayco)

### 4.1 En Backend

| Archivo | Línea/Región | Problema |
|---------|--------------|----------|
| `PedidoService.cs` | 109 | String "Pago: ePayco" hardcodeado |
| `PedidoService.cs` | 122 | Búsqueda de tipo "ePayco" |
| `PedidoService.cs` | 128 | Crear tipo "ePayco" por defecto |
| `PedidoService.cs` | 138 | Token "EPAYCO_PENDING" |

**Búsqueda de referencias ePayco:**
```bash
# En todo el backend:
grep -r "epayco" --include="*.cs" -i
```

### 4.2 En Migraciones

Las migracionescontain definiciones de columnas ePayco:
- `AddEpaycoPaymentFields` - migración obsolete
- Columnas en tabla Pedido que ya no se usan

### 4.3 En Frontend

Verificar si hay referencias a ePayco en:
- Tipos/DTOs
- Servicios de API
- Componentes de pago

---

## 5. FRONTEND - COMPONENTES FANTASMA

### 5.1 Rutas Definidas pero con Contenido Parcial

| Ruta | Problema |
|------|----------|
| `/repartidor` | Solo dashboard básico, no hay gestión de pedidos asignados |
| `/admin/categorias` | Tabla no está funcional (entidad fantasma) |

### 5.2 Componentes que No Se Usan

| Componente | Estado | Notas |
|------------|--------|-------|
| `ShopStatusWidget.tsx` | Parcial | Usa pero solo para admin |
| Various Skeleton components | ✅ En uso | Estos están correctos |

---

## 6. RELACIONES INCOMPLETAS O ROTAS

### 6.1 Relaciones No Utilizadas

| De | → | A | Problema |
|----|---|----|----------|
| `CategoriaProducto` | → | `Producto` | FK no existe, relación no implementada |
| `Pedido` | → | `Envio` | Se crea pero no se actualiza estado |
| `Pedido` | → | `PedidoHistorial` | Se crea pero no se consume en frontend |

### 6.2 Campos con Datos Inconsistentes

| Campo | Problema |
|-------|----------|
| `Producto.Categoria` | Es string libre, no usa FK a CategoriaProducto |
| `Pedido.IVA` | Siempre 0, no representa realidad |
| `Promocion.Stock` | Nullable, algunos lo usan y otros no |

---

## 7. REDUNDANCIAS IDENTIFICADAS

### 7.1 Datos Duplicados

| Duplicado | Origen | Problema |
|-----------|--------|----------|
| Categoría como string vs tabla | `Producto.Categoria` (string) vs `CategoriaProducto` (tabla) | Dos formas de representar lo mismo |
| Dirección en perfil vs dirección de envío | `Users.Direccion` vs `Pedido.DireccionEnvio` | La dirección de Users ya casi no se usa |

### 7.2 Lógica Duplicada

| Duplicado | Ubicación | Problema |
|----------|-----------|----------|
| Cálculo de precio con descuento | `PedidoService.CalcularPrecioFinal()` vs `MappingProfile` | Misma lógica en dos lugares |
| Comunas y costos de envío | `PedidoService` (hardcoded) vs `types/index.ts` (Frontend) vs `ConfiguracionTienda` | Tres lugares diferentes |

### 7.3 Código Repetido

| Patrón | Ubicciones |
|--------|------------|
| Formatting de currency | Múltiples archivos de frontend |
| Validación de formulario de tarjeta | En checkout y potencialmente en otros lugares |

---

## 8. ARCHIVOS DE DOCUMENTACIÓN OBSOLETA

### 8.1 En carpeta /changes

| Archivo | Relevancia |
|---------|------------|
| `ePayco.md` | OBSOLETO - Sistema eliminado |
| `MERCADOPAGO_SETUP.md` | OBSOLETO - No se implementó |
| `eliminar-mercadopago-y-simplificar-pagos.md` | Histórico, revisar si aún aplica |
| `cambio-bogota-a-medellin.md` | Ya implementado |
| `checkout-comunas-medellin.md` | Ya implementado |

### 8.2 En carpeta /docs

Verificar qué archivos de docs/ todavía aplican y cuáles son históricos.

---

## 9. RECOMENDACIONES DE LIMPIEZA

### 9.1 Prioridad Alta (Eliminar Ahora)

| # | Acción | Justificación |
|---|--------|---------------|
| 1 | Eliminar referencias ePayco en código | Código muerto, confusión |
| 2 | Eliminar columnas ePayco de migraciones | Columnas sin uso en BD |
| 3 | Eliminar o consumir CategoriaProducto | Entidad fantasma |
| 4 | Eliminar campo IVA de Pedido | Siempre 0, no tiene sentido |

### 9.2 Prioridad Media (Decidir y Actuar)

| # | Acción | Justificación |
|---|--------|---------------|
| 5 | Completar o eliminar personalización | Entidades sin uso completo |
| 6 | Consumir PedidoHistorial o eliminar | Creado pero no se muestra |
| 7 | Mostrar o eliminar UltimoAcceso | Actualizado pero no usado |

### 9.3 Prioridad Baja (Refactorizar)

| # | Acción | Justificación |
|---|--------|---------------|
| 8 | Externalizar costos de envío a config | Evitar hardcoded |
| 9 | Unificar validación de comunas | Tres fuentes diferentes |
| 10 | Consolidar lógica de precios | Evitar duplicación |

---

## 10. CHECKLIST DE LIMPIEZA

### Paso 1: Eliminar Código Obsoleto
- [ ] Buscar y eliminar referencias a "epayco" en todo el código
- [ ] Eliminar columnas PaymentReference, PaymentUrl, PaymentStatus de Pedido
- [ ] Eliminar endpoint de ePayco si existe

### Paso 2: Decidir Entidades Fantasma
- [ ] Decidir: ¿Usar CategoriaProducto o eliminar?
- [ ] Decidir: ¿Completar personalización o eliminar entidades?
- [ ] Decidir: ¿Usar PedidoHistorial o eliminar?

### Paso 3: Limpiar Campos No Usados
- [ ] Eliminar campo IVA de Pedido
- [ ] Consumir o eliminar UltimoAcceso
- [ ] Consumir o eliminar StockMinimo

### Paso 4: Refactorizar
- [ ] Mover costos de envío a configuración
- [ ] Unificar comunas en un solo lugar
- [ ] Consolidar lógica de precios con descuento

---

## 11. IMPACTO DE NO LIMPIAR

Si no se limpian los elementos fantasma:

1. **Confusión para desarrolladores**: Código que parece usado pero no lo está
2. **Degradación de rendimiento**: Consultas a tablas innecesarias
3. **Migraciones complejas**: Cada vez más difícil hacer cambios en schema
4. **Errores potenciales**: Campos que parecen tener datos pero están vacíos
5. **Dificultad de mantenimientomás**: Mayor superficie de código a mantener

---

## Conclusión

El sistemacontiene varios elementos que están定义idos pero no se utilizan, creando "ruido" en el código y potenciales fuentes de confusión. La recomendación principal es:

1. **Limpiar ePayco inmediatamente** - Es código muerto claro
2. **Decidir sobre entidades menores** - Categoría, Personalización, Historial
3. **Eliminar campos sin uso** - IVA, campos de pago obsoletos
4. **Consolidar configuración** - Unificar comunas y costos de envío

Una vez limpia esta "basura", el sistema será más fácil de mantener, expandir y debuggear.