# Funcionalidades Incompletas

Este documento detalla las funcionalidades que no están completamente implementadas o que tienen problemas que impiden su funcionamiento.

---

## 1. Notificaciones (Backend)

### Tipo
Service / Controller

### Ubicación
- **Servicio:** `PastisserieAPI.Services/Services/NotificacionService.cs`
- **Controlador:** `PastisserieAPI.API/Controllers/NotificacionesController.cs`
- **Entidad:** `PastisserieAPI.Core/Entities/Notificacion.cs`

### Qué Debería Hacer
El sistema de notificaciones debería permitir:
- Crear notificaciones cuando ocurre un evento (nuevo pedido, cambio de estado, etc.)
- Obtener notificaciones del usuario autenticado
- Marcar notificaciones como leídas
- Marcar todas las notificaciones como leídas

### Qué le Falta
El servicio `NotificacionService.cs` tiene errores de compilación:

1. **Línea 23:** Usa `_unitOfWork.Notificaciones.FindAsync()` - Aunque el método existe en el repositorio genérico, hay un problema de tipado
2. **Línea 38:** Usa `_unitOfWork.Notificaciones.UpdateAsync()` - Mismo problema
3. **Líneas 67, 71:** Intenta acceder a propiedades `Titulo` y `FechaCreacion` de la entidad `Notificacion` que pueden tener problemas de mapeo

### Evidencia del Error (build_log.txt)
```
PastisserieAPI.Services/Services/NotificacionService.cs(24,18): error CS1061: "IRepository<Notificacion>" no contiene una definición para "Find" ni un método de extensión accesible "Find"
PastisserieAPI.Services/Services/NotificacionService.cs(39,40): error CS1061: "IRepository<Notificacion>" no contiene una definición para "Update"
PastisserieAPI.Services/Services/NotificacionService.cs(67,17): error CS0117: 'Notificacion' no contiene una definición para 'Titulo'
PastisserieAPI.Services/Services/NotificacionService.cs(71,17): error CS0117: 'Notificacion' no contiene una definición para 'FechaCreacion'
```

### Nivel de Avance
- **Backend:** 0% (no compila)
- **Frontend:** 100% (el componente existe pero no funciona)

---

## 2. Promociones/Descuentos

### Tipo
Módulo completo

### Ubicación
- **Frontend:** 
  - `pastisserie-front/src/pages/promociones.tsx`
  - `pastisserie-front/src/pages/admin/promocionesAdmin.tsx`
  - `pastisserie-front/src/services/promocionesService.ts`
- **Backend:**
  - `PastisserieAPI.API/Controllers/PromocionesController.cs`
  - `PastisserieAPI.Core/Entities/Promocion.cs`

### Qué Debería Hacer
El sistema de promociones debería permitir:
- Crear promociones con códigos de descuento
- Aplicar descuentos automáticamente en el carrito
- Validar condiciones de promoción (monto mínimo, fecha vigencia)
- Mostrar promociones activas en el frontend

### Qué le Falta
1. **Integración con el Carrito:** La lógica para aplicar descuentos en [`CartContext.tsx`](pastisserie-front/src/context/CartContext.tsx) no está conectada con el servicio de promociones
2. **Validación de Condiciones:** No hay validación de monto mínimo o fecha de vigencia
3. **Cálculo de Descuentos:** El cálculo del total con descuento no está implementado

### Nivel de Avance
- **Backend:** 70% (CRUD existe, pero falta lógica de aplicación)
- **Frontend Admin:** 80%
- **Frontend Cliente:** 40% (solo muestra promociones, no aplica)
- **Integración Carrito:** 0%

---

## 3. Reclamaciones

### Tipo
Módulo completo

### Ubicación
- **Frontend:**
  - `pastisserie-front/src/pages/reclamaciones.tsx`
  - `pastisserie-front/src/services/reclamacionesService.ts`
- **Backend:**
  - `PastisserieAPI.API/Controllers/ReclamacionesController.cs`

### Qué Debería Hacer
El sistema de reclamaciones debería permitir:
- Crear reclamaciones asociadas a pedidos
- Listar reclamaciones (para usuarios y admin)
- Actualizar estado de reclamación (Admin)
- Ver detalles de reclamación

### Qué le Falta
1. **Validación de Propiedad:** El backend no valida que el usuario sea propietario del pedido al crear una reclamación
2. **Integración con Notificaciones:** Al crear/actualizar una reclamación no se envía notificación
3. **Estados Completos:** Faltan estados como "En revisión", "Resuelto"

