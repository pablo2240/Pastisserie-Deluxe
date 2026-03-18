# Flujo de Promociones

## Descripción General
Este flujo permite gestionar promociones especiales (descuentos, combos, ofertas) para los clientes, ya sea vinculadas a un producto específico o como promociones independientes con imagen, stock y precio propios. Los usuarios pueden agregar promociones al carrito y aprovechar los descuentos, mientras que los administradores gestionan (crean, editan, eliminan) las promociones desde un panel dedicado.

## Rastro End-to-End

- **Frontend Cliente**:
  - Página `/promociones.tsx` muestra todas promociones activas y vigentes para usuarios autenticados.
  - Botón "Agregar al carrito" enlaza con promoción (independiente o asociada a producto) usando `addToCart()`.
  - Restricción: máximo 3 unidades por promoción.
  - Visualización: muestra nombre, tipo descuento, valor, precio original/final, imagen (del producto o personalizada).
  
- **Frontend Administración**:
  - Página `/admin/promocionesAdmin.tsx`: permite crear/editar/eliminar promociones. Selección de tipo (producto/independiente), manejo de fecha de vigencia, carga de imagen, stock, validaciones.
  - Visualizaciones de estado: activa/desactiva, próxima, vigente, expirada.
  - Todas acciones llaman a los endpoints API.

- **Backend API**:
  - `PromocionesController.cs` expone endpoints:
    - `GET /promociones`: lista solo las vigentes y activas por defecto; admins pueden ver todas.
    - `POST /promociones`: crea promoción, valida datos esenciales según tipo.
    - `PUT /promociones/{id}`: actualiza promoción, valida consistencia (fechas, precio, tipo, producto).
    - `DELETE /promociones/{id}`: elimina promoción.
  - Validación estricta para fechas, precios, stock, tipo de promoción; solo admin puede cambiar promociones.
  - DTOs y entidades gestionan todos los campos relevantes para UI/negocio.

- **Backend Services y DB**:
  - `Promocion.cs`: modelo soporta ambos tipos de promoción, con referencias opcionales a producto, imagen, stock, precios.
  - `PedidoService.cs`: flujo de checkout y creación de pedido:
    - Valida stock de promo/stock de producto según tipo.
    - Calcula precio final aplicando descuento.
    - Debita stock de promo (si independiente) o producto.
  - Migrations, validaciones con FluentValidation y restricciones.

## Reglas de Negocio

- Dos tipos de promociones:
  - **Producto**: vínculo a producto, usa imagen y stock del producto; precio/descuento aplicado sobre precio del producto.
  - **Independiente**: imagen, precio, stock propios; descuento aplicado sobre precio ingresado.
- Validaciones de stock, fechas, precio original, tipo de descuento.
- Restricción de máximo 3 unidades por promoción independiente en compras.
- Promociones solo aparecen si activas, dentro de vigencia y con stock suficiente.

## Estado
**Funcional (100% end-to-end):**

- Clientes pueden visualizar y comprar promociones.
- Promociones afectan precios y stock correctamente.
- Administradores gestionan promociones y validaciones con reglas claras.
- Flujo completo y robusto, sin endpoints rotos ni lógicas desconectadas.

---

**Evidencia basada completamente en código; sin suposiciones.**
