# Pago (ePayco): Evidencia y Funcionamiento

## Clasificación: FUNCIONAL

---

### Mapeo End-to-End

#### 1. Frontend (React)

- **checkout.tsx**
    - Crea el pedido (orderService.createOrder).
    - Obtiene datos para la pasarela ePayco (`/pagos/epayco/checkout-data/{pedidoId}`).
    - Abre el widget de ePayco usando las URLs y la firma de integridad generadas en backend.
    - Limpia el carrito tras abrir el pago.

- **ResultadoPago.tsx**
    - Recibe redirect de ePayco con `ref_payco` y `pedido_id`/`extra1`.
    - Valida estado de transacción desde backend (`/pagos/epayco/confirmar/{refPayco}` – anónimo).
        - Sin sesión: consulta el estado real en ePayco y actualiza el pedido en DB.
        - Con sesión: fallback a `/pagos/epayco/validar/{refPayco}`.
    - Muestra detalles de la transacción y mapea respuesta (`codResponse`) al UI.
    - Consulta `/pagos/verificar-pedido/{pedidoId}` para estados intermedios o dudas.

- **orderService.ts**
    - Expone todas las funciones hacia API: crear pedido, obtener datos de checkout, validar y confirmar transacción, verificar pedido.

#### 2. Backend (.NET API)

- **PagosController**
    - `/epayco/checkout-data/{pedidoId}`: Genera datos de pasarela incluyendo firma, URLs, y valida el usuario.
    - `/webhook/epayco` (POST/GET): Recibe la confirmación de ePayco sobre la transacción y actualiza el pedido en base a la respuesta y estado del pago.
    - `/epayco/validar/{refPayco}`: Endpoints para validar transacción con ePayco vía REST, actualizar DB; requiere autenticación.
    - `/epayco/confirmar/{refPayco}`: Fallback anónimo; consulta ePayco, actualiza pedido (importante para casos sin sesión, o webhook fallido).
    - `/verificar-pedido/{pedidoId}`: Devuelve el estado transaccional del pedido.

- **EpaycoService**
    - Genera todos los datos de checkout (firma, URLs, etc).
    - Procesa webhooks (verifica firma, actualiza pedido según cod_response).
    - Valida transacción consultando ePayco y sincronizando el pedido; compensa webhook fallido.

- **Pedido.cs / MetodoPagoUsuario.cs**
    - Pedido almacena referencias, estado, método, y metadatos de pago ePayco.
    - MetodoPagoUsuario soporta métodos personalizados, aunque el flujo central actual es ePayco.


---

### Evidencia Técnica

- Todos los endpoints y servicios están implementados; no hay endpoints rotos ni desconectados.
- Webhook y fallback por validación compensan los posibles fallos en integración.
- Seguridad de firma ePayco verificada tanto en checkout como en webhook.
- Feedback al usuario robusto post-pago, con lógica reactiva ante distintos estados de transacción.

---

**Clasificación: FUNCIONAL**

Toda la cadena funciona y está sustentada en código real. El sistema aprovecha estrategias de compensación para asegurar la actualización y veracidad del estado de pago del pedido. No se identifican endpoints rotos o desconectados. El flujo es resiliente y sólido para operación real.
