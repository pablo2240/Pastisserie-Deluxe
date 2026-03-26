# Solución - Áreas Incompletas y Faltantes del Sistema

## Resumen

Este documento identifica las áreas incompletas, faltantes o que necesitan corrección en cada capa del sistema (Frontend, Backend, Base de Datos) para lograr un flujo funcional y consistente.

---

## 1. BASE DE DATOS - Correcciones Necesarias

### 1.1 Entidades Fantasma (Eliminar o Integrar)

| Entidad | Problema | Solución Sugerida |
|---------|----------|-------------------|
| `CategoriaProducto` | Definida pero no se usa (categoría es string) | Eliminar tabla y migraciones relacionadas |
| `Ingrediente` | Tabla vacía, sin datos | Eliminar o implementar funcionalidad completa |
| `PersonalizadoConfigIngrediente` | Sin uso | Eliminar si no se implementa personalización |
| `PersonalizadoConfig` | Incompleto | Completar implementación o eliminar |

### 1.2 Campos Obsoletos o Sin Uso

| Tabla | Campo | Problema | Acción |
|-------|-------|----------|--------|
| Pedido | `IVA` | Siempre 0, no hay lógica | Eliminar campo o implementar |
| Pedido | `PaymentReference` | Residuo ePayco | Eliminar columna |
| Pedido | `PaymentUrl` | Residuo ePayco | Eliminar columna |
| Pedido | `PaymentStatus` | Residuo ePayco | Eliminar columna |
| Users | `UltimoAcceso` | Se actualiza pero no se muestra | Consumir en frontend o eliminar |
| Producto | `StockMinimo` | Definido pero sin lógica de alerta | Implementar alerts o eliminar |

### 1.3 Relaciones a Completar

| Relación | Estado | Problema | Solución |
|----------|--------|----------|----------|
| Pedido → Envio | Parcial | Se crea pero no se actualiza estado | Completar lógica de tracking |
| Pedido → PedidoHistorial | Parcial | Se crea pero frontend no lo consume | Mostrar historial en detalles del pedido |

### 1.4 Migraciones Obsoletas

- Las migraciones contienen referencias a ePayco que ya no se usan
- Considerar: Crear migración de limpieza para eliminar columnas innecesarias

---

## 2. BACKEND - Completar y Corregir

### 2.1 Servicios Incompletos

#### PersonalizadoService (NO EXISTE)
**Problema:** Las entidades `PersonalizadoConfig`, `Ingrediente`, `PersonalizadoConfigIngrediente` están definidas pero no hay servicio para gestionarlas.

**Solución:** Crear `IPersonalizadoService` y `PersonalizadoService` si se quiere implementar la funcionalidad de pasteles personalizados. Si no, eliminar las entidades.

#### EnvioService (INCOMPLETO)
**Problema:** Solo existe el repositorio, no hay servicio con lógica de negocio.

**Solución:** 
- Crear `IEnvioService` y `EnvioService`
- Implementar actualización de estado de envío
- Integrar con notificaciones al cambiar estado

### 2.2 Código Obsoleto (Limpiar)

| Archivo | Problema | Acción |
|---------|----------|--------|
| `PedidoService.cs` | Referencias a "ePayco" en líneas 109, 122, 128, 138 | Reemplazar por "Pago Simulado" o genérico |
| `PedidoService.cs` | Campos de pago ePayco en intento | Limpiar comentarios y lógica relacionada |
| `PagosController.cs` | Endpoint de ePayco (eliminado) | Verificar que no exista o eliminar |

### 2.3 Endpoints Faltantes

| Endpoint | Descripción | Prioridad |
|---------|-------------|-----------|
| `GET /api/categorias` | Obtener todas las categorías (si se usa CategoriaProducto) | Baja (actualmente no se usa) |
| `GET /api/pedidos/{id}/historial` | Obtener historial de cambios de estado | Media |
| `PATCH /api/envios/{id}/estado` | Actualizar estado del envío | Baja |
| `GET /api/inventario/alertas` | Productos con stock bajo el mínimo | Media |

### 2.4 DTOs a Completar o Crear

| DTO | Estado | Notas |
|-----|--------|-------|
| `PedidoHistorialResponseDto` | No existe | Necesario para mostrar historial |
| `EnvioResponseDto` | No existe | Necesario para tracking |
| `AlertaStockDto` | No existe | Para notificaciones de stock bajo |

### 2.5 Validaciones Faltantes

- Validar que el stock no sea negativo al descontar
- Validar cantidad máxima por producto (definido en ConfiguracionTienda pero no se usa)
- Validar rango de fechas en promociones (ya tiene `IValidatableObject`)

### 2.6 Configuración a Externalizar

Los siguientes valores están hardcodeados y deberían estar en appsettings.json:

| Valor | Ubicación Actual | Ubicación Sugerida |
|-------|------------------|-------------------|
| Costos de envío por comuna | `PedidoService.cs` lines 14-17 | appsettings.json |
| Compra mínima | `PedidoService.cs` line 89 + Frontend | ConfiguracionTienda (ya existe) |
| Estados de pedido | Varios archivos | Constantes o enum |

---

## 3. FRONTEND - Completar e Integrar

### 3.1 Páginas/Componentes Faltantes

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Historial de pedido | ❌ Falta | Mostrar `PedidoHistorial` en detalles del pedido |
| Seguimiento de envío | ❌ Falta | Mostrar estado del Envio |
| Alertas de stock | ❌ Falta | En admin, mostrar productos bajo stock |
| Gestión de categorías | ❌ Falta | CRUD de CategoriaProducto (si se usa) |
| Panel de repartidor completo | ⚠️ Parcial | Solo dashboard básico |

### 3.2 Integración Pendiente

