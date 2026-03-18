# Código Muerto

Este documento identifica código que existe pero no se utiliza, está obsoleto, o no aporta valor al sistema.

---

## 1. PaymentSimulator.tsx (Inexistente)

### Tipo
Componente React

### Ubicación
Referenciado en: [`pastisserie-front/build4.log`](pastisserie-front/build4.log)

### Descripción
El archivo `PaymentSimulator.tsx` es referenciado en los logs de build como si existiera, pero el archivo **no existe** en el proyecto.

### Evidencia
```
src/components/PaymentSimulator.tsx(2,40): error TS6133: 'FiShield' is declared but its value is never read.
src/components/PaymentSimulator.tsx(26,10): error TS6133: 'publicKey' is declared but its value is never read.
```

### Impacto
- **Ninguno** - El archivo no existe, por lo que no afecta al sistema

### Acción Recomendada
- Eliminar las referencias a este archivo de los logs de build
- Verificar si debería existir o fue eliminado por error

---

## 2. Configuración de MercadoPago (Obsoleta)

### Tipo
Configuración + Scripts SQL

### Ubicación
- [`PastisserieAPI.API/appsettings.Development.json`](PastisserieAPI.API/appsettings.Development.json) (líneas 17-24)
- [`PastisserieAPI.API/Database/Scripts/AddMercadoPagoFields.sql`](PastisserieAPI.API/Database/Scripts/AddMercadoPagoFields.sql)

### Descripción
El proyecto actualmente usa **ePayco** como procesador de pagos, pero queda configuración obsoleta de **MercadoPago** en varios lugares.

### Evidencia Técnica

**appsettings.Development.json:**
```json
"MercadoPago": {
  "AccessToken": "TEST-7207163768477399-030606-...",
  "PublicKey": "TEST-6d03bacb-b68d-47be-94b4-...",
  "WebhookSecret": "TEST-7207163768477399-030606-...",
  "BackendBaseUrl": "http://localhost:5176",
  "FrontendBaseUrl": "http://localhost:5173",
  "IsSandbox": true
}
```

**appsettings.json principal:**
```json
"Epayco": {
  "PublicKey": "d52507b31882bd94b5f81d8ee14daf68",
  "PrivateKey": "1c263f4c027c8cf89e544fffd6e9f683",
  ...
}
```

### Impacto
- **Medio** - Código innecesario que puede causar confusión

### Acción Recomendada
- Eliminar la sección `MercadoPago` de `appsettings.Development.json`
- Eliminar el script `AddMercadoPagoFields.sql` o Renombrar a `AddEpaycoFields.sql` si es relevante

---

## 3. Paquete epayco.net (Sin uso aparente)

### Tipo
Paquete NuGet

### Ubicación
[`PastisserieAPI.Services/PastisserieAPI.Services.csproj`](PastisserieAPI.Services/PastisserieAPI.Services.csproj) línea 14

```xml
<PackageReference Include="epayco.net" Version="1.1.5" />
```

### Descripción
El proyecto tiene el paquete `epayco.net` instalado, pero el servicio [`EpaycoService.cs`](PastisserieAPI.Services/Services/EpaycoService.cs) parece usar implementación propia (llamadas HTTP directas) en lugar del SDK.

### Evidencia Técnica
Al revisar el servicio de ePayco, las llamadas se hacen usando `HttpClient` directamente, no el SDK de epayco.net.

### Impacto
- **Bajo** - Paquete innecesario que aumenta el tamaño de la build

### Acción Recomendada
1. Verificar si el paquete `epayco.net` se usa en algún lugar del código
2. Si no se usa, eliminarlo del `.csproj`

---

## 4. Variables no usadas en Frontend

### Tipo
Código TypeScript

### Ubicación y Evidencia

**[`pastisserie-front/src/components/common/Notificaciones.tsx`](pastisserie-front/src/components/common/Notificaciones.tsx):**
```typescript
// Línea 2: Imports no usados
import { Trash2, X } from 'react-icons/fi';  // Nunca utilizados
```

