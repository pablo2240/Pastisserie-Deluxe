# Glosario de Términos - PastisserieDeluxe

**Proyecto**: PASTISSERIE'S DELUXE  
**Código**: SENA Ficha 3035528  
**Versión**: 2.0  
**Fecha**: 03/04/2026

---

## A

| Término | Definición |
|---------|------------|
| **API (Application Programming Interface)** | Conjunto de protocolos y herramientas que permiten que el frontend se comunique con el backend. En este proyecto, REST API. |
| **ASP.NET Core** | Framework de desarrollo web de Microsoft utilizado para el backend. Versión 8.0. |
| **Azure Blob Storage** | Servicio de almacenamiento en la nube de Microsoft Azure para guardar imágenes de productos. |
| **Azure SQL** | Servicio de base de datos relacional en la nube de Microsoft Azure. |

---

## B

| Término | Definición |
|---------|------------|
| **Backend** | Capa del sistema que procesa la lógica de negocio, conecta con la base de datos y expone la API. En este proyecto: ASP.NET Core 8.0. |
| **BCrypt** | Algoritmo de hashing de contraseñas utilizado para almacenar passwords de forma segura. |

---

## C

| Término | Definición |
|---------|------------|
| **Carrito de Compras** | Componente del sistema que almacena temporalmente los productos que el usuario desea comprar antes de proceder al checkout. |
| **Clean Architecture** | Arquitectura de software que organiza el código en capas (Core, Infrastructure, Services, API) con dependencias hacia el núcleo, no hacia detalles de implementación. |
| **Claims** | Fragmentos de información sobre el usuario almacenados dentro del token JWT (ej: UserId, Email, Rol). |
| **CRUD** | Acrónimo de Create (Crear), Read (Leer), Update (Actualizar), Delete (Eliminar). Operaciones básicas de gestión de datos. |
| **CORS (Cross-Origin Resource Sharing)** | Mecanismo de seguridad que permite o restringe solicitudes HTTP entre diferentes dominios. |

---

## D

| Término | Definición |
|---------|------------|
| **Dashboard** | Panel de control que muestra métricas, estadísticas y gráficos para la gestión del sistema. |
| **DTO (Data Transfer Object)** | Objeto utilizado para transferir datos entre capas del sistema. Request DTOs para entrada, Response DTOs para salida. |
| **DTOs de Request** | DTOs que llegan desde el cliente al servidor con datos para crear o actualizar recursos. |
| **DTOs de Response** | DTOs que el servidor devuelve al cliente con la información solicitada. |

---

## E

| Término | Definición |
|---------|------------|
| **EF Core (Entity Framework Core)** | ORM (Object-Relational Mapper) de Microsoft para acceder a la base de datos desde código C#. |
| **Endpoint** | URL específica de la API que responde a una solicitud HTTP (ej: GET /api/productos). |
| **Entity (Entidad)** | Clase que representa una tabla en la base de datos. |

---

## F

| Término | Definición |
|---------|------------|
| **FluentValidation** | Biblioteca para validar DTOs en .NET mediante reglas declarativas. |
| **Frontend** | Capa de presentación del sistema. En este proyecto: React 19 con TypeScript, Vite y Tailwind CSS. |

---

## G

| Término | Definición |
|---------|------------|
| **GPS (Global Positioning System)** | Coordenadas de latitud y longitud almacenadas en la dirección de envío para tracking de repartidor. |

---

## J

| Término | Definición |
|---------|------------|
| **JWT (JSON Web Token)** | Estándar para generar tokens de autenticación. En este proyecto, tokens con expiración de 24 horas que contienen claims del usuario. |

---

## M

| Término | Definición |
|---------|------------|
| **Migración** | Script de Entity Framework que aplica cambios incrementales al esquema de la base de datos. |
| **Middleware** | Componente de software que se ejecuta en cada request HTTP. En este proyecto: autenticación, manejo de excepciones. |

---

## O

| Término | Definición |
|---------|------------|
| **ORM (Object-Relational Mapper)** | Técnica que permite interacturar con bases de datos relacionales usando objetos de programación. Entity Framework Core. |

