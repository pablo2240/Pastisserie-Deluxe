# Cambio de Ciudad: Bogota -> Medellin (Frontend)

**Fecha:** 9 de marzo de 2026  
**Alcance:** Frontend (`pastisserie-front`)

---

## Objetivo

Reemplazar todas las referencias a "Bogota" / "Bogota" por "Medellin" / "Medellin" en el codigo fuente del frontend, incluyendo nombres de funciones, variables, comentarios y textos visibles al usuario.

---

## Archivos modificados (8 archivos)

### 1. `src/utils/format.ts`

- Funcion `formatBogotaDate` renombrada a `formatMedellinDate`
- Funcion `formatBogotaDateTime` renombrada a `formatMedellinDateTime`
- Comentario JSDoc actualizado: "Bogota timezone" -> "Medellin timezone"

### 2. `src/pages/perfil.tsx`

- Import actualizado: `formatBogotaDate, formatBogotaDateTime` -> `formatMedellinDate, formatMedellinDateTime`
- Uso de `formatBogotaDate()` -> `formatMedellinDate()`
- Uso de `formatBogotaDateTime()` -> `formatMedellinDateTime()`

### 3. `src/pages/repartidor/dashboard.tsx`

- Import actualizado: `formatBogotaDate, formatBogotaDateTime` -> `formatMedellinDate, formatMedellinDateTime`
- Uso de `formatBogotaDate()` -> `formatMedellinDate()`
- Uso de `formatBogotaDateTime()` -> `formatMedellinDateTime()`
- Fallback de ciudad: `'Bogota'` -> `'Medellin'` (linea de direccion de envio)

### 4. `src/pages/admin/pedidosAdmin.tsx`

- Import actualizado: `formatBogotaDate` -> `formatMedellinDate`
- Uso de `formatBogotaDate()` -> `formatMedellinDate()`

### 5. `src/pages/admin/adminOrders.tsx`

- Import actualizado: `formatBogotaDate, formatBogotaDateTime` -> `formatMedellinDate, formatMedellinDateTime`
- Uso de `formatBogotaDate()` -> `formatMedellinDate()`
- Uso de `formatBogotaDateTime()` -> `formatMedellinDateTime()`

### 6. `src/components/admin/ShopStatusWidget.tsx`

- Variable `bogotaDate` -> `medellinDate`
- Variable `bogotaDay` -> `medellinDay`
- Comentario actualizado: "hora de Bogota" -> "hora de Medellin"

### 7. `src/components/ProductCard.tsx`

- Variable `bogotaDate` -> `medellinDate`
- Comentario actualizado: "fecha en Bogota" -> "fecha en Medellin"

### 8. `src/components/EmailPreviewModal.tsx`

- Texto de pie de pagina: `Bogota, Colombia` -> `Medellin, Colombia`

---

## Lo que NO se modifico

Las cadenas `'America/Bogota'` se mantuvieron sin cambio en los siguientes archivos:

- `src/utils/format.ts` (lineas 19 y 35)
- `src/components/admin/ShopStatusWidget.tsx` (lineas 36 y 97)
- `src/components/ProductCard.tsx` (linea 137)

**Razon:** `'America/Bogota'` es un identificador de zona horaria IANA estandar. Medellin comparte la misma zona horaria (UTC-5 / Colombia Time) y no existe `'America/Medellin'` como timezone ID valido. Cambiar estos valores romperia la funcionalidad de formateo de fechas y horas.

---

## Archivos del backend NO modificados

Los siguientes archivos del backend tambien contienen referencias a "Bogota" pero quedaron fuera del alcance de este cambio:

| Archivo | Tipo de referencia |
|---|---|
| `PastisserieAPI.Services/Services/PedidoService.cs` | Funcion `GetBogotaTime()`, timezone IDs |
| `PastisserieAPI.Services/Services/TiendaService.cs` | Variable `bogotaZone`, timezone IDs |
| `PastisserieAPI.Services/Services/InvoiceService.cs` | Variable `bogotaZone`, timezone IDs |
| `PastisserieAPI.Services/Services/EmailService.cs` | Texto pie de pagina "Bogota, Colombia" |
| `PastisserieAPI.Infrastructure/Data/DbInitializer.cs` | Direccion seed data "Bogota" |
