# Cumplimiento de Criterios Académicos - Backend

**Proyecto**: PASTISSERIE'S DELUXE  
**Código**: SENA Ficha 3035528  
**Fecha**: 03/04/2026

Este documento mapea cada criterio académico evaluado con su evidencia en el código fuente, la documentación correspondiente y enlaces directos al repositorio.

---

## Tabla de Cumplimiento

| # | Criterio | Cumple | Ubicación en Código | Documentación | Link GitHub |
|---|----------|:------:|---------------------|---------------|-------------|
| 1 | **Arquitectura de Software** | ✅ Sí | Capas: `Core/`, `Infrastructure/`, `Services/`, `API/` | `docs/03-arquitectura/arquitectura-software.md` | [Ver Estructura](../README.md#estructura-del-proyecto) |
| 2 | **Framework Backend** | ✅ Sí | `Program.cs` (ASP.NET Core 8.0) | `docs/04-manuales/manual-tecnico.md` | [Program.cs](../PastisserieAPI.API/Program.cs) |
| 3 | **Validaciones de Información** | ✅ Sí | `Validators/` (FluentValidation) + DataAnnotations en DTOs | `docs/01-requisitos/especificacion-requisitos.md` | [Validators](../PastisserieAPI.Services/Validators/) |
| 4 | **Encriptación de Contraseñas** | ✅ Sí | `AuthService.cs` (BCrypt.Net) | `docs/06-negocio/reglas-negocio.md` (RN-001) | [AuthService.cs](../PastisserieAPI.Services/Services/AuthService.cs) |
| 5 | **Tokens / Sesiones de Seguridad** | ✅ Sí | `JwtHelper.cs` / Configuración en `Program.cs` | `docs/01-requisitos/especificacion-requisitos.md` (RF-01) | [AuthController.cs](../PastisserieAPI.API/Controllers/AuthController.cs) |
| 6 | **Algoritmia en Lógica de Negocio** | ✅ Sí | `PedidoService.cs`, `CarritoService.cs`, `TiendaService.cs` | `docs/06-negocio/reglas-negocio.md` | [PedidoService.cs](../PastisserieAPI.Services/Services/PedidoService.cs) |
| 7 | **Registro, Login y 4 CRUD Mínimo** | ✅ Sí | 9 CRUDs completos en `Controllers/` | `docs/Actual/CRUD.md` | [Controllers](../PastisserieAPI.API/Controllers/) |
| 8 | **Informes PDF y Excel** | ⚠️ Parcial | `InvoiceService.cs` (PDF básico) | `docs/05-pruebas/informe-pruebas.md` | [InvoiceService.cs](../PastisserieAPI.Services/Services/InvoiceService.cs) |

---

## Detalle por Criterio

### 1. Arquitectura de Software
- **Tipo**: Clean Architecture (Arquitectura Limpia)
- **Capas**: 
  - `Core`: Entidades, Interfaces, Enums
  - `Infrastructure`: EF Core, Repositorios, Migraciones
  - `Services`: Lógica de negocio, DTOs, Validadores
  - `API`: Controladores, Middleware, Configuración
- **Evidencia**: Separación clara de responsabilidades y dependencias hacia el núcleo.

### 2. Framework Backend
- **Tecnología**: ASP.NET Core 8.0
- **Características**: Inyección de dependencias, Middleware pipeline, Routing, CORS, Swagger.
- **Evidencia**: Configuración en `Program.cs` y archivos `.csproj`.

### 3. Validaciones de Información
- **Herramientas**: FluentValidation + DataAnnotations
- **Ubicación**: `PastisserieAPI.Services/Validators/`
- **Ejemplo**: `RegisterRequestValidator.cs` valida email, longitud de contraseña, formato de teléfono.
- **Evidencia**: Todos los DTOs de Request tienen validadores asociados.

### 4. Encriptación de Contraseñas
- **Algoritmo**: BCrypt (Cost Factor 11)
- **Ubicación**: `AuthService.cs` (`RegisterAsync` y `LoginAsync`)
- **Evidencia**: Las contraseñas nunca se almacenan en texto plano. Se usa `BCrypt.Net.BCrypt.HashPassword()`.

### 5. Tokens / Sesiones de Seguridad
- **Mecanismo**: JWT (JSON Web Tokens)
- **Configuración**: `Program.cs` (AddAuthentication, AddJwtBearer)
- **Duración**: 24 horas
- **Claims**: `UserId`, `Email`, `Rol`
- **Evidencia**: Todos los endpoints protegidos usan `[Authorize]` o `[Authorize(Roles = "...")]`.

### 6. Algoritmia en Lógica de Negocio
- **Implementación**: 
  - `PedidoService.cs`: Cálculo de totales, validación de stock, costos de envío por comuna, validación de horarios.
  - `CarritoService.cs`: Validación de stock ilimitado, cálculo de subtotales.
  - `PromocionService.cs`: Cálculo de descuentos (porcentaje vs monto fijo), validación de vigencia.
- **Evidencia**: Lógica compleja no trivial implementada en servicios.

### 7. Registro, Login y 4 CRUD Mínimo
- **Auth**: `AuthController.cs` (Register, Login, Forgot/Reset Password)
- **CRUDs Implementados (9)**:
  1. Productos (`ProductosController.cs`)
  2. Categorías (`CategoriasController.cs`)
  3. Promociones (`PromocionesController.cs`)
  4. Carrito (`CarritoController.cs`)
  5. Pedidos (`PedidosController.cs`)
  6. Reviews (`ReviewsController.cs`)
  7. Reclamaciones (`ReclamacionesController.cs`)
  8. Usuarios (`UsersController.cs`)
  9. Notificaciones (`NotificacionesController.cs`)

### 8. Informes PDF y Excel
- **PDF**: `InvoiceService.cs` genera facturas básicas en PDF.
- **Excel**: ❌ No implementado aún.
- **Estado**: Parcial. Se cumple con PDF, pero falta exportación a Excel y reportes avanzados.

---

## Enlaces Rápidos

| Recurso | Link |
|---------|------|
| 📂 Código Backend | [PastisserieAPI/](../PastisserieAPI.API/) |
| 📄 Manual Técnico | [docs/04-manuales/manual-tecnico.md](04-manuales/manual-tecnico.md) |
| 📄 Arquitectura | [docs/03-arquitectura/arquitectura-software.md](03-arquitectura/arquitectura-software.md) |
| 📄 Reglas de Negocio | [docs/06-negocio/reglas-negocio.md](06-negocio/reglas-negocio.md) |
| 📄 Auditoría CRUD | [docs/Actual/CRUD.md](Actual/CRUD.md) |

---

*Documento generado el 03/04/2026 como parte del proyecto PastisserieDeluxe - SENA Ficha 3035528*