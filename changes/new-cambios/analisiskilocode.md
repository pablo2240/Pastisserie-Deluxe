# Análisis Técnico Completo - Proyecto PatisserieDeluxe

**Fecha de análisis:** 2026-03-19  
**Analista:** Senior Architect - Kilo Code  
**Versión:** 1.0

---

## 1. Estado Actual del Sistema

El proyecto PatisserieDeluxe es una aplicación full-stack para una pastelería ubicada en Medellín, Colombia, con arquitectura limpia (Clean Architecture).

### 1.1 Backend .NET (ASP.NET Core 8)

#### Capas del Backend

| Capa | Descripción | Estado |
|------|-------------|--------|
| **PastisserieAPI.API** | Controladores, Middleware, Extensiones | ✅ Funcional |
| **PastisserieAPI.Core** | Entidades, Interfaces, Enums | ✅ Funcional |
| **PastisserieAPI.Infrastructure** | Repositorios, EF Core, Migraciones | ✅ Funcional |
| **PastisserieAPI.Services** | Lógica de negocio, DTOs, Validadores | ⚠️ Con errores |

#### Controladores y Endpoints Operativos

| Controlador | Endpoints Funcionales | Estado |
|-------------|---------------------|--------|
| **AuthController** | `/api/auth/register`, `/api/auth/login`, `/api/auth/profile` | ✅ |
| **ProductosController** | `/api/productos`, `/api/productos/{id}`, `/api/productos/activos` | ✅ |
| **PedidosController** | `/api/pedidos`, `/api/pedidos/mis-pedidos`, `/api/pedidos/{id}/estado` | ✅ |
| **CarritoController** | `/api/carrito`, `/api/carrito/items`, `/api/carrito/clear` | ✅ |
| **PagosController** | `/api/pagos/epayco/checkout-data`, `/api/pagos/epayco/confirmar` | ✅ |
| **DashboardController** | `/api/dashboard/admin`, `/api/dashboard/earnings-history` | ✅ |
| **CategoriasController** | CRUD completo de categorías | ✅ |
| **ReviewsController** | CRUD completo de reseñas | ✅ |
| **ConfiguracionController** | GET/PUT configuración de tienda | ✅ |
| **TiendaController** | Control de estado de la tienda | ✅ |
| **EnviosController** | Gestión básica de envíos | ⚠️ Parcial |
| **PromocionesController** | CRUD de promociones | ⚠️ Parcial |
| **ReclamacionesController** | Gestión de reclamaciones | ⚠️ Parcial |
| **UsersController** | Gestión de usuarios (Admin) | ✅ |
| **UploadController** | Subida de imágenes | ⚠️ Parcial |
| **NotificacionesController** | Sistema de notificaciones | ❌ No compila |

#### Entidades de Base de Datos en Uso

Las siguientes entidades están definidas en [`PastisserieAPI.Core/Entities/`](PastisserieAPI.Core/Entities/):

- **Usuario** - Usuarios del sistema (clientes, admin, repartidores)
- **Producto** - Catálogo de productos de pastelería
- **Categoria** - Categorías de productos
- **Pedido** - Pedidos realizados por usuarios
- **CarritoCompra** - Carrito de compras persistente
- **CarritoItem** - Items dentro del carrito
- **Resena** - Reseñas de productos
- **Promocion** - Promociones y descuentos
- **ConfiguracionTienda** - Configuración de la tienda
- **Notificacion** - Notificaciones del sistema
- **Envio** - Información de envíos
- **Reclamacion** - Reclamaciones de pedidos
- **MetodoPagoUsuario** - Métodos de pago guardados (parcial)
- **TipoMetodoPago** - Tipos de método de pago

### 1.2 Frontend React

#### Componentes React Activos

