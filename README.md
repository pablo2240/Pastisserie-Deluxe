# PastisserieDeluxe 🍰

**Sistema de E-commerce para Pastelería**  
Proyecto SENA - Ficha 3035528

---

## Estado del Proyecto

| Métrica | Valor |
|---------|-------|
| **Estado** | ✅ 85-90% FUNCIONAL |
| **Última actualización** | 03/04/2026 |
| **Entidades activas** | 18 |
| **Migraciones** | 33 |
| **Frontend** | React 19 + TypeScript + Vite + Tailwind CSS v4 |
| **Backend** | ASP.NET Core 8.0 + Entity Framework Core 8.0 |
| **Base de datos** | SQL Server 2022 |
| **Despliegue** | Azure (App Service + SQL + Blob Storage) |

---

## Descripción del Proyecto

PastisserieDeluxe es una plataforma completa de e-commerce para una pastelería artesanal, desarrollada como proyecto formativo del SENA. El sistema permite:

- ✅ Registro e inicio de sesión con autenticación JWT
- ✅ Catálogo de productos con categorías, búsqueda y filtros
- ✅ Carrito de compras persistente
- ✅ Proceso de checkout con validación de horario
- ✅ Sistema de pago simulado (tarjetas, efectivo, Nequi)
- ✅ Gestión de pedidos con estados y seguimiento
- ✅ Sistema de promociones (vinculadas e independientes)
- ✅ Reseñas de productos con moderación admin
- ✅ Sistema de reclamaciones
- ✅ Notificaciones por cambio de estado
- ✅ Panel de administración completo
- ✅ Panel de repartidor
- ✅ Configuración de tienda (horario, costos de envío)

---

## Estructura del Proyecto

```
PastisserieDeluxe/
├── PastisserieAPI/                    # Backend (ASP.NET Core 8.0)
│   ├── PastisserieAPI.API/            # Capa de Controllers
│   ├── PastisserieAPI.Core/          # Capa de Entidades e Interfaces
│   ├── PastisserieAPI.Infrastructure/# Capa de Datos (EF Core)
│   └── PastisserieAPI.Services/      # Capa de Servicios y DTOs
│
├── pastisserie-front/                 # Frontend (React 19)
│   ├── src/
│   │   ├── api/                      # Cliente HTTP
│   │   ├── components/               # Componentes reutilizables
│   │   ├── context/                  # Contextos (Auth, Cart)
│   │   ├── hooks/                    # Hooks personalizados
│   │   ├── pages/                    # Páginas (27 rutas)
│   │   ├── types/                    # Tipos TypeScript
│   │   └── utils/                    # Utilidades
│   └── package.json
│
├── docs/                              # Documentación
│   ├── 01-requisitos/                # Especificación de requisitos
│   ├── 02-diagramas/                  # Diagramas UML (Mermaid)
│   ├── 03-arquitectura/              # Arquitectura de software
│   ├── 04-manuales/                  # Manuales (Técnico, Usuario, Instalación)
│   ├── 05-pruebas/                   # Informe de pruebas
│   ├── 06-negocio/                   # Reglas de negocio y glosario
│   ├── 07-base-datos/               # Schema y diccionario de datos
│   ├── 08-funcionalidades/          # Documentación de flujos
│   └── 09-historico/                # Histórico de cambios
│
└── README.md                          # Este archivo
```

---

## Tecnologías Utilizadas

### Backend

| Tecnología | Propósito |
|------------|-----------|
| ASP.NET Core 8.0 | Framework web |
| Entity Framework Core 8.0 | ORM |
| SQL Server 2022 | Base de datos |
| JWT (Bearer) | Autenticación |
| FluentValidation | Validación de DTOs |
| AutoMapper | Mapeo objeto-objeto |
| BCrypt | Hash de contraseñas |
| Azure Blob Storage | Almacenamiento de imágenes |
| Gmail SMTP | Envío de emails |

### Frontend

| Tecnología | Propósito |
|------------|-----------|
| React 19 | Framework UI |
| TypeScript 5.x | Tipado estático |
| Vite 6.x | Build tool |
| Tailwind CSS v4 | Estilos |
| React Router 7.x | Enrutamiento |
| Axios | Cliente HTTP |
| React Context | Estado global |

---

## Primeros Pasos

### Requisitos Previos

- .NET 8.0 SDK
- Node.js 18+
- SQL Server (Local o Docker)
- Visual Studio 2022 o VS Code

### Instalación

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd PastisserieDeluxe

# 2. Backend
cd PastisserieAPI.API
dotnet restore
# Configurar appsettings.json con tu conexión SQL
dotnet run

