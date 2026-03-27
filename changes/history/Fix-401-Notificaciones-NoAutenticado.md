# Fix: Error 401 en Notificaciones para usuarios no autenticados

## Fecha: 27 Mar 2026

## Problema

El componente `Notificaciones.tsx` intentaba cargar notificaciones cada 12 segundos mediante polling, incluso cuando el usuario no estaba autenticado. Esto causaba errores 401 (Unauthorized) en la consola del navegador:

```
api/notificaciones:1 Failed to load resource: the server responded with a status of 401 (Unauthorized)
Notificaciones.tsx:50 Error al cargar notificaciones: AxiosError: Request failed with status code 401
```

## Solución

Se modificó el componente para verificar la autenticación antes de realizar las peticiones:

### Cambios realizados en `Notificaciones.tsx`

1. **Función `cargarNotificaciones`**:
   - Agregada verificación `if (!user || !user.id)` al inicio
   - Si no hay usuario, limpia las notificaciones y retorna sin hacer petición

2. **useEffect**:
   - Agregada verificación antes de iniciar el polling
   - Agregado `user` como dependencia para reactivarse automáticamente
   - Limpia las notificaciones cuando no hay usuario autenticado

### Código modificado

```typescript
// En cargarNotificaciones
const cargarNotificaciones = async () => {
    // Verificar que hay usuario autenticado antes de hacer la petición
    if (!user || !user.id) {
        setNotificaciones([]);
        return;
    }
    // ... resto del código
};

// En useEffect
useEffect(() => {
    // Solo cargar notificaciones si hay usuario autenticado
    if (user && user.id) {
        cargarNotificaciones();
        const interval = setInterval(cargarNotificaciones, 12000);
        return () => clearInterval(interval);
    }
    // Limpiar notificaciones cuando no hay usuario
    setNotificaciones([]);
}, [user]);
```

## Beneficios

- ✅ Elimina errores 401 cuando el usuario no está logueado
- ✅ Evitaconsole.error innecesarios en la consola
- ✅ El polling se activa/desactiva automáticamente según el estado de autenticación
- ✅ El componente sigue funcionando correctamente para usuarios autenticados

## Build Result
- Frontend: ✅ Build exitoso