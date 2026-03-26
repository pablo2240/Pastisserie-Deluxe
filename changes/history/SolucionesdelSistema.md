# Plan de Implementación - Soluciones del Sistema

## Resumen Ejecutivo

El plan se divide en **3 fases** siguiendo las prioridades definidas en `Solucion-actual.md`:

| Fase | Prioridad | Temas | Esfuerzo Total |
|------|-----------|-------|-----------------|
| **Fase 1** | Alta | Limpieza código, Historial, Validaciones, Configuración | Bajo-Medio |
| **Fase 2** | Media | Seguimiento envío, Stock bajo, Personalización | Medio-Alto |
| **Fase 3** | Baja | Panel repartidor, UX, Pagos reales, Facturación | Alto |

---

## Fase 1: Alta Prioridad (Sistémicos)

### 1.1 Limpiar código ePayco obsoleto ⚡

**Archivos a modificar:**
- `PastisserieAPI.Services/Services/PedidoService.cs` (líneas 97, 109, 115, 122, 128, 138)

**Cambios:**
```
Línea 97:  "// Order starts as Pendiente..." → "// Order starts as Pendiente, not approved until payment is confirmed"
Línea 109: "Pago: ePayco" → "Pago: Tarjeta"
Línea 115: "ePayco - payment will be processed externally" → "Payment method - processed externally"
Línea 122: t.Nombre.Contains("ePayco") → t.Nombre.Contains("Tarjeta") o buscar tipo genérico
Línea 128: Nombre = "ePayco" → Nombre = "Pago con Tarjeta"
Línea 138: TokenPago = "EPAYCO_PENDING" → TokenPago = "PENDING"
```

**Verificar después:**
- Buscar otras referencias: `grep -r "epayco" --include="*.cs" -i`
- Verificar que PagosController no tenga endpoints obsoletos

---

### 1.2 Completar integración PedidoHistorial ✅

**Backend - Agregar endpoint en `PedidosController.cs`:**

```csharp
// AGREGAR ESTE ENDPOINT
[HttpGet("{id}/historial")]
[Authorize]
public async Task<IActionResult> GetHistorial(int id)
{
    var pedido = await _unitOfWork.Pedidos.GetByIdAsync(id);
    if (pedido == null) return NotFound();
    
    // Verificar permisos
    var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var isAdmin = User.IsInRole("Admin");
    if (!isAdmin && pedido.UsuarioId.ToString() != userIdStr)
        return Forbid();
    
    // Cargar historial - crear query si no existe en repositorio
    var historial = await _context.PedidoHistoriales
        .Where(h => h.PedidoId == id)
        .OrderByDescending(h => h.FechaCambio)
        .ToListAsync();
    
    return Ok(ApiResponse<List<PedidoHistorialResponseDto>>.SuccessResponse(
        _mapper.Map<List<PedidoHistorialResponseDto>>(historial)
    ));
}
```

**DTOs a crear:**
- `PastisserieAPI.Services/DTOs/Response/PedidoHistorialResponseDto.cs`

```csharp
public class PedidoHistorialResponseDto
{
    public int Id { get; set; }
    public string EstadoAnterior { get; set; } = string.Empty;
    public string EstadoNuevo { get; set; } = string.Empty;
    public DateTime FechaCambio { get; set; }
    public int? CambiadoPor { get; set; }
    public string? Notas { get; set; }
}
```

**Frontend - Modificar `perfil.tsx`:**
1. Agregar `PedidoHistorial` a types/index.ts
2. En componente de detalles del pedido, agregar sección "Historial de cambios"
3. Mostrar línea de tiempo con estados y fechas

---

### 1.3 Validar stock negativo y límites

**En `PedidoService.cs` - método `SimularPago` o donde se descuenta stock:**

```csharp
// AGREGAR VALIDACIÓN antes de descontar
foreach (var item in pedido.Items)
{
    if (item.ProductoId.HasValue)
    {
        var producto = await _unitOfWork.Productos.GetByIdAsync(item.ProductoId.Value);
        if (producto.Stock < item.Cantidad)
        {
            throw new Exception($"Stock insuficiente para {producto.Nombre}");
        }
        // NUEVO: Validar límite por producto
        var config = await _tiendaService.GetConfiguracionAsync();
        if (config?.LimitarUnidadesPorProducto == true && item.Cantidad > config.MaxUnidadesPorProducto)
        {
            throw new Exception($"Cantidad máxima por producto: {config.MaxUnidadesPorProducto}");
        }
    }
}
```