| Página/Componente | Ruta | Estado |
|------------------|------|--------|
| **Home** | `/` | ✅ Funcional |
| **Catálogo** | `/catalogo` | ✅ Funcional |
| **Detalle Producto** | `/producto/:id` | ✅ Funcional |
| **Carrito** | `/carrito` | ✅ Funcional |
| **Checkout** | `/checkout` | ✅ Funcional |
| **Resultado Pago** | `/resultado-pago` | ✅ Funcional |
| **Login** | `/login` | ✅ Funcional |
| **Register** | `/register` | ✅ Funcional |
| **Forgot Password** | `/forgot-password` | ✅ Funcional |
| **Reset Password** | `/reset-password` | ✅ Funcional |
| **Perfil** | `/perfil` | ✅ Funcional |
| **Promociones** | `/promociones` | ⚠️ Parcial |
| **Reclamaciones** | `/reclamaciones` | ⚠️ Parcial |
| **Contacto** | `/contacto` | ✅ Funcional |
| **Admin Dashboard** | `/admin/dashboard` | ✅ Funcional |
| **Admin Pedidos** | `/admin/pedidos` | ✅ Funcional |
| **Admin Productos** | `/admin/productos` | ✅ Funcional |
| **Admin Categorías** | `/admin/categorias` | ✅ Funcional |
| **Admin Usuarios** | `/admin/usuarios` | ✅ Funcional |
| **Admin Promociones** | `/admin/promociones` | ⚠️ Parcial |
| **Admin Reseñas** | `/admin/resenas` | ✅ Funcional |
| **Admin Reportes** | `/admin/reportes` | ✅ Funcional |
| **Admin Configuración** | `/admin/configuracion` | ✅ Funcional |
| **Repartidor Dashboard** | `/repartidor/dashboard` | ✅ Funcional |

#### Servicios y Contextos Activos

| Servicio/Contexto | Descripción | Estado |
|-------------------|-------------|--------|
| **AuthContext** | Gestión de autenticación | ✅ |
| **CartContext** | Gestión del carrito | ✅ |
| **axios** | Cliente HTTP | ✅ |
| **productService** | API de productos | ✅ |
| **orderService** | API de pedidos | ✅ |
| **cartService** | API del carrito | ✅ |
| **dashboardService** | API del dashboard | ✅ |
| **promocionesService** | API de promociones | ⚠️ Parcial |
| **reviewService** | API de reseñas | ✅ |
| **configuracionService** | API de configuración | ✅ |
| **enviosService** | API de envíos | ⚠️ Parcial |
| **reclamacionesService** | API de reclamaciones | ⚠️ Parcial |

### 1.3 Base de Datos (SQL Server)

#### Tablas en Uso

La base de datos `PastisserieDB` contiene las siguientes tablas:

- **Usuarios** - Almacena información de usuarios (clientes, admin, repartidores)
- **Productos** - Catálogo de productos con precios, stock, imágenes
- **Categorías** - Clasificación de productos
- **Pedidos** - Órdenes de compra con estados
- **CarritoCompras** - Carritos persistentes por usuario
- **CarritoItems** - Items dentro de cada carrito
- **Reseñas** - Reviews de productos por usuarios
- **Promociones** - Códigos de descuento y promociones
- **ConfiguracionTienda** - Configuración general de la tienda
- **Notificaciones** - Registro de notificaciones
- **Envios** - Información de entregas
- **Reclamaciones** - Solicitudes de reclamación
- **MetodosPagoUsuario** - Métodos de pago guardados

#### Conexión Configurada

```
Server=localhost,1433;Database=PastisserieDB;User Id=sa;Password=DevSql2026!;TrustServerCertificate=True
```

---

## 2. Implementaciones Pendientes

Las siguientes funcionalidades fueron planificadas pero aún no han sido desarrolladas completamente.

### 2.1 Backend - Nuevos Endpoints/Services Faltantes

