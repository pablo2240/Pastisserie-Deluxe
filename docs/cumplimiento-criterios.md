# Cumplimiento de Criterios Académicos - PastisserieDeluxe

**Proyecto**: PASTISSERIE'S DELUXE  
**Código**: SENA Ficha 3035528  
**Fecha**: 03/04/2026

Este documento mapea cada criterio académico evaluado con su evidencia en el código fuente, la documentación correspondiente y enlaces directos al repositorio.

---

## A. Backend y Desarrollo (Criterios Técnicos)

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

## B. Documentación y Diseño (Criterios Académicos)

### B.1 Informe de Especificación de Requisitos (5%)

| Sub-Criterio | Cumple | Evidencia | Documentación | Link |
|--------------|:------:|-----------|---------------|------|
| **Redactar Requisitos F - NF - RN - RI** | ✅ Sí | 33 RF, 5 RNF, 9 RN, 2 RI documentados | `docs/01-requisitos/especificacion-requisitos.md` | [Ver Requisitos](01-requisitos/especificacion-requisitos.md) |
| **Presentar Informe de Requisitos** | ✅ Sí | Documento completo con trazabilidad y resumen | `docs/01-requisitos/especificacion-requisitos.md` | [Ver Informe](01-requisitos/especificacion-requisitos.md) |

### B.2 Informes de Análisis y Diseño del Software (10%)

| Sub-Criterio | Cumple | Evidencia | Documentación | Link |
|--------------|:------:|-----------|---------------|------|
| **Presenta los Diagramas UML** | ✅ Sí | 6 diagramas UML en formato Mermaid | `docs/02-diagramas/` | [Ver Diagramas](02-diagramas/) |

**Diagramas incluidos:**
| # | Diagrama | Archivo | Descripción |
|---|----------|---------|-------------|
| 1 | Casos de Uso | `casos-de-uso.md` | 54 casos de uso, 3 actores |
| 2 | Clases | `clases.md` | 18 entidades con relaciones |
| 3 | Secuencia | `secuencia.md` | 7 flujos principales |
| 4 | Componentes | `componentes.md` | Clean Architecture layers |
| 5 | Base de Datos (E-R) | `base-de-datos.md` | 18 tablas con relaciones |
| 6 | Despliegue | `despliegue.md` | Azure + Local deployment |

### B.3 Propuestas Técnicas de Servicios TI (5%)

| Sub-Criterio | Cumple | Evidencia | Documentación | Link |
|--------------|:------:|-----------|---------------|------|
| **Propuesta Técnica con Arquitectura** | ✅ Sí | Clean Architecture + Azure Cloud + React 19 + ASP.NET Core 8.0 | `docs/03-arquitectura/arquitectura-software.md` | [Ver Arquitectura](03-arquitectura/arquitectura-software.md) |

**Componentes de la propuesta técnica:**
- **Arquitectura**: Clean Architecture (4 capas)
- **Backend**: ASP.NET Core 8.0 + EF Core 8.0
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4
- **Base de Datos**: SQL Server 2022
- **Despliegue**: Azure App Service + Azure SQL + Azure Blob Storage
- **Seguridad**: JWT, BCrypt, FluentValidation, CORS

### B.4 Base de Datos del Software (15%)

| Sub-Criterio | Cumple | Evidencia | Documentación | Link |
|--------------|:------:|-----------|---------------|------|
| **Presenta Modelo E-R** | ✅ Sí | Diagrama E-R en Mermaid con 18 tablas | `docs/02-diagramas/base-de-datos.md` | [Ver E-R](02-diagramas/base-de-datos.md) |
| **Modelo Relacional (SQL)** | ✅ Sí | 18 tablas con PK, FK, índices y constraints | `docs/07-base-datos/diccionario-datos.md` | [Ver Diccionario](07-base-datos/diccionario-datos.md) |
| **Base de Datos Normalizada** | ✅ Sí | 3FN (Tercera Forma Normal) | `docs/07-base-datos/diccionario-datos.md` | [Ver Normalización](07-base-datos/diccionario-datos.md) |
| **Presenta el Script de la BD** | ✅ Sí | Script completo con 18 tablas + seed data | `docs/07-base-datos/schema-actual.sql` | [Ver Script](07-base-datos/schema-actual.sql) |

**Estado de la Base de Datos:**
- **Total de tablas**: 18 activas
- **Migraciones**: 33 aplicadas
- **Normalización**: 3FN (sin redundancias, sin dependencias transitivas)
- **Índices**: PK, FK, UNIQUE, IX (búsqueda) en todas las tablas
- **Constraints**: CHECK, FK con ON DELETE CASCADE/SET NULL/NO ACTION

---

## Resumen de Cumplimiento General

| Categoría | Peso | Cumplimiento |
|-----------|:----:|:------------:|
| Backend y Desarrollo | - | 87.5% (7/8 completos, 1 parcial) |
| Especificación de Requisitos | 5% | ✅ 100% |
| Análisis y Diseño (UML) | 10% | ✅ 100% |
| Propuestas Técnicas TI | 5% | ✅ 100% |
| Base de Datos | 15% | ✅ 100% |

---

## Detalle por Criterio (Backend)

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
| 📄 Requisitos | [docs/01-requisitos/especificacion-requisitos.md](01-requisitos/especificacion-requisitos.md) |
| 📄 Diagramas UML | [docs/02-diagramas/](02-diagramas/) |
| 📄 Schema SQL | [docs/07-base-datos/schema-actual.sql](07-base-datos/schema-actual.sql) |
| 📄 Diccionario de Datos | [docs/07-base-datos/diccionario-datos.md](07-base-datos/diccionario-datos.md) |

---

*Documento generado el 03/04/2026 como parte del proyecto PastisserieDeluxe - SENA Ficha 3035528*