**Verificar en:**
- `CarritoService` al agregar al carrito
- `PagosController.SimularPago()` al confirmar

---

### 1.4 Externalizar configuración hardcoded

**En `appsettings.json`:**

```json
{
  "Tienda": {
    "CostosEnvio": {
      "Guayabal": 5000,
      "Belén": 6000
    },
    "CompraMinima": 15000,
    "MaxUnidadesPorProducto": 10,
    "Moneda": "COP"
  }
}
```

**En `PedidoService.cs`:**

```csharp
// CAMBIAR de:
private static readonly Dictionary<string, decimal> CostosEnvioPorComuna = ...

// A:
private readonly IConfiguration _configuration;

public PedidoService(..., IConfiguration configuration)
{
    ...
    _configuration = configuration;
}

// Y usar:
var costos = _configuration.GetSection("Tienda:CostosEnvio")
    .Get<Dictionary<string, decimal>>() ?? new();
```

**Nota:** Mantener fallback por si no existe config.

---

## Fase 2: Media Prioridad (Funcionalidad)

### 2.1 Implementar seguimiento de envío

**Backend - Agregar en `EnviosController.cs` (o crear si no existe):**

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Repartidor")]
public class EnviosController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var envio = await _context.Envios
            .Include(e => e.Pedido)
            .Include(e => e.Repartidor)
            .FirstOrDefaultAsync(e => e.Id == id);
            
        if (envio == null) return NotFound();
        
        // Verificar acceso
        var userId = GetUserId();
        var isAdmin = User.IsInRole("Admin");
        var isRepartidor = User.IsInRole("Repartidor");
        
        if (!isAdmin && isRepartidor && envio.RepartidorId != userId)
            return Forbid();
            
        return Ok(ApiResponse<EnvioResponseDto>.SuccessResponse(mapper));
    }
    
    [HttpPut("{id}/estado")]
    [Authorize(Roles = "Repartidor")]
    public async Task<IActionResult> UpdateEstado(int id, [FromBody] UpdateEnvioEstadoDto dto)
    {
        var envio = await _context.Envios.FindAsync(id);
        if (envio == null) return NotFound();
        
        // Solo el repartidor asignado puede actualizar
        var userId = GetUserId();
        if (envio.RepartidorId != userId) return Forbid();
        
        envio.Estado = dto.Estado;
        if (dto.Estado == "Entregado")
            envio.FechaEntrega = DateTime.UtcNow.AddHours(-5);
            
        await _context.SaveChangesAsync();
        
        // Notificar al cliente
        await _notificacionService.CrearNotificacionAsync(
            envio.Pedido.UsuarioId,
            $"Envío actualizado",
            $"Tu pedido ahora está: {dto.Estado}",
            "Pedido",
            $"/perfil"
        );
        
        return Ok(ApiResponse<EnvioResponseDto>.SuccessResponse(mapper));
    }
}
```

**Frontend:**
- En `perfil.tsx`, sección de detalles del pedido: mostrar estado del envío
- En dashboard del repartidor: permitir cambiar estado del envío

---

### 2.2 Mostrar alertas de stock bajo en admin

**El backend ya tiene `GetProductosBajoStockAsync()` en ProductoService.**

**Frontend - Modificar `admin/dashboard.tsx`:**

1. Importar endpoint: `GET /api/productos/bajo-stock` (verificar si existe, si no crear)
2. Crear componente "Alertas de Stock" en el dashboard
3. Mostrar lista de productos con stock < StockMinimo

```tsx
// En dashboard.tsx - agregar sección
const [productosBajoStock, setProductosBajoStock] = useState<Producto[]>([]);

useEffect(() => {
  api.get('/productos/bajo-stock').then(r => setProductosBajoStock(r.data.data));
}, []);

