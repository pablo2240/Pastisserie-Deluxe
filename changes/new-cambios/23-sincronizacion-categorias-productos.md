# 23-Sincronizacion-Categorias-Productos

## Problema Identificado

Se detectaron problemas en el módulo de catálogo que afectan la coherencia entre categorías y productos:

### Issue 1: Categorías nuevas no aparecen en filtros del catálogo público
- **Síntoma**: Cuando el administrador crea una nueva categoría, esta no se refleja en los filtros del catálogo
- **Causa raíz**: El componente `catalogo.tsx` extraía categorías únicamente de los productos existentes:
  ```typescript
  const categorias = ['Todos', ...new Set(productos.map(p => p.categoriaNombre).filter(Boolean) as string[])];
  ```
  Esto significa que si no hay productos con esa categoría, no aparece en los filtros. Además, no había recarga dinámica cuando se crea una nueva categoría.

### Issue 2: Cambio de categoría en producto no se aplica correctamente
- **Síntoma**: Al editar un producto e intentar cambiar su categoría, el cambio no se guarda
- **Causa raíz**: El formData en productosAdmin.tsx tenía `categoriaId` pero no `categoriaProductoId`. El tipo Producto del frontend tiene `categoriaProductoId`, y al hacer cast a `Partial<Producto>`, el `categoriaId` no se mapeaba correctamente al campo esperado por el backend.

## Solución Implementada

### 1. Catalogo.tsx - Carga de categorías desde el sistema
- Agregado estado `categoriasSistema` para almacenar categorías del endpoint `/api/categorias`
- Agregada función `fetchCategoriasSistema` que consulta el endpoint de categorías
- Modificada la generación de lista de categorías para incluir tanto las del sistema como las de productos:
  ```typescript
  const categorias = ['Todos', ...new Set([
      ...categoriasSistema.map(c => c.nombre),
      ...productos.map(p => p.categoriaNombre).filter(Boolean) as string[]
  ])];
  ```
- Esto asegura que las categorías nuevas aparezcan en los filtros aunque no tengan productos asociados

### 2. ProductosAdmin.tsx - Fix para cambio de categoría
- En `handleInputChange`, ahora se actualizan ambos campos al seleccionar categoría:
  ```typescript
  setFormData(prev => ({ 
      ...prev, 
      categoria: value,
      categoriaId: selectedCat?.id || null,
      categoriaProductoId: selectedCat?.id || null  // Campo que espera el tipo Producto
  }));
  ```

## Archivos Modificados

- `pastisserie-front/src/pages/catalogo.tsx`
  - Agregado tipo `CategoriaSistema` 
  - Agregado estado `categoriasSistema`
  - Agregada función `fetchCategoriasSistema`
  - Modificada lógica de generación de categorías

- `pastisserie-front/src/pages/admin/productosAdmin.tsx`
  - En `handleInputChange`, ahora se actualiza `categoriaProductoId` junto con `categoriaId`

## Estado: ✅ COMPLETADO

El backend ya tenía la configuración correcta:
- `/api/categorias` retorna categorías activas
- AutoMapper mapea correctamente `CategoriaProductoId`
- El controller actualiza el producto correctamente