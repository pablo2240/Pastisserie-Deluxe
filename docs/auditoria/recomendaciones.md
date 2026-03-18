# Recomendaciones

Este documento contiene las recomendaciones técnicas priorizadas para mejorar el proyecto.

---

## Quick Wins (Limpieza Inmediata)

Estas tareas pueden realizarse en menos de 30 minutos y no requieren cambios funcionales.

### 1. Eliminar configuración de MercadoPago

**Riesgo:** Bajo

**Pasos:**
1. Abrir [`appsettings.Development.json`](PastisserieAPI.API/appsettings.Development.json)
2. Eliminar la sección `MercadoPago`
3. Eliminar el archivo [`AddMercadoPagoFields.sql`](PastisserieAPI.API/Database/Scripts/AddMercadoPagoFields.sql)

**Tiempo estimado:** 5 minutos

---

### 2. Eliminar imports no usados en Frontend

**Riesgo:** Bajo

**Archivos a corregir:**
- [`Notificaciones.tsx`](pastisserie-front/src/components/common/Notificaciones.tsx) - Eliminar `Trash2`, `X`
- [`Configuracion.tsx`](pastisserie-front/src/pages/admin/Configuracion.tsx) - Eliminar `api` import

**Tiempo estimado:** 10 minutos

---

### 3. Verificar y eliminar paquete epayco.net

**Riesgo:** Bajo

**Pasos:**
1. Buscar `using epayco` en todo el proyecto
2. Si no se usa, eliminar del `.csproj`

**Tiempo estimado:** 15 minutos

---

## Arreglos Críticos (Antes de Producción)

Estas tareas deben realizarse antes de任何 despliegue a producción.

### 1. Arreglar Notificaciones Service (BLOCKER)

**Riesgo:** Medio

**Problema:** El servicio no compila

**Pasos a seguir:**
1. Revisar el [`NotificacionService.cs`](PastisserieAPI.Services/Services/NotificacionService.cs)
2. Verificar que usa los métodos correctos del repositorio:
   - `FindAsync` (línea async) en lugar de `Find`
   - `UpdateAsync` (línea async) en lugar de `Update`
3. Limpiar cache de build: `dotnet clean`
4. Rebuild: `dotnet build`

**Tiempo estimado:** 30 minutos

---

### 2. Mover credenciales a Secrets

**Riesgo:** Alto (Seguridad)

**Problema:** Contraseñas en config

**Pasos:**
1. En desarrollo: `dotnet user-secrets set Smtp:Password "tu_password"`
2. En producción: Usar variables de entorno
3. Eliminar passwords hardcodeados de `appsettings.json`

**Tiempo estimado:** 20 minutos

---

### 3. Fix Zona Horaria

**Riesgo:** Medio

**Problema:** Inconsistencia de horas

**Recomendación:**
- Usar UTC en toda la base de datos
- Convertir a hora local solo en el frontend
- Crear un utilitario `toLocalTime()` en frontend

**Tiempo estimado:** 1 hora

---

## Arreglos de Alta Prioridad

### 1. Completar Sistema de Promociones

**Riesgo:** Bajo

**Estado actual:** 40% implementado

**Qué falta:**
1. Integrar `promocionesService` con `CartContext`
2. Validar condiciones (monto mínimo, fecha)
3. Aplicar descuento al total

**Pasos:**
1. En [`CartContext.tsx`](pastisserie-front/src/context/CartContext.tsx), agregar método para aplicar descuento
2. Conectar con [`PromocionesController`](PastisserieAPI.API/Controllers/PromocionesController.cs)
3. Validar vigencia y condiciones

**Tiempo estimado:** 2-3 horas

---

### 2. Crear Enum de Estados de Pedido

**Riesgo:** Bajo

**Problema:** Estados inconsistentes

**Pasos:**
1. Crear enum en `PastisserieAPI.Core/Enums/PedidoEstado.cs`
2. Actualizar entidad `Pedido` para usar el enum
3. Validar estados en el servicio