### Nivel de Avance
- **Backend:** 60%
- **Frontend:** 70%

---

## 4. Envíos/Repartidores

### Tipo
Controller / Service

### Ubicación
- **Backend:**
  - `PastisserieAPI.API/Controllers/EnviosController.cs`
  - `PastisserieAPI.Core/Entities/Envio.cs`
  - `PastisserieAPI.Infrastructure/Repositories/EnvioRepository.cs`

### Qué Debería Hacer
El sistema de envíos debería permitir:
- Crear registros de envío
- Rastrear estado de envío
- Asignar repartidores a pedidos

### Qué le Falta
1. **Integración con Pedidos:** No se crea automáticamente un envío cuando se crea un pedido
2. **Frontend:** No hayUI para gestionar envíos
3. **Seguimiento:** No hayendpoint público para que el cliente rastree su envío

### Nivel de Avance
- **Backend:** 40%
- **Frontend:** 0%

---

## 5. Upload de Imágenes

### Tipo
Controller

### Ubicación
- **Backend:** `PastisserieAPI.API/Controllers/UploadController.cs`

### Qué Debería Hacer
Permitir subir imágenes de productos al servidor

### Qué le Falta
1. **Validación de Archivos:** No hay validación de tipo de archivo (solo imágenes)
2. **Compresión:** No hay compresión de imágenes
3. **Limpieza:** No hay método para eliminar imágenes antiguas

### Nivel de Avance
- **Backend:** 60%

---

## 6. Facturación

### Tipo
Service

### Ubicación
- **Backend:**
  - `PastisserieAPI.Services/Services/InvoiceService.cs`
  - `PastisserieAPI.API/Controllers/PedidosController.cs` (línea 113-131)

### Qué Debería Hacer
Generar facturas PDF para los pedidos

### Qué le Falta
1. **Plantilla PDF:** El diseño de la factura es básico
2. **Datos de la Tienda:** No incluye datos completos de la pastelería en la factura
3. **Envío Automático:** No se envía la factura por email automáticamente

### Nivel de Avance
- **Backend:** 50%

---

## 7. Estado de la Tienda (Horarios)

### Tipo
Feature

### Ubicación
- **Frontend:**
  - `pastisserie-front/src/hooks/useTiendaStatus.ts`
  - `pastisserie-front/src/components/admin/ShopStatusWidget.tsx`
- **Backend:**
  - `PastisserieAPI.API/Controllers/TiendaController.cs`
  - `PastisserieAPI.Core/Entities/ConfiguracionTienda.cs`

### Qué Debería Hacer
- Mostrar si la tienda está abierta o cerrada según horarios
- Bloquear pedidos cuando la tienda está cerrada
- Permitir configurar horarios de operación

### Qué le Falta
1. **Validación en Checkout:** El checkout no verifica el estado de la tienda antes de procesar
2. **Zona Horaria:** Hay confusión entre UTC y hora de Colombia (-5)
3. **Notificaciones:** No avisa al admin cuando la tienda se cierra automáticamente

### Nivel de Avance
- **Backend:** 70%
- **Frontend:** 60%

---

## 8. Métodos de Pago Adicionales

### Tipo
Feature

### Ubicación
- **Backend:**
  - `PastisserieAPI.Core/Entities/MetodoPagoUsuario.cs`
  - `PastisserieAPI.Core/Entities/TipoMetodoPago.cs`

### Qué Debería Hacer
Permitir guardar múltiples métodos de pago por usuario

### Qué le Falta
1. **CRUD de Métodos:** No hay endpoints para gestionar métodos de pago guardados
2. **Frontend:** No hayUI para gestionar métodos de pago
3. **Integración:** No se conecta con ePayco para guardar tokens

### Nivel de Avance
- **Backend:** 20% (solo entidades)
- **Frontend:** 0%

---

## Resumen de Avance

| Funcionalidad | Backend | Frontend | Integración | Prioridad |
|---------------|---------|----------|-------------|-----------|
| Notificaciones | 0% ❌ | 100% | 0% ❌ | CRÍTICA |
| Promociones | 70% | 70% | 0% ❌ | ALTA |
| Reclamaciones | 60% | 70% | 40% | MEDIA |
| Envíos | 40% | 0% | 0% ❌ | MEDIA |
| Upload | 60% | N/A | N/A | BAJA |
| Facturación | 50% | N/A | N/A | BAJA |
| Estado Tienda | 70% | 60% | 40% | MEDIA |
| Métodos Pago | 20% | 0% | 0% ❌ | BAJA |
