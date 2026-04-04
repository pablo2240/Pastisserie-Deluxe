# Inconsistencias

Este documento detalla las desconexiones, inconsistencias y desajustes entre el frontend, backend y base de datos.

---

## 1. Error de Compilación: Notificaciones

### Tipo
Inconsistencia Backend (Build Error)

### Descripción
El servicio de notificaciones no compila debido a que usa métodos que aparentemente no existen correctamente en el repositorio genérico.

### Evidencia Técnica
```bash
# Del build_log.txt:
PastisserieAPI.Services/Services/NotificacionService.cs(24,18): error CS1061: 
"IRepository<Notificacion>" no contiene una definición para "Find" ni un método de extensión accesible "Find"
```

### Análisis
- El [`Repository.cs`](PastisserieAPI.Infrastructure/Repositories/Repository.cs) **SÍ tiene** el método `FindAsync` (línea 29)
- El [`NotificacionService.cs`](PastisserieAPI.Services/Services/NotificacionService.cs) intenta usar `Find()` sin el sufijo "Async"
- También usa `Update()` sin el sufijo "Async"

### Solución Necesaria
Cambiar en `NotificacionService.cs`:
- `FindAsync` → el método correcto es `FindAsync` (ya lo usa)
- `UpdateAsync` → verificar que usa `UpdateAsync`

### Impacto
**Crítico** - El módulo de notificaciones no funciona

---

## 2. Zona Horaria Inconsistente

### Tipo
Inconsistencia de Lógica

### Descripción
Hay confusión entre UTC y hora local (Colombia, UTC-5) en varios lugares del código.

### Evidencia Técnica

**En [`DashboardController.cs`](PastisserieAPI.API/Controllers/DashboardController.cs):**
```csharp
var ahora = DateTime.UtcNow.AddHours(-5); // Sincronizado con Medellín
```

**En [`ConfiguracionTienda.cs`](PastisserieAPI.Core/Entities/ConfiguracionTienda.cs):**
```csharp
// Sin manejo explícito de zona horaria
public DateTime HoraApertura { get; set; }
public DateTime HoraCierre { get; set; }
```

### Problema
- No hay un estándar claro de qué zona horaria se usa en la BD
- El frontend muestra horas que pueden no coincidir con lo esperado

### Solución Necesaria
- Estandarizar el uso de UTC en toda la aplicación
- Convertir a hora local solo en la capa de presentación

---

## 3. Configuración Duplicada de ePayco

### Tipo
Inconsistencia de Configuración

### Descripción
La configuración de ePayco aparece en dos archivos diferentes con valores potencialmente diferentes.

### Evidencia Técnica

**[`appsettings.json`](PastisserieAPI.API/appsettings.json):**
```json
"Epayco": {
  "PublicKey": "d52507b31882bd94b5f81d8ee14daf68",
  "PrivateKey": "1c263f4c027c8cf89e544fffd6e9f683",
  "Test": true
}
```

**[`appsettings.Development.json`](PastisserieAPI.API/appsettings.Development.json):**
No tiene sección Epayco (tiene MercadoPago)

### Problema
- En desarrollo se usa la configuración de appsettings.json (Production keys?)
- En desarrollo debería haber keys de prueba específicas

### Solución Necesaria
- Mover configuración de ePayco a `appsettings.Development.json`
- Usar valores de prueba en desarrollo

---

## 4. Modelo de Carrito vs Carrito de Contexto

### Tipo
Inconsistencia Frontend-Backend

### Descripción
El frontend usa un "carrito en memoria" (CartContext) mientras el backend tiene un modelo persistente.

### Evidencia Técnica

**Frontend - [`CartContext.tsx`](pastisserie-front/src/context/CartContext.tsx):**
```typescript
// Carrito en memoria (localStorage)
const [carrito, setCarrito] = useState<Carrito | null>(null);
```

**Backend - [`CarritoController.cs`](PastisserieAPI.API/Controllers/CarritoController.cs):**
```csharp
// Carrito persistente en BD
var carrito = await _carritoService.GetByUsuarioIdAsync(usuarioId);
```

### Problema
- El usuario ve un carrito "instantáneo" en el frontend
- Los datos reales pueden diferir si hay múltiples dispositivos
- No hay sincronización en tiempo real

### Solución Necesaria
- Sincronizar el carrito con el backend al iniciar la sesión
- O eliminar el carrito del backend y usar solo localStorage

---

## 5. DTOs con Nombres Inconsistentes

### Tipo
Inconsistencia de Nombres

### Descripción
Los DTOs del backend no siguen un patrón consistente de nomenclatura.

### Evidencia Técnica
```csharp
// Request DTOs
RegisterRequestDto
LoginRequestDto
CreatePedidoRequestDto

// Response DTOs  
NotificacionResponseDto
UserResponseDto
PedidoResponseDto
```

