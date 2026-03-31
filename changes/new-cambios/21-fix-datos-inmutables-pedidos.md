# 21 - Fix: Datos Inmutables de Pedidos vs Perfil de Usuario

## Problema

Cuando el usuario actualiza su información personal (perfil), esos cambios también se reflejan en pedidos ya realizados. Esto es incorrecto porque los pedidos deben mantener su propia copia de la información de envío capturada en el checkout.

El problema está en el frontend (`perfil.tsx`) que muestra los datos del perfil cuando no hay `direccionEnvio` en el pedido.

## Análisis

### Backend (ya implementado correctamente)

El `PedidoService.cs` ya crea una `DireccionEnvio` independiente para cada pedido (líneas 148-167):

```csharp
// Crear DireccionEnvio con los datos del checkout (captura estática)
var direccionEnvio = new DireccionEnvio
{
    UsuarioId = userId,
    NombreCompleto = usuario?.Nombre ?? "Cliente",
    Direccion = request.Direccion ?? string.Empty,
    Comuna = request.Comuna,
    Telefono = request.Telefono ?? usuario?.Telefono ?? string.Empty,
    ...
};
```

### Frontend (problema)

En `perfil.tsx`, cuando NO hay `direccionEnvio` en el pedido, muestra los datos del perfil:

```tsx
// Línea 419
{(user as any)?.direccion || 'No disponible'}

// Línea 424
{user?.telefono || '-'}
```

Esto hace que los pedidos históricos muestren los datos actuales del perfil en lugar de los datos originales.

## Solución

1. **No mostrar datos del perfil como fallback** en pedidos históricos
2. **Mantener la separación clara:**
   - Perfil → autocompletado en checkout (solo para nuevos pedidos)
   - Pedidos → datos inmutables captured en el momento de la compra

## Tareas

1. ⬜ Corregir perfil.tsx para no usar datos del perfil como fallback
2. ⬜ Verificar que compile
3. ⬜ Testing
