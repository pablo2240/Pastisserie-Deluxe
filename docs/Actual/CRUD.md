# Auditoría de CRUD - Estado Actual del Sistema

## Resumen Ejecutivo

Este documento presenta un análisis completo del estado de las operaciones CRUD (Crear, Leer, Actualizar, Eliminar) en el sistema PastisserieDeluxe. El análisis abarca las tres capas del proyecto: Base de Datos, Backend y Frontend.

---

## 1. Estado General del CRUD por Capa

### 1.1 Base de Datos ✅

| Entidad | Tabla | Estado CRUD | Notas |
|---------|-------|-------------|-------|
| Productos | `Productos` | ✅ Completo | Campo `Activo` para soft-delete |
| Categorías | `CategoriasProducto` | ✅ Completo | Entidad existe pero desconectada del modelo de productos |
| Pedidos | `Pedidos` | ✅ Completo | Estados manejan lifecycle |
| Usuarios | `Users` | ✅ Completo | Roles manejan acceso |
| Promociones | `Promociones` | ✅ Completo | Soporta independientes y vinculadas |
| Reviews | `Reviews` | ✅ Completo | Campo `Aprobada` para moderación |
| Reclamaciones | `Reclamaciones` | ✅ Completo | Estados: Pendiente, EnRevision, Resuelta, Rechazada |
| Carrito | `Carritos`, `CarritoItems` | ✅ Completo | Por usuario |
| Configuración | `ConfiguracionTienda` | ✅ Completo | Store-wide settings |

### 1.2 Backend ✅

| Controller | Endpoints | Estado |
|------------|-----------|--------|
| AuthController | 10 | ✅ Completo |
| ProductosController | 6 | ✅ Completo |
| CategoriasController | 4 | ✅ Completo (con observación) |
| PromocionesController | 5 | ✅ Completo |
| PedidosController | 10 | ✅ Completo |
| UsersController | 6 | ✅ Completo |
| ReviewsController | 8 | ✅ Completo |
| CarritoController | 5 | ✅ Completo |
| PagosController | 4 | ✅ Completo (simulado) |
| ConfiguracionController | 2 | ✅ Completo |
| DashboardController | 3 | ✅ Completo |

**Observación**: El `CategoriasController` usa formato de respuesta diferente (objetos anónimos en lugar de `ApiResponse<T>`).

### 1.3 Frontend Admin ⚠️ PARCIAL

| Página | Create | Read | Update | Delete |
|--------|--------|------|---------|--------|
| productosAdmin.tsx | ✅ Working | ✅ Working | ✅ Working | ✅ Working |
| promocionesAdmin.tsx | ✅ Working | ✅ Working | ✅ Working | ✅ Working |
| categoriasAdmin.tsx | ❌ **BROKEN** | ✅ Working | ❌ **BROKEN** | ✅ Working |
| usuariosAdmin.tsx | ✅ Working | ✅ Working | ✅ Working | ❌ Missing |
| pedidosAdmin.tsx | N/A | ✅ Working | ✅ Working | ✅ Working |
| resenasAdmin.tsx | N/A | ✅ Working | ⚠️ Partial | ✅ Working |

---

## 2. Funcionalidades Completamente Funcionales

### 2.1 Productos (Backend + Frontend) ✅

**Flujo completo:**
```
Frontend (productosAdmin) 
  → POST /api/productos 
  → Backend crea registro 
  → Frontend muestra en lista
  
Frontend (catalogo) 
  → GET /api/productos 
  → Backend retorna activos 
  → Frontend filtra por Activo = true
```

**Características:**
- Create: Modal con todos los campos (Nombre, Descripcion, Precio, Stock, Categoria, ImagenUrl, EsPersonalizable)
- Read: Lista con búsqueda, filtrado por categoría, ordenamiento
- Update: Modal de edición con datos precargados
- Delete: Soft-delete (campo Activo = false)
- Upload: Integración con UploadController para imágenes

### 2.2 Promociones (Backend + Frontend) ✅

**Flujo completo:**
```
Frontend (promocionesAdmin)
  → POST /api/promociones
  → Backend crea
  → Frontend muestra en lista
```

**Características:**
- Dos tipos: Vinculadas a producto e Independientes
- Descuentos: Porcentaje o monto fijo
- Fechas de vigencia
- Stock para independientes
- Validación de fechas

### 2.3 Pedidos (Backend + Frontend) ✅

**Flujo completo:**
```
Frontend (carrito/checkout)
  → POST /api/pedidos
  → Backend crea pedido
  → Frontend redirige a pago

Frontend (perfil)
  → GET /api/pedidos/mis-pedidos
  → Backend retorna pedidos del usuario
```

**Características:**
- Creación desde checkout
- Cambio de estado (Pendiente → Confirmado → EnProceso → Listo → EnCamino → Entregado)
- Asignación de repartidor
- Historial de cambios
- Factura PDF

