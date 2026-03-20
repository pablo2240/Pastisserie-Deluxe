# AGENTS.md - PastisserieDeluxe Developer Guide

## Project Overview
- **Backend**: ASP.NET Core 8.0 with Clean Architecture (Core → Infrastructure → Services → API)
- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS v4
- **Database**: SQL Server via Entity Framework Core
- **Frontend Port**: `http://localhost:5173`

---

## Build / Lint / Test Commands

### Backend (PastisserieAPI)
```bash
# Build entire solution
dotnet build PastisserieAPI.sln

# Build specific project
dotnet build PastisserieAPI.Services/PastisserieAPI.Services.csproj

# Run API (from PastisserieAPI.API directory)
dotnet run

# Run migrations
dotnet ef migrations add <MigrationName> -p ../PastisserieAPI.Infrastructure -s PastisserieAPI.API
dotnet ef database update -p ../PastisserieAPI.Infrastructure -s PastisserieAPI.API
```

### Frontend (pastisserie-front)
```bash
cd pastisserie-front

# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Lint all files
npm run lint

# Lint with auto-fix
npm run lint -- --fix

# Preview production build
npm run preview
```

**Note**: No test projects exist in this codebase yet. If tests are added, use:
```bash
# .NET tests
dotnet test

# React tests (if vitest is configured)
npm run test
```

---

## Code Style Guidelines

### C# Backend Conventions

#### Naming Conventions
| Element | Convention | Example |
|---------|------------|---------|
| Namespaces | PascalCase, match folder path | `PastisserieAPI.API.Controllers` |
| Classes/Interfaces | PascalCase, `I` prefix for interfaces | `AuthController`, `IAuthService` |
| Private fields | `_camelCase` | `_authService`, `_unitOfWork` |
| Methods/Properties | PascalCase | `GetUserByIdAsync`, `Email` |
| Enums | PascalCase | `EstadoPedido`, `TipoRol` |
| DTOs | PascalCase with suffix | `RegisterRequestDto`, `UserResponseDto` |

#### File Organization
```csharp
// 1. System/Framework imports
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

// 2. Project imports (Core, then Infrastructure, then Services)
using PastisserieAPI.Core.Entities;
using PastisserieAPI.Core.Interfaces;
using PastisserieAPI.Services.DTOs.Request;
using PastisserieAPI.Services.DTOs.Response;
using PastisserieAPI.Services.Services.Interfaces;

// 3. Namespace
namespace PastisserieAPI.API.Controllers
{
    // Class with dependency injection constructor
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        // Public methods get XML documentation
        /// <summary>
        /// Registrar nuevo usuario
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            // ...
        }
    }
}
```

#### Entity Conventions
- Use `string.Empty` for default string values (not `null`)
- Use DataAnnotations for validation (`[Required]`, `[MaxLength]`, `[EmailAddress]`)
- Navigation properties are `virtual` for EF lazy loading
- Use `DateTime.UtcNow` for timestamps
- Boolean defaults: `= false` / `= true` (no `Is` prefix)

#### Error Handling
- Controllers return `ApiResponse<T>.SuccessResponse()` or `ApiResponse<T>.ErrorResponse()`
- Use `[Authorize]` and `[Authorize(Roles = "Admin")]` attributes
- Global exceptions handled by `GlobalExceptionMiddleware`
- Services throw exceptions; controllers don't catch (except in try/catch for specific recovery)

#### Async/Await
- Always use `async/await` pattern
- Name methods with `Async` suffix
- Return `Task<T>` for methods that return a value

---

### React/TypeScript Frontend Conventions

#### Naming Conventions
| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase files, default exports | `AuthController.tsx`, `CarritoPage.tsx` |
| Hooks | `use` prefix, camelCase | `useAuth`, `useCarrito` |
| Utils/Helpers | camelCase | `apiClient.ts`, `formatDate.ts` |
| Types/Interfaces | PascalCase, `T` prefix optional | `User`, `ApiResponse<T>` |
| CSS/Tailwind | Tailwind classes, kebab-case | `flex`, `text-center`, `bg-pink-100` |

#### File Organization
```
src/
├── api/           # API client functions
├── components/    # Reusable UI components
├── context/       # React context providers
├── hooks/         # Custom hooks
├── layouts/       # Page layouts
├── pages/         # Route pages
├── services/      # Business logic services
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

#### Import Order
```typescript
// 1. React/Framework imports
import React, { useState, useEffect } from 'react'

// 2. Third-party libraries
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// 3. Project imports (relative)
import ErrorBoundary from './components/common/ErrorBoundary'
import { useAuth } from '../hooks/useAuth'
import type { User } from '../types'
```

#### TypeScript Guidelines
- Avoid `any`; use proper types or `unknown`
- Use `interface` for object shapes, `type` for unions/aliases
- Null checks: use optional chaining `?.` and nullish coalescing `??`
- Component props: define explicit interface

```typescript
// Good
interface ProductoCardProps {
  producto: Producto
  onAddToCart: (id: number) => void
}

// Bad - avoid
const Card = (props: any) => { ... }
```

#### React Patterns
- Use functional components with hooks
- Wrap app in `ErrorBoundary` for error handling
- Use `React.StrictMode` in development
- Fetch data in `useEffect` or with React Query pattern
- Handle loading/error states explicitly

---

## Architecture Patterns

### Backend (Clean Architecture)
```
API Layer (Controllers, Middleware)
    ↓
Services Layer (Business Logic, DTOs, Validators, Mappings)
    ↓
Infrastructure (EF Core, Repositories)
    ↓
Core (Entities, Enums, Interfaces)
```

### Key Patterns
- **Repository Pattern**: `IRepository<T>`, `IUnitOfWork`
- **Unit of Work**: Single `SaveChangesAsync()` per operation
- **DTO Pattern**: Separate Request/Response DTOs in `Services/DTOs/`
- **AutoMapper**: Configure mappings in `MappingProfile.cs`
- **FluentValidation**: Validators in `Validators/` folder
- **JWT Auth**: Token generation via `JwtHelper`

---

## Common Operations

### Add a new Entity
1. Create entity in `PastisserieAPI.Core/Entities/`
2. Add interface in `PastisserieAPI.Core/Interfaces/Repositories/`
3. Create repository implementation in `PastisserieAPI.Infrastructure/Repositories/`
4. Add DbSet and configuration in Infrastructure layer
5. Create DTOs in `PastisserieAPI.Services/DTOs/`
6. Create/update AutoMapper profile
7. Add FluentValidation validator
8. Create service interface and implementation
9. Create controller endpoints

### Add a new API endpoint
```csharp
/// <summary>
/// Description of endpoint
/// </summary>
[HttpGet("{id}")]
public async Task<IActionResult> GetById(int id)
{
    var entity = await _service.GetByIdAsync(id);
    if (entity == null)
        return NotFound(ApiResponse<T>.ErrorResponse("Not found"));
    return Ok(ApiResponse<T>.SuccessResponse(entity));
}
```

---

## Important Configuration
- **appsettings.json**: Database connection strings, JWT secrets, email settings
- **appsettings.Example.json**: Template with placeholder values
- **FrontendUrl config**: Set in backend for password reset/email links
- **CORS**: Configured in `Program.cs` - update origins for production
