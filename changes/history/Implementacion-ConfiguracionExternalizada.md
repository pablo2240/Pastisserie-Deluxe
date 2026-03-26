# Implementación: Externalizar Configuración Hardcoded

## Fecha de Ejecución
2026-03-26

## Resumen
Se implementó la externalización de los costos de envío hardcoded en el backend, ahora los costos por comuna se pueden configurar desde el panel de administración.

---

## ¿Qué se implementó?

### Backend - Entity y Lógica

| Archivo | Cambio |
|---------|--------|
| `ConfiguracionTienda.cs` | Agregado campo `CostosEnvioPorComuna` |
| `PedidoService.cs` | Lee costos desde configuración con fallback |
| Migración nueva | Agregada columna `CostosEnvioPorComuna` |

### Frontend - Panel Admin

| Archivo | Cambio |
|---------|--------|
| `admin/Configuracion.tsx` | Agregado campo para editar JSON de costos |

---

## Detalle de Cambios

### Backend - Entity

**Archivo:** `PastisserieAPI.Core/Entities/ConfiguracionTienda.cs`

```csharp
/// <summary>Costos de envío por comuna en formato JSON: {"Guayabal": 5000, "Belén": 6000}</summary>
[MaxLength(1000)]
public string? CostosEnvioPorComuna { get; set; }
```

### Backend - Lógica

**Archivo:** `PastisserieAPI.Services/Services/PedidoService.cs`

```csharp
private Dictionary<string, decimal> GetCostosEnvioDesdeConfig(ConfiguracionTienda? config)
{
    if (string.IsNullOrEmpty(config?.CostosEnvioPorComuna))
    {
        return CostosEnvioPorComunaDefault;
    }

    try
    {
        var costos = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, decimal>>(
            config.CostosEnvioPorComuna, 
            new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true }
        );
        return costos ?? CostosEnvioPorComunaDefault;
    }
    catch
    {
        _logger.LogWarning("Error al parsear CostosEnvioPorComuna, usando valores por defecto");
        return CostosEnvioPorComunaDefault;
    }
}
```

### Frontend - Editor

**Archivo:** `pastisserie-front/src/pages/admin/Configuracion.tsx`

- Agregado campo `costosEnvioPorComuna` en la interfaz `StoreData`
- Agregado textarea para editar el JSON de costos por comuna
- El valor por defecto es: `{"Guayabal": 5000, "Belen": 6000}`

---

## Casos de Uso

| Escenario | Comportamiento |
|-----------|----------------|
| No hay config de costos | Usa valores por defecto (Guayabal: 5000, Belén: 6000) |
| Admin define costos en JSON | Lee de `CostosEnvioPorComuna` en config |
| JSON inválido | Usa fallback, registra warning en log |
| Nueva comuna en request no configurada | Lanza excepción con comunas permitidas |

---

## Formato del JSON

```json
{
  "Guayabal": 5000,
  "Belen": 6000
}
```

El admin puede agregar más comunas según sea necesario.

---

## Verificación Post-Implementación

### Compilación Backend
```
dotnet build PastisserieAPI.sln
✅ Compilación correcta - 0 errores
```

### Compilación Frontend
```
npm run build
✅ Build exitoso
```

---

## Migración Creada

```
AddCostosEnvioPorComuna
```

Esta migración agrega la columna `CostosEnvioPorComuna` a la tabla `ConfiguracionTienda`.

---

## Archivos Modificados

### Backend (3 archivos)
- ✅ `ConfiguracionTienda.cs`
- ✅ `PedidoService.cs`
- ✅ Migración nueva

### Frontend (1 archivo)
- ✅ `admin/Configuracion.tsx`

---

## Estado del Sistema Post-Implementación

| Componente | Estado |
|------------|--------|
| Costos de envío configurables | ✅ Implementado |
| Fallback a valores por defecto | ✅ Implementado |
| Editor JSON en admin | ✅ Implementado |
| Migración de BD | ✅ Creada |

---

## Siguiente Paso

Ejecutar la migración en base de datos:
```bash
dotnet ef database update -p PastisserieAPI.Infrastructure -s PastisserieAPI.API
```

---

## Documentación Relacionada
- `Solucion-actual.md` - Plan original de soluciones
- `SolucionesdelSistema.md` - Plan de implementación
- `LimpiezaEstructural-Fase1.md` - Limpieza anterior
- `Implementacion-PedidoHistorial.md` - Implementación anterior
- `Implementacion-StockValidacion.md` - Validación de stock