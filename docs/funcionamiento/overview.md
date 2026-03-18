# Overview — Funcionamiento Técnico del Sistema

## Descripción General
El sistema PastisserieDeluxe es una aplicación web full-stack para la gestión de productos, pedidos, pagos, promociones, notificaciones, reseñas y envíos en una pastelería gourmet online. Está compuesto por un backend en .NET (Web API), frontend React, y una base de datos SQL Server.

## Estructura Modular
- **Backend:**
  - API Controllers: Exponen endpoints por dominio
  - Services: Lógica de negocio (validaciones, operaciones, reglas)
  - Repositories: Acceso persistente a datos
  - Entities: Modelos, relaciones y enums (usuarios, productos, pedidos, etc.)
  - Data: Contexto relacional, migraciones, configuración de indices y relaciones
- **Frontend:**
  - Pages: UI para cada caso de uso, integración con servicios
  - Services: Conexión AJAX con backend (REST), transformación de datos
  - Context/Hooks: Estado global de sesión, carrito, perfil, tienda
  - Utils: Operaciones utilitarias
- **DB:**
  - Tablas, migraciones, índices únicos y de rendimiento

## Flujos Principales
- Registro, autenticación con JWT y gestión de roles
- CRUD de productos, revisión, promociones, y stock
- Carrito con validaciones de stock y promociones
- Checkout y pedidos, sistema de estados y asignación de repartidor
- Pagos vía integración ePayco, validación y confirmación de estado
- Gestión de reclamaciones, notificaciones y reseñas
- Administración de configuraciones y reportes
- Envíos gestionados por admin y repartidores

## Integración Real
Cada flujo está respaldado por rutas, lógica de negocio, y persistencia — validaciones y operaciones críticas se realizan tanto en frontend como backend, asegurando seguridad, feedback y consistencia.

## Estado Inicial
La auditoría identificó todos los flujos de negocio, puntos rotos, desconexiones y mapeó cada módulo según evidencia del código.
