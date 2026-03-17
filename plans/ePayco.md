# Integración ePayco - Patisserie Deluxe

## Resumen

Se reemplazó completamente el sistema de pagos simulado (emulador MercadoPago) por una integración real con **ePayco Standard Checkout**. Todos los pagos se procesan a través del widget oficial de ePayco y se validan en el servidor mediante webhook y API REST.

---

## Qué se implementó

### Backend (.NET 8)

| Archivo | Cambio |
|---------|--------|
| `Core/Enums/EstadoPedido.cs` | Nuevos estados: `PagoPendiente`, `PagoFallido` |
| `Core/Entities/Pedido.cs` | 4 campos nuevos: `EpaycoRefPayco`, `EpaycoTransactionId`, `EpaycoEstadoTransaccion`, `EpaycoMetodoPago` |
| `Services/Services/EpaycoService.cs` | **Nuevo**: servicio completo de ePayco (checkout data, webhook, validación) |
| `Services/Services/Interfaces/IEpaycoService.cs` | **Nuevo**: interfaz con 3 métodos |
| `Services/DTOs/Payment/EpaycoCheckoutDataDto.cs` | **Nuevo**: DTO con datos para el widget de checkout |
| `Services/DTOs/Payment/EpaycoWebhookDto.cs` | **Nuevo**: DTO con campos `x_` del webhook |
| `Services/DTOs/Payment/EpaycoTransactionResultDto.cs` | **Nuevo**: DTO del resultado de validación |
| `API/Controllers/PagosController.cs` | Reescrito: 5 endpoints ePayco (ver tabla abajo). Incluye webhook POST y GET, endpoint anónimo de confirmación, validación autenticada, y verificación de pedido. |
| `API/Extensions/DependencyInjection.cs` | Registro de `EpaycoService` con `AddHttpClient` |
| `API/appsettings.json` | Sección `Epayco` con credenciales (placeholder) |
| `Services/PastisserieAPI.Services.csproj` | Paquete NuGet: `Mercadopago` eliminado, `epayco.net` v1.1.5 agregado |

**Todo el código de integración ePayco está aislado en archivos y servicios nuevos, sin mezclar lógica de otros medios de pago.**
| `Services/Services/PedidoService.cs` | Eliminada auto-aprobación y tokens simulados |

### Frontend (React/Vite/TypeScript)

| Archivo | Cambio |
|---------|--------|
| `index.html` | Script `checkout.epayco.co/checkout.js` agregado |
| `src/pages/checkout.tsx` | Reescrito: abre widget ePayco con `window.ePayco.checkout.configure().open()`. Usa `external: 'true'` para abrir en nueva ventana (no iframe) y que la redirección post-pago funcione correctamente. |
| `src/services/orderService.ts` | Métodos nuevos: `getEpaycoCheckoutData`, `verificarPedido`, `validarTransaccionEpayco`, `confirmarTransaccionEpayco` (este último llama al endpoint anónimo `/api/pagos/epayco/confirmar/{refPayco}`) |
| `src/pages/ResultadoPago.tsx` | **Reescrito completamente**: usa endpoint anónimo `confirmarTransaccionEpayco` como método primario (no requiere JWT). Incluye auto-retry (3 intentos cada 5s) para pagos pendientes, botón de reintento manual, y fallbacks (validación autenticada, verificación de pedido). |
| `src/api/axios.ts` | Añadido `/pagos/epayco/confirmar` a endpoints públicos. Añadido `/pago/` a la exclusión del interceptor 401 para no redirigir a login desde la página de resultado de pago. |
| `src/types/index.ts` | Nuevos estados `PagoPendiente` y `PagoFallido` |
| `src/components/MercadoPagoBrick.tsx` | **Eliminado** |
| `src/services/pagoEmuladorService.ts` | **Eliminado** |

### Migración de base de datos

Se generó la migración `AddEpaycoPaymentFields` que agrega 4 columnas a la tabla `Pedidos`:

