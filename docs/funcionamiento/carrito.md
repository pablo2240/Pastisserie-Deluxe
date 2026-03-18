# Funcionamiento real: Carrito de Compras

## Flujos principales
- Ver carrito
- Añadir item
- Modificar cantidad
- Eliminar item
- Vaciar carrito
- Validación negocio mínima/stock/promoción

## Evidencia de código (end-to-end)
- Frontend: `pastisserie-front/src/services/cartService.ts`, `pages/carrito.tsx`, context `CartContext`
- Backend: `PastisserieAPI.API/Controllers/CarritoController.cs`, `PastisserieAPI.Services/Services/CarritoService.cs`, `PastisserieAPI.Infrastructure/Repositories/CarritoRepository.cs`, `PastisserieAPI.Core/Entities/CarritoItem.cs`, `CarritoCompra.cs`

## Rutas y operaciones
- GET `/carrito` → obtener
- POST `/carrito/items` → añadir
- PUT `/carrito/items/{id}` → actualizar
- DELETE `/carrito/items/{id}` → eliminar
- DELETE `/carrito/clear` → vaciar

## Estado
- El flujo está **completo y conectado**, UI → servicio → API → DB.
- Los métodos de frontend llaman rutas backend y muestran feedback inmediato.
- El código cubre los edge case de stock, promociones y mínima compra.

## Relevancia técnica
- No hay desconexiones ni endpoints rotos.
- Validación de errores, autenticación, y feedback correctos.

## Archivos clave
- Frontend: cartService.ts, carrito.tsx, CartContext
- Backend: CarritoController.cs, CarritoService.cs, CarritoRepository.cs, CarritoItem.cs, CarritoCompra.cs