| Funcionalidad | Ubicación | Estado | Prioridad |
|--------------|-----------|--------|-----------|
| **Sistema de Notificaciones** | NotificacionService.cs | ❌ No compila | CRÍTICA |
| **Integración Carrito-Promociones** | CartService + PromocionService | ⚠️ 0% | ALTA |
| **CRUD Métodos de Pago** | MetodoPagoUsuario | ⚠️ 20% (solo entidades) | BAJA |
| **Tracking Público de Envíos** | EnviosController | ⚠️ 0% | MEDIA |
| **Generación Automática de Facturas** | InvoiceService | ⚠️ 50% | BAJA |

### 2.2 Frontend - Componentes Pendientes

| Componente | Descripción | Estado |
|------------|-------------|--------|
| **UI de Gestión de Envíos** | Panel para admin/repartidor | ❌ No existe |
| **UI de Métodos de Pago** | Guardar métodos de pago | ❌ No existe |
| **Tracking de Pedido** | Seguimiento público | ⚠️ Parcial |

### 2.3 Modificaciones de Esquema Requeridas

1. **Enum de Estados de Pedido** - Crear para estandarizar: Pendiente, Confirmado, EnProceso, EnCamino, Entregado, Cancelado, Rechazado

2. **Tabla de Notificaciones** - Ya existe pero tiene problemas de mapeo con el servicio

3. **Campos adicionales para Facturación** - Datos completos de la empresa en configuración

---

## 3. Funcionalidades Incompletas

Las siguientes características están parcialmente implementadas y requieren finalización.

### 3.1 Notificaciones (Backend)

**Estado:** ❌ No compila (0% funcional)

**Problema:** El [`NotificacionService.cs`](PastisserieAPI.Services/Services/NotificacionService.cs) tiene errores de compilación:
- Usa `_unitOfWork.Notificaciones.FindAsync()` que genera error CS1061
- Usa `_unitOfWork.Notificaciones.UpdateAsync()` que genera error CS1061
- Intenta acceder a propiedades `Titulo` y `FechaCreacion` que generan error CS0117

**Archivos involucrados:**
- [`PastisserieAPI.Services/Services/NotificacionService.cs`](PastisserieAPI.Services/Services/NotificacionService.cs)
- [`PastisserieAPI.API/Controllers/NotificacionesController.cs`](PastisserieAPI.API/Controllers/NotificacionesController.cs)
- [`PastisserieAPI.Core/Entities/Notificacion.cs`](PastisserieAPI.Core/Entities/Notificacion.cs)

**Qué debería hacer:**
- Crear notificaciones cuando ocurre un evento (nuevo pedido, cambio de estado)
- Obtener notificaciones del usuario autenticado
- Marcar notificaciones como leídas
- Marcar todas las notificaciones como leídas

**Nivel de avance:**
- Backend: 0% (no compila)
- Frontend: 100% (el componente existe pero no funciona)

### 3.2 Promociones/Descuentos

**Estado:** ⚠️ Incompleto (~60%)

**Qué falta:**
1. **Integración con el Carrito:** La lógica para aplicar descuentos en [`CartContext.tsx`](pastisserie-front/src/context/CartContext.tsx) no está conectada con el servicio de promociones
2. **Validación de Condiciones:** No hay validación de monto mínimo o fecha de vigencia
3. **Cálculo de Descuentos:** El cálculo del total con descuento no está implementado

**Archivos involucrados:**
- [`pastisserie-front/src/pages/promociones.tsx`](pastisserie-front/src/pages/promociones.tsx)
- [`pastisserie-front/src/pages/admin/promocionesAdmin.tsx`](pastisserie-front/src/pages/admin/promocionesAdmin.tsx)
- [`pastisserie-front/src/services/promocionesService.ts`](pastisserie-front/src/services/promocionesService.ts)
- [`PastisserieAPI.API/Controllers/PromocionesController.cs`](PastisserieAPI.API/Controllers/PromocionesController.cs)

**Nivel de avance:**
- Backend: 70% (CRUD existe, pero falta lógica de aplicación)
- Frontend Admin: 80%
- Frontend Cliente: 40% (solo muestra promociones, no aplica)
- Integración Carrito: 0%

### 3.3 Reclamaciones