return (
  {/* KPI existente */}
  {productosBajoStock.length > 0 && (
    <div className="bg-red-50 p-4 rounded-lg">
      <h3>⚠️ Productos bajo stock mínimo</h3>
      <ul>
        {productosBajoStock.map(p => (
          <li key={p.id}>{p.nombre} - Stock: {p.stock} (Mín: {p.stockMinimo})</li>
        ))}
      </ul>
    </div>
  )}
);
```

---

### 2.3 Completar o eliminar personalización

**Decisión requerida antes de implementar:**

| Opción | Acción | Esfuerzo |
|--------|--------|-----------|
| **COMPLETAR** | Implementar flujo completo: Frontend + Backend + poblar DB | Alto |
| **ELIMINAR** | Eliminar entidades: PersonalizadoConfig, Ingrediente, PersonalizadoConfigIngrediente | Bajo |

**Si se decide COMPLETAR:**
1. Poblar tabla Ingredientes con datos base
2. Crear `PersonalizadoService` con lógica de precios
3. Frontend: Agregar selector en ProductDetail (si producto.EsPersonalizable)
4. Frontend: Agregar opciones de personalización en Checkout
5. Backend: Calcular precio adicional en PedidoService

**Si se decide ELIMINAR:**
1. Eliminar entidades de Core/Entities
2. Eliminar DbSets en ApplicationDbContext
3. Crear migración para eliminar tablas
4. Limpiar código relacionado

---

### 2.4 Limpiar tablas fantasma

**Si se decide NO usar CategoriaProducto:**

1. **Verificar** si algún producto usa la relación
2. **Decidir** si migración de eliminación es viable o crear migración nueva
3. **Frontend**: Ya usa `producto.categoria` (string), no se afecta

**Para Ingrediente/Personalizado:**
- Ver decisión en sección 2.3

---

## Fase 3: Baja Prioridad (Mejora)

### 3.1 Panel de repartidor completo

**Rutas a mejorar:**
- `/repartidor` - Solo tiene dashboard básico
- Crear `/repartidor/pedidos` con lista completa

**Funcionalidades a agregar:**
1. Lista de pedidos asignados con filtros (EnCamino, Entregados hoy)
2. Detalle de pedido con dirección y teléfono del cliente
3. Botones de acción: "Marcar Entregado", "Marcar No Entregado" (con motivo)
4. Historial de entregas realizadas

---

### 3.2 Mejoras de UX

**Cosas simples a implementar:**
1. **Loading states**: Agregar spinners/skeletons donde faltan
2. **Error handling**: Pantallas de error más descriptivas
3. **Toast notifications**: Mensajes más claros en errores

---

### 3.3-3.4 Pagos reales y Facturación electrónica

**No recomendados para fase actual** - Requieren:
- Integración con proveedor de pagos (MercadoPago, Stripe, etc.)
- Registro en Dian para facturación electrónica
- Costos y configuraciones adicionales

---

## Resumen de tareas por fase

### Fase 1 - Lista de tareas

| # | Tarea | Archivos | Líneas/Notas |
|---|-------|----------|---------------|
| 1.1 | Limpiar ePayco | PedidoService.cs | 6 cambios de texto |
| 1.2a | Crear DTO | PedidoHistorialResponseDto.cs | Nuevo archivo |
| 1.2b | Agregar endpoint | PedidosController.cs | Nuevo método GetHistorial |
| 1.2c | Consumir frontend | perfil.tsx | Nueva sección historial |
| 1.3a | Validar stock negativo | PedidoService.cs / CarritoService.cs | Agregar validación |
| 1.3b | Validar límite unidades | PedidoService.cs | Usar config existente |
| 1.4a | Agregar config | appsettings.json | Nueva sección Tienda |
| 1.4b | Usar config en código | PedidoService.cs | Reemplazar hardcoded |

### Fase 2 - Lista de tareas

| # | Tarea | Archivos | Notas |
|---|-------|----------|-------|
| 2.1a | Completar EnviosController | Nuevo o existente | CRUD de envíos |
| 2.1b | Frontend seguimiento | perfil.tsx | Mostrar estado envío |
| 2.2 | Dashboard stock bajo | admin/dashboard.tsx | Consumir endpoint |
| 2.3 | Decidir personalización | - | COMPLETAR o ELIMINAR |
| 2.4 | Limpiar tablas fantasma | Según decisión | - |

### Fase 3 - Lista de tareas

| # | Tarea | Notas |
|---|-------|-------|
| 3.1 | Panel repartidor mejorado | Lista + acciones |
| 3.2 | Mejoras UX | Loading, errores |

---

## Preguntas de Clarificación

Antes de ejecutar, necesito tu respuesta:

1. **Personalización (sección 2.3):** ¿Completar el sistema de pasteles personalizados o eliminar las entidades relacionadas?

2. **CategoriaProducto (sección 2.4):** ¿Eliminar la tabla o mantenerla aunque no se use?

3. **¿Confirmas que inicie con la Fase 1?** (Limpieza ePayco → Historial → Validaciones → Configuración)

---

**Nota:** Las tareas de Fase 1 tienen esfuerzo "Bajo-Medio" y son fundamentales para limpiar el código antes de agregar nuevas funcionalidades.