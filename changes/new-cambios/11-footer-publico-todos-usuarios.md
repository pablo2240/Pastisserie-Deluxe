# 11 - Hacer el footer accesible para todos los usuarios

## ¿Qué se implementó?
Se modificó el endpoint `/api/configuracion` para permitir acceso público (sin autenticación) al método GET, mientras el método PUT permanece protegido solo para administradores.

## Archivos modificados
- `PastisserieAPI.API/Controllers/ConfiguracionController.cs`

## Problema resuelto
Anteriormente, el endpoint GET `/api/configuracion` requía autenticación de administrador ([Authorize(Roles = "Admin")]), lo que impedía que usuarios no autenticados, clientes o domiciliarios pudieran ver la configuración del footer.

Ahora:
- **GET /api/configuracion**: Acceso público (sin autenticación) - cualquiera puede leer
- **PUT /api/configuracion**: Solo administradores pueden modificar

## Cómo probarlo
1. Asegurarse de que la API esté corriendo
2. Sin estar autenticado, hacer una petición GET a `/api/configuracion`
3. Verificar que retorna la configuración (dirección, teléfono, redes sociales)
4. Verificar que el footer se muestra correctamente para todos los usuarios

## Impacto en el sistema
- **Backend**: Endpoint GET de configuración ahora es público
- **Frontend**: Sin cambios necesarios
- **Base de datos**: Sin impacto