**Estado:** ⚠️ Básico (~65%)

**Qué falta:**
1. **Validación de Propiedad:** El backend no valida que el usuario sea propietario del pedido al crear una reclamación
2. **Integración con Notificaciones:** Al crear/actualizar una reclamación no se envía notificación
3. **Estados Completos:** Faltan estados como "En revisión", "Resuelto"

**Archivos involucrados:**
- [`pastisserie-front/src/pages/reclamaciones.tsx`](pastisserie-front/src/pages/reclamaciones.tsx)
- [`PastisserieAPI.API/Controllers/ReclamacionesController.cs`](PastisserieAPI.API/Controllers/ReclamacionesController.cs)

**Nivel de avance:**
- Backend: 60%
- Frontend: 70%

### 3.4 Envíos/Repartidores

**Estado:** ⚠️ Parcial (~40%)

**Qué falta:**
1. **Integración con Pedidos:** No se crea automáticamente un envío cuando se crea un pedido
2. **Frontend:** No hay UI para gestionar envíos
3. **Seguimiento:** No hay endpoint público para que el cliente rastree su envío

**Archivos involucrados:**
- [`PastisserieAPI.API/Controllers/EnviosController.cs`](PastisserieAPI.API/Controllers/EnviosController.cs)
- [`PastisserieAPI.Core/Entities/Envio.cs`](PastisserieAPI.Core/Entities/Envio.cs)

**Nivel de avance:**
- Backend: 40%
- Frontend: 0%

### 3.5 Estado de la Tienda (Horarios)

**Estado:** ⚠️ Parcial (~65%)

**Qué falta:**
1. **Validación en Checkout:** El checkout no verifica el estado de la tienda antes de procesar
2. **Zona Horaria:** Hay confusión entre UTC y hora de Colombia (-5)
3. **Notificaciones:** No avisa al admin cuando la tienda se cierra automáticamente

**Archivos involucrados:**
- [`pastisserie-front/src/hooks/useTiendaStatus.ts`](pastisserie-front/src/hooks/useTiendaStatus.ts)
- [`pastisserie-front/src/components/admin/ShopStatusWidget.tsx`](pastisserie-front/src/components/admin/ShopStatusWidget.tsx)
- [`PastisserieAPI.API/Controllers/TiendaController.cs`](PastisserieAPI.API/Controllers/TiendaController.cs)

**Nivel de avance:**
- Backend: 70%
- Frontend: 60%

### 3.6 Facturación

**Estado:** ⚠️ Básico (~50%)

**Qué falta:**
1. **Plantilla PDF:** El diseño de la factura es básico
2. **Datos de la Tienda:** No incluye datos completos de la pastelería en la factura
3. **Envío Automático:** No se envía la factura por email automáticamente

**Archivos involucrados:**
- [`PastisserieAPI.Services/Services/InvoiceService.cs`](PastisserieAPI.Services/Services/InvoiceService.cs)

---

## 4. Código Muerto

El siguiente código existe pero no se utiliza, está obsoleto, o no aporta valor al sistema.

### 4.1 Clases, Métodos o Archivos Sin Uso (Backend)

| Archivo/Clase | Tipo | Acción Recomendada |
|---------------|------|-------------------|
| **PaymentSimulator.tsx** | Componente React | No existe - eliminar referencia en logs |
| **epayco.net package** | Paquete NuGet | Verificar uso, eliminar si no se usa |
| **MercadoPago config** | Configuración | Eliminar de appsettings.Development.json |
| **AddMercadoPagoFields.sql** | Script SQL | Eliminar archivo |
| **IInvoiceService** | Interfaz | Revisar y completar o eliminar |

### 4.2 Componentes React No Referenciados

Según los análisis, no se encontraron componentes completamente huérfanos. Sin embargo, algunos componentes podrían no estar siendo utilizados:

- Verificar uso de todos los componentes en AdminLayout
- Revisar si `ShopStatusWidget` está siendo usado correctamente

