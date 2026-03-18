# Funcionamiento real: Pedidos

## Flujos principales
- Crear pedido (checkout)
- Obtener pedidos usuario
- Obtener todos los pedidos (admin)
- Cambiar estado
- Asignar repartidor
- Eliminar pedido
- Generar factura PDF

## Evidencia de código (end-to-end)
- Frontend: `pastisserie-front/src/services/orderService.ts`, `pages/admin/pedidosAdmin.tsx`
- Backend: `PastisserieAPI.API/Controllers/PedidosController.cs`, `PastisserieAPI.Services/Services/PedidoService.cs`, `PastisserieAPI.Infrastructure/Repositories/PedidoRepository.cs`, `PastisserieAPI.Core/Entities/Pedido.cs`, `PedidoItem.cs`, `EstadoPedido.cs`

## Rutas y operaciones
- POST `/pedidos` → crear
- GET `/pedidos/mis-pedidos` → usuario
- GET `/pedidos/todos` → admin
- PUT `/pedidos/{id}/estado` → actualizar
- PATCH `/pedidos/{id}/asignar-repartidor` → logística
- DELETE `/pedidos/{id}` → eliminar
- GET `/pedidos/{id}/factura` → PDF

## Estado
- El flujo está **completo y funcional** extremo a extremo.
- Todas las operaciones, rutas y respuestas están alineadas entre frontend y backend.
- El admin puede gestionar estados, asignar repartidores y eliminar pedidos; el usuario puede ver y crear pedidos.

## Relevancia técnica
- No hay endpoints fallando ni funcionalidades desconectadas.
- Validación de autenticación y roles según evidencia.

## Archivos clave
- Frontend: orderService.ts, pedidosAdmin.tsx
- Backend: PedidosController.cs, PedidoService.cs, PedidoRepository.cs, Pedido.cs, PedidoItem.cs, EstadoPedido.cs