**[`pastisserie-front/src/pages/admin/Configuracion.tsx`](pastisserie-front/src/pages/admin/Configuracion.tsx):**
```typescript
// Línea 3: Variable no usada
import { api } from '../api/axios';  // api nunca utilizado
```

### Impacto
- **Ninguno** - Warning de TypeScript, no afecta funcionalidad

### Acción Recomendada
- Eliminar los imports y variables no utilizadas

---

## 5. Scripts de Base de Datos Obsoletos

### Tipo
Scripts SQL

### Ubicación
[`PastisserieAPI.API/Database/Scripts/`](PastisserieAPI.API/Database/Scripts/)

### Archivos potenciales a revisar

| Archivo | Estado | Notas |
|---------|--------|-------|
| `AddMercadoPagoFields.sql` | 💀 Obsoleto | Debería eliminarse |
| `CreateMetodoPagoUsuarioTable.sql` | ⚠️ Parcial | La tabla existe pero no se usa completamente |
| `FixMissingTables.sql` | ✅ Histórico | Probablemente ya aplicado |

### Acción Recomendada
- Revisar y eliminar scripts obsoletos después de verificar que las migraciones están aplicadas

---

## 6. Changes/ Documentos de Decisión

### Tipo
Documentación

### Ubicación
Directorio [`changes/`](changes/)

### Descripción
Hay múltiples archivos de documentación de cambios que pueden estar desactualizados o ser redundantes con la auditoría actual.

### Archivos Identificados
- `ePayco.md` - Puede ser redundante con la implementación actual
- `MERCADOPAGO_SETUP.md` - Obsoleto
- `eliminar-mercadopago-y-simplificar-pagos.md` - Histórico

### Impacto
- **Ninguno** - Solo documentación

### Acción Recomendada
- Mantener solo la documentación relevante
- Mover documentación histórica a una carpeta `docs/historico/`

---

## 7. Interfaces/Servicios no implementados

### Tipo
Interfaces

### Ubicación
[`PastisserieAPI.Services/Services/Interfaces/`](PastisserieAPI.Services/Services/Interfaces/)

### Descripción
Algunas interfaces pueden estar definidas pero no tener implementación completa.

### Evidencia
- `IInvoiceService` existe pero tiene funcionalidad limitada
- `INotificacionService` existe pero no compila

### Acción Recomendada
- Revisar cada interfaz y su implementación
- Eliminar interfaces huérfanas

---

## 8. Imágenes en wwwroot no utilizadas

### Tipo
Recursos estáticos

### Ubicación
[`PastisserieAPI.API/wwwroot/images/products/`](PastisserieAPI.API/wwwroot/images/products/)

### Descripción
Hay múltiples imágenes de productos en el servidor.Algunas pueden ser de productos eliminados.

### Evidencia
13 archivos de imagen en la carpeta.

### Acción Recomendada
- Crear un script de limpieza que elimine imágenes huérfanas (no referenciadas en la BD)

---

## Resumen de Impacto

| Ítem | Tipo | Impacto | Riesgo | Acción |
|------|------|---------|--------|--------|
| PaymentSimulator.tsx | Missing | Ninguno | Bajo | Limpiar logs |
| Config MercadoPago | Config | Medio | Bajo | Eliminar |
| epayco.net package | Dep | Bajo | Bajo | Verificar y eliminar |
| Variables no usadas | Code | Ninguno | Ninguno | Eliminar |
| Scripts SQL obsoletos | DB | Bajo | Medio | Revisar y eliminar |
| Changes docs | Docs | Ninguno | Ninguno | Archivar |
| Interfaces huérfanas | Code | Bajo | Bajo | Revisar |
| Imágenes huérfanas | Assets | Bajo | Bajo | Script cleanup |

---

## Quick Wins (Limpieza Inmediata)

1. **Eliminar configuración de MercadoPago** - 5 minutos
2. **Eliminar imports no usados en TypeScript** - 10 minutos
3. **Verificar y eliminar paquete epayco.net** - 15 minutos
4. **Archivar documentación de cambios** - 10 minutos