### 4.3 Tablas de Base de Datos Obsoletas

| Tabla | Estado | Notas |
|-------|--------|-------|
| **MetodosPagoUsuario** | ⚠️ Parcial | La tabla existe pero no se usa completamente |
| **Notificaciones** | ❌ Con problemas | Existe pero el servicio no compila |

### 4.4 Configuración Redundante

1. **Configuración de MercadoPago** - Obsoleta, el proyecto usa ePayco
   - Ubicación: [`appsettings.Development.json`](PastisserieAPI.API/appsettings.Development.json)
   
2. **Paquete epayco.net sin uso** - El proyecto usa implementación propia con HttpClient
   - Ubicación: [`PastisserieAPI.Services.csproj`](PastisserieAPI.Services/PastisserieAPI.Services.csproj)

### 4.5 Scripts de Base de Datos Obsoletos

| Script | Estado | Acción |
|--------|--------|--------|
| `AddMercadoPagoFields.sql` | 💀 Obsoleto | Eliminar |
| `CreateMetodoPagoUsuarioTable.sql` | ⚠️ Parcial | Revisar uso |
| `FixMissingTables.sql` | ✅ Histórico | Probablemente aplicado |

---

## 5. Flujo Completo de Datos

A continuación se presenta el flujo completo desde la interfaz de usuario React pasando por los controllers y servicios .NET hasta la base de datos.

### 5.1 Flujo de Autenticación

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND REACT                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Login     │    │  Register   │    │ ForgotPass  │    │ ResetPass   │  │
│  │  page.tsx   │    │  page.tsx   │    │  page.tsx   │    │  page.tsx   │  │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘  │
│         │                  │                  │                  │          │
│         └──────────────────┼──────────────────┼──────────────────┘          │
│                            │                  │                               │
│                     ┌──────▼──────┐    ┌──────▼──────┐                     │
│                     │ AuthContext  │    │  axios.ts   │                     │
│                     │ (Estado)    │    │ (HTTP)      │                     │
│                     └──────┬──────┘    └──────┬──────┘                     │
└────────────────────────────┼──────────────────┼─────────────────────────────┘
                             │                  │
                             │ POST /api/auth/  │
                             │ (JWT Token)      │
                             │                  │
┌────────────────────────────┼──────────────────┼─────────────────────────────┐
│                            ▼                  ▼                             │
│                      BACKEND .NET                                             │
│                     ┌──────────────┐    ┌──────────────┐                    │
│                     │AuthController│    │  JwtBearer   │                    │
│                     │   (API)      │    │  (Middleware)│                    │
│                     └──────┬───────┘    └──────────────┘                    │
│                            │                                                  │
│                     ┌──────▼───────┐    ┌──────────────┐                    │
│                     │ AuthService  │    │  UserRepo    │                    │
│                     │  (Lógica)    │    │ (Repositorio)│                    │
│                     └──────┬───────┘    └──────────────┘                    │
│                            │                                                  │
└────────────────────────────┼──────────────────────────────────────────────────┘
                             │
                             │ EF Core
                             │
┌────────────────────────────┼──────────────────────────────────────────────────┐
│                            ▼                                                  │
│                      SQL SERVER                                              │
│                   ┌────────────────┐                                         │
│                   │   Usuarios     │◄────────── Tabla principal              │
│                   │    Table       │                                         │
│                   └────────────────┘                                         │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Flujo de Compra (Carrito → Pedido → Pago)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND REACT                                  │
│                                                                             │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐    │
│  │  Catálogo  │───►│ ProductCard│───►│CartContext │───►│  Carrito   │    │
│  │  page.tsx  │    │  (Item)    │    │ (Estado)   │    │  page.tsx  │    │
│  └────────────┘    └────────────┘    └─────┬──────┘    └─────┬──────┘    │
│                                             │                  │           │
└─────────────────────────────────────────────┼──────────────────┼───────────┘
                                              │                  │
                                              │ POST /api/carrito│
                                              │ items            │
