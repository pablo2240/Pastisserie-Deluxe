## Título: Ajuste de navegación para usuarios invitados (sin forzar login)

### Qué se implementó
Se eliminó la redirección automática al login cuando usuarios no autenticados intentan acceder a funcionalidades privadas. Ahora los usuarios invitados pueden navegar libremente por la aplicación y ven mensajes de "autenticación requerida" dentro de la interfaz cuando intentan acceder a funcionalidades que requieren cuenta.

### Archivos modificados
- `pastisserie-front/src/api/axios.ts` - Eliminado redirección automática window.location.href = '/login', ahora solo limpia localStorage si había token y emite evento custom auth:unauthorized

### Problema que se resolvió
Los usuarios no autenticados eran redirigidos automáticamente a /login al intentar acceder a cualquier funcionalidad que requiriera autenticación, lo cual era una mala experiencia de usuario. El origen del problema estaba en el interceptor de respuestas de axios que detectaba errores 401 y redirigía automáticamente.

### Cómo probarlo
1. Acceder al home (/) sin estar autenticado - debe cargar sin problemas
2. Navegar a /productos, /promociones, /contacto - deben funcionar
3. Intentar acceder a /perfil - debe mostrar mensaje "Para ver tu perfil y historial de pedidos, necesitas tener una cuenta."
4. Intentar acceder a /checkout - debe mostrar mensaje "Para finalizar tu pedido, necesitas tener una cuenta y estar autenticado."
5. Intentar acceder a /reclamaciones - debe mostrar mensaje "Para crear o ver reclamaciones, necesitas tener una cuenta activa."
6. Los botones en los mensajes deben dirigir a /login y /registro

### Impacto en el sistema
- Backend: Sin cambios
- Frontend: Cambio en comportamiento de autenticación
- No se rompen funcionalidades existentes
- Las rutas protegidas (/admin/*, /repartidor) siguen funcionando igual
- El componente AuthRequiredMessage ya existía y se usa correctamente