```
dotnet ef database update --project PastisserieAPI.Infrastructure --startup-project PastisserieAPI.API
```

---

## Cómo funciona el flujo de pago

```
1. Usuario completa el checkout (dirección, resumen)
         |
2. Frontend crea el pedido (POST /api/pedidos)
   -> Pedido queda en estado "Pendiente", Aprobado=false
         |
3. Frontend solicita datos de checkout
   (POST /api/pagos/epayco/checkout-data/{pedidoId})
   -> Backend genera firma SHA-256, URLs de respuesta/confirmación
   -> Pedido pasa a estado "PagoPendiente"
   -> Devuelve EpaycoCheckoutDataDto
         |
4. Frontend abre el widget de ePayco (external: 'true' = nueva ventana)
   window.ePayco.checkout.configure({ key: publicKey, test: true/false })
   handler.open({ ...checkoutData })
   -> Se abre una nueva ventana/pestaña con el checkout de ePayco
         |
5. Usuario paga en el widget de ePayco
   (tarjeta, PSE, efectivo, etc.)
         |
6. ePayco envía POST (o GET) a url_confirmation (webhook)
   (POST /api/pagos/webhook/epayco) [FromForm]
   (GET  /api/pagos/webhook/epayco) [FromQuery] — algunos flujos de ePayco envían GET
   -> Backend valida firma SHA-256 del webhook
   -> Actualiza estado del pedido según x_cod_response:
      - 1 = Confirmado (Aprobado=true)
      - 2,4,6,9,10,11,12 = PagoFallido
      - 3,7,8 = PagoPendiente
   -> Guarda ref_payco, transaction_id, estado, método de pago
         |
7. ePayco redirige al usuario a url_response
    (/pago/resultado) — sin query params propios, ePayco añade ref_payco
   -> Frontend llama GET /api/pagos/epayco/confirmar/{refPayco} (anónimo, sin JWT)
   -> Si falla, intenta GET /api/pagos/epayco/validar/{refPayco} (con JWT)
   -> Auto-retry si el pago está pendiente (3 intentos, 5s entre cada uno)
   -> Muestra resultado: aprobado, pendiente, rechazado o error
```

### Códigos de respuesta ePayco

| Código | Significado | Estado del pedido |
|--------|-------------|-------------------|
| 1 | Aceptada | Confirmado |
| 2 | Rechazada | PagoFallido |
| 3 | Pendiente | PagoPendiente |
| 4 | Fallida | PagoFallido |
| 6 | Reversada | PagoFallido |
| 7 | Retenida | PagoPendiente |
| 8 | Iniciada | PagoPendiente |
| 9 | Expirada | PagoFallido |
| 10 | Abandonada | PagoFallido |
| 11 | Cancelada | PagoFallido |
| 12 | Antifraude | PagoFallido |

### Estados del pedido

```
Pendiente -> PagoPendiente -> Confirmado -> EnProceso -> ... -> Entregado
                           \-> PagoFallido
                           \-> Cancelado
```

---