┌─────────────────────────────────────────────┼──────────────────┼───────────┐
│                            BACKEND .NET      ▼                  ▼           │
│                     ┌──────────────────────────────────────────────┐      │
│                     │           CarritoController                  │      │
│                     └──────────────────────┬───────────────────────┘      │
│                                              │                            │
│                      ┌──────────────────────▼───────────────────────┐     │
│                      │           CarritoService                     │     │
│                      │  (Lógica de negocio del carrito)            │     │
│                      └──────────────────────┬───────────────────────┘     │
│                                              │                            │
│                      ┌──────────────────────▼───────────────────────┐     │
│                      │       CarritoRepository / ProductoRepo      │     │
│                      └──────────────────────┬───────────────────────┘     │
│                                              │                            │
└───────────────────────────────────────────────│────────────────────────────┘
                                                │ EF Core
                                                │
┌───────────────────────────────────────────────│────────────────────────────┐
│                                               ▼                            │
│                                    SQL SERVER                               │
│                         ┌─────────────┐  ┌─────────────┐                   │
│                         │  Productos  │  │CarritoItems │                   │
│                         │   Table     │  │   Table     │                   │
│                         └─────────────┘  └─────────────┘                   │
└────────────────────────────────────────────────────────────────────────────┘

                                    ▼ (CHECKOUT)

┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND REACT                                  │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                        CHECKOUT PAGE                                │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │    │
│  │  │  Resumen │  │  Envío   │  │  Pago    │  │ Confirmación    │   │    │
│  │  │  Orden   │  │(Comunas) │  │ (ePayco) │  │  (Resultado)    │   │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘   │    │
│  │       │             │             │                 │             │    │
│  │       └─────────────┴─────────────┴─────────────────┘             │    │
│  │                              │                                     │    │
│  │                     POST /api/pedidos                             │    │
│  └──────────────────────────────┼─────────────────────────────────────┘    │
│                                 │                                           │
┌────────────────────────────────┼────────────────────────────────────────────┐
│                                ▼                                            │
│                      BACKEND .NET                                           │
│                     ┌─────────────────┐                                    │
│                     │ PedidosController│                                   │
│                     └────────┬────────┘                                    │
│                              │                                             │
│                     ┌────────▼────────┐                                    │
│                     │  PedidoService   │                                    │
│                     │  - Crear pedido  │                                    │
│                     │  - Calcular total│                                    │
│                     │  - Aplicar promo │◄── Promociones (parcial)          │
│                     └────────┬────────┘                                    │
│                              │                                             │
│                     ┌────────▼────────┐    ┌────────────┐                  │
│                     │   PagosController│───►│EpaycoService│                 │
│                     │ (checkout ePayco)│    │ (API calls) │                  │
│                     └─────────────────┘    └────────────┘                  │
│                              │                                             │
└──────────────────────────────┼─────────────────────────────────────────────┘
                               │ EF Core
                               │
┌──────────────────────────────┼─────────────────────────────────────────────┐
│                              ▼                                              │
│                     SQL SERVER                                              │
│                   ┌──────────────┐  ┌────────────┐                         │
│                   │   Pedidos   │  │ Notificaciones│                       │
│                   │    Table    │  │    Table    │◄── ❌ No funciona      │
│                   └──────────────┘  └────────────┘                         │
└─────────────────────────────────────────────────────────────────────────────┘

                                    ▼ (PAGO CONFIRMADO - WEBHOOK)

┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND REACT                                  │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                    RESULTADO PAGO PAGE                             │    │
│  │         Muestra resultado de pago (éxito/falla)                   │    │
│  └────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Flujo de Datos - Brechas e Inconsistencias Identificadas

#### Brecha 1: Notificaciones (CRÍTICA)