---

## 3. Inconsistencias y Problemas Identificados

### 3.1 Categorías (CRUD Incompleto) ❌

**Problema:** La página de categorías en admin tiene los botones de crear y editar sin funcionalidad.

**Ubicación:** `pastisserie-front/src/pages/admin/categoriasAdmin.tsx`

```tsx
// Líneas 51-53 - Botón crear SIN onClick
<button
  onClick={() => {}}  // ❌ VACÍO - NO HACE NADA
  className="..."
>
  <FiPlus /> Nueva Categoría
</button>

// Línea 79 - Botón editar SIN onClick
<button
  onClick={() => {}}  // ❌ VACÍO - NO HACE NADA
  className="..."
>
  <FiEdit2 />
</button>
```

**Estado actual:**
| Operación | Estado | Backend | Frontend |
|------------|--------|---------|----------|
| Create | ❌ No funciona | ✅ Endpoint existe | ❌ Sin handler |
| Read | ✅ Funciona | ✅ GET /categorias | ✅ Muestra lista |
| Update | ❌ No funciona | ✅ Endpoint existe | ❌ Sin handler |
| Delete | ✅ Funciona | ✅ DELETE /categorias | ✅ Botón funciona |

**Servicio disponible:** El `categoriasService.ts` tiene los métodos `create()` y `update()` pero no están conectados al UI.

---

### 3.2 Usuarios (Delete Faltante) ⚠️

**Problema:** No hay funcionalidad para eliminar usuarios en el panel de admin.

**Ubicación:** `pastisserie-front/src/pages/admin/usuariosAdmin.tsx`

**Estado actual:**
| Operación | Estado | Backend | Frontend |
|------------|--------|---------|----------|
| Create | ✅ Funciona | ✅ POST /users | ✅ Modal funciona |
| Read | ✅ Funciona | ✅ GET /users | ✅ Tabla funciona |
| Update (Status) | ✅ Funciona | ✅ PATCH /users/{id}/status | ✅ Toggle funciona |
| Update (Role) | ✅ Funciona | ✅ PATCH /users/{id}/role | ✅ Select funciona |
| Delete | ❌ No existe | ✅ DELETE /users/{id} | ❌ Sin botón |

---

### 3.3 Reviews (Edit Faltante) ⚠️

**Problema:** No se pueden editar las reseñas (calificación o comentario) una vez creadas.

**Ubicación:** `pastisserie-front/src/pages/admin/resenasAdmin.tsx`

**Estado actual:**
| Operación | Estado | Backend | Frontend |
|------------|--------|---------|----------|
| Read | ✅ Funciona | ✅ GET /reviews | ✅ Tabla funciona |
| Approve | ✅ Funciona | ✅ PUT /reviews/{id}/aprobar | ✅ Botón funciona |
| Delete | ✅ Funciona | ✅ DELETE /reviews/{id} | ✅ Botón funciona |
| Update | ❌ No existe | ❌ Endpoint no existe | ❌ No hay UI |

**Nota:** El backend no tiene endpoint para actualizar una review existente.

---

### 3.4 Campo Activo en Productos - Sincronización ⚠️

**Problema identificado:**

El frontend del catálogo (`catalogo.tsx`) filtra productos activos manualmente:

```tsx
// catalogo.tsx línea 36
const productosValidos = data.filter(p => p && p.activo !== false);
```

Esto significa que el backend retorna TODOS los productos (activos e inactivos) y el frontend filtra en cliente.

**Comportamiento esperado:**
- El backend debería filtrar solo `Activo = true` en el endpoint público
- El admin ve todos los productos (activos e inactivos)

**Actual:**
- GET /api/productos retorna todos (para admin)
- GET /api/productos/activos retorna solo activos (para catálogo público)
- Frontend aplica filtro adicional por seguridad

---

### 3.5 CategoriaProducto - Entidad Desconectada ⚠️

**Problema:** La entidad `CategoriaProducto` existe en la base de datos pero no está vinculada a `Producto`.

**Situación:**
| Componente | Estado | Notas |
|------------|---------|-------|
| Tabla DB | ✅ Existe | `CategoriasProducto` |
| Entity | ✅ Existe | `CategoriaProducto.cs` |
| DbSet | ✅ Existe | `CategoriasProducto` |
| Controller | ✅ Existe | CRUD completo |
| Frontend Admin | ✅ Existe | `categoriasAdmin.tsx` |
| Relación con Producto | ❌ NO EXISTE | Productos usan string Categoria |

**Impacto:**
- Admin puede crear/gestionar categorías
- Los productos usan el campo `Producto.Categoria` (string) libre
- No hay forma de asignar una categoría a un producto desde el UI

---

## 4. Elementos Fantasma Identificados

### 4.1 Funcionalidades Sin Soporte Backend

