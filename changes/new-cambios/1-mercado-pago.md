# Análisis y Plan de Eliminación - MercadoPago

**Fecha:** 2026-03-19  
**Estado:** Código muerto identificado  
**Objetivo:** Eliminar todo lo relacionado con MercadoPago

---

## 1. Resumen Ejecutivo

El proyecto **ya no utiliza MercadoPago** como pasarela de pagos. Fue reemplazado por **ePayco**. 

Sin embargo, existen fragmentos de código muerto (configuración, scripts SQL, documentación) que deben eliminarse para mantener el código limpio.

### Estado Actual
- ✅ **Código de integración ELIMINADO**: Servicios, DTOs, componentes frontend
- ❌ **Código muerto PENDIENTE**: Configuración, scripts SQL, documentación

---

## 2. Código de MercadoPago Ya Eliminado

### 2.1 Backend - Servicios Eliminados

| Archivo | Estado | Notas |
|---------|--------|-------|
| `PastisserieAPI.Services/Services/MercadoPagoService.cs` | ✅ Eliminado | Confirmado en historial |
| `PastisserieAPI.Services/Services/Interfaces/IMercadoPagoService.cs` | ✅ Eliminado | Confirmado en historial |
| `PastisserieAPI.Services/Config/MercadoPagoSettings.cs` | ✅ Eliminado | Confirmado en historial |
| `PastisserieAPI.Services/DTOs/MercadoPago/*.cs` | ✅ Eliminado | Directorio eliminado |
| `PastisserieAPI.Services/DTOs/Response/MercadoPagoDto.cs` | ✅ Eliminado | Confirmado en historial |
| `PastisserieAPI.Services/DTOs/Request/MercadoPagoRequestDto.cs` | ✅ Eliminado | Confirmado en historial |

**Verificación:** No se encontraron archivos con "MercadoPago" en `PastisserieAPI.Services/`

### 2.2 Frontend - Componentes Eliminados

| Archivo | Estado | Notas |
|---------|--------|-------|
| `src/components/MercadoPagoBrick.tsx` | ✅ Eliminado | Confirmado en historial |
| `src/components/PaymentSimulator.tsx` | ✅ Eliminado | Referencia en logs pero no existe |
| `src/services/pagoEmuladorService.ts` | ✅ Eliminado | Confirmado en historial |
| Paquete `@mercadopago/sdk-react` | ✅ Eliminado | Confirmado en historial |

**Verificación:** No se encontraron archivos con "MercadoPago" en `pastisserie-front/src/`

---

## 3. Código Muerto Identificado (PENDIENTE DE ELIMINAR)

### 3.1 Configuración

| Archivo | Tipo de código muerto | Acción |
|---------|---------------------|--------|
| [`PastisserieAPI.API/appsettings.Development.json`](PastisserieAPI.API/appsettings.Development.json) | Archivo completo de desarrollo | **ELIMINAR** (consolidar en appsettings.json) |

**Contenido a eliminar:**
```json
"MercadoPago": {
  "AccessToken": "TEST-7207163768477399-030606-48f7b81a33fea8a580a0bc428e6c0b06-3220724535",
  "PublicKey": "TEST-6d03bacb-b68d-47be-94b4-09aa3f52032b",
  "WebhookSecret": "TEST-7207163768477399-030606-48f7b81a33fea8a580a0bc428e6c0b06-3220724535",
  "BackendBaseUrl": "http://localhost:5176",
  "FrontendBaseUrl": "http://localhost:5173",
  "IsSandbox": true
}
```

### 3.2 Scripts de Base de Datos

| Archivo | Tipo de código muerto | Acción |
|---------|---------------------|--------|
| [`PastisserieAPI.API/Database/Scripts/AddMercadoPagoFields.sql`](PastisserieAPI.API/Database/Scripts/AddMercadoPagoFields.sql) | Script completo de MercadoPago | **ELIMINAR** |
| [`PastisserieAPI.API/Database/Scripts/CreateMetodoPagoUsuarioTable.sql`](PastisserieAPI.API/Database/Scripts/CreateMetodoPagoUsuarioTable.sql) | Referencias a "MercadoPago" | **LIMPIAR** |

**Detalles de AddMercadoPagoFields.sql (ELIMINAR):**
- Agrega columnas `MercadoPagoPaymentId`, `MercadoPagoStatus`, `MercadoPagoStatusDetail`, `MercadoPagoPaymentMethodId`, `MercadoPagoCardLastFourDigits`, `MercadoPagoAmountRefunded` a la tabla Pedidos
- Inserta tipo de pago "MercadoPago" en la tabla TipoMetodoPago