# 3. Frontend
cd ../pastisserie-front
npm install
npm run dev
```

### Documentación de Instalación

Ver: `docs/04-manuales/manual-instalacion.md`

---

## Entidades del Sistema (18 tablas activas)

| # | Entidad | Descripción |
|---|---------|-------------|
| 1 | Users | Usuarios registrados |
| 2 | Roles | Roles (Admin, Usuario, Repartidor) |
| 3 | UserRoles | Relación usuario-rol |
| 4 | CategoriaProducto | Categorías de productos |
| 5 | Productos | Catálogo de productos |
| 6 | Reviews | Reseñas de productos |
| 7 | CarritoCompra | Carrito por usuario |
| 8 | CarritoItems | Items del carrito |
| 9 | Promociones | Promociones vigentes |
| 10 | DireccionEnvio | Direcciones con GPS |
| 11 | Pedidos | Pedidos realizados |
| 12 | PedidoItems | Items de pedidos |
| 13 | PedidoHistorial | Historial de estados |
| 14 | RegistroPago | Intentos de pago |
| 15 | Notificaciones | Notificaciones |
| 16 | ConfiguracionTienda | Configuración global |
| 17 | HorarioDia | Horario por día |
| 18 | Reclamaciones | Reclamaciones |

---

## Roles del Sistema

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **Admin** | Administrador | Acceso completo CRUD, dashboard, configuración |
| **Usuario** | Cliente | Carrito, pedidos, reseñas, perfil |
| **Repartidor** | Repartidor | Ver pedidos asignados, actualizar estado |

---

## Documentación Completa

### Requisitos

| Documento | Descripción |
|-----------|-------------|
| `especificacion-requisitos.md` | RF, RNF, RN, RI |
| `casos-de-uso.md` | 34 casos de uso detallados |

### Diagramas UML

| Documento | Tipo |
|-----------|------|
| `casos-de-uso.md` | Diagrama de casos de uso |
| `clases.md` | Diagrama de clases (18 entidades) |
| `secuencia.md` | Diagramas de secuencia (7 flujos) |
| `componentes.md` | Diagrama de componentes |
| `base-de-datos.md` | Diagrama E-R |
| `despliegue.md` | Diagrama de despliegue |

### Manuales

| Manual | Público objetivo |
|--------|-----------------|
| `manual-tecnico.md` | Desarrolladores |
| `manual-usuario.md` | Usuarios, Admin, Repartidor |
| `manual-instalacion.md` | Técnicos / Despliegue |

### Otros Documentos

| Documento | Descripción |
|-----------|-------------|
| `arquitectura-software.md` | Arquitectura Clean Architecture |
| `reglas-negocio.md` | 15 reglas de negocio |
| `glosario-terminos.md` | 50+ términos técnicos |
| `diccionario-datos.md` | Todas las tablas con campos |
| `informe-pruebas.md` | 127 pruebas ejecutadas |

---

## Estados del Sistema

### Estados de Pedido

```
Pendiente → Espera → Confirmado → EnProceso → Listo → EnCamino → Entregado
                                                              ↓
                                                        NoEntregado
```

### Estados de Reclamación

```
Pendiente → EnRevision → Resuelta / Rechazada
```

---

## Cambios Recientes (2026)

| Fecha | Cambio |
|-------|--------|
| 03/04/2026 | Integración Azure Blob Storage para imágenes |
| 02/04/2026 | Agregado campo StockIlimitado en Productos |
| 02/04/2026 | Agregado GPS (Latitud/Longitud) en DireccionEnvio |
| 26/03/2026 | Limpieza: eliminadas tablas obsoletas |
| 26/03/2026 | Simplificación: MetodoPago ahora es string |

---

## API Endpoints Principales

| Recurso | Endpoints |
|---------|-----------|
| Auth | /register, /login, /forgot-password, /reset-password |
| Productos | GET, POST, PUT, DELETE, /activos, /categoria/{id} |
| Carrito | GET, /agregar, /actualizar, /vaciar |
| Pedidos | POST, GET /mis-pedidos, PATCH /{id}/estado |
| Pagos | POST /{id}/simular, /registrar-intento |
| Promociones | CRUD, GET /vigentes |
| Reviews | POST, GET /producto/{id}, PATCH /{id}/aprobar |
| Admin | /dashboard/estadisticas, /dashboard/ventas, /dashboard/top-productos |

---

## Contribuir

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Add nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

---

## Licencia

Este proyecto es para fines educativos - SENA Ficha 3035528

---

## Contacto

- **Proyecto**: Pastisserie's Deluxe
- **Institución**: SENA
- **Ficha**: 3035528
- **Última actualización**: 03/04/2026

---

*Para documentación detallada, ver la carpeta `docs/`*