---

## P

| Término | Definición |
|---------|------------|
| **PaginationDto** | DTO que contiene parámetros de paginación (número de página, tamaño de página) y resultados. |
| **Pago Simulado** | Sistema de pago que acepta cualquier tarjeta con formato válido sin conectarse a un procesador real. |
| **Promoción Vinculada** | Promoción aplicada a un producto existente, usando el precio y stock del producto original. |
| **Promoción Independiente** | Promoción que es un producto nuevo (ej: "Pack de 6 cupcakes") con precio, stock e imagen propios. |

---

## R

| Término | Definición |
|---------|------------|
| **Repository Pattern** | Patrón que abstrae el acceso a datos, proporcionando una interfaz para operaciones CRUD. |
| **Rol** | Tipo de usuario del sistema: Admin, Usuario (Cliente), Repartidor. Define permisos y acceso. |

---

## S

| Término | Definición |
|---------|------------|
| **SENA** | Servicio Nacional de Aprendizaje de Colombia. Institución educativa del proyecto. |
| **Schema** | Estructura de la base de datos que define tablas, columnas, relaciones y restricciones. |
| **Seed Data** | Datos iniciales que se insertan en la base de datos al crear o migrar (ej: roles por defecto). |
| **Soft-Delete** | Técnica de eliminación que marca un registro como inactivo (Activo = false) en lugar de borrarlo físicamente. |
| **StockIlimitado** | Campo booleano en Producto que indica que el producto no tiene límite de stock y nunca se agota. |
| **SQL Server** | Sistema de gestión de bases de datos relacional de Microsoft. Versión 2022. |

---

## T

| Término | Definición |
|---------|------------|
| **Tailwind CSS** | Framework de CSS utility-first utilizado para estilizar el frontend. Versión v4. |
| **Token JWT** | Token de autenticación generado tras login, válido por 24 horas, almacenado en el frontend. |
| **TypeScript** | Lenguaje de programación que añade tipado estático a JavaScript. Versión 5.x. |

---

## V

| Término | Definición |
|---------|------------|
| **Vite** | Herramienta de build y servidor de desarrollo rápido para proyectos frontend. |

---

## Términos del Dominio (E-Commerce)

| Término | Definición |
|---------|------------|
| **Checkout** | Proceso de completar la compra: datos de envío, resumen del pedido y pago. |
| **Pedido Mínimo** | Monto mínimo requerido para procesar un pedido (15.000 COP en este sistema). |
| **Costo de Envío** | Valor adicional por entrega a domicilio, varía según la zona/comuna. |
| **Comuna** | División territorial para deliveries: Guayabal (5.000 COP) y Belén (6.000 COP). |
| **Reseña/Review** | Comentario y calificación de un producto dejada por un cliente que lo compró. |
| **Reclamación** | Formalización de una queja o problema relacionado con un pedido. |
| **Ticket** | Identificador único de una reclamación (formato: REC-XXXXXX). |

---

## Estados del Sistema

| Término | Definición |
|---------|------------|
| **Estados del Pedido** | Pendiente → Espera → Confirmado → EnProceso → Listo → EnCamino → Entregado / NoEntregado / Cancelado |
| **Estados de Reclamación** | Pendiente → EnRevision → Resuelta / Rechazada |
| **Estados de Reseña** | Pendiente de aprobación → Aprobada / Rechazada |
| **Estados de Tienda** | Abierta / Cerrada (por horario o manualmente) |

---

## Términos Técnicos Adicionales

| Término | Definición |
|---------|------------|
| **Claim** | Ver JWT Claims |
| **FK (Foreign Key)** | Clave foránea que establece relación entre tablas. |
| **PK (Primary Key)** | Clave primaria que identifica unívocamente cada registro. |
| **Índice** | Estructura que mejora la velocidad de búsqueda en columnas frecuentemente consultadas. |
| **Cascada** | Comportamiento de eliminación/actualización automática en registros relacionados. |

---

*Documento generado el 03/04/2026 como parte del proyecto PastisserieDeluxe - SENA Ficha 3035528*