## Endpoints de la API

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/pagos/epayco/checkout-data/{pedidoId}` | JWT | Genera datos para abrir el widget de ePayco |
| POST | `/api/pagos/webhook/epayco` | Ninguna | Webhook POST que ePayco llama para confirmar transacciones |
| GET | `/api/pagos/webhook/epayco` | Ninguna | Webhook GET (ePayco a veces envía confirmación por GET) |
| GET | `/api/pagos/epayco/confirmar/{refPayco}` | **Ninguna** | **Nuevo**: Confirma transacción consultando API ePayco y actualiza pedido. Diseñado para ser llamado desde ResultadoPago sin JWT. |
| GET | `/api/pagos/epayco/validar/{refPayco}` | JWT | Valida una transacción contra la API REST de ePayco (fallback autenticado) |
| GET | `/api/pagos/verificar-pedido/{pedidoId}` | JWT | Consulta el estado actual de un pedido |

---

## Dónde configurar las API Keys

### Archivo: `PastisserieAPI.API/appsettings.json`

```json
"Epayco": {
  "PublicKey": "TU_PUBLIC_KEY_AQUI",
  "PrivateKey": "TU_PRIVATE_KEY_AQUI",
  "PCustIdCliente": "TU_P_CUST_ID_CLIENTE_AQUI",
  "PKey": "TU_P_KEY_AQUI",
  "Test": true,
  "Language": "ES",
  "BackendBaseUrl": "http://localhost:5176",
  "FrontendBaseUrl": "http://localhost:5173"
}
```

### Cómo obtener las credenciales

1. Ir al dashboard de ePayco: https://dashboard.epayco.co
2. Iniciar sesión o crear una cuenta de comercio
3. En el menú lateral ir a **Integraciones** > **Llaves API** (o **API Keys**)
4. Copiar los valores:

| Campo en appsettings.json | Valor en el dashboard de ePayco |
|---------------------------|--------------------------------|
| `PublicKey` | Llave pública (PUBLIC_KEY) |
| `PrivateKey` | Llave privada (PRIVATE_KEY) |
| `PCustIdCliente` | P_CUST_ID_CLIENTE (ID del comercio) |
| `PKey` | P_KEY (llave de encriptación) |

### Configuración de URLs

| Campo | Descripción | Ejemplo dev | Ejemplo producción |
|-------|-------------|-------------|-------------------|
| `BackendBaseUrl` | URL base del API (para el webhook) | `http://localhost:5176` | `https://api.tudominio.com` |
| `FrontendBaseUrl` | URL base del frontend (para redirección post-pago) | `http://localhost:5173` | `https://tudominio.com` |

### Modo test vs producción

- `"Test": true` -> Modo pruebas (transacciones de prueba, sin cobros reales)
- `"Test": false` -> Modo producción (cobros reales)

El modo test/producción también se controla desde el dashboard de ePayco. Ambos deben coincidir.

---

## Validación de seguridad

### Firma del checkout (generada por el backend)

```
SHA-256(p_cust_id_cliente ^ p_key ^ invoice ^ amount ^ currency)
```

Se envía al widget como `integrity` para que ePayco verifique que los datos no fueron alterados.

**Importante:** El parámetro `p_cust_id_cliente` debe estar presente en la configuración del widget y en el payload del checkout. Su ausencia invalida la transacción, y también es parte de la firma (integrity) generada por el backend.


### Firma del webhook (validada por el backend)

```
SHA-256(p_cust_id_cliente ^ p_key ^ ref_payco ^ x_transaction_id ^ x_amount ^ x_currency_code)
```

El backend calcula esta firma y la compara con `x_signature` del webhook. Si no coincide, el webhook se rechaza.

---

## Tarjetas y cuentas de prueba ePayco

Para pruebas y QA en modo test, ePayco ofrece tarjetas de crédito y cuentas de Daviplata simuladas.

### Tarjetas de crédito de prueba:

- Visa: 4111 1111 1111 1111
- Mastercard: 5454 0000 0000 0000
- Amex: 3782 0000 0000 000
- Diners: 3056 0000 0000 00

*CVV:* cualquiera (ej: 123)  
*Fecha expiración:* cualquier futuro (ej: 12/39)

### Daviplata de prueba:

- Cedula: 1000000000
- Celular: 3000000000

> Para más datos ver: https://docs.epayco.co/pagos-colombia/#pruebas

---

## Consideraciones para producción

1. **Webhook accesible**: `BackendBaseUrl` debe ser una URL pública (no localhost). Para desarrollo local usar ngrok o similar. El webhook ahora acepta tanto POST como GET.