| Pantalla | Datos a Mostrar | Estado |
|----------|-----------------|--------|
| Detalle de pedido (perfil) | Historial de cambios | ❌ No se muestra |
| Detalle de pedido (perfil) | Estado de envío | ❌ No se muestra |
| Dashboard admin | Productos bajo stock | ❌ No se muestra |
| Perfil | Último acceso | ❌ No se muestra |

### 3.3 Types a Completar

```typescript
// Agregar a types/index.ts

interface PedidoHistorial {
  id: number;
  pedidoId: number;
  estadoAnterior: string;
  estadoNuevo: string;
  fechaCambio: string;
  cambiadoPor: number;
  notas?: string;
}

interface Envio {
  id: number;
  pedidoId: number;
  repartidorId?: number;
  numeroGuia?: string;
  estado: string;
  fechaDespacho: string;
  fechaEntrega?: string;
}

interface AlertaStock {
  productoId: number;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
}
```

### 3.4 Mejoras de UX Pendientes

| Mejora | Prioridad | Descripción |
|--------|-----------|-------------|
| Loading states | Media | Algunos procesos no tienen feedback de carga |
| Error handling | Media | Pantallas de error más descriptivas |
| Optimistic updates | Baja | Actualizar UI antes de confirmar con API |
| Offline support | Baja | Carrito persistente sin conexión |

### 3.5 Rutas a Agregar/Modificar

| Ruta | Acción | Notas |
|------|--------|-------|
| `/admin/inventario` | Crear | Nueva página para gestión de inventario |
| `/repartidor/pedidos` | Mejorar | Lista de pedidos asignados con acciones |
| `/pedidos/{id}/seguimiento` | Crear | Página pública de seguimiento |

---

## 4. INTEGRACIÓN - Flujos a Completar

### 4.1 Flujo de Personalización (Incompleto)

**Actual:** Entidades definidas pero no hay flujo en frontend.

**Opciones:**
1. **Completar:** Crear selector de personalización en ProductDetail y checkout
2. **Eliminar:** Quitar las entidades de personalización del modelo

**Si se completa, necesarios:**
- Frontend: Componente de selección (sabor, tamaño, diseño, niveles)
- Backend: Servicio de cálculo de precio adicional
- Base de datos: Poblar tabla Ingredientes

### 4.2 Flujo de Seguimiento de Envío

**Actual:** Se crea Envio pero no se actualiza.

**Necesario:**
1. Backend: Endpoint para repartidor actualizar estado
2. Frontend: Mostrar tracking en detalle del pedido
3. Frontend (repartidor): Panel para actualizar estado

### 4.3 Flujo de Historial de Pedido

**Actual:** Se crea PedidoHistorial pero no se muestra.

**Necesario:**
1. Backend: Endpoint `GET /api/pedidos/{id}/historial`
2. Frontend: Mostrar línea de tiempo en detalles del pedido

---

## 5. PRIORIDADES DE IMPLEMENTACIÓN

### Alta Prioridad (Sistémicos)

| # | Tarea | Capa | Esfuerzo |
|---|-------|------|-----------|
| 1 | Limpiar código ePayco obsoleto | Backend | Bajo |
| 2 | Completar integración PedidoHistorial | Backend + Frontend | Medio |
| 3 | Validar stock negativo y límites | Backend | Bajo |
| 4 | Externalizar configuración hardcoded | Backend | Bajo |

### Media Prioridad (Funcionalidad)

| # | Tarea | Capa | Esfuerzo |
|---|-------|------|-----------|
| 5 | Implementar seguimiento de envío | Backend + Frontend | Medio |
| 6 | Mostrar alertas de stock bajo en admin | Backend + Frontend | Medio |
| 7 | Completar o eliminar personalización | DB + Backend + Frontend | Alto |
| 8 | Limpiar tablas fantasma (CategoriaProducto, etc) | DB | Bajo |

### Baja Prioridad (Mejora)

| # | Tarea | Capa | Esfuerzo |
|---|-------|------|-----------|
| 9 | Panel de repartidor completo | Frontend | Medio |
| 10 | Mejoras de UX (loading, errores) | Frontend | Bajo |
| 11 | Integrar con procesador de pagos real | Backend | Alto |
| 12 | Facturación electrónica (Dian) | Backend | Alto |

---

## 6. RECOMENDACIONES DE ARQUITECTURA

### 6.1 Limpieza de Código

```bash
# Pasos recomendados:
1. Eliminar referencias a "ePayco" en código
2. Eliminar columnas de pago ePayco en migrations
3. Decidir sobre CategoriaProducto: usar o eliminar
4. Decidir sobre Personalizado: completar o eliminar
```

### 6.2 Externalizar Configuración

```json
// appsettings.json - Agregar sección de tienda
{
  "Tienda": {
    "CostosEnvio": {
      "Guayabal": 5000,
      "Belén": 6000
    },
    "CompraMinima": 15000,
    "Moneda": "COP",
    "MaxUnidadesPorProducto": 10
  }
}
```

### 6.3 Monitoreo y Alertas

Considerar agregar:
- Logs de acciones importantes (creación de pedido, cambios de estado)
- Alertas de stock bajo (email o notificación interna)
- Métricas de uso

---

## Conclusión

El sistema tiene una base sólida pero requiere limpieza de código obsoleto y completamiento de funcionalidades parciales. Las prioridades inmediatas son:

1. **Limpiar ePayco** del código
2. **Completar historial de pedidos** (backend + frontend)
3. **Decidir destino de personalización** (completar o eliminar)
4. **Validaciones de negocio** (stock, límites)

Una vez tratadas estas áreas, el sistema estará más consistente y será más fácil de mantener y expandir.