# Funcionamiento real: Usuarios y Autenticación

## Flujos principales
- Registro
- Login
- Recuperación de contraseña
- Gestión de perfil
- Roles y permisos

## Evidencia de código (end-to-end)
- Frontend: `pastisserie-front/src/pages/login.tsx`, `register.tsx`, `resetPassword.tsx`, `perfil.tsx`, `services/authService.ts`
- Backend: `PastisserieAPI.API/Controllers/AuthController.cs`, `UsersController.cs`, `PastisserieAPI.Services/Services/AuthService.cs`
- DB: Tablas `Users`, `UserRoles`, `Roles`, `CarritoCompra`

## Rutas y operaciones
- POST `/auth/register` → registro usuario
- POST `/auth/login` → login usuario
- POST `/auth/reset-password` → recuperación
- GET `/users/{id}` → perfil
- POST `/users/change-password` → cambio contraseña
- Roles gestionados por DB y verificados en backend

## Estado
- El flujo está **100% implementado**, extremo a extremo.
- Todas las pantallas de frontend (registro, login, perfil, recuperación) llaman los endpoints backend, los servicios corresponden y están conectados.
- Pruebas de código muestran retorno correcto de estados, autenticación JWT, validación y feedback UI.
- Recuperación simula el token en memoria (evidencia en backend).

## Relevancia técnica
- No se detectan partes rotas, desconexiones o endpoints faltantes.
- El flujo cumple la operación completa según el código, no solo teoría.

## Archivos clave
- Frontend: login.tsx, register.tsx, resetPassword.tsx, perfil.tsx, authService.ts
- Backend: AuthController.cs, UsersController.cs, AuthService.cs
