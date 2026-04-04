# Auditoría Técnica — Puntos Rotos y Lógica Incompleta

---

## Backend (.NET)

### 1. **Excepciones de negocio y catch vacíos**
- **Ubicación:** PastisserieAPI.Services/Services/PedidoService.cs (líneas 33, 40, 82, 88, 160, 164, 174, 190, 208, 223, 265, 321, 339, 559, 579, 627)
- **Descripción:** Múltiples throw y catch vacíos en lógicas de validación stock, comunas, productos. Los catch sin contenido ocultan errores en flujos críticos.
- **Evidencia técnica:** `throw new Exception(...)`, `catch {}`
- **Flujo afectado:** Creación y gestión de pedidos, validación de stock y comunas
- **Impacto:** Alto
- **Recomendación:** Loguear los errores, implementar manejo centralizado de excepciones y retorno controlado a UI.

### 2. **Retorno null crítico en mapeos y entidades**
- **Ubicación:** PastisserieAPI.Services/Mappings/MappingProfile.cs (línea 193), PedidoService.cs (381, 503, 637), CarritoService.cs (244, 249), ProductoService.cs (81), EnvioService.cs (37, 50), ReclamacionService.cs (114), AuthService.cs (41, 46, 80, 128)
- **Descripción:** Métodos retornan `null` en ausencia de datos válidos; puede provocar errores silenciosos en capa superior.
- **Evidencia técnica:** `return null`
- **Flujo afectado:** Cualquier flujo que espera una entidad/DTO válida
- **Impacto:** Medio
- **Recomendación:** Usar objetos de error o respuestas explícitas para evitar NullReference.

### 3. **Lógica incompleta/documentada como frágil**
- **Ubicación:** PastisserieAPI.Services/Services/ReviewService.cs (línea 24, 55), UnitOfWork.cs (48), PedidoRepository.cs (14), CarritoRepository.cs (21)
- **Descripción:** Comentarios advierten posibles errores o puntos frágiles en métodos clave (“Si te da error aquí avísame.”).
- **Evidencia técnica:** Comentarios en código
- **Flujo afectado:** Dashboard de pedidos, asignación de delivery, CRUD de reseñas
- **Impacto:** Medio
- **Recomendación:** Auditar/expandir cobertura de tests.

### 4. **Inicialización crítica del sistema y configuración de pagos**
- **Ubicación:** PastisserieAPI.Services/Services/EpaycoService.cs (39-42, 54, 57, 60, 64), Program.cs (80), DbInitializer.cs (32-66)
- **Descripción:** Si faltan claves de configuración, pagos quedan inoperativos; errores de inicialización lanzan throw que pueden dejar la app inutilizable.
- **Evidencia técnica:** `throw new InvalidOperationException(...)`, `catch (Exception ex) {throw;}`
- **Flujo afectado:** Sistema de pagos, inicialización global
- **Impacto:** Alto
- **Recomendación:** Validar config al inicio, fallback y logs en errores críticos.

### 5. **catch sin gestión en email y otros servicios**
- **Ubicación:** EmailService.cs (61, 64, 133, 230), AuthService.cs (120, 252), TiendaService.cs (51, 55), InvoiceService.cs (64, 94, 99), JwtHelper.cs (76)
- **Descripción:** Operaciones críticas con catch vacío o solo logs. Algunos re-lanzan error, otros lo ignoran.
- **Evidencia técnica:** `catch {}` o `catch (Exception ex)` sin acción
- **Flujo afectado:** Envío de correos, autenticación, composición de facturas
- **Impacto:** Alto
- **Recomendación:** Logging y gestión completa de error.


## Frontend (React)

### 1. **catch vacío y manejo superficial de error**
- **Ubicación:** src/context/CartContext.tsx (43, 118), src/services/reviewService.ts (68), src/utils/format.ts (25, 42), src/utils/seeder.ts (401, 406), src/hooks/useTiendaStatus.ts (29, 30), src/pages/promociones.tsx (38-39)
- **Descripción:** Uso de catch vacío/log sin recuperación; algunas funciones sólo muestran error al usuario.
- **Evidencia técnica:** `catch {}`, `console.error(...)`, `toast.error(...)`
- **Flujo afectado:** Carga y actualización de carrito/productos, reseñas, estado tienda
- **Impacto:** Medio
- **Recomendación:** Implementar reintentos automáticos y captura granular.

### 2. **Flujo de pago con fallback incompleto**
- **Ubicación:** src/pages/ResultadoPago.tsx (58-148)
- **Descripción:** Si fallan los endpoints de validación de pago, el status se marca sólo como 'error'. No hay reintento ni reporting.
- **Evidencia técnica:** `console.warn(...)`, `setStatus('error')`
- **Flujo afectado:** Confirmación de pago
- **Impacto:** Medio
- **Recomendación:** Añadir reintentos, logs remotos y reporting.

### 3. **Manejo superficial de errores en configuración/admin**
- **Ubicación:** src/pages/admin/Configuracion.tsx (115-117, 179-182)
- **Descripción:** Al fallar operaciones de sincronización/configuración, sólo hay logs y toast; sin recuperación ni acción.
- **Evidencia técnica:** `console.error(...)`, `toast.error(...)`
- **Flujo afectado:** Configuración admin
- **Impacto:** Medio
- **Recomendación:** Implementar fallback y reporting.

### 4. **Errores de integración y reintentos manuales**
- **Ubicación:** src/pages/checkout.tsx (130-134, 210-212), src/pages/carrito.tsx (21-25), src/pages/admin/pedidosAdmin.tsx (56-108), src/pages/admin/reportesAdmin.tsx (34-73), src/pages/perfil.tsx (38-81)
- **Descripción:** Mensajes de error entregados al usuario, pero sin reintentos automáticos ni reporting.
- **Evidencia técnica:** `toast.error(...)`, `console.error(...)`
- **Flujo afectado:** Checkout, eliminación/asignación de pedidos, reportes, perfil
- **Impacto:** Medio
- **Recomendación:** Añadir lógica de reintentos y registro de fallos.

### 5. **Retorno undefined y uso incorrecto de context/provider**
- **Ubicación:** src/context/CartContext.tsx (22, 236-237), src/pages/perfil.tsx (385, 391), src/services/productService.ts (36, 37)
- **Descripción:** `return undefined` en objetos clave, y errores de uso de context pueden provocar pantallas blancas o flujos congelados.
- **Evidencia técnica:** `undefined` en config/data, `throw new Error('useCart debe usarse dentro de un CartProvider')`
- **Flujo afectado:** Carrito, productos, perfil
- **Impacto:** Medio
- **Recomendación:** Validar siempre datos y context en componentes críticos.


---

## Base de Datos

### 1. **OnDelete(NoAction) para relaciones críticas**
- **Ubicación:** PastisserieAPI.Infrastructure/Data/ApplicationDbContext.cs (68)
- **Descripción:** DeleteBehavior.NoAction previene errores SQL, pero puede dejar registros huérfanos sin validación.
- **Evidencia técnica:** `.OnDelete(DeleteBehavior.NoAction);`
- **Flujo afectado:** Cascada de eliminaciones en pedidos/carrito/envíos
- **Impacto:** Bajo
- **Recomendación:** Validar consistencia referencial y limpieza en cascada.


---

# Recomendaciones generales

- Implementar manejo centralizado de errores, logs detallados en catch y fallback para operaciones críticas (pagos, pedidos).
- Añadir reporting automático y reintentos en frontend para funciones de integración y pagos.
- Validar exhaustivamente configuraciones iniciales, entidades y datos.
- Expandir cobertura de tests en puntos documentados como frágiles por comentarios de código.
