# Plan de Solución - Corrección CRUD

## Resumen

Este documento presenta las soluciones estructuradas para los problemas identificados en la auditoría CRUD documentada en `CRUD.md`. Las correcciones se priorizan por impacto y complejidad.

---

## Problemas Identificados y Soluciones

### 1. Categorías - CRUD Incompleto (Prioridad ALTA)

**Problema:** Los botones de Crear y Editar en `categoriasAdmin.tsx` no tienen funcionalidad.

**Estado actual:**
- Backend: ✅ Endpoint existe y funciona
- Frontend: ❌ Sin handlers para Create/Update

**Solución:** Conectar los métodos del servicio con la UI.

#### Cambios requeridos en `categoriasAdmin.tsx`:

```tsx
// AGREGAR ESTADOS
const [showModal, setShowModal] = useState(false);
const [editando, setEditando] = useState<Categoria | null>(null);
const [formData, setFormData] = useState({ nombre: '', descripcion: '' });

// HANDLERS
const handleCrear = async () => {
  try {
    await categoriasService.create(formData);
    setShowModal(false);
    fetchCategorias();
    toast.success('Categoría creada');
  } catch (error) {
    toast.error('Error al crear categoría');
  }
};

const handleEditar = async () => {
  if (!editando) return;
  try {
    await categoriasService.update(editando.id, formData);
    setShowModal(false);
    setEditando(null);
    fetchCategorias();
    toast.success('Categoría actualizada');
  } catch (error) {
    toast.error('Error al actualizar categoría');
  }
};

// BOTONES
// Crear: onClick={() => setShowModal(true)}
// Editar: onClick={() => { setEditando(cat); setShowModal(true); }}
```

---

### 2. Usuarios - Delete Faltante (Prioridad ALTA)

**Problema:** No hay botón de eliminar usuario en el panel de admin, aunque el endpoint existe.

**Estado actual:**
- Backend: ✅ DELETE /api/users/{id} existe
- Frontend: ❌ Sin botón en UI

**Solución:** Agregar botón de eliminar en la tabla de usuarios.

#### Cambios requeridos en `usuariosAdmin.tsx`:

```tsx
// AGREGAR FUNCIÓN
const handleDeleteUser = async (id: number) => {
  if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
  
  try {
    await api.delete(`/users/${id}`);
    fetchUsuarios();
    toast.success('Usuario eliminado');
  } catch (error) {
    toast.error('Error al eliminar usuario');
  }
};

// AGREGAR BOTÓN EN LA TABLA
<button
  onClick={() => handleDeleteUser(usuario.id)}
  className="text-red-500 hover:text-red-700"
>
  <FiTrash2 />
</button>
```

---

### 3. Reviews - Edit No Existe (Prioridad MEDIA)

**Problema:** No se pueden editar las reseñas (calificación o comentario).

**Estado actual:**
- Backend: ❌ No existe endpoint PUT /api/reviews/{id}
- Frontend: ❌ No hay UI

**Solución:** Crear endpoint y conectar con UI.

#### Backend - Agregar en ReviewsController:

```csharp
[HttpPut("{id}")]
[Authorize]
public async Task<IActionResult> Update(int id, [FromBody] UpdateReviewRequestDto request)
{
    var review = await _context.Reviews.FindAsync(id);
    if (review == null) return NotFound();
    
    review.Calificacion = request.Calificacion;
    review.Comentario = request.Comentario;
    review.FechaActualizacion = DateTime.UtcNow;
    
    await _context.SaveChangesAsync();
    return Ok(ApiResponse<ReviewResponseDto>.SuccessResponse(_mapper.Map<ReviewResponseDto>(review)));
}
```

#### Frontend - Agregar en resenasAdmin.tsx:

```tsx
// AGREGAR ESTADO Y MODAL
const [editando, setEditando] = useState<Review | null>(null);

const handleActualizar = async () => {
  if (!editando) return;
  try {
    await reviewService.update(editando.id, {
      calificacion: editando.calificacion,
      comentario: editando.comentario
    });
    setEditando(null);
    fetchReviews();
    toast.success('Reseña actualizada');
  } catch (error) {
    toast.error('Error al actualizar');
  }
};
```

