# 15 - Sistema de Facturación con Dirección de Envío

## Problema resuelto

El sistema de facturación ahora garantiza **integridad de datos**:
1. Los datos de envío se capturan estáticamente al confirmar el pedido
2. La factura usa exclusivamente los datos del checkout, no del perfil
3. Los cambios en el perfil NO afectan las facturas históricas
4. El checkout autocompleta datos desde el perfil como sugerencia

## Archivos modificados

| Capa | Archivo |
|------|---------|
| Backend | `PastisserieAPI.Core/Entities/User.cs` |
| Backend | `PastisserieAPI.Services/DTOs/Request/UpdateUserRequestDto.cs` |
| Backend | `PastisserieAPI.Services/DTOs/Response/UserResponseDto.cs` |
| Backend | `PastisserieAPI.Services/DTOs/Request/CreatePedidoRequestDto.cs` |
| Backend | `PastisserieAPI.Services/Services/AuthService.cs` |
| Backend | `PastisserieAPI.Services/Services/PedidoService.cs` |
| Backend | `PastisserieAPI.Services/Services/InvoiceService.cs` |
| Backend | `PastisserieAPI.Infrastructure/Repositories/PedidoRepository.cs` |
| Backend | `PastisserieAPI.Infrastructure/Repositories/UnitOfWork.cs` |
| Backend | `PastisserieAPI.Core/Interfaces/IUnitOfWork.cs` |
| Frontend | `pastisserie-front/src/pages/perfil.tsx` |
| Frontend | `pastisserie-front/src/pages/checkout.tsx` |
| Frontend | `pastisserie-front/src/types/index.ts` |

## Cambios implementados

### 1. Backend - PedidoService.cs (CAMBIO CLAVE)
- Al crear un pedido, se crea una nueva entidad `DireccionEnvio` con los datos del checkout
- Esta dirección queda asociada al pedido y es **inmutable**
- Los datos se capturan: dirección, comuna, teléfono, notas como referencia

### 2. Backend - InvoiceService.cs (CAMBIO CLAVE)
- La sección "FACTURADO A:" ahora usa exclusivamente `pedido.DireccionEnvio` (datos del checkout)
- Ya NO usa datos del perfil del usuario
- La sección "DIRECCIÓN DE ENVÍO" muestra los datos guardados en el pedido

### 3. Backend - CreatePedidoRequestDto.cs
- Agregado campo `Telefono` para capturar el teléfono del checkout

### 4. Backend - UnitOfWork.cs / IUnitOfWork.cs
- Agregado repositorio `DireccionesEnvio` para guardar direcciones de envío

### 5. Frontend - checkout.tsx
- Autocompletado de dirección y teléfono desde el perfil del usuario
- Mensaje de提示: "Algunos datos han sido autocompletados desde tu perfil. Puedes modificarlos antes de confirmar tu pedido."
- El usuario puede editar los datos antes de confirmar

### 6. Frontend - perfil.tsx
- Muestra la dirección del pedido (datos del checkout)
- Si no hay dirección de envío, muestra la dirección del perfil como fallback

### 7. Otros cambios (de tarea anterior)
- Campo `Direccion` en User, UpdateUserRequestDto, UserResponseDto
- Migración `AddDireccionToUser`

## Cómo probarlo

1. Ejecutar la migración: `dotnet ef database update`
2. Iniciar sesión como usuario
3. Actualizar el perfil con una dirección y teléfono
4. Ir al checkout y verificar:
   - Los campos se autocompletan desde el perfil
   - Aparece el mensaje de autocompletado
   - El usuario puede modificar los datos
5. Confirmar el pedido
6. Ir a "Mis Pedidos" > "Ver detalles"
7. Verificar que muestra los datos del checkout (no del perfil)
8. Descargar la factura PDF y verificar que usa datos del pedido
9. Cambiar la dirección en el perfil
10. Verificar que el pedido y factura NO cambian (integridad de datos)

## Impacto en el sistema

- **Backend**: Creación de DireccionEnvio al crear pedido
- **Frontend**: Autocompletado desde perfil + mensaje de提示
- **Base de datos**: Nueva columna `Direccion` en tabla Users
- **Integridad**: Las facturas son inmutables - no se ven afectadas por cambios en el perfil
