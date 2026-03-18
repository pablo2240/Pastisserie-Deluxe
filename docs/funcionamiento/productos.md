# Funcionamiento real: Productos

## Flujos principales
- Listado de productos
- Detalle de producto
- Creación/edición de producto (admin)
- Eliminación de producto
- Filtros, orden, búsqueda

## Evidencia de código (end-to-end)
- Frontend: `pastisserie-front/src/services/productService.ts`, `pages/admin/productosAdmin.tsx`, `pages/productDetail.tsx`
- Backend: `PastisserieAPI.API/Controllers/ProductosController.cs`, `PastisserieAPI.Services/Services/ProductoService.cs`, `PastisserieAPI.Infrastructure/Repositories/ProductoRepository.cs`, `PastisserieAPI.Core/Entities/Producto.cs`

## Rutas y operaciones
- GET `/productos` → listado
- GET `/productos/{id}` → detalle
- POST `/productos` → crear
- PUT `/productos/{id}` → actualizar
- DELETE `/productos/{id}` → eliminar
- GET `/productos/activos` → activos

## Estado
- El flujo está **100% funcional**, UI → servicio → API → DB.
- Todas las operaciones CRUD operan y retornan estados correctos.
- El admin puede filtrar, buscar, ordenar, y el backend responde al instante.
- El usuario puede ver detalle, agregar al carrito, ver stock real.

## Relevancia técnica
- No hay endpoints rotos, pantallas desconectadas ni saltos lógicos.
- Todas las rutas coinciden y los tipos/payloads están alineados.

## Archivos clave
- Frontend: productService.ts, productosAdmin.tsx, productDetail.tsx
- Backend: ProductosController.cs, ProductoService.cs, ProductoRepository.cs, Producto.cs