**Detalles de CreateMetodoPagoUsuarioTable.sql (LIMPIAR):**
- Línea 25: `'MercadoPago', 'Pagos a traves de MercadoPago', 1`
- Línea 38: `'MercadoPago', 'Pagos a traves de MercadoPago', 1`
- Línea 60: Comentario "Campos especificos de MercadoPago"

### 3.3 Documentación Obsoleta

| Archivo | Acción |
|---------|--------|
| [`changes/MERCADOPAGO_SETUP.md`](changes/MERCADOPAGO_SETUP.md) | **ELIMINAR** o mover a carpeta `docs/historico/` |
| [`changes/eliminar-mercadopago-y-simplificar-pagos.md`](changes/eliminar-mercadopago-y-simplificar-pagos.md) | **ELIMINAR** o mover a carpeta `docs/historico/` |

---

## 4. Plan de Eliminación

### Fase 1: Eliminar Configuración

**Paso 1.1:** Editar [`appsettings.Development.json`](PastisserieAPI.API/appsettings.Development.json)
- Eliminar la sección `"MercadoPago"` completa (líneas 17-24)

### Fase 2: Eliminar Scripts SQL

**Paso 2.1:** Eliminar archivo [`AddMercadoPagoFields.sql`](PastisserieAPI.API/Database/Scripts/AddMercadoPagoFields.sql)
- Ya fue ejecutado (si la BD existe) o no es necesario

**Paso 2.2:** Editar [`CreateMetodoPagoUsuarioTable.sql`](PastisserieAPI.API/Database/Scripts/CreateMetodoPagoUsuarioTable.sql)
- Eliminar líneas 25, 38 que insertan "MercadoPago"
- Eliminar o actualizar comentario de línea 60

### Fase 3: Limpiar Documentación

**Paso 3.1:** Eliminar o archivar:
- [`changes/MERCADOPAGO_SETUP.md`](changes/MERCADOPAGO_SETUP.md)
- [`changes/eliminar-mercadopago-y-simplificar-pagos.md`](changes/eliminar-mercadopago-y-simplificar-pagos.md)

### Fase 4: Verificar Compilación

**Paso 4.1:** Ejecutar build del backend
```bash
cd PastisserieAPI.API
dotnet build
```

**Paso 4.2:** Ejecutar build del frontend
```bash
cd pastisserie-front
npm run build
```

---

## 5. Impacto de la Eliminación

### Lo que NO se ve afectado:
- ✅ Funcionalidad de pagos (ePayco funciona completamente)
- ✅ Endpoints de `/api/pagos/epayco/*`
- ✅ Flujo de checkout
- ✅ Tablas de base de datos existentes

### Lo que SÍ se elimina:
- ❌ Configuración de desarrollo de MercadoPago
- ❌ Scripts SQL de migración de MercadoPago
- ❌ Documentación obsoleta

### Riesgo: **BAJO**
- No hay código de MercadoPago en uso
- La eliminación solo limpia código muerto

---

## 6. Comandos de Verificación Post-Eliminación

```bash
# Verificar que no quedan referencias a MercadoPago en el código
grep -r "MercadoPago" PastisserieAPI.Services/ pastisserie-front/src/

# Build backend
cd PastisserieAPI.API && dotnet build

# Build frontend  
cd pastisserie-front && npm run build
```

---

## 7. Seguimiento

| Tarea | Estado | Responsable |
|-------|--------|-------------|
| Eliminar appsettings.Development.json (consolidar configuración) | ✅ Completado | Kilo Code |
| Eliminar AddMercadoPagoFields.sql | ✅ Completado | Kilo Code |
| Limpiar CreateMetodoPagoUsuarioTable.sql | ✅ Completado | Kilo Code |
| Archivar documentación obsoleta | ⏳ Pendiente | - |
| Verificar compilación backend | ✅ Completado | Kilo Code |
| Verificar compilación frontend | ⚠️ Errores preexistentes (no relacionados) | - |

---

## 8. Resultados de la Eliminación

### Cambios Realizados (2026-03-19)

1. **appsettings.Development.json** - Archivo completo eliminado (consolidado en appsettings.json)
2. **AddMercadoPagoFields.sql** - Archivo eliminado
3. **CreateMetodoPagoUsuarioTable.sql** - Referencias a MercadoPago eliminadas

### Verificación de Compilación

- **Backend (.NET):** ✅ Build exitoso - 0 errores
- **Frontend (React):** ⚠️ Errores preexistentes (no relacionados con MercadoPago):
  - `CartContext.tsx(163,13)`: Variable no usada 'actualItem'
  - `Configuracion.tsx(128,9) y (130,9)`: Tipos incompatibles

Estos errores del frontend ya existían antes de los cambios de eliminación de MercadoPago y deben corregirse por separado.

---

*Documento generado como parte del análisis de código muerto del proyecto PatisserieDeluxe.*