```
El flujo debería ser:
  PedidoService → NotificacionService → Notificaciones Table

PROBLEMA: NotificacionService no compila
  ✗ FindAsync() genera error CS1061
  ✗ UpdateAsync() genera error CS1061  
  ✗ Propiedades Titulo/FechaCreacion no accesibles

IMPACTO: No se pueden enviar notificaciones de:
  - Nuevo pedido (al admin)
  - Cambio de estado (al cliente)
  - Nueva reclamación (al admin)
```

#### Brecha 2: Promociones en Carrito (ALTA)

```
El flujo debería ser:
  CartContext → validar código → PromocionesController → aplicar descuento

PROBLEMA: No hay conexión
  ✗ CartContext no llama a PromocionesController
  ✗ No hay validación de condiciones (monto mínimo, vigencia)
  ✗ No hay cálculo de descuento

IMPACTO: Las promociones no se aplican automáticamente
```

#### Brecha 3: Zona Horaria (MEDIA)

```
PROBLEMA: Inconsistencia de zonas horarias
  - DashboardController usa: DateTime.UtcNow.AddHours(-5)
  - Frontend muestra horas sin conversión consistente
  - Base de datos almacena sin estándar claro

IMPACTO: Horas mostradas pueden no coincidir con la realidad
```

#### Brecha 4: Carrito Memoria vs BD (MEDIA)

```
PROBLEMA: Dos fuentes de verdad
  - Frontend: CartContext usa localStorage (memoria)
  - Backend: CarritoController usa base de datos (persistente)

IMPACTO: 
  - Si el usuario cambia de dispositivo, pierde el carrito
  - No hay sincronización en tiempo real
```

