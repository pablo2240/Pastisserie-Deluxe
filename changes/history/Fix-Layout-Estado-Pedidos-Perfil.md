# Fix: Layout de Badge de Estado en Mis Pedidos

## Fecha: 30 Mar 2026

## Problema

En la sección "Mis Pedidos" del perfil del usuario, al cambiar el estado del pedido (por ejemplo a "En Preparación" o "NoEntregado"), el diseño se rompía. Esto ocurría porque el badge del estado no tenía un ancho fijo, y cada estado tiene diferente longitud de texto.

## Solución

Se agregó un ancho mínimo (`min-w-[90px]`) y centrado de texto (`text-center`) al badge del estado del pedido para mantener el layout consistente independientemente del texto del estado.

## Cambios Realizados

### Archivo modificado

**`pastisserie-front/src/pages/perfil.tsx`**

### Cambio realizado

```diff
- <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${getStatusColor(pedido.estado)}`}>
+ <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest min-w-[90px] text-center ${getStatusColor(pedido.estado)}`}>
```

### Resultado

- El badge del estado ahora tiene un ancho mínimo de 90px
- El texto está centrado
- El layout se mantiene consistente sin importar la longitud del nombre del estado

---

## Build Result

- Frontend: ✅ Lint verificado (errores preexistentes, no introducidos por este cambio)