**Tiempo estimado:** 1 hora

---

### 3. Sincronizar Carrito Frontend-Backend

**Riesgo:** Medio

**Problema:** Carrito en memoria vs BD

**Opciones:**

**Opción A (Recomendada):** Usar solo localStorage
- Eliminar `CarritoController` del backend
- Simplificar a solo Frontend

**Opción B:** Sincronizar al iniciar
- Llamar `GET /api/carrito` al hacer login
- Actualizar localStorage con datos del servidor

**Tiempo estimado:** 1-2 horas

---

## Arreglos de Prioridad Media

### 1. Mejorar Sistema de Reclamaciones

**Riesgo:** Bajo

**Mejoras:**
- Validar propiedad del pedido
- Agregar más estados
- Conectar con notificaciones

**Tiempo estimado:** 2 horas

---

### 2. Implementar Sistema de Envíos

**Riesgo:** Medio

**Qué implementar:**
- CRUD completo de envíos
- Frontend para tracking
- Integración con pedidos

**Tiempo estimado:** 4 horas

---

### 3. Mejorar Facturación

**Riesgo:** Bajo

**Mejoras:**
- Mejorar plantilla PDF
- Incluir datos completos de la tienda
- Envío automático por email

**Tiempo estimado:** 2 horas

---

## Refactorización Recomendada

### 1. Estandarizar DTOs

**Problema:** Nombres inconsistentes

**Nueva convención:**
```
{Entidad}{Operacion}Dto
- UsuarioCreateDto
- UsuarioUpdateDto
- UsuarioDto (respuesta)
```

**Tiempo estimado:** 3-4 horas (revisar todos los DTOs)

---

### 2. Separar Aplicaciones (Si crece)

**Recomendación futura:**
- `PastisserieAPI.Api` → solo Controllers
- `PastisserieAPI.Application` → Services
- `PastisserieAPI.Infrastructure` → Repositorios
- `PastisserieAPI.Domain` → Entidades

**Por ahora:** Mantener estructura actual

---

### 3. Agregar Tests

**Áreas críticas a probar:**
- CarritoService
- PedidoService
- EpaycoService
- AuthService

**Tiempo estimado:** 8-10 horas (setup + tests básicos)

---

## Orden Sugerido de Refactorización

### Fase 1: Limpieza (Semana 1)
- [ ] Eliminar config MercadoPago
- [ ] Fix imports no usados
- [ ] Fix build errors

### Fase 2: Seguridad (Semana 1-2)
- [ ] Mover credenciales a secrets
- [ ] Fix zona horaria

### Fase 3: Estabilidad (Semana 2-3)
- [ ] Arreglar Notificaciones
- [ ] Crear enum de estados
- [ ] Sincronizar carrito

### Fase 4: Funcionalidad (Semana 3-4)
- [ ] Completar promociones
- [ ] Mejorar reclamaciones
- [ ] Implementar seguimientos

### Fase 5: Calidad (Mes 2)
- [ ] Estandarizar DTOs
- [ ] Agregar tests
- [ ] Documentación

---

## Validaciones Antes de Tocar Código

Antes de realizar cualquier cambio, verificar:

1. **Backup:** Hacer backup de la base de datos
2. **Branch:** Crear rama de feature
3. **Tests:** Correr tests existentes (si hay)
4. **Build:** Verificar que build pasa antes de cambios
5. **Integración:** Probar flujo end-to-end después de cambios

---

## Recursos Necesarios

| Recurso | Cantidad |
|---------|----------|
| Desarrollador Junior | 1 (para limpieza) |
| Desarrollador Senior | 1 (para arquitectura) |
| QA | 1 (para testing) |
| Tiempo estimado total | 40-60 horas |

---

## Notas Adicionales

- El proyecto tiene una buena base arquitectónica
- La mayoría de funcionalidades core funcionan
- El problema principal es el error de compilación de Notificaciones
- Después de arreglar eso, el proyecto está ~70% listo para producción
