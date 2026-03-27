# Fix: Columna MetodoPago en tabla Pedidos

## Fecha: 27 Mar 2026

## Problema
La migración para eliminar las tablas de ePayco (`MetodosPagoUsuario`, `TipoMetodoPago`) falló durante ejecución porque la columna `MetodoPagoId` (int, NOT NULL) en la tabla `Pedidos` no puede ser nula.

## Estado actual
- ✅ Código C# actualizado: `Pedido.MetodoPago` es `string`
- ❌ Base de datos: todavía tiene `MetodoPagoId` (int NOT NULL)

## Cambios realizados en código

### 1. CreatePedidoRequestDto.cs
- Eliminado: `public int MetodoPagoId { get; set; }`
- Mantenido: `public string? MetodoPago { get; set; }`

### 2. CreatePedidoRequestValidator.cs
- Eliminada validación de `MetodoPagoId`

### 3. Pedido.cs (verificado)
-确认ado: `public string MetodoPago { get; set; } = "Efectivo";`

## Build resultados
- Backend: ✅ Compilación exitosa (0 errores, 8 warnings)
- Frontend: ✅ Build exitoso

## Acción requerida (SQL - MANUAL)

Ejecutar en la base de datos:

```sql
-- 1. Agregar la nueva columna MetodoPago con valor por defecto
ALTER TABLE Pedidos ADD MetodoPago NVARCHAR(100) NOT NULL DEFAULT 'Simulado';

-- 2. Eliminar la columna antigua MetodoPagoId
ALTER TABLE Pedidos DROP COLUMN MetodoPagoId;
```

## Notas
- Esta corrección debe ejecutarse manualmente en SQL Server Management Studio o Azure Data Studio
- Después de ejecutar el SQL, el flujo de pago simulado funcionará correctamente
- El método de pago se guardará como string en la columna `MetodoPago`