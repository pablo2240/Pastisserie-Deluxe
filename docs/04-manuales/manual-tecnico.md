# Manual Técnico - PASTISSERIE'S DELUXE

**Versión**: 1.0  
**Fecha**: 03/04/2026  
**Proyecto**: Sistema de E-Commerce para Pastelería  
**SENA Ficha**: 3035528  

---

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Tecnologías y Herramientas](#tecnologías-y-herramientas)
4. [Modelo de Datos](#modelo-de-datos)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [Backend - API REST](#backend---api-rest)
7. [Frontend - Aplicación Web](#frontend---aplicación-web)
8. [Seguridad](#seguridad)
9. [Integración con Servicios Externos](#integración-con-servicios-externos)
10. [Testing y Debugging](#testing-y-debugging)
11. [Deployment y CI/CD](#deployment-y-cicd)
12. [Mantenimiento y Escalabilidad](#mantenimiento-y-escalabilidad)
13. [Apéndices](#apéndices)

---

## 1. Introducción

### 1.1 Propósito del Documento

Este manual técnico proporciona documentación completa sobre la arquitectura, diseño e implementación del sistema de e-commerce **PASTISSERIE'S DELUXE**. Está dirigido a:

- **Desarrolladores**: Que necesitan comprender el código para mantenimiento o nuevas funcionalidades
- **Arquitectos de software**: Para entender decisiones de diseño y patrones aplicados
- **DevOps**: Para configuración de infraestructura y despliegue
- **QA/Testers**: Para comprender flujos y endpoints a validar

### 1.2 Alcance del Sistema

**PASTISSERIE'S DELUXE** es una aplicación web full-stack para gestión de ventas de productos de pastelería con las siguientes capacidades:

#### Funcionalidades Principales:
- **Catálogo de productos**: Navegación, búsqueda, detalles, reviews, promociones
- **Gestión de usuarios**: Registro, login, recuperación de contraseña, perfiles
- **Carrito de compras**: Persistente, asociado a usuario autenticado
- **Procesamiento de pedidos**: Checkout, aprobación, asignación a repartidores, tracking
- **Sistema de entregas**: Dashboard para repartidores con Google Maps y GPS
- **Administración**: CRUD completo de productos, categorías, promociones, usuarios, configuración
- **Moderación de contenido**: Aprobación de reviews
- **Notificaciones**: Sistema de alertas en tiempo real
- **Reclamaciones**: Gestión de quejas y problemas de entrega
- **Reportes**: Dashboards con gráficos y estadísticas

#### Roles del Sistema:
1. **Usuario (Cliente)**: Compra productos, gestiona pedidos, escribe reviews
2. **Administrador**: Control total del sistema
3. **Repartidor**: Gestión de entregas con tracking GPS

### 1.3 Convenciones de Nomenclatura

#### Backend (C#):
```csharp
// Clases y métodos: PascalCase
public class ProductoService
public async Task<ProductoResponseDto> GetByIdAsync(int id)

// Variables y parámetros privados: _camelCase
private readonly IUnitOfWork _unitOfWork;

// Constantes: UPPER_CASE
public const string DEFAULT_CURRENCY = "COP";
```

#### Frontend (TypeScript):
```typescript
// Componentes: PascalCase
function ProductoCard({ producto }: ProductoCardProps) {}

// Funciones y variables: camelCase
const fetchProductos = async () => {}
const [productos, setProductos] = useState<Producto[]>([])

// Tipos e interfaces: PascalCase
interface Producto { ... }
type ApiResponse<T> = { ... }

// Constantes: UPPER_CASE
const API_BASE_URL = "http://localhost:5000"
```

#### Base de Datos (SQL):
- **Tablas**: PascalCase (Users, Productos, PedidoItems)
- **Columnas**: PascalCase (Id, Nombre, FechaCreacion)
- **Claves primarias**: `Id` (int, auto-incremental)
- **Claves foráneas**: `{Entidad}Id` (ej: UsuarioId, ProductoId)

---

## 2. Arquitectura del Sistema

### 2.1 Arquitectura General

El sistema sigue una arquitectura **Cliente-Servidor** con separación completa entre Frontend (SPA) y Backend (API REST).

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Navegador)                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  React 19 SPA + TypeScript + Tailwind CSS v4         │  │
│  │  - Páginas: 27 rutas (público + privado)             │  │
│  │  - Contextos: Auth, Carrito                          │  │
│  │  - Servicios: API clients (Axios)                    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTPS/JSON
┌─────────────────────────────────────────────────────────────┐
│              SERVIDOR (ASP.NET Core 8.0)                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ API Layer: 15 Controllers (REST endpoints)           │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Services Layer: 10 Services (lógica de negocio)      │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Infrastructure: UnitOfWork + Repositories (EF Core)  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Core: 18 Entities + Interfaces (Domain)              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────┬──────────────────┬──────────────────────┐
│   SQL Server       │  Azure Blob      │    Gmail SMTP        │
│   (PastisserieDB)  │  Storage         │    (Emails)          │
│   18 tablas        │  (Imágenes)      │                      │
└────────────────────┴──────────────────┴──────────────────────┘
```

### 2.2 Clean Architecture (Backend)

El backend sigue los principios de **Clean Architecture** (Robert C. Martin) con 4 capas:

#### Capas (de adentro hacia afuera):

1. **Core (Dominio)** - `PastisserieAPI.Core`
   - **Responsabilidad**: Definir entidades de negocio e interfaces
   - **Dependencias**: NINGUNA (capa más interna)
   - **Contenido**: 
     - 18 Entities (User, Producto, Pedido, etc.)
     - Enums (EstadoPedido, TipoRol, TipoNotificacion)
     - Interfaces (IRepository, IUnitOfWork, IAuthService, etc.)

2. **Infrastructure (Infraestructura)** - `PastisserieAPI.Infrastructure`
   - **Responsabilidad**: Implementar acceso a datos
   - **Dependencias**: Core, EF Core, SQL Server
   - **Contenido**:
     - ApplicationDbContext (DbContext de EF Core)
     - Repositories (implementaciones de IRepository<T>)
     - UnitOfWork (implementación de IUnitOfWork)
     - Migrations (33 migraciones de base de datos)

3. **Services (Aplicación)** - `PastisserieAPI.Services`
   - **Responsabilidad**: Lógica de negocio
   - **Dependencias**: Core, Infrastructure, AutoMapper, FluentValidation
   - **Contenido**:
     - 10 Services (AuthService, ProductoService, etc.)
     - DTOs Request/Response (RegisterRequestDto, ProductoResponseDto, etc.)
     - Validators (FluentValidation)
     - AutoMapper Profiles (mapeos Entity ↔ DTO)
     - Helpers (JwtHelper, EmailHelper)

4. **API (Presentación)** - `PastisserieAPI.API`
   - **Responsabilidad**: Exponer endpoints HTTP
   - **Dependencias**: Services
   - **Contenido**:
     - 15 Controllers (AuthController, ProductoController, etc.)
     - Middleware (GlobalExceptionMiddleware, JWT, CORS)
     - Program.cs (configuración de servicios)
     - appsettings.json (configuración de la aplicación)

#### Flujo de Dependencias:
```
API → Services → Infrastructure → Core
                                   ↑
                    Todos dependen de Core (interfaces)
```

**Beneficios**:
- ✅ Testabilidad: Fácil crear mocks de interfaces
- ✅ Independencia de frameworks: Core no conoce EF Core
- ✅ Flexibilidad: Cambiar ORM sin tocar lógica de negocio
- ✅ Separación de responsabilidades: Cada capa tiene un propósito claro

### 2.3 Patrón de Comunicación

#### Request/Response HTTP:
```
1. Cliente (React) → HTTP Request (JSON) → Controller
2. Controller → llama a Service
3. Service → valida DTO con FluentValidation
4. Service → llama a UnitOfWork.Repository
5. Repository → consulta base de datos con EF Core
6. Database → retorna Entity
7. Service → mapea Entity a DTO con AutoMapper
8. Controller → envuelve en ApiResponse<T>
9. Controller → HTTP Response (JSON) → Cliente
```

#### Formato de Respuestas:
```csharp
// Éxito
{
  "success": true,
  "message": "Operación exitosa",
  "data": { /* DTO */ }
}

// Error
{
  "success": false,
  "message": "Error al procesar solicitud",
  "data": null
}
```

---

## 3. Tecnologías y Herramientas

### 3.1 Stack Tecnológico

#### Backend
| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| .NET | 8.0 | Framework principal |
| ASP.NET Core | 8.0 | Web API framework |
| Entity Framework Core | 8.0.2 | ORM para acceso a datos |
| SQL Server | 2022 | Base de datos relacional |
| BCrypt.Net-Next | 4.0.3 | Hashing de contraseñas |
| System.IdentityModel.Tokens.Jwt | 8.0.0 | Generación/validación de JWT |
| AutoMapper | (via Services) | Mapeo Entity ↔ DTO |
| FluentValidation | (via Services) | Validación de DTOs |
| Azure.Storage.Blobs | (via Services) | Subida de imágenes a Azure |
| Swashbuckle (Swagger) | 6.6.2 | Documentación de API |

#### Frontend
| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| React | 19.2.0 | Framework de UI |
| TypeScript | 5.9.3 | Tipado estático |
| Vite | 7.2.4 | Build tool y dev server |
| Tailwind CSS | 4.1.18 | Framework CSS utility-first |
| React Router | 7.13.0 | Enrutamiento SPA |
| Axios | 1.13.4 | Cliente HTTP |
| Recharts | 2.15.0 | Gráficos para dashboards |
| React Hot Toast | 2.6.0 | Notificaciones toast |
| SweetAlert2 | 11.26.24 | Alertas modales |
| Lucide React | 0.563.0 | Iconos |

#### Base de Datos
- **SQL Server 2022** (local) / **Azure SQL Database** (producción)
- 18 tablas
- 33 migraciones aplicadas

#### Servicios Externos
- **Azure Blob Storage**: Almacenamiento de imágenes de productos
- **Gmail SMTP**: Envío de emails (recuperación de contraseña)
- **Google Maps API**: (Futuro) Visualización de rutas de entrega

### 3.2 Herramientas de Desarrollo

| Herramienta | Propósito |
|------------|-----------|
| Visual Studio Code | Editor de código principal |
| SQL Server Management Studio (SSMS) | Administración de base de datos |
| Postman | Testing de endpoints de API |
| Azure Portal | Gestión de servicios en la nube |
| Git + GitHub | Control de versiones |
| GitHub Actions | CI/CD (futuro) |

### 3.3 Requisitos del Sistema

#### Para Desarrollo:
- **OS**: Windows 10/11, macOS, Linux
- **CPU**: Intel i5 o superior (2 cores mínimo)
- **RAM**: 8 GB mínimo, 16 GB recomendado
- **Disco**: 10 GB libres
- **Software**:
  - .NET SDK 8.0+
  - Node.js 20 LTS+
  - SQL Server 2022 Express (Windows) / Docker SQL Server (macOS/Linux)
  - Visual Studio Code
  - Git

#### Para Producción:
- **Frontend**: Azure App Service (Basic B1 mínimo)
- **Backend**: Azure App Service (Standard S1 recomendado)
- **Database**: Azure SQL Database (Basic tier mínimo)
- **Storage**: Azure Blob Storage (Standard LRS)

---

## 4. Modelo de Datos

### 4.1 Diagrama Entidad-Relación

Ver diagrama completo en: [`docs/02-diagramas/base-de-datos.md`](../02-diagramas/base-de-datos.md)

### 4.2 Entidades Principales

#### Users
```sql
CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(100) NOT NULL,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(500) NOT NULL,
    Telefono NVARCHAR(20),
    EmailVerificado BIT NOT NULL DEFAULT 0,
    FechaRegistro DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UltimoAcceso DATETIME2,
    Activo BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FechaActualizacion DATETIME2
);
```

**Relaciones**:
- 1:N con `UserRoles` (roles múltiples)
- 1:1 con `CarritoCompras`
- 1:N con `Pedidos` (como cliente y como repartidor)
- 1:N con `Reviews`, `Notificaciones`, `DireccionesEnvio`

#### Productos
```sql
CREATE TABLE Productos (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(200) NOT NULL,
    Descripcion NVARCHAR(1000),
    Precio DECIMAL(18,2) NOT NULL CHECK (Precio > 0),
    Stock INT NOT NULL DEFAULT 0 CHECK (Stock >= 0),
    StockIlimitado BIT NOT NULL DEFAULT 0, -- Agregado 02/04/2026
    StockMinimo INT,
    CategoriaProductoId INT,
    ImagenUrl NVARCHAR(500), -- URL en Azure Blob Storage
    EsPersonalizable BIT NOT NULL DEFAULT 0,
    Activo BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FechaActualizacion DATETIME2,
    CONSTRAINT FK_Productos_CategoriasProducto FOREIGN KEY (CategoriaProductoId)
        REFERENCES CategoriasProducto(Id) ON DELETE SET NULL
);
```

**Índices**:
- `IX_Productos_Activo` (filtrar productos activos)
- `IX_Productos_CategoriaProductoId` (búsquedas por categoría)

#### Pedidos
```sql
CREATE TABLE Pedidos (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UsuarioId INT NOT NULL,
    FechaPedido DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    Estado NVARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    MetodoPago NVARCHAR(100) NOT NULL DEFAULT 'Efectivo',
    DireccionEnvioId INT,
    Subtotal DECIMAL(18,2) NOT NULL,
    CostoEnvio DECIMAL(18,2) NOT NULL,
    Total DECIMAL(18,2) NOT NULL CHECK (Total > 0),
    Aprobado BIT NOT NULL DEFAULT 0,
    FechaAprobacion DATETIME2,
    FechaEntregaEstimada DATETIME2,
    FechaEntrega DATETIME2,
    NotasCliente NVARCHAR(1000),
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FechaActualizacion DATETIME2,
    RepartidorId INT, -- FK a Users (repartidor)
    MotivoNoEntrega NVARCHAR(500),
    FechaNoEntrega DATETIME2,
    CONSTRAINT FK_Pedidos_Users_Usuario FOREIGN KEY (UsuarioId)
        REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Pedidos_Users_Repartidor FOREIGN KEY (RepartidorId)
        REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Pedidos_DireccionesEnvio FOREIGN KEY (DireccionEnvioId)
        REFERENCES DireccionesEnvio(Id) ON DELETE SET NULL,
    CONSTRAINT CHK_Pedidos_Estado CHECK (Estado IN ('Pendiente', 'Aprobado', 'EnCamino', 'Entregado', 'Cancelado', 'NoEntregado'))
);
```

**Índices**:
- `IX_Pedidos_UsuarioId` (búsquedas de "Mis Pedidos")
- `IX_Pedidos_RepartidorId` (pedidos asignados a repartidor)
- `IX_Pedidos_Estado` (filtrar por estado)
- `IX_Pedidos_FechaPedido` (ordenar cronológicamente)

### 4.3 Cambios Recientes en el Modelo

#### Entidades Eliminadas (Marzo 2026):
- ❌ **Factura**: Reemplazada por `RegistrosPagos` simplificado
- ❌ **Envios**: Datos absorbidos por `Pedidos` (campos `RepartidorId`, `FechaEntrega`, etc.)
- ❌ **MetodosPagoUsuario + TiposMetodoPago**: Simplificado a campo string `MetodoPago` en `Pedidos`
- ❌ **Personalización**: Funcionalidad pospuesta (flag `EsPersonalizable` en `Producto`)

#### Campos Agregados (Abril 2026):
- ✅ `Producto.StockIlimitado` (02/04/2026): Permite inventario infinito
- ✅ `DireccionEnvio.Latitud + Longitud` (02/04/2026): Coordenadas GPS para Google Maps

---

## 5. Estructura del Proyecto

### 5.1 Backend (ASP.NET Core 8.0)

```
PastisserieAPI/
├── PastisserieAPI.sln
├── PastisserieAPI.Core/                 # Capa de Dominio
│   ├── Entities/                        # 18 entidades
│   │   ├── User.cs
│   │   ├── Producto.cs
│   │   ├── Pedido.cs
│   │   └── ... (15 más)
│   ├── Enums/
│   │   ├── EstadoPedido.cs
│   │   ├── TipoRol.cs
│   │   └── TipoNotificacion.cs
│   └── Interfaces/
│       ├── IRepository.cs
│       ├── IUnitOfWork.cs
│       └── Repositories/ (interfaces específicas)
├── PastisserieAPI.Infrastructure/       # Capa de Infraestructura
│   ├── Data/
│   │   ├── ApplicationDbContext.cs      # DbContext de EF Core
│   │   └── DbInitializer.cs             # Seeding de datos
│   ├── Repositories/                    # Implementaciones
│   │   ├── Repository.cs                # Genérico
│   │   ├── UserRepository.cs
│   │   ├── ProductoRepository.cs
│   │   └── ... (16 más)
│   ├── UnitOfWork.cs                    # Coordinador de repositorios
│   └── Migrations/                      # 33 migraciones de EF Core
├── PastisserieAPI.Services/             # Capa de Aplicación
│   ├── Services/
│   │   ├── Interfaces/
│   │   │   ├── IAuthService.cs
│   │   │   ├── IProductoService.cs
│   │   │   └── ... (8 más)
│   │   └── Implementations/
│   │       ├── AuthService.cs
│   │       ├── ProductoService.cs
│   │       └── ... (8 más)
│   ├── DTOs/
│   │   ├── Request/
│   │   │   ├── RegisterRequestDto.cs
│   │   │   ├── LoginRequestDto.cs
│   │   │   └── ... (20+ más)
│   │   └── Response/
│   │       ├── UserResponseDto.cs
│   │       ├── ProductoResponseDto.cs
│   │       └── ... (20+ más)
│   ├── Validators/                      # FluentValidation
│   │   ├── RegisterRequestDtoValidator.cs
│   │   └── ... (10+ más)
│   ├── Mappings/
│   │   └── MappingProfile.cs            # AutoMapper
│   └── Helpers/
│       ├── JwtHelper.cs
│       └── EmailHelper.cs
└── PastisserieAPI.API/                  # Capa de Presentación
    ├── Controllers/                     # 15 controladores
    │   ├── AuthController.cs
    │   ├── ProductoController.cs
    │   ├── PedidoController.cs
    │   └── ... (12 más)
    ├── Middleware/
    │   └── GlobalExceptionMiddleware.cs
    ├── Program.cs                       # Configuración de servicios
    ├── appsettings.json                 # Configuración general
    ├── appsettings.Development.json     # Configuración de desarrollo
    └── appsettings.Example.json         # Template de configuración
```

### 5.2 Frontend (React 19 + TypeScript)

```
pastisserie-front/
├── public/                              # Assets estáticos
│   └── vite.svg
├── src/
│   ├── api/                             # Configuración de Axios
│   │   └── axios.ts
│   ├── components/                      # Componentes reutilizables
│   │   ├── common/
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── productos/
│   │   │   ├── ProductoCard.tsx
│   │   │   └── ProductoList.tsx
│   │   └── ... (10+ componentes)
│   ├── context/                         # React Context API
│   │   ├── AuthContext.tsx              # Estado de autenticación
│   │   └── CartContext.tsx              # Estado del carrito
│   ├── hooks/                           # Custom hooks
│   │   ├── useAuth.ts
│   │   └── useCarrito.ts
│   ├── layouts/                         # Layouts de páginas
│   │   ├── MainLayout.tsx
│   │   ├── AdminLayout.tsx
│   │   └── RepartidorLayout.tsx
│   ├── pages/                           # 27 páginas
│   │   ├── public/
│   │   │   ├── HomePage.tsx
│   │   │   ├── ProductosPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── cliente/
│   │   │   ├── CarritoPage.tsx
│   │   │   ├── MisPedidosPage.tsx
│   │   │   ├── PerfilPage.tsx
│   │   │   └── ... (5 más)
│   │   ├── admin/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ProductosAdminPage.tsx
│   │   │   ├── PedidosAdminPage.tsx
│   │   │   └── ... (8 más)
│   │   └── repartidor/
│   │       ├── DashboardRepartidorPage.tsx
│   │       ├── EntregasPage.tsx
│   │       └── MapaPage.tsx
│   ├── services/                        # API clients
│   │   ├── authService.ts
│   │   ├── productoService.ts
│   │   ├── carritoService.ts
│   │   ├── pedidoService.ts
│   │   └── ... (10+ servicios)
│   ├── types/                           # TypeScript types
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   ├── producto.ts
│   │   └── ... (10+ archivos)
│   ├── utils/                           # Utilidades
│   │   ├── formatDate.ts
│   │   ├── formatCurrency.ts
│   │   └── validateForm.ts
│   ├── App.tsx                          # Componente raíz
│   ├── main.tsx                         # Entry point
│   └── index.css                        # Estilos globales + Tailwind
├── package.json
├── tsconfig.json                        # Configuración TypeScript
├── vite.config.ts                       # Configuración Vite
├── tailwind.config.js                   # Configuración Tailwind
└── eslint.config.js                     # Configuración ESLint
```

---

## 6. Backend - API REST

### 6.1 Controllers (15 total)

#### AuthController (`/api/auth`)
**Responsabilidad**: Autenticación y gestión de cuentas

| Endpoint | Método | Descripción | Autenticación |
|----------|--------|-------------|---------------|
| `/register` | POST | Registro de nuevo usuario | No |
| `/login` | POST | Login y generación de JWT | No |
| `/forgot-password` | POST | Envío de email de recuperación | No |
| `/reset-password` | POST | Reset de contraseña con token | No |

**Ejemplo de Request/Response**:
```http
POST /api/auth/register
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "telefono": "3001234567"
}

Response 201 Created:
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "id": 5,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "telefono": "3001234567",
    "roles": ["Usuario"],
    "fechaRegistro": "2026-04-03T19:30:00Z"
  }
}
```

#### ProductoController (`/api/producto`)
**Responsabilidad**: CRUD de productos

| Endpoint | Método | Descripción | Roles |
|----------|--------|-------------|-------|
| `/` | GET | Listar productos activos | Público |
| `/{id}` | GET | Detalle de producto | Público |
| `/` | POST | Crear producto | Admin |
| `/{id}` | PUT | Editar producto | Admin |
| `/{id}` | DELETE | Soft delete (Activo = false) | Admin |
| `/categoria/{catId}` | GET | Productos por categoría | Público |

**Ejemplo de Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Torta de Chocolate",
      "descripcion": "Deliciosa torta de chocolate con cobertura de ganache",
      "precio": 45000.00,
      "stock": 10,
      "stockIlimitado": false,
      "imagenUrl": "https://storage.blob.core.windows.net/productos/abc123.jpg",
      "categoria": {
        "id": 1,
        "nombre": "Tortas"
      },
      "calificacionPromedio": 4.5,
      "totalReviews": 12,
      "activo": true
    }
  ]
}
```

#### PedidoController (`/api/pedido`)
**Responsabilidad**: Gestión del ciclo completo de pedidos

| Endpoint | Método | Descripción | Roles |
|----------|--------|-------------|-------|
| `/crear` | POST | Crear pedido desde carrito | Usuario |
| `/usuario` | GET | Mis pedidos | Usuario |
| `/todos` | GET | Todos los pedidos (filtros opcionales) | Admin |
| `/{id}` | GET | Detalle de pedido | Usuario/Admin/Repartidor |
| `/{id}/aprobar` | PUT | Aprobar pedido | Admin |
| `/{id}/asignar-repartidor` | PUT | Asignar repartidor | Admin |
| `/mis-asignaciones` | GET | Pedidos del repartidor autenticado | Repartidor |
| `/{id}/marcar-entregado` | PUT | Marcar como entregado | Repartidor |
| `/{id}/marcar-no-entregado` | PUT | Marcar como no entregado (crea Reclamación) | Repartidor |
| `/{id}/cancelar` | PUT | Cancelar pedido | Usuario/Admin |

**Estados del Pedido**:
1. **Pendiente**: Creado por cliente, esperando aprobación
2. **Aprobado**: Aprobado por admin, esperando asignación de repartidor
3. **EnCamino**: Asignado a repartidor, en proceso de entrega
4. **Entregado**: Entregado exitosamente
5. **NoEntregado**: No pudo entregarse (genera Reclamación automática)
6. **Cancelado**: Cancelado por usuario o admin

### 6.2 Services (10 total)

#### AuthService
```csharp
public interface IAuthService
{
    Task<UserResponseDto> RegisterAsync(RegisterRequestDto request);
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
    Task<bool> ForgotPasswordAsync(string email);
    Task<bool> ResetPasswordAsync(ResetPasswordRequestDto request);
}

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public async Task<UserResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        // 1. Validar email único
        var existingUser = await _unitOfWork.Users.GetByEmailAsync(request.Email);
        if (existingUser != null)
            throw new InvalidOperationException("El email ya está registrado");

        // 2. Hashear contraseña con BCrypt
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // 3. Crear usuario
        var user = new User
        {
            Nombre = request.Nombre,
            Email = request.Email,
            PasswordHash = passwordHash,
            Telefono = request.Telefono,
            EmailVerificado = false,
            Activo = true
        };

        await _unitOfWork.Users.AddAsync(user);

        // 4. Asignar rol "Usuario" por defecto
        var rolUsuario = await _unitOfWork.Roles.GetByNameAsync("Usuario");
        var userRol = new UserRol
        {
            UsuarioId = user.Id,
            RolId = rolUsuario.Id
        };

        await _unitOfWork.UserRoles.AddAsync(userRol);

        // 5. Crear carrito vacío
        var carrito = new CarritoCompra { UsuarioId = user.Id };
        await _unitOfWork.Carritos.AddAsync(carrito);

        // 6. Guardar cambios (transacción atómica)
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<UserResponseDto>(user);
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
    {
        // 1. Buscar usuario por email (incluye roles)
        var user = await _unitOfWork.Users.GetByEmailWithRolesAsync(request.Email);
        if (user == null || !user.Activo)
            throw new UnauthorizedAccessException("Credenciales inválidas");

        // 2. Verificar contraseña con BCrypt
        var isValidPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!isValidPassword)
            throw new UnauthorizedAccessException("Credenciales inválidas");

        // 3. Actualizar último acceso
        user.UltimoAcceso = DateTime.UtcNow;
        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync();

        // 4. Generar JWT token
        var token = JwtHelper.GenerateToken(user);

        return new LoginResponseDto
        {
            Token = token,
            User = _mapper.Map<UserResponseDto>(user)
        };
    }
}
```

#### ProductoService
```csharp
public interface IProductoService
{
    Task<IEnumerable<ProductoResponseDto>> GetAllAsync();
    Task<ProductoResponseDto?> GetByIdAsync(int id);
    Task<ProductoResponseDto> CreateAsync(CreateProductoDto dto);
    Task<ProductoResponseDto> UpdateAsync(int id, UpdateProductoDto dto);
    Task<bool> DeleteAsync(int id); // Soft delete
}

public class ProductoService : IProductoService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public async Task<IEnumerable<ProductoResponseDto>> GetAllAsync()
    {
        var productos = await _unitOfWork.Productos.GetActiveProductsAsync();
        return _mapper.Map<IEnumerable<ProductoResponseDto>>(productos);
    }

    public async Task<ProductoResponseDto> CreateAsync(CreateProductoDto dto)
    {
        // Validación: categoría existe
        if (dto.CategoriaProductoId.HasValue)
        {
            var categoria = await _unitOfWork.CategoriasProducto.GetByIdAsync(dto.CategoriaProductoId.Value);
            if (categoria == null)
                throw new InvalidOperationException("Categoría no encontrada");
        }

        var producto = _mapper.Map<Producto>(dto);
        await _unitOfWork.Productos.AddAsync(producto);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<ProductoResponseDto>(producto);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var producto = await _unitOfWork.Productos.GetByIdAsync(id);
        if (producto == null)
            return false;

        // Soft delete
        producto.Activo = false;
        producto.FechaActualizacion = DateTime.UtcNow;
        _unitOfWork.Productos.Update(producto);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }
}
```

### 6.3 DTOs (Data Transfer Objects)

#### Separación Request/Response
```csharp
// Request DTO (datos del cliente)
public class RegisterRequestDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
    public string? Telefono { get; set; }
}

// Response DTO (datos al cliente - SIN PasswordHash!)
public class UserResponseDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public List<string> Roles { get; set; } = new();
    public DateTime FechaRegistro { get; set; }
}
```

**Beneficios**:
- ✅ Seguridad: No exponer campos sensibles (PasswordHash)
- ✅ Validación: FluentValidation solo en Request DTOs
- ✅ Versionado: Cambiar DTOs sin tocar entidades
- ✅ Over-posting prevention: Cliente no puede enviar `Id` o `FechaCreacion`

### 6.4 Validación con FluentValidation

```csharp
public class RegisterRequestDtoValidator : AbstractValidator<RegisterRequestDto>
{
    public RegisterRequestDtoValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre es obligatorio")
            .MaximumLength(100).WithMessage("El nombre no puede exceder 100 caracteres");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("El email es obligatorio")
            .EmailAddress().WithMessage("Formato de email inválido")
            .MaximumLength(150).WithMessage("El email no puede exceder 150 caracteres");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La contraseña es obligatoria")
            .MinimumLength(6).WithMessage("La contraseña debe tener al menos 6 caracteres");

        RuleFor(x => x.ConfirmPassword)
            .Equal(x => x.Password).WithMessage("Las contraseñas no coinciden");

        RuleFor(x => x.Telefono)
            .MaximumLength(20).WithMessage("El teléfono no puede exceder 20 caracteres")
            .When(x => !string.IsNullOrEmpty(x.Telefono));
    }
}
```

**Registro en `Program.cs`**:
```csharp
builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestDtoValidator>();
```

### 6.5 Middleware

#### GlobalExceptionMiddleware
```csharp
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var statusCode = exception switch
        {
            UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
            InvalidOperationException => StatusCodes.Status400BadRequest,
            KeyNotFoundException => StatusCodes.Status404NotFound,
            _ => StatusCodes.Status500InternalServerError
        };

        context.Response.StatusCode = statusCode;

        var response = new
        {
            success = false,
            message = exception.Message,
            data = (object?)null
        };

        return context.Response.WriteAsJsonAsync(response);
    }
}
```

**Registro en `Program.cs`**:
```csharp
app.UseMiddleware<GlobalExceptionMiddleware>();
```

---

## 7. Frontend - Aplicación Web

### 7.1 Arquitectura de Componentes

#### Patrón Container/Presentational
```
Pages (Smart Components)
   ↓ props
Components (Presentational)
```

**Ejemplo**:
```typescript
// Page (Container) - tiene lógica y estado
function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const data = await productoService.getAll();
        setProductos(data);
      } catch (error) {
        toast.error("Error al cargar productos");
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1>Productos</h1>
      <ProductoList productos={productos} />
    </div>
  );
}

// Component (Presentational) - solo recibe props y renderiza
interface ProductoListProps {
  productos: Producto[];
}

function ProductoList({ productos }: ProductoListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {productos.map(producto => (
        <ProductoCard key={producto.id} producto={producto} />
      ))}
    </div>
  );
}
```

### 7.2 Context API para Estado Global

#### AuthContext
```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    // Verificar token al cargar la app
    if (token) {
      authService.verifyToken(token)
        .then(userData => setUser(userData))
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
        });
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('token', response.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const hasRole = (role: string) => {
    return user?.roles.includes(role) ?? false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Uso en componentes**:
```typescript
function Navbar() {
  const { user, logout, hasRole } = useAuth();

  return (
    <nav>
      <span>Hola, {user?.nombre}</span>
      {hasRole('Admin') && <Link to="/admin">Admin Panel</Link>}
      <button onClick={logout}>Cerrar Sesión</button>
    </nav>
  );
}
```

### 7.3 Routing con React Router v7

```typescript
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/productos" element={<ProductosPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas protegidas - Usuario */}
        <Route element={<ProtectedRoute roles={['Usuario']} />}>
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/mis-pedidos" element={<MisPedidosPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
        </Route>

        {/* Rutas protegidas - Admin */}
        <Route element={<ProtectedRoute roles={['Admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="productos" element={<ProductosAdminPage />} />
            <Route path="pedidos" element={<PedidosAdminPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
          </Route>
        </Route>

        {/* Rutas protegidas - Repartidor */}
        <Route element={<ProtectedRoute roles={['Repartidor']} />}>
          <Route path="/repartidor" element={<RepartidorLayout />}>
            <Route index element={<DashboardRepartidorPage />} />
            <Route path="entregas" element={<EntregasPage />} />
            <Route path="mapa" element={<MapaPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**ProtectedRoute**:
```typescript
interface ProtectedRouteProps {
  roles?: string[];
}

function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.some(role => hasRole(role))) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
```

### 7.4 API Services (Axios)

#### Configuración de Axios
```typescript
// src/api/axios.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor: Agregar token a cada request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: Manejo de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

#### Service Example (productoService.ts)
```typescript
import apiClient from '../api/axios';
import type { Producto, CreateProductoDto, UpdateProductoDto } from '../types';

export const productoService = {
  getAll: async (): Promise<Producto[]> => {
    const response = await apiClient.get('/api/producto');
    return response.data.data;
  },

  getById: async (id: number): Promise<Producto> => {
    const response = await apiClient.get(`/api/producto/${id}`);
    return response.data.data;
  },

  create: async (dto: CreateProductoDto): Promise<Producto> => {
    const response = await apiClient.post('/api/producto', dto);
    return response.data.data;
  },

  update: async (id: number, dto: UpdateProductoDto): Promise<Producto> => {
    const response = await apiClient.put(`/api/producto/${id}`, dto);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/producto/${id}`);
  }
};
```

### 7.5 Estilos con Tailwind CSS v4

**Tailwind configurado en `index.css`**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition;
  }

  .btn-secondary {
    @apply bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition;
  }

  .card {
    @apply bg-white shadow-md rounded-lg p-4;
  }
}
```

**Uso en componentes**:
```typescript
function ProductoCard({ producto }: { producto: Producto }) {
  return (
    <div className="card hover:shadow-lg transition">
      <img src={producto.imagenUrl} alt={producto.nombre} className="w-full h-48 object-cover rounded" />
      <h3 className="text-lg font-bold mt-2">{producto.nombre}</h3>
      <p className="text-gray-600 text-sm">{producto.descripcion}</p>
      <p className="text-pink-500 font-bold text-xl mt-2">${producto.precio.toLocaleString()}</p>
      <button className="btn-primary w-full mt-4">
        Agregar al Carrito
      </button>
    </div>
  );
}
```

---

## 8. Seguridad

### 8.1 Autenticación JWT

#### Generación de Token (Backend)
```csharp
public static class JwtHelper
{
    public static string GenerateToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Nombre)
        };

        // Agregar roles como claims
        foreach (var userRol in user.UserRoles)
        {
            claims.Add(new Claim(ClaimTypes.Role, userRol.Rol.Nombre));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"]));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"],
            audience: _configuration["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

#### Validación de Token (Middleware)
```csharp
// Program.cs
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Secret"]))
        };
    });
```

#### Protección de Endpoints
```csharp
[ApiController]
[Route("api/[controller]")]
public class ProductoController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() // Público
    {
        // ...
    }

    [Authorize(Roles = "Admin")] // Solo Admin
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductoDto dto)
    {
        // ...
    }

    [Authorize] // Cualquier usuario autenticado
    [HttpGet("mis-favoritos")]
    public async Task<IActionResult> GetFavoritos()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
        // ...
    }
}
```

### 8.2 Hashing de Contraseñas (BCrypt)

```csharp
// Al registrar usuario
var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
user.PasswordHash = passwordHash;

// Al hacer login
var isValidPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
if (!isValidPassword)
    throw new UnauthorizedAccessException("Credenciales inválidas");
```

**Características de BCrypt**:
- ✅ **Salt automático**: Genera salt único por contraseña
- ✅ **Trabajo configurable**: `workFactor` (default: 11) hace el proceso lento intencionalmente
- ✅ **Resistente a rainbow tables**: Salt evita ataques con tablas precomputadas
- ✅ **Resistente a fuerza bruta**: Alto costo computacional

### 8.3 CORS (Cross-Origin Resource Sharing)

```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",  // Desarrollo
            "https://pastisserie-deluxe.azurewebsites.net" // Producción
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});

// Usar middleware
app.UseCors("AllowFrontend");
```

### 8.4 Validación de Entrada

#### Backend (FluentValidation)
```csharp
public class CreateProductoDtoValidator : AbstractValidator<CreateProductoDto>
{
    public CreateProductoDtoValidator()
    {
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Precio).GreaterThan(0).LessThan(10000000);
        RuleFor(x => x.Stock).GreaterThanOrEqualTo(0);
    }
}
```

#### Frontend (TypeScript + React Hook Form - futuro)
```typescript
const schema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(200),
  precio: z.number().min(0.01, "Precio debe ser mayor a 0"),
  stock: z.number().int().min(0)
});
```

### 8.5 Prevención de SQL Injection

**Entity Framework Core previene automáticamente SQL Injection** usando queries parametrizadas:

```csharp
// ✅ SEGURO (EF Core usa parámetros)
var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

// ❌ INSEGURO (SQL directo sin parámetros - NO USAR)
var user = await _context.Users.FromSqlRaw($"SELECT * FROM Users WHERE Email = '{email}'").FirstOrDefaultAsync();

// ✅ SEGURO (SQL directo con parámetros)
var user = await _context.Users.FromSqlRaw("SELECT * FROM Users WHERE Email = {0}", email).FirstOrDefaultAsync();
```

### 8.6 Prevención de XSS (Cross-Site Scripting)

#### React (Escape automático)
React escapa automáticamente contenido en JSX:

```typescript
// ✅ SEGURO (React escapa HTML)
<p>{producto.descripcion}</p>

// ❌ INSEGURO (permite HTML arbitrario - NO USAR)
<p dangerouslySetInnerHTML={{ __html: producto.descripcion }} />
```

#### Backend (No retorna HTML)
El backend solo retorna JSON, nunca HTML:

```csharp
// ✅ API retorna JSON (no hay riesgo de XSS en backend)
return Ok(ApiResponse<T>.SuccessResponse(data));
```

---

## 9. Integración con Servicios Externos

### 9.1 Azure Blob Storage (Imágenes de Productos)

#### Configuración (appsettings.json)
```json
{
  "AzureStorage": {
    "ConnectionString": "DefaultEndpointsProtocol=https;AccountName={account};AccountKey={key};EndpointSuffix=core.windows.net",
    "ContainerName": "productos"
  }
}
```

#### BlobStorageService (Backend)
```csharp
public interface IBlobStorageService
{
    Task<string> UploadImageAsync(IFormFile file, string folder);
    Task<bool> DeleteImageAsync(string blobUrl);
}

public class BlobStorageService : IBlobStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly string _containerName;

    public BlobStorageService(IConfiguration configuration)
    {
        _blobServiceClient = new BlobServiceClient(configuration["AzureStorage:ConnectionString"]);
        _containerName = configuration["AzureStorage:ContainerName"];
    }

    public async Task<string> UploadImageAsync(IFormFile file, string folder)
    {
        // 1. Validación
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
            throw new InvalidOperationException("Formato de imagen no permitido");

        if (file.Length > 5 * 1024 * 1024) // 5 MB
            throw new InvalidOperationException("La imagen excede el tamaño máximo (5 MB)");

        // 2. Generar nombre único
        var fileName = $"{folder}/{Guid.NewGuid()}{extension}";

        // 3. Subir a Azure Blob Storage
        var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
        var blobClient = containerClient.GetBlobClient(fileName);

        await using var stream = file.OpenReadStream();
        await blobClient.UploadAsync(stream, overwrite: true);

        // 4. Retornar URL pública
        return blobClient.Uri.ToString();
    }

    public async Task<bool> DeleteImageAsync(string blobUrl)
    {
        var uri = new Uri(blobUrl);
        var blobName = uri.Segments.Last();

        var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
        var blobClient = containerClient.GetBlobClient(blobName);

        return await blobClient.DeleteIfExistsAsync();
    }
}
```

#### UploadController
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UploadController : ControllerBase
{
    private readonly IBlobStorageService _blobStorageService;

    [HttpPost("producto")]
    public async Task<IActionResult> UploadProductoImage([FromForm] IFormFile file)
    {
        try
        {
            var url = await _blobStorageService.UploadImageAsync(file, "productos");
            return Ok(ApiResponse<string>.SuccessResponse(url));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse<string>.ErrorResponse(ex.Message));
        }
    }
}
```

#### Frontend (React con Drag & Drop)
```typescript
function ImageUpload({ onUploadComplete }: { onUploadComplete: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const response = await apiClient.post('/api/upload/producto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onUploadComplete(response.data.data);
      toast.success('Imagen subida exitosamente');
    } catch (error) {
      toast.error('Error al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <Spinner />}
    </div>
  );
}
```

### 9.2 Gmail SMTP (Envío de Emails)

#### Configuración (appsettings.json)
```json
{
  "EmailSettings": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "Username": "pastisseriedeluxe@gmail.com",
    "Password": "{app-password}",
    "FromEmail": "pastisseriedeluxe@gmail.com",
    "FromName": "PASTISSERIE'S DELUXE"
  }
}
```

#### EmailHelper
```csharp
public static class EmailHelper
{
    public static async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        var smtpClient = new SmtpClient(_configuration["EmailSettings:Host"])
        {
            Port = int.Parse(_configuration["EmailSettings:Port"]),
            Credentials = new NetworkCredential(
                _configuration["EmailSettings:Username"],
                _configuration["EmailSettings:Password"]
            ),
            EnableSsl = true
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(
                _configuration["EmailSettings:FromEmail"],
                _configuration["EmailSettings:FromName"]
            ),
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };

        mailMessage.To.Add(toEmail);

        await smtpClient.SendMailAsync(mailMessage);
    }

    public static async Task SendPasswordResetEmailAsync(string toEmail, string resetToken, string frontendUrl)
    {
        var resetLink = $"{frontendUrl}/reset-password?token={resetToken}";
        var body = $@"
            <h2>Recuperación de Contraseña</h2>
            <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
            <a href='{resetLink}'>Restablecer Contraseña</a>
            <p>Este enlace expira en 1 hora.</p>
        ";

        await SendEmailAsync(toEmail, "Recuperación de Contraseña - PASTISSERIE'S DELUXE", body);
    }
}
```

---

## 10. Testing y Debugging

### 10.1 Testing Manual con Postman

#### Colección de Endpoints

**1. Auth - Register**
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "nombre": "Test User",
  "email": "test@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "telefono": "3001234567"
}
```

**2. Auth - Login**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Password123!"
}

# Guardar token de respuesta en variable de entorno
# Postman Tests tab:
pm.environment.set("token", pm.response.json().data.token);
```

**3. Producto - Get All (con token)**
```http
GET http://localhost:5000/api/producto
Authorization: Bearer {{token}}
```

**4. Producto - Create (Admin)**
```http
POST http://localhost:5000/api/producto
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "nombre": "Torta Red Velvet",
  "descripcion": "Deliciosa torta de terciopelo rojo",
  "precio": 50000,
  "stock": 5,
  "categoriaProductoId": 1,
  "imagenUrl": "https://storage.blob.core.windows.net/productos/test.jpg"
}
```

### 10.2 Debugging Backend (Visual Studio Code)

#### launch.json
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": ".NET Core Launch (web)",
      "type": "coreclr",
      "request": "launch",
      "preLaunchTask": "build",
      "program": "${workspaceFolder}/PastisserieAPI.API/bin/Debug/net8.0/PastisserieAPI.API.dll",
      "args": [],
      "cwd": "${workspaceFolder}/PastisserieAPI.API",
      "stopAtEntry": false,
      "serverReadyAction": {
        "action": "openExternally",
        "pattern": "\\bNow listening on:\\s+(https?://\\S+)"
      },
      "env": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      },
      "sourceFileMap": {
        "/Views": "${workspaceFolder}/Views"
      }
    }
  ]
}
```

**Uso**:
1. Establecer breakpoints en código C#
2. F5 para iniciar debugging
3. Navegar a endpoint en Postman o navegador
4. Debugger se detiene en breakpoint

### 10.3 Debugging Frontend (Chrome DevTools)

#### Inspeccionar Network Requests
1. Abrir Chrome DevTools (F12)
2. Tab "Network"
3. Filtrar por "Fetch/XHR"
4. Ver requests a API con headers, payload, response

#### Debugging React en Browser
```typescript
// Agregar debugger statement
function ProductoCard({ producto }: ProductoCardProps) {
  debugger; // ⬅️ Chrome pausará aquí
  return <div>{producto.nombre}</div>;
}
```

#### React DevTools Extension
- Instalar "React Developer Tools" en Chrome
- Inspeccionar árbol de componentes
- Ver props y estado en tiempo real
- Profiler para medir performance

### 10.4 Logs

#### Backend (ILogger)
```csharp
public class ProductoService : IProductoService
{
    private readonly ILogger<ProductoService> _logger;

    public async Task<ProductoResponseDto> CreateAsync(CreateProductoDto dto)
    {
        _logger.LogInformation("Creando producto: {Nombre}", dto.Nombre);

        try
        {
            // ...
            _logger.LogInformation("Producto creado exitosamente con ID: {Id}", producto.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear producto: {Nombre}", dto.Nombre);
            throw;
        }
    }
}
```

**Niveles de log**:
- `Trace`: Información muy detallada (no en producción)
- `Debug`: Información de debugging
- `Information`: Eventos generales (login, creación de recursos)
- `Warning`: Advertencias (validaciones fallidas, recursos no encontrados)
- `Error`: Errores recuperables
- `Critical`: Errores fatales (base de datos inaccesible)

#### Frontend (console.log)
```typescript
console.log('[ProductoService] Fetching productos...');
console.error('[ProductoService] Error fetching productos:', error);
console.warn('[ProductoService] Producto sin imagen, usando placeholder');
```

---

## 11. Deployment y CI/CD

### 11.1 Build de Producción

#### Backend
```bash
# Compilar en modo Release
dotnet publish -c Release -o ./publish

# Resultado: carpeta publish/ con DLLs optimizadas
```

#### Frontend
```bash
# Compilar para producción
cd pastisserie-front
npm run build

# Resultado: carpeta dist/ con HTML/CSS/JS minificados
```

### 11.2 Configuración de Azure

Ver detalles completos en: [`docs/02-diagramas/despliegue.md`](../02-diagramas/despliegue.md)

#### Checklist de Deployment:
- [ ] Crear Azure SQL Database
- [ ] Aplicar migraciones: `dotnet ef database update --connection "{azure-connection-string}"`
- [ ] Crear Azure Blob Storage container "productos" (acceso público)
- [ ] Crear App Service para Backend (Standard S1)
- [ ] Configurar variables de entorno en App Service
- [ ] Desplegar backend (ZIP Deploy o GitHub Actions)
- [ ] Crear App Service para Frontend (Basic B1)
- [ ] Desplegar frontend (ZIP Deploy)
- [ ] Configurar certificado SSL (Let's Encrypt automático)
- [ ] Configurar Application Insights (opcional)

### 11.3 Variables de Entorno (Producción)

#### Backend App Service Configuration
```
ConnectionStrings__DefaultConnection = Server=tcp:{server}.database.windows.net,1433;Initial Catalog=PastisserieDB;User ID={user};Password={password};Encrypt=True;TrustServerCertificate=False;
JwtSettings__Secret = {production-secret-key-min-32-chars}
JwtSettings__Issuer = PastisserieAPI
JwtSettings__Audience = PastisserieClients
JwtSettings__ExpirationHours = 24
AzureStorage__ConnectionString = DefaultEndpointsProtocol=https;AccountName={account};AccountKey={key};EndpointSuffix=core.windows.net
AzureStorage__ContainerName = productos
FrontendUrl = https://pastisserie-deluxe-frontend.azurewebsites.net
EmailSettings__Host = smtp.gmail.com
EmailSettings__Port = 587
EmailSettings__Username = pastisseriedeluxe@gmail.com
EmailSettings__Password = {app-password}
```

#### Frontend App Service Configuration
```
VITE_API_URL = https://pastisserie-deluxe-api.azurewebsites.net
```

---

## 12. Mantenimiento y Escalabilidad

### 12.1 Agregar Nueva Entidad

**Pasos**:

1. **Crear Entity en Core**:
```csharp
// PastisserieAPI.Core/Entities/Favorito.cs
public class Favorito
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UsuarioId { get; set; }

    [Required]
    public int ProductoId { get; set; }

    public DateTime FechaAgregado { get; set; } = DateTime.UtcNow;

    // Relaciones
    [ForeignKey("UsuarioId")]
    public virtual User Usuario { get; set; } = null!;

    [ForeignKey("ProductoId")]
    public virtual Producto Producto { get; set; } = null!;
}
```

2. **Crear Interface de Repository en Core**:
```csharp
// PastisserieAPI.Core/Interfaces/Repositories/IFavoritoRepository.cs
public interface IFavoritoRepository : IRepository<Favorito>
{
    Task<IEnumerable<Favorito>> GetByUsuarioIdAsync(int usuarioId);
}
```

3. **Agregar DbSet en ApplicationDbContext**:
```csharp
public DbSet<Favorito> Favoritos { get; set; }
```

4. **Crear Migración**:
```bash
dotnet ef migrations add AddFavoritoTable -p ../PastisserieAPI.Infrastructure -s PastisserieAPI.API
dotnet ef database update
```

5. **Implementar Repository en Infrastructure**:
```csharp
public class FavoritoRepository : Repository<Favorito>, IFavoritoRepository
{
    public async Task<IEnumerable<Favorito>> GetByUsuarioIdAsync(int usuarioId)
    {
        return await _context.Favoritos
            .Include(f => f.Producto)
            .Where(f => f.UsuarioId == usuarioId)
            .ToListAsync();
    }
}
```

6. **Agregar a UnitOfWork**:
```csharp
public interface IUnitOfWork
{
    // ... otros repositorios
    IFavoritoRepository Favoritos { get; }
}

public class UnitOfWork : IUnitOfWork
{
    public IFavoritoRepository Favoritos { get; }

    public UnitOfWork(ApplicationDbContext context)
    {
        Favoritos = new FavoritoRepository(context);
    }
}
```

7. **Crear DTOs en Services**:
```csharp
public class FavoritoResponseDto
{
    public int Id { get; set; }
    public int ProductoId { get; set; }
    public string ProductoNombre { get; set; }
    public decimal ProductoPrecio { get; set; }
    public string ProductoImagenUrl { get; set; }
    public DateTime FechaAgregado { get; set; }
}
```

8. **Crear Service**:
```csharp
public interface IFavoritoService
{
    Task<IEnumerable<FavoritoResponseDto>> GetByUsuarioIdAsync(int usuarioId);
    Task<FavoritoResponseDto> AddAsync(int usuarioId, int productoId);
    Task<bool> RemoveAsync(int usuarioId, int productoId);
}
```

9. **Crear Controller**:
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FavoritoController : ControllerBase
{
    private readonly IFavoritoService _favoritoService;

    [HttpGet]
    public async Task<IActionResult> GetMisFavoritos()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
        var favoritos = await _favoritoService.GetByUsuarioIdAsync(userId);
        return Ok(ApiResponse<IEnumerable<FavoritoResponseDto>>.SuccessResponse(favoritos));
    }

    [HttpPost("{productoId}")]
    public async Task<IActionResult> AgregarFavorito(int productoId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
        var favorito = await _favoritoService.AddAsync(userId, productoId);
        return Ok(ApiResponse<FavoritoResponseDto>.SuccessResponse(favorito));
    }
}
```

10. **Registrar Service en Program.cs**:
```csharp
builder.Services.AddScoped<IFavoritoService, FavoritoService>();
```

### 12.2 Estrategias de Escalabilidad

#### Horizontal Scaling (App Services)
```yaml
# Azure App Service Auto-scale rules
min_instances: 1
max_instances: 5
scale_out_rules:
  - metric: CPU
    threshold: 70%
    duration: 5 minutes
    increase_by: 1 instance
  - metric: Memory
    threshold: 80%
    duration: 5 minutes
    increase_by: 1 instance
scale_in_rules:
  - metric: CPU
    threshold: 30%
    duration: 10 minutes
    decrease_by: 1 instance
```

#### Database Optimization
- **Índices**: Crear índices en columnas de búsqueda frecuente
- **Query optimization**: Usar `.AsNoTracking()` para queries de solo lectura
- **Paginación**: Implementar paginación en endpoints que retornan listas grandes
- **Caching**: Usar Redis para cachear respuestas frecuentes (futuro)

#### CDN para Assets Estáticos
```
Frontend Assets (JS/CSS/Imágenes) → Azure CDN → Edge Servers → Usuario
```

---

## 13. Apéndices

### 13.1 Comandos Útiles

#### Backend
```bash
# Build
dotnet build

# Run
cd PastisserieAPI.API
dotnet run

# Watch mode (auto-reload)
dotnet watch run

# Crear migración
dotnet ef migrations add MigrationName -p ../PastisserieAPI.Infrastructure -s PastisserieAPI.API

# Aplicar migraciones
dotnet ef database update -p ../PastisserieAPI.Infrastructure -s PastisserieAPI.API

# Revertir última migración
dotnet ef database update PreviousMigrationName -p ../PastisserieAPI.Infrastructure -s PastisserieAPI.API

# Generar script SQL de migración
dotnet ef migrations script -p ../PastisserieAPI.Infrastructure -s PastisserieAPI.API -o migration.sql
```

#### Frontend
```bash
# Install dependencies
npm install

# Development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint

# Lint with auto-fix
npm run lint -- --fix
```

### 13.2 Troubleshooting Común

#### Error: "Cannot connect to SQL Server"
**Solución**:
- Verificar que SQL Server esté corriendo
- Verificar connection string en `appsettings.Development.json`
- Verificar que la base de datos `PastisserieDB` exista
- Windows: Verificar que el servicio SQL Server esté activo

#### Error: "CORS policy blocked"
**Solución**:
- Verificar que `app.UseCors("AllowFrontend")` esté ANTES de `app.UseAuthorization()`
- Verificar que la URL del frontend esté en la política CORS
- Verificar que el navegador no esté en modo incógnito (puede cachear políticas)

#### Error: "401 Unauthorized" en endpoints protegidos
**Solución**:
- Verificar que el token JWT esté en el header: `Authorization: Bearer {token}`
- Verificar que el token no haya expirado (24 horas)
- Verificar que el usuario tenga el rol requerido

#### Error: "Cannot upload image to Azure Blob Storage"
**Solución**:
- Verificar connection string en `appsettings.json`
- Verificar que el contenedor "productos" exista
- Verificar que el archivo sea menor a 5 MB
- Verificar formato permitido (.jpg, .jpeg, .png, .webp)

### 13.3 Recursos Adicionales

#### Documentación Oficial:
- ASP.NET Core: https://learn.microsoft.com/en-us/aspnet/core/
- Entity Framework Core: https://learn.microsoft.com/en-us/ef/core/
- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/docs/
- Tailwind CSS: https://tailwindcss.com/docs

#### Tutoriales Recomendados:
- Clean Architecture en .NET: https://github.com/jasontaylordev/CleanArchitecture
- React Best Practices: https://react.dev/learn

#### Comunidades:
- Stack Overflow: https://stackoverflow.com/
- Reddit r/dotnet: https://www.reddit.com/r/dotnet/
- Reddit r/reactjs: https://www.reddit.com/r/reactjs/

---

## Notas Finales

Este manual técnico refleja el estado del sistema al **03/04/2026** con las 18 entidades actuales y 33 migraciones aplicadas. Para cambios futuros, mantener actualizado este documento junto con el código.

**Última actualización**: 03/04/2026  
**Versión del documento**: 1.0  
**Autor**: Equipo de Desarrollo - SENA Ficha 3035528