### 5.4 Diagrama de Integración Frontend-Backend

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Puerto 5173)                               │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         PÁGINAS                                       │   │
│  │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐     │   │
│  │  │ Home  │ │Catálogo│ │Carrito│ │Checkout│ │Admin  │ │Repart │     │   │
│  │  └───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘     │   │
│  └──────┼─────────┼─────────┼─────────┼─────────┼─────────┼──────────┘   │
│         │         │         │         │         │         │              │
│  ┌──────▼─────────▼─────────▼─────────▼─────────▼─────────▼──────────┐   │
│  │                      SERVICIOS / CONTEXTOS                          │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌───────┐  │   │
│  │  │ Auth   │ │ Product│ │  Cart  │ │ Order  │ │Dashboard│ │Promo  │  │   │
│  │  │Context │ │ Service│ │Context │ │ Service│ │ Service │ │Service│  │   │
│  │  └───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘  │   │
│  └──────┼─────────┼─────────┼─────────┼─────────┼─────────┼───────┘   │
│         │         │         │         │         │         │             │
│  ┌──────▼─────────▼─────────▼─────────▼─────────▼─────────▼────────┐   │
│  │                          AXIOS (HTTP Client)                       │   │
│  │              Configurado con proxy: localhost:5173 → 5176        │   │
│  └──────────────────────────────┬───────────────────────────────────┘   │
└───────────────────────────────────┼───────────────────────────────────────┘
                                    │ /api/*
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Puerto 5176)                                │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      AUTHENTICATION (JWT)                            │   │
│  │              JWT Bearer Middleware + User Context                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐  │
│  │  Auth   │ │Producto │ │ Carrito │ │ Pedidos │ │ Pagos   │ │Dashboard│ │
│  │  Controller    │Controller│Controller│Controller│Controller│  │Controller│ │
│  │  ✅      │ │   ✅    │ │   ✅    │ │   ✅    │ │   ✅    │ │   ✅    │ │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬───┘  │
│       │           │           │           │           │           │       │
│  ┌────▼───────────▼───────────▼───────────▼───────────▼───────────▼─────┐ │
│  │                        SERVICIOS (Business Logic)                    │ │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │ │
│  │  │  Auth  │ │Product │ │ Carrito│ │ Pedido │ │ Epayco │ │Dashboard│ │ │
│  │  │Service │ │Service │ │ Service│ │Service │ │Service │ │ Service │ │ │
│  │  │  ✅    │ │  ✅    │ │  ✅    │ │  ✅    │ │  ✅    │ │   ✅    │ │ │
│  │  │        │ │        │ │        │ │        │ │        │ │        │ │ │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘  │ │
│  │      │         │          │         │         │          │          │ │
│  │  ┌───┴─────────┴──────────┴─────────┴─────────┴──────────┴────────┐  │ │
│  │  │              REPOSITORIES (Data Access)                       │  │ │
│  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐      │  │ │
│  │  │  │ User   │ │Product │ │ Carrito│ │  Pedido│ │  Repo  │      │  │ │
│  │  │  │  Repo  │ │  Repo  │ │  Repo  │ │  Repo  │ │ Genérico│      │  │ │
│  │  │  │   ✅   │ │   ✅   │ │   ✅   │ │   ✅   │ │   ✅   │      │  │ │
│  │  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘      │  │ │
│  │  └─────────────────────────────────────────────────────────────┘  │ │
│  │                              │                                      │ │
│  │                     ┌────────▼────────┐                           │ │
│  │                     │  ApplicationDb  │                           │ │
│  │                     │     Context     │                           │ │
│  │                     │  (EF Core)      │                           │ │
│  │                     └────────┬────────┘                           │ │
│  └─────────────────────────────┼─────────────────────────────────────┘ │
│                                 │                                          │
└─────────────────────────────────┼──────────────────────────────────────────┘
                                  │
                                  │ Microsoft.Data.SqlClient
                                  │
┌─────────────────────────────────┼──────────────────────────────────────────┐
│                                 ▼                                           │
│                    SQL SERVER (Puerto 1433)                                 │
│                                                                             │
│   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│   │ Usuarios  │  │ Productos │  │  Pedidos  │  │ Carrito   │               │
│   │   Table   │  │   Table   │  │   Table   │  │  Tables   │               │
│   └───────────┘  └───────────┘  └───────────┘  └───────────┘               │
│                                                                             │
│   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│   │Categorías │  │ Reseñas   │  │Promociones│  │   Envíos  │               │
│   │   Table   │  │   Table   │  │   Table   │  │   Table   │               │
│   └───────────┘  └───────────┘  └───────────┘  └───────────┘               │
│                                                                             │
│   ┌───────────┐  ┌───────────┐                                             │
│   │Notificaciones│ConfigTienda│  ❌ CON PROBLEMAS                          │
│   │   Table   │  │   Table   │                                             │
│   └───────────┘  └───────────┘                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Resumen Ejecutivo

### Estado General del Proyecto

| Métrica | Valor |
|---------|-------|
| **Porcentaje Funcional** | ~65-70% |
| **Controladores API** | 16 total |
| **Controladores Funcionales** | ~14 (87.5%) |
| **Controladores con Error** | 1 (Notificaciones) |
| **Páginas Frontend** | ~20 |
| **Páginas Funcionales** | ~17 (85%) |
| **Entidades Core** | ~20 |
| **Servicios** | ~15 |

### Problemas Críticos que Bloquean

1. **Notificaciones** - Error de compilación que debe arreglarse inmediatamente
2. **Build Frontend** - Errores TypeScript por variables no usadas

### Recomendaciones de Prioridad

| Prioridad | Acción | Tiempo Estimado |
|-----------|--------|-----------------|
| **CRÍTICA** | Arreglar NotificacionService para que compile | 30 min |
| **ALTA** | Limpiar código muerto (MercadoPago config) | 15 min |
| **ALTA** | Completar integración de promociones con carrito | 2-3 horas |
| **MEDIA** | Crear enum de estados de pedido | 1 hora |
| **MEDIA** | Fix zona horaria | 1 hora |
| **MEDIA** | Sincronizar carrito Frontend-Backend | 1-2 horas |
| **BAJA** | Arreglar warnings de TypeScript | 10 min |
| **BAJA** | Verificar y eliminar paquete epayco.net | 15 min |

---

*Documento generado automáticamente como parte del análisis de arquitectura del proyecto PatisserieDeluxe.*