2. **Sincronización por API (endpoint anónimo)**: El endpoint principal de fallback es `GET /api/pagos/epayco/confirmar/{refPayco}` (sin autenticación). Este es el que usa `ResultadoPago.tsx` como método primario para confirmar el pago cuando el webhook no llega (caso localhost). Consulta la API REST de ePayco y actualiza el pedido en la base de datos.
   - **Importante**: Este endpoint es anónimo (`[AllowAnonymous]`) para funcionar cuando el usuario vuelve de ePayco sin JWT válido.
   - El endpoint autenticado `GET /api/pagos/epayco/validar/{refPayco}` sigue existiendo como fallback secundario.
   - El frontend (`ResultadoPago`) implementa auto-retry (3 intentos cada 5s) para pagos pendientes y botón de reintento manual.

3. **Widget externo**: El widget de ePayco debe abrirse con `external: 'true'` (nueva ventana/pestaña), no como iframe/modal. Esto es necesario para que el botón "Salir" en la factura de ePayco redirija correctamente a `url_response`.

4. **url_response sin query params propios**: La `url_response` debe ser solo la ruta base (`/pago/resultado`) sin query params como `?pedido_id=X`. ePayco reemplaza/añade sus propios query params (como `ref_payco`). El `pedidoId` se pasa en `extra1` y se recupera desde la respuesta de ePayco.

5. **Interceptor axios**: El endpoint `/pagos/epayco/confirmar` está en la lista de endpoints públicos del interceptor axios, y la ruta `/pago/` está excluida del redirect a login por 401. Esto evita que el usuario sea redirigido a login al volver de ePayco.

6. **HTTPS obligatorio**: En producción tanto el backend como el frontend deben usar HTTPS.
7. **Credenciales seguras**: No dejar las API keys en el código fuente. Usar variables de entorno o Azure Key Vault:
   ```bash
   # Variables de entorno (alternativa a appsettings.json)
   Epayco__PublicKey=tu_public_key
   Epayco__PrivateKey=tu_private_key
   Epayco__PCustIdCliente=tu_p_cust_id
   Epayco__PKey=tu_p_key
   ```
8. **Configurar url_confirmation en ePayco**: Además de enviarla en cada transacción, se recomienda configurarla como URL fija en el dashboard de ePayco (Integraciones > Configuración > URL de confirmación).
9. **Moneda**: Todos los pagos se procesan en COP (Peso Colombiano).

---

## Bugs corregidos (Marzo 2026)

### Bug 1: Pedido no se actualiza de "PagoPendiente" a "Confirmado"

**Causa raíz**: El webhook de ePayco (`url_confirmation`) apunta a `http://localhost:5176`, que no es alcanzable desde los servidores de ePayco. El endpoint autenticado de validación (`/api/pagos/epayco/validar/{refPayco}`) requería JWT, pero al regresar de ePayco el JWT podía estar expirado o ausente.

**Solución**: Se creó un nuevo endpoint anónimo `GET /api/pagos/epayco/confirmar/{refPayco}` con `[AllowAnonymous]`. El frontend lo llama como método primario al regresar de ePayco. Este endpoint consulta la API REST de ePayco y actualiza el pedido en la DB.

### Bug 2: Redirección post-pago rota ("Salir" lleva a página de ePayco)

**Causa raíz**: El widget se abría con `external: 'false'` (iframe/modal), lo que impedía la redirección correcta al hacer clic en "Salir". Además, `url_response` incluía query params (`?pedido_id=X`) que ePayco sobrescribía.

**Solución**: 
- Cambio a `external: 'true'` para abrir ePayco en nueva ventana/pestaña.
- Eliminación de query params propios de `url_response` (ahora es solo `/pago/resultado`).
- El `pedidoId` se pasa en `extra1` y se recupera desde la respuesta de ePayco.

### Bug 3: Interceptor axios redirigía a login desde ResultadoPago

**Causa raíz**: El interceptor 401 en `axios.ts` no reconocía la ruta `/pago/resultado` ni el endpoint `/pagos/epayco/confirmar` como rutas públicas, forzando una redirección a `/login`.

**Solución**: Se añadió `/pagos/epayco/confirmar` a la lista de endpoints públicos y `/pago/` a la exclusión del interceptor.
