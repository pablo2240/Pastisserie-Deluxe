# 13 - Mostrar nombre de usuario en reseñas

## Problema

El sistema de visualización de reseñas no mostraba los nombres de los usuarios:
1. **Home**: Mostraba solo la inicial 'P' (fallback) en lugar del nombre real
2. **Productos**: Mostraba "Cliente" en lugar del nombre del usuario que hizo la reseña

### Causa raíz

**El backend usa camelCase en la serialización JSON** (configuración por defecto de ASP.NET Core).

El backend envía:
- `nombreUsuario` (minúscula)
- `fecha` (minúscula)

El frontend esperaba:
- `NombreUsuario` (mayúscula)
- `Fecha` (mayúscula)

Esto causaba que los nombres no aparecieran porque TypeScript no encontraba las propiedades y usaba los valores por defecto ("Cliente", fallback 'P').

## Solución

Se actualizó el frontend para usar los nombres de campos en minúsculas que el backend envía (camelCase).

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `pastisserie-front/src/services/reviewService.ts` | Interfaz Review: `NombreUsuario` → `nombreUsuario`, `Fecha` → `fecha` |
| `pastisserie-front/src/pages/home.tsx` | Líneas 168, 172: Usa `review.nombreUsuario` |
| `pastisserie-front/src/components/ProductReviews.tsx` | Línea 149: Usa `rev.nombreUsuario`, línea 159: Usa `rev.fecha` |
| `pastisserie-front/src/pages/admin/resenasAdmin.tsx` | Línea 126, 129: Usa `rev.nombreUsuario`, línea 153: Usa `rev.fecha` |

## Cambios específicos

### 1. reviewService.ts - Interfaz Review
```typescript
// Antes
NombreUsuario: string;
Fecha: string;

// Después
nombreUsuario: string;
fecha: string;
```

### 2. home.tsx - Nombre de usuario
```tsx
// Antes
{review.NombreUsuario ? review.NombreUsuario.substring(0, 1) : 'P'}

// Después
{review.nombreUsuario ? review.nombreUsuario.substring(0, 1) : 'P'}
```

### 3. ProductReviews.tsx - Nombre y fecha
```tsx
// Antes línea 149
{rev.NombreUsuario || "Cliente"}

// Después
{rev.nombreUsuario || "Cliente"}

// Antes línea 159
{rev.Fecha ? new Date(rev.Fecha).toLocaleDateString() : 'Fecha no disponible'}

// Después
{rev.fecha ? new Date(rev.fecha).toLocaleDateString() : 'Fecha no disponible'}
```

### 4. resenasAdmin.tsx
```tsx
// Antes línea 126
{rev.NombreUsuario?.substring(0, 1).toUpperCase() || 'U'}

// Después
{rev.nombreUsuario?.substring(0, 1).toUpperCase() || 'U'}

// Antes línea 153
new Date(rev.Fecha || '')

// Después
new Date(rev.fecha || '')
```

## Cómo probarlo

1. Ejecutar el frontend: `npm run dev` en `pastisserie-front`
2. Navegar a la página Home - verificar que muestre el nombre completo del usuario en las reseñas destacadas
3. Ir a cualquier producto con reseñas - verificar que muestre el nombre del usuario en lugar de "Cliente"
4. Ir al admin de reseñas - verificar que muestre la fecha correctamente

## Impacto en el sistema

- **Backend**: Sin cambios (serialización camelCase por defecto)
- **Frontend**: Corrección de mapeo de campos en 4 archivos
- **Base de datos**: Sin cambios

---

## Nota técnica

El endpoint de debug reveló el JSON exacto que envía el backend:
```json
{
  "id": 2003,
  "usuarioId": 1001,
  "nombreUsuario": "alex",
  "productoId": 7,
  "calificacion": 5,
  "comentario": "muy rico recomendado con cafecito ",
  "fecha": "2026-03-25T21:24:33.0465558",
  "aprobada": true
}
```

Esto confirmó que ASP.NET Core usa camelCase por defecto en la serialización JSON.

---

# 13.2 - Mostrar todas las reseñas aprobadas en Home (sin filtro de estrellas)

## Problema

El endpoint `GetFeaturedAsync()` del backend solo mostraba reseñas de **5 estrellas** en la página Home, excluyendo reseñas válidas con 4, 3, 2 o 1 estrella.

## Solución

Se eliminó el filtro de estrellas, mostrando todas las reseñas aprobadas.

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `PastisserieAPI.Infrastructure/Repositories/ReviewRepository.cs` | Línea 59: Eliminado filtro `Calificacion == 5` |

## Cambios específicos

```csharp
// Antes (línea 59)
.Where(r => r.Calificacion == 5 && r.Aprobada)

// Después
.Where(r => r.Aprobada)
```

## Cómo probarlo

1. Reiniciar el servidor backend
2. Limpiar caché del navegador (Ctrl + Shift + R)
3. Navegar al Home
4. Verificar que aparezcan reseñas de cualquier número de estrellas (manteniendo el límite de 3)

## Impacto en el sistema

- **Backend**: Cambio en query de repositorio
- **Frontend**: Sin cambios
- **Base de datos**: Sin cambios