---

### 4. CategoriaProducto - Entidad Desconectada (Prioridad BAJA)

**Problema:** La entidad existe pero no está vinculada a productos.

**Opciones:**

#### Opción A: Eliminar (Recomendado si no se usará)
1. Eliminar tabla `CategoriasProducto`
2. Eliminar controller y frontend relacionado
3. Mantener campo string en Producto

#### Opción B: Implementar FK
1. Agregar FK en entity Producto
2. Modificar migración
3. Actualizar frontend para usar selector
4. Conectar con crear/editar producto

---

## Plan de Implementación

### Fase 1: Correcciones Críticas (Inmediato)

| # | Tarea | Archivos | Esfuerzo |
|---|-------|----------|----------|
| 1.1 | Corregir Create en categoriasAdmin | categoriasAdmin.tsx | Bajo |
| 1.2 | Corregir Update en categoriasAdmin | categoriasAdmin.tsx | Bajo |
| 1.3 | Agregar Delete en usuariosAdmin | usuariosAdmin.tsx | Bajo |

### Fase 2: Mejoras (Próxima iteración)

| # | Tarea | Archivos | Esfuerzo |
|---|-------|----------|----------|
| 2.1 | Agregar endpoint Update Review | ReviewsController.cs | Medio |
| 2.2 | Agregar UI Edit Review | resenasAdmin.tsx | Medio |

### Fase 3: Decisión Arquitectura (Planificación)

| # | Tarea | Notas |
|---|-------|-------|
| 3.1 | Decidir destino CategoriaProducto | Eliminar o implementar FK |

---

## Especificación Técnica de Cambios

### 1. categoriasAdmin.tsx

```typescript
// Imports necesarios
import { categoriasService } from '../../services/categoriasService';
import { toast } from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

// Agregar estados
const [showModal, setShowModal] = useState(false);
const [categoriaEditando, setCategoriaEditando] = useState<any>(null);
const [formData, setFormData] = useState({ nombre: '', descripcion: '' });

// Funciones handler
const handleCrearCategoria = async () => {
  try {
    await categoriasService.create(formData);
    setShowModal(false);
    setFormData({ nombre: '', descripcion: '' });
    fetchCategorias();
    toast.success('Categoría creada exitosamente');
  } catch (error) {
    toast.error('Error al crear categoría');
  }
};

const handleEditarCategoria = async () => {
  if (!categoriaEditando) return;
  try {
    await categoriasService.update(categoriaEditando.id, formData);
    setShowModal(false);
    setCategoriaEditando(null);
    setFormData({ nombre: '', descripcion: '' });
    fetchCategorias();
    toast.success('Categoría actualizada');
  } catch (error) {
    toast.error('Error al actualizar categoría');
  }
};

const abrirEditar = (categoria: any) => {
  setCategoriaEditando(categoria);
  setFormData({ nombre: categoria.nombre, descripcion: categoria.descripcion || '' });
  setShowModal(true);
};

// Botón crear (línea ~51)
<button
  onClick={() => { setShowModal(true); setCategoriaEditando(null); setFormData({ nombre: '', descripcion: '' }); }}
  className="..."
>

// Botón editar (línea ~79)
<button
  onClick={() => abrirEditar(categoria)}
  className="..."
>
  <FiEdit2 />
</button>

// Modal (agregar al final del componente)
{showModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
      <h3 className="text-lg font-bold mb-4">
        {categoriaEditando ? 'Editar Categoría' : 'Nueva Categoría'}
      </h3>
      <input
        type="text"
        value={formData.nombre}
        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
        placeholder="Nombre de categoría"
        className="w-full border rounded p-2 mb-4"
      />
      <textarea
        value={formData.descripcion}
        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
        placeholder="Descripción (opcional)"
        className="w-full border rounded p-2 mb-4"
      />
      <div className="flex gap-2">
        <button
          onClick={categoriaEditando ? handleEditarCategoria : handleCrearCategoria}
          className="flex-1 bg-patisserie-red text-white py-2 rounded"
        >
          {categoriaEditando ? 'Actualizar' : 'Crear'}
        </button>
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 border rounded"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}
```

