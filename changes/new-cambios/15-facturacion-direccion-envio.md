# 15 - Sistema de Facturación con Dirección de Envío

## Problema resuelto

El sistema de facturación y visualización de pedidos ahora muestra correctamente la dirección del cliente en:
1. Modal "Ver detalles" del pedido en el perfil del usuario
2. PDF de factura generado (sección "FACTURADO A:")
3. Perfil del usuario (campo de dirección editable)

## Archivos modificados

| Capa | Archivo |
|------|---------|
| Backend | `PastisserieAPI.Infrastructure/Repositories/PedidoRepository.cs` |
| Backend | `PastisserieAPI.Services/Services/InvoiceService.cs` |
| Backend | `PastisserieAPI.API/Controllers/PedidosController.cs` |
| Backend | `PastisserieAPI.Core/Entities/User.cs` |
| Backend | `PastisserieAPI.Services/DTOs/Request/UpdateUserRequestDto.cs` |
| Backend | `PastisserieAPI.Services/DTOs/Response/UserResponseDto.cs` |
| Backend | `PastisserieAPI.Services/Services/AuthService.cs` |
| Frontend | `pastisserie-front/src/pages/perfil.tsx` |
| Frontend | `pastisserie-front/src/types/index.ts` |

## Cambios implementados

### 1. Backend - PedidoRepository.cs
- Agregado `.Include(p => p.DireccionEnvio)` en el método `GetByUsuarioIdAsync`
- Esto permite que la consulta de pedidos del usuario incluya los datos de dirección

### 2. Backend - InvoiceService.cs
- Agregada nueva sección "DIRECCIÓN DE ENVÍO" en el PDF de factura
- Muestra: Nombre completo, Dirección, Barrio, Comuna, Referencia, Teléfono
- La sección solo aparece si existe dirección de envío asociada al pedido
- La sección "FACTURADO A:" ahora incluye la dirección del perfil del cliente

### 3. Backend - PedidosController.cs
- Modificado endpoint de factura para cargar las direcciones del usuario
- Ahora incluye la dirección del perfil del cliente en "FACTURADO A:" del PDF

### 4. Backend - User.cs (NUEVO)
- Agregado campo `Direccion` a la entidad User

### 5. Backend - UpdateUserRequestDto.cs (NUEVO)
- Agregado campo `Direccion` para permitir actualizar desde el perfil

### 6. Backend - UserResponseDto.cs (NUEVO)
- Agregado campo `Direccion` en la respuesta del perfil

### 7. Backend - AuthService.cs (NUEVO)
- Modificado `UpdateProfileAsync` para guardar el campo Direccion

### 8. Frontend - perfil.tsx
- Corregida la visualización de información de entrega en el modal de detalles
- Ahora muestra todos los campos de dirección:
  - Destinatario (nombre completo)
  - Dirección
  - Barrio
  - Comuna
  - Referencia
  - Teléfono
- Si no hay dirección de envío, muestra la dirección del perfil del usuario

### 9. Frontend - types/index.ts (NUEVO)
- Agregado campo `direccion` a la interfaz User

### 10. Base de datos
- Migración creada: `AddDireccionToUser` para agregar columna Direccion a la tabla Users

## Cómo probarlo

1. Ejecutar la migración: `dotnet ef database update`
2. Iniciar sesión como usuario
3. Actualizar el perfil con una dirección
4. Ir a "Mis Pedidos" en el perfil
5. Hacer clic en "Ver detalles" de cualquier pedido
6. Verificar que se muestra la dirección completa en "Información de Entrega"
7. Descargar la factura PDF y verificar que incluye:
   - La dirección del cliente en "FACTURADO A:"
   - La dirección de envío en la sección correspondiente

## Impacto en el sistema

- **Backend**: Cambio en entidades, DTOs y servicios
- **Frontend**: Mejora en visualización
- **Base de datos**: Nueva columna `Direccion` en tabla Users
- **Riesgo bajo**: Solo agrega un nuevo campo opcional