| Frontend | Backend | Estado |
|----------|---------|--------|
| Editar Review | ❌ No existe endpoint | No se puede editar rating/comentario |
| Eliminar Usuario | ✅ Existe endpoint | Sin embargo, no hay botón en UI |
| Crear Pedido (Admin) | ❌ No existe | Los pedidos se crean desde checkout |

### 4.2 Tablas/Entidades Sin Uso Real

| Entidad | Uso Real | Notas |
|---------|----------|-------|
| CategoriaProducto | ❌ Parcial | Existe CRUD pero desconectada de productos |
| Ingrediente | ❌ Eliminado | Removed in LimpiezaEstructural-Fase1 |
| PersonalizadoConfig | ❌ Eliminado | Removed in LimpiezaEstructural-Fase1 |

---

## 5. Flujos de Datos por Entidad

### 5.1 Productos ✅

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│    Backend   │────▶│      BD     │
│ productos   │     │ Productos    │     │ Productos  │
│ Admin       │     │ Controller   │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
      │                    │                    │
      │ POST               │ INSERT             │
      │ ◀── OK ──────────▶ │ ◀── OK ──────────▶│
      │                    │                    │
      │ GET                │ SELECT             │
      │ ◀── lista ────────▶│ ◀── lista ────────▶│
      │                    │                    │
      │ PUT                │ UPDATE             │
      │ ◀── OK ──────────▶ │ ◀── OK ──────────▶│
      │                    │                    │
      │ DELETE             │ UPDATE (Activo=0)  │
      │ ◀── OK ──────────▶ │ ◀── OK ──────────▶│
```

### 5.2 Categorías ❌ (Incompleto)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│    Backend   │────▶│      BD     │
│ categorias  │     │ Categorias   │     │ Categorias  │
│ Admin       │     │ Controller   │     │ Producto    │
└─────────────┘     └──────────────┘     └─────────────┘
      │                    │                    │
      │ POST (❌)         │ INSERT             │
      │ ◀── ERROR ──────▶│ ◀── OK ──────────▶│
      │                    │                    │
      │ GET                │ SELECT             │
      │ ◀── lista ────────▶│ ◀── lista ────────▶│
      │                    │                    │
      │ PUT (❌)          │ UPDATE             │
      │ ◀── ERROR ──────▶│ ◀── OK ──────────▶│
      │                    │                    │
      │ DELETE            │ DELETE             │
      │ ◀── OK ──────────▶│ ◀── OK ──────────▶│
```

---

## 6. Resumen de Estado CRUD

### Completo y Funcional ✅

| Entidad | Create | Read | Update | Delete |
|---------|--------|------|---------|--------|
| Productos | ✅ | ✅ | ✅ | ✅ |
| Promociones | ✅ | ✅ | ✅ | ✅ |
| Pedidos | N/A | ✅ | ✅ | ✅ |
| Usuarios | ✅ | ✅ | ✅ | ❌ |
| Reviews | N/A | ✅ | ❌ | ✅ |
| Configuración | N/A | ✅ | ✅ | N/A |

### Incompleto/Con Problemas ❌

| Entidad | Create | Read | Update | Delete |
|---------|--------|------|---------|--------|
| Categorías | ❌ | ✅ | ❌ | ✅ |

---

## 7. Recomendaciones de Corrección

### Prioridad Alta

1. **Corregir categoriasAdmin.tsx**
   - Agregar handler para botón Crear nueva categoría
   - Agregar handler para botón Editar categoría
   - Conectar con `categoriasService.create()` y `categoriasService.update()`

2. **Agregar delete en usuariosAdmin.tsx**
   - Agregar botón de eliminar usuario
   - Conectar con endpoint existente `DELETE /api/users/{id}`

### Prioridad Media

3. **Agregar endpoint para editar review**
   - Backend: Agregar PUT /api/reviews/{id}
   - Frontend: Agregar modal de edición en resenasAdmin

4. **Decidir sobre CategoriaProducto**
   - Opción A: Eliminar la tabla y mantener solo el string en Producto
   - Opción B: Implementar FK real y conectar con productos

### Prioridad Baja

5. **Refactorizar filtro de productos activos**
   - Mover filtro `Activo = true` al backend en endpoint público
   - Simplificar código frontend

---

## 8. Conclusión

### Estado General

| Métrica | Porcentaje |
|---------|-------------|
| CRUDs completamente funcionales | ~75% |
| CRUDs con problemas menores | ~17% |
| CRUDs rotos | ~8% |

### Puntos Críticos

1. **Categorías** - CRUD roto en frontend (no persistence)
2. **Usuarios** - Delete no disponible en UI
3. **Reviews** - No se pueden editar

### Fortalezas

1. Productos CRUD completo y funcional
2. Promociones CRUD completo y funcional
3. Pedidos gestión completa
4. Backend consistente con ApiResponse<T>

---

*Documento generado el 2026-03-26 como parte de la auditoría del sistema PastisserieDeluxe.*
