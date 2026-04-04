# Manual de Instalación - PASTISSERIE'S DELUXE

**Versión**: 1.0  
**Fecha**: 03/04/2026  
**Proyecto**: Sistema de E-Commerce para Pastelería  
**SENA Ficha**: 3035528  

---

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Requisitos del Sistema](#requisitos-del-sistema)
3. [Instalación del Backend (ASP.NET Core)](#instalación-del-backend-aspnet-core)
4. [Instalación del Frontend (React)](#instalación-del-frontend-react)
5. [Configuración de la Base de Datos](#configuración-de-la-base-de-datos)
6. [Configuración de Servicios Externos](#configuración-de-servicios-externos)
7. [Verificación de la Instalación](#verificación-de-la-instalación)
8. [Despliegue a Producción](#despliegue-a-producción)
9. [Solución de Problemas](#solución-de-problemas)
10. [Anexos](#anexos)

---

## 1. Introducción

### 1.1 Propósito del Manual

Este manual proporciona instrucciones paso a paso para instalar, configurar y desplegar el sistema **PASTISSERIE'S DELUXE** en entornos de desarrollo y producción.

### 1.2 Alcance

Cubre la instalación completa de:
- **Backend**: ASP.NET Core 8.0 con SQL Server
- **Frontend**: React 19 con Vite
- **Servicios Externos**: Azure Blob Storage, Gmail SMTP
- **Despliegue**: Configuración para Azure App Service

### 1.3 Audiencia

Este manual está dirigido a:
- Desarrolladores que configuran el entorno local
- Administradores de sistemas que despliegan a producción
- Personal de TI responsable del mantenimiento

### 1.4 Convenciones del Manual

| Símbolo | Significado |
|---------|-------------|
| 💻 | Comando de terminal |
| 📁 | Ruta de archivo o carpeta |
| ⚙️ | Configuración requerida |
| ⚠️ | Advertencia importante |
| ✅ | Paso completado exitosamente |
| 📝 | Nota adicional |

---

## 2. Requisitos del Sistema

### 2.1 Requisitos de Hardware

#### Desarrollo (Mínimo):
- **Procesador**: Intel Core i5 / AMD Ryzen 5 (4 núcleos)
- **RAM**: 8 GB
- **Disco**: 10 GB de espacio libre (SSD recomendado)
- **Conexión a Internet**: 5 Mbps

#### Desarrollo (Recomendado):
- **Procesador**: Intel Core i7 / AMD Ryzen 7 (8 núcleos)
- **RAM**: 16 GB o más
- **Disco**: 20 GB de espacio libre en SSD
- **Conexión a Internet**: 10 Mbps o más

#### Producción (Azure):
- **App Service Plan**: B1 o superior (Backend)
- **App Service**: B1 o superior (Frontend)
- **SQL Database**: Basic (5 DTU) o superior
- **Storage Account**: Standard (LRS)

### 2.2 Requisitos de Software

#### Sistema Operativo:
- **Windows 10/11** (64-bit) — Recomendado
- **macOS 12+** (compatible)
- **Linux** (Ubuntu 20.04+, compatible)

#### Software Obligatorio:

| Componente | Versión Mínima | Versión Recomendada | Descarga |
|------------|----------------|---------------------|----------|
| **.NET SDK** | 8.0.0 | 8.0.100 o superior | https://dotnet.microsoft.com/download |
| **Node.js** | 18.0.0 | 20.11.0 LTS | https://nodejs.org |
| **npm** | 9.0.0 | 10.2.4 | (incluido con Node.js) |
| **SQL Server** | 2019 | 2022 Express/Developer | https://www.microsoft.com/sql-server |
| **Git** | 2.30.0 | 2.44.0 | https://git-scm.com |

#### Editores/IDEs Recomendados:

**Backend:**
- Visual Studio 2022 Community (o superior)
- Visual Studio Code con extensión C# Dev Kit
- JetBrains Rider

**Frontend:**
- Visual Studio Code
- WebStorm

**Base de Datos:**
- SQL Server Management Studio (SSMS) 19+
- Azure Data Studio
- DBeaver

#### Extensiones de VS Code Recomendadas:

```json
{
  "recommendations": [
    "ms-dotnettools.csdevkit",
    "ms-dotnettools.csharp",
    "ms-mssql.mssql",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

---

## 3. Instalación del Backend (ASP.NET Core)

### 3.1 Verificar Instalación de .NET SDK

Abre una terminal y ejecuta:

💻 **Windows (PowerShell):**
```powershell
dotnet --version
```

💻 **macOS/Linux:**
```bash
dotnet --version
```

**Salida esperada:**
```
8.0.100
```

Si no está instalado o la versión es anterior a 8.0.0, descarga e instala desde: https://dotnet.microsoft.com/download/dotnet/8.0

---

### 3.2 Clonar el Repositorio

💻 **Comando:**
```bash
git clone https://github.com/tuusuario/PatisserieDeluxe.git
cd PatisserieDeluxe
```

📝 **Nota**: Reemplaza `tuusuario` con el usuario real del repositorio.

---

### 3.3 Restaurar Dependencias del Backend

Navega a la carpeta raíz del proyecto y ejecuta:

💻 **Comando:**
```bash
dotnet restore PastisserieAPI.sln
```

**Salida esperada:**
```
Restore completed in X ms for PastisserieAPI.Core.csproj
Restore completed in X ms for PastisserieAPI.Infrastructure.csproj
Restore completed in X ms for PastisserieAPI.Services.csproj
Restore completed in X ms for PastisserieAPI.API.csproj
```

✅ **Verificación**: No debe haber errores ni advertencias críticas.

---

### 3.4 Estructura del Proyecto Backend

📁 **Estructura esperada:**
```
PastisserieAPI/
├── PastisserieAPI.Core/          # Entidades, Enums, Interfaces
├── PastisserieAPI.Infrastructure/ # EF Core, Repositorios, Migraciones
├── PastisserieAPI.Services/       # Lógica de negocio, DTOs, Validadores
├── PastisserieAPI.API/            # Controllers, Middleware, Program.cs
└── PastisserieAPI.sln             # Solución
```

---

### 3.5 Paquetes NuGet Instalados

El proyecto utiliza los siguientes paquetes principales:

**PastisserieAPI.API:**
- `Microsoft.AspNetCore.Authentication.JwtBearer` 8.0.0 — Autenticación JWT
- `BCrypt.Net-Next` 4.0.3 — Hash de contraseñas
- `System.IdentityModel.Tokens.Jwt` 8.0.0 — Generación de tokens
- `Swashbuckle.AspNetCore` 6.6.2 — Documentación Swagger/OpenAPI
- `Microsoft.EntityFrameworkCore.SqlServer` 8.0.2 — Proveedor SQL Server
- `Microsoft.EntityFrameworkCore.Design` 8.0.2 — Herramientas EF Core

**PastisserieAPI.Infrastructure:**
- `Azure.Storage.Blobs` 12.27.0 — Azure Blob Storage
- `Microsoft.EntityFrameworkCore.SqlServer` 8.0.2
- `Microsoft.EntityFrameworkCore.Tools` 8.0.2

**PastisserieAPI.Services:**
- `AutoMapper.Extensions.Microsoft.DependencyInjection` 12.0.1 — Mapeo de DTOs
- `FluentValidation.AspNetCore` 11.3.0 — Validación de DTOs

---

### 3.6 Configurar appsettings.json

📁 **Ruta**: `PastisserieAPI.API/appsettings.json`

⚙️ **Configuración base** (para desarrollo local):

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Information"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=PastisserieDB;User Id=sa;Password=TU_PASSWORD_AQUI;TrustServerCertificate=True"
  },
  "JwtSettings": {
    "SecretKey": "TuClaveSecretaSuperSeguraDeAlMenos32CaracteresParaPastisserieAPI2026",
    "Issuer": "PastisserieAPI",
    "Audience": "PastisserieClients",
    "ExpirationMinutes": 60
  },
  "ApiUrl": "http://localhost:5000",
  "FrontendUrl": "http://localhost:5173",
  "Smtp": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "User": "tu-email@gmail.com",
    "Password": "tu-app-password",
    "EnableSsl": true,
    "From": "tu-email@gmail.com",
    "FromName": "Pâtisserie Deluxe"
  },
  "AzureStorage": {
    "ConnectionString": "DefaultEndpointsProtocol=https;AccountName=NOMBRE_CUENTA;AccountKey=TU_KEY;EndpointSuffix=core.windows.net",
    "ContainerName": "productos-imagenes"
  }
}
```

⚠️ **IMPORTANTE**: 
- **NO subas este archivo con credenciales reales a Git**
- Reemplaza `TU_PASSWORD_AQUI` con la contraseña real de SQL Server
- Genera una `SecretKey` única de al menos 32 caracteres
- Configura credenciales SMTP y Azure Storage (ver secciones 6.1 y 6.2)

---

### 3.7 Variables de Entorno (Alternativa Segura)

Para evitar exponer credenciales en `appsettings.json`, usa variables de entorno:

💻 **Windows (PowerShell):**
```powershell
$env:ConnectionStrings__DefaultConnection="Server=localhost,1433;Database=PastisserieDB;User Id=sa;Password=TuPassword;TrustServerCertificate=True"
$env:JwtSettings__SecretKey="TuClaveSecreta32Caracteres"
$env:Smtp__User="tu-email@gmail.com"
$env:Smtp__Password="tu-app-password"
$env:AzureStorage__ConnectionString="DefaultEndpointsProtocol=https;..."
```

💻 **macOS/Linux:**
```bash
export ConnectionStrings__DefaultConnection="Server=localhost,1433;Database=PastisserieDB;User Id=sa;Password=TuPassword;TrustServerCertificate=True"
export JwtSettings__SecretKey="TuClaveSecreta32Caracteres"
export Smtp__User="tu-email@gmail.com"
export Smtp__Password="tu-app-password"
export AzureStorage__ConnectionString="DefaultEndpointsProtocol=https;..."
```

📝 **Nota**: Las variables de entorno sobrescriben los valores de `appsettings.json`.

---

### 3.8 Compilar el Backend

💻 **Comando:**
```bash
dotnet build PastisserieAPI.sln
```

**Salida esperada:**
```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

✅ **Verificación**: Si hay errores de compilación, revisa:
- Versión de .NET SDK
- Paquetes NuGet restaurados correctamente
- Referencias entre proyectos

---

## 4. Instalación del Frontend (React)

### 4.1 Verificar Instalación de Node.js y npm

💻 **Comandos:**
```bash
node --version
npm --version
```

**Salida esperada:**
```
v20.11.0
10.2.4
```

Si no están instalados o las versiones son anteriores, descarga desde: https://nodejs.org (versión LTS recomendada).

---

### 4.2 Navegar a la Carpeta del Frontend

💻 **Comando:**
```bash
cd pastisserie-front
```

---

### 4.3 Instalar Dependencias del Frontend

💻 **Comando:**
```bash
npm install
```

**Salida esperada:**
```
added 250 packages in 15s
```

✅ **Verificación**: No debe haber errores `ERR!`. Advertencias (`WARN`) de peer dependencies son normales.

---

### 4.4 Estructura del Proyecto Frontend

📁 **Estructura esperada:**
```
pastisserie-front/
├── public/              # Archivos estáticos
├── src/
│   ├── api/             # Clientes API (axios)
│   ├── components/      # Componentes reutilizables
│   ├── context/         # Context API (Auth, Cart)
│   ├── hooks/           # Custom hooks
│   ├── layouts/         # Layouts de página
│   ├── pages/           # Páginas (routes)
│   │   ├── admin/       # Páginas de administrador
│   │   └── repartidor/  # Páginas de repartidor
│   ├── services/        # Lógica de negocio
│   ├── types/           # TypeScript types
│   ├── utils/           # Utilidades
│   ├── App.tsx          # Componente raíz
│   ├── main.tsx         # Entry point
│   └── index.css        # Estilos globales
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

---

### 4.5 Dependencias del Frontend

**Dependencias de Producción:**
- `react` 19.2.0 — Biblioteca principal
- `react-dom` 19.2.0 — DOM renderer
- `react-router-dom` 7.13.0 — Enrutamiento
- `axios` 1.13.4 — Cliente HTTP
- `tailwindcss` 4.1.18 — Framework CSS
- `recharts` 2.15.0 — Gráficos y estadísticas
- `react-hot-toast` 2.6.0 — Notificaciones
- `sweetalert2` 11.26.24 — Diálogos/modales
- `lucide-react` 0.563.0 — Iconos
- `lodash-es` 4.17.23 — Utilidades JavaScript

**Dependencias de Desarrollo:**
- `vite` 7.2.4 — Build tool
- `typescript` 5.9.3 — Lenguaje tipado
- `eslint` 9.39.1 — Linter
- `@vitejs/plugin-react` 5.1.1 — Plugin React para Vite

---

### 4.6 Configurar Variables de Entorno del Frontend

📁 **Archivo**: `pastisserie-front/.env` (crear si no existe)

⚙️ **Contenido para desarrollo:**
```env
VITE_API_URL=http://localhost:5000/api
```

📁 **Archivo**: `pastisserie-front/.env.production` (crear si no existe)

⚙️ **Contenido para producción:**
```env
VITE_API_URL=https://tu-api.azurewebsites.net/api
```

⚠️ **IMPORTANTE**:
- Las variables deben tener el prefijo `VITE_` para ser accesibles en el código
- **NO incluyas credenciales secretas** — `.env` se empaqueta en el bundle
- Agrega `.env.local` a `.gitignore` si usas variables locales

---

### 4.7 Configurar URL del Backend

📁 **Archivo**: `pastisserie-front/src/api/apiClient.ts`

Verifica que la configuración de Axios apunte correctamente:

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT
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

export default apiClient;
```

✅ **Verificación**: La variable `VITE_API_URL` se lee correctamente de `.env`.

---

## 5. Configuración de la Base de Datos

### 5.1 Instalar SQL Server

#### Opción 1: SQL Server 2022 Express (Recomendado para desarrollo)

1. Descarga SQL Server 2022 Express desde:  
   https://www.microsoft.com/sql-server/sql-server-downloads

2. Ejecuta el instalador y selecciona **"Basic"**

3. Acepta los términos de licencia

4. Elige la ubicación de instalación (por defecto está bien)

5. Espera a que se instale (5-10 minutos)

6. Al finalizar, anota:
   - **Instancia**: `SQLEXPRESS` (por defecto)
   - **Connection String**: `Server=localhost\SQLEXPRESS;...`

#### Opción 2: SQL Server 2022 Developer (Completo)

1. Descarga desde: https://www.microsoft.com/sql-server/sql-server-downloads

2. Ejecuta el instalador

3. Selecciona **"Installation"** → **"New SQL Server stand-alone installation"**

4. Configuración recomendada:
   - **Instance Features**: Database Engine Services
   - **Instance Name**: `MSSQLSERVER` (default) o personalizado
   - **Authentication Mode**: Mixed Mode (SQL Server + Windows)
   - **SA Password**: Crea una contraseña fuerte (mínimo 8 caracteres)

5. Completa la instalación

#### Opción 3: Docker (Multiplataforma)

💻 **Comando:**
```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=DevSql2026!" \
   -p 1433:1433 --name sqlserver2022 --hostname sqlserver2022 \
   -d mcr.microsoft.com/mssql/server:2022-latest
```

📝 **Nota**: Reemplaza `DevSql2026!` con una contraseña fuerte.

---

### 5.2 Instalar SQL Server Management Studio (SSMS)

1. Descarga SSMS 19+ desde:  
   https://learn.microsoft.com/sql/ssms/download-sql-server-management-studio-ssms

2. Ejecuta el instalador

3. Sigue el asistente (instalación predeterminada)

4. Reinicia el equipo si es necesario

---

### 5.3 Conectar a SQL Server

1. Abre **SQL Server Management Studio (SSMS)**

2. En la ventana de conexión, ingresa:
   - **Server type**: Database Engine
   - **Server name**: 
     - `localhost` o `localhost\SQLEXPRESS` (si usaste Express)
     - `localhost,1433` (si usaste Docker)
   - **Authentication**: SQL Server Authentication
   - **Login**: `sa`
   - **Password**: La contraseña que configuraste

3. Haz clic en **"Connect"**

✅ **Verificación**: Si la conexión es exitosa, verás el árbol de bases de datos en el panel izquierdo.

⚠️ **Errores comunes**:
- **"Cannot connect to server"**: Verifica que SQL Server esté corriendo (Services → SQL Server)
- **"Login failed"**: Verifica usuario y contraseña
- **"Named Pipes error"**: Habilita TCP/IP en SQL Server Configuration Manager

---

### 5.4 Actualizar Connection String

Actualiza `appsettings.json` con la cadena de conexión correcta:

**Si usas SQL Server Express:**
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=PastisserieDB;User Id=sa;Password=TU_PASSWORD;TrustServerCertificate=True"
}
```

**Si usas SQL Server Developer (instancia default):**
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=PastisserieDB;User Id=sa;Password=TU_PASSWORD;TrustServerCertificate=True"
}
```

**Si usas Docker:**
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost,1433;Database=PastisserieDB;User Id=sa;Password=DevSql2026!;TrustServerCertificate=True"
}
```

📝 **Nota**: `TrustServerCertificate=True` es necesario para desarrollo local (evita errores de certificado SSL).

---

### 5.5 Aplicar Migraciones de Entity Framework Core

El proyecto incluye **33 migraciones** que crean la estructura completa de la base de datos.

#### Paso 1: Verificar Herramientas EF Core

💻 **Comando:**
```bash
dotnet ef --version
```

**Salida esperada:**
```
Entity Framework Core .NET Command-line Tools
8.0.2
```

Si no está instalado:
```bash
dotnet tool install --global dotnet-ef
```

---

#### Paso 2: Aplicar Migraciones

Desde la carpeta raíz del proyecto:

💻 **Comando:**
```bash
dotnet ef database update --project PastisserieAPI.Infrastructure --startup-project PastisserieAPI.API
```

**Salida esperada:**
```
Build started...
Build succeeded.
Applying migration '20260226000001_InitialCreate'.
Applying migration '20260226000002_AddConfiguracionTienda'.
...
Applying migration '20260403000033_AddAzureBlobStorageSupport'.
Done.
```

✅ **Verificación**: En SSMS, actualiza la lista de bases de datos (F5) y verás `PastisserieDB` con 18 tablas.

---

#### Paso 3: Verificar Tablas Creadas

Ejecuta esta consulta en SSMS:

```sql
USE PastisserieDB;
GO

SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
```

**Tablas esperadas (18):**
1. `__EFMigrationsHistory` (historial de migraciones)
2. `CarritoCompra`
3. `CarritoItems`
4. `CategoriaProducto`
5. `ConfiguracionTienda`
6. `DireccionEnvio`
7. `HorarioDia`
8. `Notificaciones`
9. `PedidoHistorial`
10. `PedidoItems`
11. `Pedidos`
12. `Productos`
13. `Promociones`
14. `Reclamaciones`
15. `RegistrosPagos`
16. `Reviews`
17. `Roles`
18. `UserRoles`
19. `Users`

✅ **Verificación**: Si todas las tablas existen, la migración fue exitosa.

---

### 5.6 Insertar Datos Iniciales (Seed)

El sistema requiere **datos iniciales** para funcionar (roles, usuario admin, categorías base).

#### Opción 1: Ejecutar Script SQL Manual

📁 **Ruta**: `docs/07-base-datos/seed-data.sql` (si existe)

Si no existe, crea el siguiente script:

```sql
USE PastisserieDB;
GO

-- 1. Insertar Roles
IF NOT EXISTS (SELECT 1 FROM Roles WHERE Nombre = 'Usuario')
BEGIN
    INSERT INTO Roles (Nombre, Descripcion) VALUES 
    ('Usuario', 'Cliente regular del sistema'),
    ('Admin', 'Administrador con acceso completo'),
    ('Repartidor', 'Personal de entregas');
END
GO

-- 2. Insertar Usuario Administrador (contraseña: Admin123)
-- Hash BCrypt de "Admin123": $2a$11$...
DECLARE @PasswordHash NVARCHAR(MAX) = '$2a$11$X9hGvFZRf4Kz5mKJY3Ln3.QF8Y0Z9qX5Y6Wz8J9mKJY3Ln3.QF8Y0';

IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'admin@pastisserie.com')
BEGIN
    INSERT INTO Users (Nombre, Email, Telefono, PasswordHash, FechaCreacion, Estado)
    VALUES ('Administrador', 'admin@pastisserie.com', '+57 300 000 0000', @PasswordHash, GETUTCDATE(), 1);
    
    DECLARE @AdminId INT = SCOPE_IDENTITY();
    DECLARE @AdminRoleId INT = (SELECT Id FROM Roles WHERE Nombre = 'Admin');
    
    INSERT INTO UserRoles (UsuarioId, RolId) VALUES (@AdminId, @AdminRoleId);
END
GO

-- 3. Insertar Categorías Base
IF NOT EXISTS (SELECT 1 FROM CategoriaProducto)
BEGIN
    INSERT INTO CategoriaProducto (Nombre, Descripcion) VALUES 
    ('Tortas', 'Tortas personalizadas y temáticas'),
    ('Postres', 'Postres individuales y familiares'),
    ('Galletas', 'Galletas artesanales'),
    ('Panes', 'Panadería tradicional'),
    ('Bebidas', 'Bebidas calientes y frías');
END
GO

-- 4. Insertar Configuración Inicial
IF NOT EXISTS (SELECT 1 FROM ConfiguracionTienda)
BEGIN
    INSERT INTO ConfiguracionTienda (Clave, Valor, Descripcion) VALUES 
    ('NombreTienda', 'Pâtisserie Deluxe', 'Nombre de la tienda'),
    ('Telefono', '+57 300 123 4567', 'Teléfono de contacto'),
    ('Email', 'contacto@pastisserie.com', 'Email de contacto'),
    ('Direccion', 'Calle 123 #45-67, Bogotá', 'Dirección física'),
    ('MontoMinimoPedido', '20000', 'Monto mínimo en COP'),
    ('TiempoEntregaEstimado', '60', 'Tiempo en minutos');
END
GO

-- 5. Insertar Horarios de Atención
IF NOT EXISTS (SELECT 1 FROM HorarioDia)
BEGIN
    INSERT INTO HorarioDia (DiaSemana, HoraApertura, HoraCierre, Cerrado) VALUES 
    ('Lunes', '08:00:00', '18:00:00', 0),
    ('Martes', '08:00:00', '18:00:00', 0),
    ('Miércoles', '08:00:00', '18:00:00', 0),
    ('Jueves', '08:00:00', '18:00:00', 0),
    ('Viernes', '08:00:00', '18:00:00', 0),
    ('Sábado', '09:00:00', '14:00:00', 0),
    ('Domingo', '00:00:00', '00:00:00', 1);
END
GO

PRINT 'Datos iniciales insertados correctamente';
```

Ejecuta el script en SSMS (F5).

#### Opción 2: Seed Automático en Código

📁 **Archivo**: `PastisserieAPI.Infrastructure/Data/DbInitializer.cs`

Verifica que el método `SeedAsync()` se llame en `Program.cs`:

```csharp
// Program.cs
var app = builder.Build();

// Seed initial data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await DbInitializer.SeedAsync(context);
}
```

Al ejecutar la API por primera vez, los datos se insertarán automáticamente.

---

### 5.7 Verificar Datos Iniciales

Ejecuta en SSMS:

```sql
-- Ver roles
SELECT * FROM Roles;

-- Ver usuario admin
SELECT u.*, r.Nombre AS Rol 
FROM Users u
INNER JOIN UserRoles ur ON u.Id = ur.UsuarioId
INNER JOIN Roles r ON ur.RolId = r.Id
WHERE u.Email = 'admin@pastisserie.com';

-- Ver categorías
SELECT * FROM CategoriaProducto;

-- Ver configuración
SELECT * FROM ConfiguracionTienda;
```

✅ **Verificación**: Debes ver al menos 3 roles, 1 usuario admin, 5 categorías y configuración inicial.

---

## 6. Configuración de Servicios Externos

### 6.1 Configurar Gmail SMTP para Emails

El sistema usa **Gmail** para enviar emails (recuperación de contraseña, notificaciones).

#### Paso 1: Crear/Usar Cuenta de Gmail

1. Usa una cuenta de Gmail existente o crea una nueva en https://gmail.com
2. Recomendación: Crea una cuenta específica para el proyecto (ej: `patisseriesdeluxe@gmail.com`)

---

#### Paso 2: Habilitar Verificación en 2 Pasos

1. Ve a https://myaccount.google.com/security
2. En "Cómo inicias sesión en Google", haz clic en **"Verificación en 2 pasos"**
3. Sigue el asistente para habilitarla (requiere número de teléfono)

---

#### Paso 3: Generar Contraseña de Aplicación

⚠️ **IMPORTANTE**: No uses tu contraseña normal de Gmail. Genera una **App Password**.

1. Ve a https://myaccount.google.com/apppasswords
2. En "Seleccionar app", elige **"Correo"**
3. En "Seleccionar dispositivo", elige **"Otro (nombre personalizado)"**
4. Escribe: `PastisserieAPI`
5. Haz clic en **"Generar"**
6. Google mostrará una **contraseña de 16 caracteres** (ej: `abcd efgh ijkl mnop`)
7. **Copia esta contraseña** (sin espacios)

---

#### Paso 4: Configurar en appsettings.json

Actualiza la sección `Smtp`:

```json
"Smtp": {
  "Host": "smtp.gmail.com",
  "Port": 587,
  "User": "patisseriesdeluxe@gmail.com",
  "Password": "abcdefghijklmnop",  // App Password (sin espacios)
  "EnableSsl": true,
  "From": "patisseriesdeluxe@gmail.com",
  "FromName": "Pâtisserie Deluxe"
}
```

⚠️ **IMPORTANTE**: 
- Usa la **App Password**, NO la contraseña normal
- Guarda la App Password en variables de entorno en producción
- **NO subas appsettings.json con credenciales a Git**

---

#### Paso 5: Probar Envío de Email

1. Ejecuta la API (ver sección 7.1)
2. Registra un usuario nuevo
3. Usa la función "¿Olvidaste tu contraseña?"
4. Verifica que el email llegue a la bandeja de entrada

✅ **Verificación**: Si recibes el email, la configuración es correcta.

⚠️ **Error "Authentication failed"**: Verifica que la App Password sea correcta y que la verificación en 2 pasos esté activa.

---

### 6.2 Configurar Azure Blob Storage para Imágenes

El sistema usa **Azure Blob Storage** para almacenar imágenes de productos.

#### Paso 1: Crear Cuenta de Azure

1. Ve a https://azure.microsoft.com
2. Haz clic en **"Iniciar gratis"** (incluye crédito de $200 USD por 30 días)
3. Inicia sesión con tu cuenta Microsoft o crea una nueva
4. Completa el formulario de registro (requiere tarjeta de crédito para verificación, no se cobra)

---

#### Paso 2: Crear Storage Account

1. En el portal de Azure (https://portal.azure.com), busca **"Storage accounts"**
2. Haz clic en **"+ Create"**
3. Configuración:
   - **Subscription**: Tu suscripción
   - **Resource group**: Crea uno nuevo → `pastisserie-rg`
   - **Storage account name**: `pastisseriedeluxe` (debe ser único globalmente, solo minúsculas y números)
   - **Region**: Elige la más cercana (ej: `East US`, `Brazil South`)
   - **Performance**: Standard
   - **Redundancy**: LRS (Locally-redundant storage) — más económico para desarrollo
4. Haz clic en **"Review + create"** → **"Create"**
5. Espera 1-2 minutos a que se cree

---

#### Paso 3: Crear Blob Container

1. Una vez creado, ve al Storage Account → **"Containers"** (en el menú izquierdo)
2. Haz clic en **"+ Container"**
3. Configuración:
   - **Name**: `productos-imagenes`
   - **Public access level**: **Blob** (permite acceso público de lectura a las imágenes)
4. Haz clic en **"Create"**

---

#### Paso 4: Obtener Connection String

1. En el Storage Account, ve a **"Access keys"** (menú izquierdo, bajo "Security + networking")
2. Copia el valor de **"Connection string"** de key1 (haz clic en "Show" primero)

Ejemplo:
```
DefaultEndpointsProtocol=https;AccountName=pastisseriedeluxe;AccountKey=AbCdEfGh123...==;EndpointSuffix=core.windows.net
```

---

#### Paso 5: Configurar en appsettings.json

Agrega la sección `AzureStorage`:

```json
"AzureStorage": {
  "ConnectionString": "DefaultEndpointsProtocol=https;AccountName=pastisseriedeluxe;AccountKey=AbCdEfGh123...==;EndpointSuffix=core.windows.net",
  "ContainerName": "productos-imagenes"
}
```

⚠️ **IMPORTANTE**: 
- Guarda el Connection String en variables de entorno en producción
- **NO subas appsettings.json con este dato a Git**

---

#### Paso 6: Probar Subida de Imagen

1. Ejecuta la API y el frontend
2. Inicia sesión como administrador
3. Ve a **"Productos"** → **"Nuevo Producto"**
4. Sube una imagen (arrastra y suelta)
5. Guarda el producto
6. Verifica que la imagen se muestre correctamente en el catálogo

✅ **Verificación**: 
- La imagen se sube a Azure Blob Storage
- La URL generada es del tipo: `https://pastisseriedeluxe.blob.core.windows.net/productos-imagenes/abc123.jpg`

---

#### Costos Estimados de Azure Storage

| Uso | Costo Mensual (USD) |
|-----|---------------------|
| **100 imágenes (50 MB total)** | ~$0.02 |
| **1000 imágenes (500 MB)** | ~$0.10 |
| **10,000 transacciones (subidas/lecturas)** | ~$0.01 |

📝 **Nota**: Los costos son aproximados (región East US, 2026). Usa la calculadora de Azure para estimaciones precisas: https://azure.microsoft.com/pricing/calculator/

---

## 7. Verificación de la Instalación

### 7.1 Ejecutar el Backend

#### Paso 1: Navegar a la Carpeta de la API

💻 **Comando:**
```bash
cd PastisserieAPI.API
```

---

#### Paso 2: Ejecutar la API

💻 **Comando:**
```bash
dotnet run
```

**Salida esperada:**
```
Building...
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:5001
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shutdown.
```

✅ **Verificación**: La API está corriendo en `http://localhost:5000`.

---

#### Paso 3: Probar Swagger UI

1. Abre tu navegador
2. Ve a: http://localhost:5000/swagger
3. Deberías ver la **documentación interactiva de la API** con todos los endpoints

**Endpoints principales visibles:**
- `POST /api/Auth/register`
- `POST /api/Auth/login`
- `GET /api/Productos`
- `GET /api/Categorias`
- `POST /api/Pedidos`
- ... (total ~50 endpoints)

---

#### Paso 4: Probar Endpoint de Prueba

En Swagger, ejecuta:
- **GET** `/api/Productos` → Click en "Try it out" → "Execute"

**Respuesta esperada** (si no hay productos):
```json
{
  "success": true,
  "message": "Productos obtenidos exitosamente",
  "data": []
}
```

✅ **Verificación**: La API responde correctamente.

---

### 7.2 Ejecutar el Frontend

#### Paso 1: Navegar a la Carpeta del Frontend

Abre una **nueva terminal** (deja la del backend corriendo):

💻 **Comando:**
```bash
cd pastisserie-front
```

---

#### Paso 2: Ejecutar el Servidor de Desarrollo

💻 **Comando:**
```bash
npm run dev
```

**Salida esperada:**
```
  VITE v7.2.4  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

✅ **Verificación**: El frontend está corriendo en `http://localhost:5173`.

---

#### Paso 3: Abrir en el Navegador

1. Abre tu navegador
2. Ve a: http://localhost:5173
3. Deberías ver la **página de inicio** de PASTISSERIE'S DELUXE

**Elementos visibles:**
- Navbar con logo y menú
- Banner de bienvenida
- Botones "Registrarse" / "Iniciar Sesión"
- Catálogo de productos (vacío si no hay productos)

---

#### Paso 4: Probar Registro de Usuario

1. Haz clic en **"Registrarse"**
2. Completa el formulario:
   - Nombre: Juan Pérez
   - Email: juan@test.com
   - Teléfono: +57 300 123 4567
   - Contraseña: Test123
   - Confirmar: Test123
3. Haz clic en **"Registrarse"**
4. ✅ Deberías ver: "Usuario registrado exitosamente"
5. Serás redirigido al login

---

#### Paso 5: Probar Login

1. Ingresa:
   - Email: `admin@pastisserie.com`
   - Contraseña: `Admin123` (si usaste el seed con esa contraseña)
2. Haz clic en **"Iniciar Sesión"**
3. ✅ Deberías ver:
   - Tu nombre en la navbar
   - Opción "Panel Admin" (si eres admin)
   - El botón cambia a "Cerrar Sesión"

---

### 7.3 Verificar Integración Backend-Frontend

#### Prueba 1: Crear Producto (como Admin)

1. Ve a **Panel Admin** → **"Productos"** → **"Nuevo Producto"**
2. Completa:
   - Nombre: Torta de Chocolate
   - Descripción: Deliciosa torta...
   - Categoría: Tortas
   - Precio: 45000
   - Stock: 10 (o marca "Stock Ilimitado")
   - Imagen: Sube una imagen JPG/PNG
3. Haz clic en **"Crear Producto"**
4. ✅ Verifica:
   - Mensaje de éxito
   - El producto aparece en la lista de productos
   - La imagen se subió a Azure Blob Storage

---

#### Prueba 2: Ver Producto en Catálogo (como Cliente)

1. Cierra sesión
2. Ve a **"Catálogo"**
3. ✅ Deberías ver el producto recién creado con su imagen

---

#### Prueba 3: Añadir al Carrito y Crear Pedido

1. Inicia sesión como cliente (usuario regular)
2. En el catálogo, haz clic en **"Añadir al Carrito"**
3. Ve al **icono del carrito** (arriba derecha)
4. Haz clic en **"Proceder al Pago"**
5. Completa:
   - Dirección de envío
   - Método de pago: Efectivo
6. Haz clic en **"Confirmar Pedido"**
7. ✅ Verifica:
   - Mensaje de confirmación con número de pedido
   - El pedido aparece en "Mis Pedidos" con estado "Pendiente"

---

#### Prueba 4: Aprobar Pedido (como Admin)

1. Inicia sesión como admin
2. Ve a **Panel Admin** → **"Pedidos"**
3. Encuentra el pedido recién creado (estado "Pendiente")
4. Haz clic en **"Ver Detalles"**
5. Haz clic en **"Aprobar Pedido"**
6. ✅ Verifica:
   - El estado cambia a "Aprobado"
   - El stock se descuenta automáticamente (si no es ilimitado)

---

### 7.4 Verificar Logs y Errores

#### Backend:

Los logs aparecen en la terminal donde ejecutaste `dotnet run`:

```
info: Microsoft.AspNetCore.Hosting.Diagnostics[1]
      Request starting HTTP/1.1 GET http://localhost:5000/api/Productos
info: Microsoft.AspNetCore.Routing.EndpointMiddleware[0]
      Executing endpoint 'PastisserieAPI.API.Controllers.ProductoController.GetAll (PastisserieAPI.API)'
```

⚠️ **Busca errores** (`fail:`, `error:`, `Exception`):
- Errores de conexión a BD
- Errores de autenticación JWT
- Excepciones no manejadas

---

#### Frontend:

Abre la **Consola del Navegador** (F12 → Console):

✅ **Sin errores**: No debe haber mensajes rojos
⚠️ **Con errores comunes**:
- `401 Unauthorized` → Token JWT inválido o expirado
- `404 Not Found` → Endpoint no existe o URL incorrecta
- `500 Internal Server Error` → Error en el backend (revisa logs de la API)
- `Network Error` → Backend no está corriendo o CORS mal configurado

---

## 8. Despliegue a Producción

### 8.1 Despliegue en Azure (Recomendado)

#### Arquitectura de Despliegue:

```
┌─────────────────────┐
│  Azure Front Door   │ (opcional: CDN + WAF)
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
┌───▼────┐   ┌───▼────┐
│Frontend│   │Backend │
│App     │   │App     │
│Service │   │Service │
└────────┘   └───┬────┘
                 │
         ┌───────┴────────┐
         │                │
    ┌────▼────┐    ┌─────▼──────┐
    │SQL      │    │Azure Blob  │
    │Database │    │Storage     │
    └─────────┘    └────────────┘
```

---

### 8.2 Desplegar Backend (API)

#### Opción 1: Despliegue desde Visual Studio

1. Abre `PastisserieAPI.sln` en Visual Studio 2022
2. Click derecho en **PastisserieAPI.API** → **"Publish"**
3. Selecciona **"Azure"** → **"Azure App Service (Windows)"**
4. Inicia sesión con tu cuenta de Azure
5. Click en **"Create a new Azure App Service"**:
   - **Name**: `pastisserie-api` (debe ser único)
   - **Subscription**: Tu suscripción
   - **Resource Group**: Usa `pastisserie-rg` o crea uno nuevo
   - **Hosting Plan**: Crea uno nuevo (B1 Basic o superior)
   - **Region**: Misma región que el Storage Account
6. Click en **"Create"**
7. Una vez creado, click en **"Publish"**
8. Espera 2-5 minutos

✅ **Verificación**: Accede a `https://pastisserie-api.azurewebsites.net/swagger`

---

#### Opción 2: Despliegue con Azure CLI

💻 **Comandos:**

```bash
# 1. Login a Azure
az login

# 2. Crear App Service Plan (si no existe)
az appservice plan create \
  --name pastisserie-plan \
  --resource-group pastisserie-rg \
  --sku B1 \
  --is-linux false

# 3. Crear Web App
az webapp create \
  --name pastisserie-api \
  --resource-group pastisserie-rg \
  --plan pastisserie-plan \
  --runtime "DOTNET|8.0"

# 4. Configurar variables de entorno
az webapp config appsettings set \
  --name pastisserie-api \
  --resource-group pastisserie-rg \
  --settings \
    ConnectionStrings__DefaultConnection="Server=tcp:TU_SERVIDOR.database.windows.net,1433;Initial Catalog=PastisserieDB;User ID=TU_USUARIO;Password=TU_PASSWORD;Encrypt=True;" \
    JwtSettings__SecretKey="TuClaveSecreta32Caracteres" \
    Smtp__User="tu-email@gmail.com" \
    Smtp__Password="tu-app-password" \
    AzureStorage__ConnectionString="DefaultEndpointsProtocol=https;..." \
    ASPNETCORE_ENVIRONMENT="Production"

# 5. Desplegar
cd PastisserieAPI.API
dotnet publish -c Release -o ./publish
cd publish
zip -r ../publish.zip .
az webapp deployment source config-zip \
  --name pastisserie-api \
  --resource-group pastisserie-rg \
  --src ../publish.zip
```

---

### 8.3 Configurar SQL Database en Azure

#### Opción 1: Azure SQL Database (Recomendado)

1. En el portal de Azure, busca **"SQL databases"**
2. Click en **"+ Create"**
3. Configuración:
   - **Resource group**: `pastisserie-rg`
   - **Database name**: `PastisserieDB`
   - **Server**: Crea uno nuevo:
     - **Server name**: `pastisserie-sql` (único)
     - **Location**: Misma región
     - **Authentication**: SQL authentication
     - **Admin login**: `sqladmin`
     - **Password**: Contraseña fuerte
   - **Compute + storage**: Basic (5 DTU, $5 USD/mes) o Standard S0 ($15 USD/mes)
4. Click en **"Review + create"** → **"Create"**
5. Espera 5-10 minutos

---

#### Paso 2: Configurar Firewall

1. Ve al SQL Server creado → **"Networking"**
2. En **"Firewall rules"**:
   - Habilita **"Allow Azure services and resources to access this server"**
   - Agrega tu IP actual (para acceso desde SSMS):
     - Click en **"Add client IP"**
3. Click en **"Save"**

---

#### Paso 3: Aplicar Migraciones a Azure SQL

Actualiza el Connection String en `appsettings.Production.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=tcp:pastisserie-sql.database.windows.net,1433;Initial Catalog=PastisserieDB;User ID=sqladmin;Password=TU_PASSWORD;Encrypt=True;Connection Timeout=30;"
  }
}
```

Ejecuta las migraciones:

💻 **Comando:**
```bash
dotnet ef database update \
  --project PastisserieAPI.Infrastructure \
  --startup-project PastisserieAPI.API \
  --connection "Server=tcp:pastisserie-sql.database.windows.net,1433;Initial Catalog=PastisserieDB;User ID=sqladmin;Password=TU_PASSWORD;Encrypt=True;"
```

---

### 8.4 Desplegar Frontend

#### Opción 1: Azure Static Web Apps (Recomendado)

1. En el portal de Azure, busca **"Static Web Apps"**
2. Click en **"+ Create"**
3. Configuración:
   - **Resource group**: `pastisserie-rg`
   - **Name**: `pastisserie-frontend`
   - **Plan type**: Free
   - **Region**: Automático
   - **Source**: GitHub (o Azure DevOps)
   - **Repository**: Conecta tu repo
   - **Branch**: `main`
   - **Build Presets**: React
   - **App location**: `/pastisserie-front`
   - **Output location**: `dist`
4. Click en **"Review + create"** → **"Create"**
5. Azure creará un workflow de GitHub Actions automáticamente
6. El despliegue se ejecuta al hacer push a `main`

✅ **URL final**: `https://pastisserie-frontend-XXXXX.azurestaticapps.net`

---

#### Opción 2: Azure App Service (alternativa)

💻 **Comandos:**

```bash
# 1. Crear App Service
az webapp create \
  --name pastisserie-frontend \
  --resource-group pastisserie-rg \
  --plan pastisserie-plan \
  --runtime "NODE|20-lts"

# 2. Build del frontend
cd pastisserie-front
npm run build

# 3. Desplegar
cd dist
zip -r ../build.zip .
az webapp deployment source config-zip \
  --name pastisserie-frontend \
  --resource-group pastisserie-rg \
  --src ../build.zip
```

---

### 8.5 Configurar Variables de Entorno en Producción

#### Backend (App Service):

1. Ve a tu App Service → **"Configuration"**
2. En **"Application settings"**, agrega:

| Name | Value |
|------|-------|
| `ConnectionStrings__DefaultConnection` | `Server=tcp:pastisserie-sql.database.windows.net,...` |
| `JwtSettings__SecretKey` | `TuClaveSecreta32CaracteresProduccion` |
| `Smtp__User` | `patisseriesdeluxe@gmail.com` |
| `Smtp__Password` | `abcdefghijklmnop` |
| `AzureStorage__ConnectionString` | `DefaultEndpointsProtocol=https;...` |
| `FrontendUrl` | `https://pastisserie-frontend-XXXXX.azurestaticapps.net` |
| `ASPNETCORE_ENVIRONMENT` | `Production` |

3. Click en **"Save"** → **"Continue"**
4. La app se reiniciará automáticamente

---

#### Frontend (Static Web App):

1. Ve a tu Static Web App → **"Configuration"**
2. En **"Application settings"**, agrega:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://pastisserie-api.azurewebsites.net/api` |

3. Click en **"Save"**
4. Redespliega el frontend (hace push al repo o manualmente)

---

### 8.6 Configurar CORS en Producción

Actualiza `Program.cs` en el backend:

```csharp
// Configurar CORS para producción
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins(
                    "http://localhost:5173", // Desarrollo
                    "https://pastisserie-frontend-XXXXX.azurestaticapps.net" // Producción
                )
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        });
});

var app = builder.Build();

app.UseCors("AllowFrontend");
```

Redespliega el backend.

---

### 8.7 Configurar SSL/HTTPS

✅ **Automático en Azure**:
- Azure App Service y Static Web Apps incluyen certificados SSL gratuitos
- Todas las URLs `https://*.azurewebsites.net` tienen SSL automático
- Redireccionamiento HTTP → HTTPS está habilitado por defecto

Para **dominios personalizados** (ej: `www.pastisseriedeluxe.com`):
1. Ve a tu App Service/Static Web App → **"Custom domains"**
2. Click en **"Add custom domain"**
3. Sigue el asistente (requiere configurar DNS)
4. Azure provee certificado SSL gratuito (Let's Encrypt)

---

### 8.8 Verificar Despliegue en Producción

#### Checklist:

- [ ] Backend responde en `https://tu-api.azurewebsites.net/swagger`
- [ ] Frontend carga en `https://tu-frontend.azurestaticapps.net`
- [ ] Login funciona correctamente
- [ ] Registro de usuario funciona
- [ ] Creación de productos (admin) funciona
- [ ] Subida de imágenes a Azure Blob Storage funciona
- [ ] Emails de recuperación de contraseña se envían
- [ ] Pedidos se crean y aprueban correctamente
- [ ] No hay errores en la consola del navegador
- [ ] No hay errores 500 en los logs de App Service

---

## 9. Solución de Problemas

### 9.1 Problemas de Backend

#### Error: "Could not find a part of the path"

**Causa**: Rutas absolutas en Windows (`C:\...`) no funcionan en Linux/Mac.

**Solución**: Usa rutas relativas o `Path.Combine()`:
```csharp
var filePath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "image.jpg");
```

---

#### Error: "A connection was successfully established, but then an error occurred"

**Causa**: Certificado SSL de SQL Server no confiado.

**Solución**: Agrega `TrustServerCertificate=True` al Connection String:
```json
"Server=localhost;Database=PastisserieDB;User Id=sa;Password=xxx;TrustServerCertificate=True"
```

---

#### Error: "Login failed for user 'sa'"

**Causa**: Contraseña incorrecta o usuario no configurado.

**Solución**:
1. Verifica la contraseña en SSMS
2. Si usas SQL Server Express, habilita autenticación mixta:
   - SQL Server Configuration Manager → SQL Server Services → Restart
   - SSMS → Server Properties → Security → "SQL Server and Windows Authentication mode"

---

#### Error: "The certificate chain was issued by an authority that is not trusted"

**Causa**: Certificado SSL auto-firmado en SQL Server.

**Solución**: Usa `TrustServerCertificate=True` (solo en desarrollo).

---

### 9.2 Problemas de Frontend

#### Error: "Network Error" al hacer peticiones

**Causa**: Backend no está corriendo o CORS mal configurado.

**Solución**:
1. Verifica que el backend esté corriendo (`dotnet run`)
2. Verifica `VITE_API_URL` en `.env`
3. Revisa configuración CORS en `Program.cs`

---

#### Error: "Module not found: Can't resolve '...'"

**Causa**: Dependencia no instalada.

**Solución**:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

#### Error: Las imágenes de productos no cargan

**Causa**: URLs de Azure Blob Storage incorrectas o acceso público no habilitado.

**Solución**:
1. Verifica que el container tenga `Public access level: Blob`
2. Prueba la URL directamente en el navegador
3. Verifica que el Connection String sea correcto

---

### 9.3 Problemas de Base de Datos

#### Error: "Cannot open database requested by the login"

**Causa**: La base de datos no existe.

**Solución**:
```bash
dotnet ef database update --project PastisserieAPI.Infrastructure --startup-project PastisserieAPI.API
```

---

#### Error: "There is already an object named '...' in the database"

**Causa**: Migraciones aplicadas parcialmente.

**Solución**:
```bash
# Borrar la base de datos y recrearla
dotnet ef database drop --project PastisserieAPI.Infrastructure --startup-project PastisserieAPI.API
dotnet ef database update --project PastisserieAPI.Infrastructure --startup-project PastisserieAPI.API
```

---

### 9.4 Problemas de Emails

#### Error: "The SMTP server requires a secure connection"

**Causa**: SSL no habilitado.

**Solución**:
```json
"Smtp": {
  "EnableSsl": true
}
```

---

#### Error: "Authentication failed"

**Causa**: App Password incorrecta o verificación en 2 pasos deshabilitada.

**Solución**:
1. Genera una nueva App Password en https://myaccount.google.com/apppasswords
2. Verifica que la verificación en 2 pasos esté activa

---

## 10. Anexos

### 10.1 Comandos Útiles

#### Backend:

```bash
# Restaurar dependencias
dotnet restore

# Compilar
dotnet build

# Ejecutar
dotnet run --project PastisserieAPI.API

# Ejecutar con hot reload
dotnet watch run --project PastisserieAPI.API

# Crear migración
dotnet ef migrations add MigracionNueva --project PastisserieAPI.Infrastructure --startup-project PastisserieAPI.API

# Aplicar migraciones
dotnet ef database update --project PastisserieAPI.Infrastructure --startup-project PastisserieAPI.API

# Revertir última migración
dotnet ef migrations remove --project PastisserieAPI.Infrastructure --startup-project PastisserieAPI.API

# Borrar base de datos
dotnet ef database drop --project PastisserieAPI.Infrastructure --startup-project PastisserieAPI.API

# Generar script SQL
dotnet ef migrations script --project PastisserieAPI.Infrastructure --startup-project PastisserieAPI.API -o migration.sql
```

---

#### Frontend:

```bash
# Instalar dependencias
npm install

# Ejecutar desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de build
npm run preview

# Linter
npm run lint

# Linter con auto-fix
npm run lint -- --fix

# Limpiar caché
rm -rf node_modules package-lock.json
npm install
```

---

### 10.2 Puertos Utilizados

| Servicio | Puerto | Protocolo | URL |
|----------|--------|-----------|-----|
| Backend (HTTP) | 5000 | HTTP | http://localhost:5000 |
| Backend (HTTPS) | 5001 | HTTPS | https://localhost:5001 |
| Frontend | 5173 | HTTP | http://localhost:5173 |
| SQL Server | 1433 | TCP | localhost,1433 |
| Swagger UI | 5000 | HTTP | http://localhost:5000/swagger |

---

### 10.3 Estructura de Archivos de Configuración

```
PastisserieAPI/
├── PastisserieAPI.API/
│   ├── appsettings.json           # Configuración base (NO subir a Git con secrets)
│   ├── appsettings.Development.json  # Configuración de desarrollo
│   ├── appsettings.Production.json   # Configuración de producción
│   └── appsettings.Example.json      # Plantilla (sí subir a Git)

pastisserie-front/
├── .env                           # Variables locales (NO subir a Git)
├── .env.production                # Variables de producción
└── .env.example                   # Plantilla (sí subir a Git)
```

---

### 10.4 Checklist Pre-Despliegue

Antes de desplegar a producción, verifica:

**Seguridad:**
- [ ] `SecretKey` de JWT es única y >= 32 caracteres
- [ ] Contraseñas de BD son fuertes y únicas
- [ ] App Passwords de Gmail están en variables de entorno
- [ ] Azure Storage Connection String está seguro
- [ ] `appsettings.json` con secretos NO está en Git
- [ ] CORS solo permite orígenes autorizados
- [ ] HTTPS habilitado en producción

**Funcionalidad:**
- [ ] Todas las migraciones aplicadas
- [ ] Datos iniciales (seed) insertados
- [ ] Emails de prueba funcionan
- [ ] Subida de imágenes a Azure funciona
- [ ] Todos los endpoints principales funcionan
- [ ] Frontend conecta correctamente al backend

**Performance:**
- [ ] Índices creados en tablas principales
- [ ] Imágenes optimizadas (< 500 KB)
- [ ] Build de producción del frontend (`npm run build`)
- [ ] Logs de nivel apropiado (Info en producción, no Debug)

---

### 10.5 Recursos Adicionales

**Documentación Oficial:**
- .NET 8: https://learn.microsoft.com/dotnet/core/whats-new/dotnet-8
- Entity Framework Core: https://learn.microsoft.com/ef/core/
- React 19: https://react.dev
- Vite: https://vitejs.dev
- Tailwind CSS: https://tailwindcss.com
- Azure App Service: https://learn.microsoft.com/azure/app-service/

**Herramientas:**
- Postman: https://www.postman.com (testing de API)
- Azure Storage Explorer: https://azure.microsoft.com/features/storage-explorer/
- SQL Server Management Studio: https://learn.microsoft.com/sql/ssms/

**Comunidad:**
- Stack Overflow: https://stackoverflow.com
- GitHub Issues: (repo del proyecto)
- SENA Foro de Aprendices

---

## Notas Finales

- **Versión del sistema**: 1.0 (03/04/2026)
- **Tiempo estimado de instalación**: 2-3 horas (primera vez)
- **Soporte técnico**: Contactar al instructor o equipo de desarrollo

⚠️ **IMPORTANTE**: 
- Realiza backups regulares de la base de datos en producción
- Monitorea los costos de Azure (especialmente SQL Database y Storage)
- Actualiza dependencias regularmente (`dotnet outdated`, `npm outdated`)
- Revisa logs de errores periódicamente

✅ **Si completaste todos los pasos, tu instalación está lista para desarrollo o producción.**

---

**PASTISSERIE'S DELUXE** — Sistema de E-Commerce  
© 2026 SENA Ficha 3035528  
Todos los derechos reservados
