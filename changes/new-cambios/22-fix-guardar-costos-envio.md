# 22 - Fix: Guardar Costos de Envío por Comuna con Validación

## Problema

En la configuración del admin, el campo de "Costos de envío por comuna (JSON)" existe pero:
1. No hay validación del formato JSON antes de guardar
2. No hay validación de que los valores sean numéricos
3. No hay validación de que las comunas sean válidas

## Análisis

### Estado Actual

- **Frontend**: Campo textarea con JSON existe en `Configuracion.tsx` (líneas 508-521)
- **Backend**: `PUT /configuracion` ya guarda estos valores
- **PedidoService**: Ya lee `CostosEnvioPorComuna` desde la configuración

### Lo que falta

1. **Validación del JSON** antes de guardar
2. **Validar estructura** (clave: valor)
3. **Validar que valores sean numéricos**
4. **Mensaje de éxito/error específico** para este campo

## Solución

### Frontend (Configuracion.tsx)

Agregar validación en el `handleSubmit` antes de enviar:

```typescript
// Validar JSON de costos de envío
if (storeData.costosEnvioPorComuna) {
  try {
    const parsed = JSON.parse(storeData.costosEnvioPorComuna);
    // Verificar que todos los valores sean números
    for (const [comuna, costo] of Object.entries(parsed)) {
      if (typeof costo !== 'number' || costo < 0) {
        throw new Error(`El costo de "${comuna}" debe ser un número positivo`);
      }
    }
  } catch (e) {
    toast.error('El JSON de costos de envío es inválido');
    return;
  }
}
```

## Tareas

1. ⬜ Agregar validación de JSON en el frontend
2. ⬜ Verificar que compile
3. ⬜ Testing
