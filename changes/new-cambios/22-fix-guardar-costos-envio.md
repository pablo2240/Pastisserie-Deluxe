# 22 - Fix: Costos de Envío por Comuna - Configuración Dinámica

## Problema Original

En la configuración del admin, el campo de "Costos de envío por comuna (JSON)" tenía varios problemas:
1. No había validación del formato JSON antes de guardar
2. El backend no guardaba el campo en la base de datos
3. El frontend del checkout usaba valores hardcodeados
4. Los cambios no se reflejaban en tiempo real

## Cambios Implementados

### 1. Frontend - Validación (Configuracion.tsx)

Se agregó validación del JSON antes de enviar al backend:

```typescript
if (storeData.costosEnvioPorComuna && storeData.costosEnvioPorComuna.trim()) {
    try {
        const parsed = JSON.parse(storeData.costosEnvioPorComuna);
        for (const [comuna, costo] of Object.entries(parsed)) {
            if (typeof costo !== 'number' || costo < 0) {
                toast.error(`El costo de "${comuna}" debe ser un número positivo`);
                return;
            }
        }
    } catch (e) {
        toast.error('El JSON de costos de envío es inválido. Verifique el formato.');
        return;
    }
}
```

### 2. Backend - Guardar Configuración (ConfiguracionController.cs)

Se agregó el campo para guardar en la base de datos:

```csharp
// Costos de envío por comuna
existingConfig.CostosEnvioPorComuna = newConfig.CostosEnvioPorComuna;
```

### 3. Backend - API Estado (TiendaController.cs)

Se agregó el endpoint para retornar los costos parseados:

```csharp
Dictionary<string, decimal>? costosEnvioPorComuna = null;
if (!string.IsNullOrEmpty(config.CostosEnvioPorComuna))
{
    try
    {
        costosEnvioPorComuna = JsonSerializer.Deserialize<Dictionary<string, decimal>>(config.CostosEnvioPorComuna);
    }
    catch
    {
        costosEnvioPorComuna = null;
    }
}
```

### 4. Frontend - Hook (useTiendaStatus.ts)

Se agregó el tipo para los costos por comuna:

```typescript
export interface TiendaStatus {
    // ... otros campos
    costosEnvioPorComuna?: Record<string, number>;
}
```

### 5. Frontend - Checkout (checkout.tsx)

Se implementó la función para obtener costos dinámicos:

```typescript
const getCostoEnvio = (comuna: string): number => {
    if (status?.costosEnvioPorComuna && typeof status.costosEnvioPorComuna === 'object') {
        const costos = status.costosEnvioPorComuna as Record<string, number>;
        if (comuna in costos) {
            return costos[comuna];
        }
    }
    // Fallback: valores por defecto
    if (comuna && ComunasDisponibles[comuna as ComunaKey]) {
        return ComunasDisponibles[comuna as ComunaKey].costoEnvio;
    }
    return status?.costoEnvio || 0;
};
```

También se agregó sincronización en tiempo real:
- Al montar el checkout → refresca estado
- Al cambiar de step → refresca estado
- Al cambiar de comuna → refresca estado

## Archivos Modificados

1. `pastisserie-front/src/pages/admin/Configuracion.tsx` - Validación
2. `PastisserieAPI.API/Controllers/ConfiguracionController.cs` - Guardar en DB
3. `PastisserieAPI.API/Controllers/TiendaController.cs` - Retornar JSON parseado
4. `pastisserie-front/src/hooks/useTiendaStatus.ts` - Tipo de datos
5. `pastisserie-front/src/pages/checkout.tsx` - Costos dinámicos

## Flujo Completo

1. Admin configura JSON en panel de config ✅
2. Se valida formato antes de guardar ✅
3. Se guarda en la base de datos ✅
4. Endpoint `/tienda/estado` retorna costos parseados ✅
5. Checkout lee los costos dinámicamente ✅
6. Se muestra en shipping, resumen y payment ✅
7. Se sincroniza en tiempo real ✅

## Tareas

1. ✅ Agregar validación de JSON en el frontend
2. ✅ Guardar en la base de datos
3. ✅ Parsear JSON en backend
4. ✅ Usar costos dinámicos en checkout
5. ✅ Sincronización en tiempo real
6. ✅ Verificar que compile