### Problema
- Inconsistencia entre `RequestDto` y `Request` (algunos usan uno, otros otro)
- Dificulta la generación automática de clientes

### Solución Necesaria
- Estandarizar nomenclatura: `{Entidad}{Tipo}Dto`
- Ejemplo: `ProductoCreateDto`, `ProductoUpdateDto`, `ProductoDto`

---

## 6. Estados de Pedido No Validados

### Tipo
Inconsistencia de Validación

### Descripción
No hay validación de los estados de pedido permitidos en el backend.

### Evidencia Técnica

**[`PedidosController.cs`](PastisserieAPI.API/Controllers/PedidosController.cs):**
```csharp
[HttpPut("{id}/estado")]
public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdatePedidoEstadoRequestDto request)
{
    // No valida que el estado sea válido
    var result = await _pedidoService.UpdateEstadoAsync(id, request);
}
```

### Problema
- Se puede establecer cualquier estado de texto libre
- Inconsistencias en nombres: "EnProceso", "En Proceso", "EnProceso"

### Estados Encontrados
- Pendiente
- Confirmado
- EnProceso / En Proceso
- EnCamino / En Camino
- Entregado
- Cancelado
- Rechazado
- NoEntregado

### Solución Necesaria
- Crear enum para estados de pedido
- Validar contra el enum en el servicio

---

## 7. Propiedades de Entidad No Consistencia

### Tipo
Inconsistencia de Modelo

### Descripción
Algunas entidades tienen propiedades que no coinciden entre lo definido y lo usado.

### Evidencia Técnica

**Entidad [`Notificacion`](PastisserieAPI.Core/Entities/Notificacion.cs):**
```csharp
public string Titulo { get; set; } = string.Empty;
public string Mensaje { get; set; } = string.Empty;
public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
```

**Servicio intenta acceder a:**
```csharp
notificacion.Titulo  // Error según build log
notificacion.FechaCreacion  // Error según build log
```

### Análisis
- Las propiedades SÍ existen en la entidad
- El error parece ser un problema de compilación/transpilación
- Posible cache de build antigua

---

## 8. Frontend Build Errors

### Tipo
Errores de Build Frontend

### Descripción
El build de frontend tiene errores TypeScript.

### Evidencia Técnica

**Del [`build_log_frontend.txt`](pastisserie-front/build_log_frontend.txt):**
```
src/components/common/Notificaciones.tsx(2,23): error TS6133: 'Trash2' is declared but its value is never read.
src/components/common/Notificaciones.tsx(2,31): error TS6133: 'X' is declared but its value is never read.
src/pages/admin/Configuracion.tsx(3,1): error TS6133: 'api' is declared but its value is never read.
```

### Solución Necesaria
- Eliminar imports no usados
- El build debería pasar con `npm run build`

---

## 9. Passwords en Config (No Recomendado)

### Tipo
Problema de Seguridad

### Descripción
Las credenciales SMTP están hardcodeadas en los archivos de configuración.

### Evidencia Técnica

**[`appsettings.json`](PastisserieAPI.API/appsettings.json):**
```json
"Smtp": {
  "Password": "mnuk wgej uzkl pfiq",
  ...
}
```

### Problema
- Contraseña expuesta en repositorio
- Debería usar secrets o environment variables

### Solución Necesada
- Usar `dotnet user-secrets` en desarrollo
- Usar variables de entorno en producción

---

## 10. Endpoints No Consumidos

### Tipo
Código No Utilizado

### Descripción
Algunos endpoints del backend no son consumidos por el frontend.

### Endpoints Identificados

| Endpoint | Controller | Frontend |
|----------|------------|----------|
| GET `/api/users` | UsersController | No usado claramente |
| PUT `/api/users/{id}` | UsersController | No usado |
| DELETE `/api/users/{id}` | UsersController | No usado |

### Solución Necesaria
- Verificar si estos endpoints son necesarios
- Si no, eliminar o documentar como "para futura implementación"

---

## Resumen de Severidad

| # | Inconsistencia | Severidad | Impacto |
|---|----------------|-----------|---------|
| 1 | Notificaciones Build Error | CRÍTICO | Sistema no compila |
| 2 | Zona Horaria | ALTO | Datos incorrectos |
| 3 | Config ePayco Duplicada | MEDIO | Confusión |
| 4 | Carrito Memoria vs BD | MEDIO | UX inconsistente |
| 5 | DTOs Inconsistentes | BAJO | Maintainability |
| 6 | Estados Pedido | ALTO | Validación |
| 7 | Entidad Notificacion | CRÍTICO | Build error |
| 8 | Frontend Build | MEDIO | No despliega |
| 9 | Passwords en Config | CRÍTICO | Seguridad |
| 10 | Endpoints No Usados | BAJO | Código muerto |