### 2. usuariosAdmin.tsx

```typescript
// Función agregar
const handleDeleteUser = async (userId: number) => {
  if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
    return;
  }
  
  try {
    await api.delete(`/users/${userId}`);
    fetchUsuarios();
    toast.success('Usuario eliminado correctamente');
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Error al eliminar usuario');
  }
};

// En la tabla, agregar columna o botón
<button
  onClick={() => handleDeleteUser(usuario.id)}
  className="text-red-500 hover:text-red-700 p-2"
  title="Eliminar usuario"
>
  <FiTrash2 size={18} />
</button>
```

### 3. Backend - Review Update

```csharp
// ReviewsController.cs - Agregar DTO y endpoint
public class UpdateReviewRequestDto
{
    public int Calificacion { get; set; }
    public string Comentario { get; set; }
}

[HttpPut("{id}")]
[Authorize]
public async Task<IActionResult> Update(int id, [FromBody] UpdateReviewRequestDto request)
{
    var review = await _context.Reviews.FindAsync(id);
    if (review == null)
        return NotFound(ApiResponse.ErrorResponse("Reseña no encontrada"));
    
    // Verificar propiedad
    var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (!User.IsInRole("Admin") && review.UsuarioId.ToString() != userIdStr)
        return Forbid();
    
    review.Calificacion = request.Calificacion;
    review.Comentario = request.Comentario;
    review.FechaActualizacion = DateTime.UtcNow;
    
    await _context.SaveChangesAsync();
    return Ok(ApiResponse<ReviewResponseDto>.SuccessResponse(
        _mapper.Map<ReviewResponseDto>(review)
    ));
}
```

---

## Verificación Post-Implementación

```bash
# Backend
dotnet build PastisserieAPI.sln

# Frontend  
npm run build
```

### Pruebas de aceptación:

1. **Categorías**
   - [ ] Crear nueva categoría → Aparece en lista
   - [ ] Editar categoría existente → Cambios persisten
   - [ ] Eliminar categoría → Desaparece de lista

2. **Usuarios**
   - [ ] Eliminar usuario → Ya no aparece en lista
   - [ ] Confirmar eliminación → Toast de éxito

3. **Reviews**
   - [ ] Editar calificación → Se actualiza
   - [ ] Editar comentario → Se actualiza

---

## Archivos a Modificar

### Backend (1 archivo)
| Archivo | Cambio |
|---------|--------|
| `ReviewsController.cs` | Agregar endpoint PUT |

### Frontend (3 archivos)
| Archivo | Cambio |
|---------|--------|
| `categoriasAdmin.tsx` | Agregar Create/Update handlers y modal |
| `usuariosAdmin.tsx` | Agregar botón Delete |
| `resenasAdmin.tsx` | Agregar Edit modal |

---

## Notas Adicionales

1. **Seguridad:** Verificar que solo el usuario propietario o Admin pueda editar reviews
2. **Validaciones:** Agregar validación de campos (nombre requerido, calificación 1-5)
3. **Confirmaciones:** Agregar confirm() antes de delete para evitar accidentes
4. **Feedback:** Mostrar toast de éxito/error después de cada operación

---

## Conclusión

Este plan proporciona soluciones específicas para cada problema identificado:

| Prioridad | Problema | Solución |
|-----------|----------|----------|
| Alta | Categorías Create/Update | Conectar handlers |
| Alta | Usuarios Delete | Agregar botón |
| Media | Reviews Edit | Crear endpoint + UI |
| Baja | CategoriaProducto | Decidir destino |

La implementación de estas correcciones elevará el funcionamiento CRUD del ~75% actual a ~95%.

---

*Documento generado el 2026-03-26 como plan de corrección del sistema PastisserieDeluxe.*
