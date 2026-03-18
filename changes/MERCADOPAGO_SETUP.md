# Guía de Configuración - MercadoPago Sandbox

Este documento describe cómo configurar la integración de MercadoPago para pruebas en modo sandbox.

---

## 📋 Requisitos Previos

1. Cuenta de MercadoPago (gratis): https://www.mercadopago.com.co/
2. Proyecto PastisserieDeluxe configurado
3. Acceso al panel de desarrolladores de MercadoPago

---

## 🔧 Paso 1: Obtener Credenciales de Prueba

### 1.1 Acceder al Panel de Desarrolladores

1. Ve a: https://www.mercadopago.com.co/developers/panel
2. Inicia sesión con tu cuenta de prueba
3. Selecciona tu aplicación o crea una nueva

### 1.2 Copiar Credenciales

En la sección "Credenciales de prueba", copia:

- **Access Token** ( começa com `TEST-`)
- **Public Key** ( começa com `TEST-`)

> ⚠️ **Importante**: Las credenciales de prueba son diferentes a las de producción. Asegúrate de usar las de "Prueba".

---

## ⚙️ Paso 2: Configurar Backend (API)

### 2.1 Editar appsettings.json

Abre `PastisserieAPI.API/appsettings.json` y configura:

```json
{
  "MercadoPago": {
    "AccessToken": "TEST-COPIAR-AQUI-TU-ACCESS-TOKEN",
    "PublicKey": "TEST-COPIAR-AQUI-TU-PUBLIC-KEY",
    "AccessTokenSandbox": "TEST-COPIAR-AQUI-TU-ACCESS-TOKEN",
    "PublicKeySandbox": "TEST-COPIAR-AQUI-TU-PUBLIC-KEY",
    "EsPrueba": true,
    "ExpirationMinutes": 30
  },
  "FrontendUrl": "http://localhost:5173"
}
```

### 2.2 Configurar URLs de Desarrollo

Asegúrate de tener estas configuraciones:

```json
{
  "ApiUrl": "http://localhost:5000",
  "FrontendUrl": "http://localhost:5173"
}
```

---

## 🎨 Paso 3: Configurar Frontend

### 3.1 El frontend ya está configurado

El componente `PaymentSimulator.tsx` obtiene automáticamente las credenciales del backend.

### 3.2 Verificar SDK instalado

En `pastisserie-front/package.json`, verifica:

```json
{
  "@mercadopago/sdk-react": "^1.0.7"
}
```

---

## 🔄 Paso 4: Modo de Operación

### Modo Prueba (Sandbox)
```json
"MercadoPago": {
  "EsPrueba": true
}
```
- Usa tarjetas de prueba de MercadoPago
- No genera cargos reales
- Ideal para desarrollo

### Modo Producción
```json
"MercadoPago": {
  "EsPrueba": false,
  "AccessTokenProduccion": "TU-ACCESS-TOKEN-PRODUCCION",
  "PublicKeyProduccion": "TU-PUBLIC-KEY-PRODUCCION",
  "NotificationUrl": "https://tu-dominio.com/api/pagos/webhook"
}
```
- Usa tarjetas reales
- Genera cargos reales
- Requiere cuenta verificada

---

## 🧪 Paso 5: Probar el Flujo de Pago

### 5.1 Tarjetas de Prueba

Usa estas tarjetas para pruebas:

| Tipo | Número | CVV | Vencimiento |
|------|--------|-----|-------------|
| Visa | 4509 9535 0130 6160 | 123 | 11/25 |
| Mastercard | 5031 7557 3453 0604 | 123 | 11/25 |
| American Express | 3711 803032 57522 | 1234 | 11/25 |

**Usuario comprador de prueba:**
- Email: test_user_XXXX@testuser.com
- Contraseña: cualquier password

### 5.2 Iniciar la Aplicación

```bash
# Backend
cd PastisserieAPI.API
dotnet run

# Frontend
cd pastisserie-front
npm run dev
```

### 5.3 Flujo de Prueba

1. Abre http://localhost:5173
2. Agrega productos al carrito
3. Ve al checkout
4. Completa datos de envío
5. Selecciona método de pago con tarjeta
6. Ingresa los datos de la tarjeta de prueba
7. Verifica que el pago sea aprobado

---

## 🌐 Paso 6: Configurar Webhooks (Producción)

### 6.1 Requisitos para Webhooks

Para recibir notificaciones de pago en producción:

1. **Dominio con HTTPS**: MercadoPago requiere URL segura
2. **Webhook Key**: Genera una clave secreta

### 6.2 Configurar en MercadoPago

1. Ve a: https://www.mercadopago.com.co/developers/panel/configuraciones
2. Configura la URL de webhook: `https://tu-dominio.com/api/pagos/webhook`
3. Genera y guarda el Webhook Key

### 6.3 Configurar en appsettings.json

```json
{
  "MercadoPago": {
    "NotificationUrl": "https://tu-dominio.com/api/pagos/webhook",
    "WebhookKey": "TU-WEBHOOK-KEY-SECRETA",
    "EsPrueba": false
  }
}
```

---

## 📊 Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/pagos/configuracion` | Obtiene Public Key |
| POST | `/api/pagos/crear-preferencia` | Crea preferencia de pago |
| POST | `/api/pagos/procesar` | Procesa pago directo |
| POST | `/api/pagos/webhook` | Recibe notificaciones |
| GET | `/api/pagos/verificar/{paymentId}` | Verifica estado |
| POST | `/api/pagos/reembolso/{pedidoId}` | Solicita reembolso |

---

## ⚠️ Solución de Problemas

### Error: "Token de pago inválido"
- Verifica que el Access Token sea correcto
- Asegúrate de estar usando credenciales de prueba

### Error: "La cuenta no está autorizada"
- Tu cuenta de prueba necesita verificación
- Ve a https://www.mercadopago.com.co/developers/panel/configuraciones

### No llegan los webhooks
- En desarrollo local, los webhooks no funcionan
- Usa el endpoint `/api/pagos/verificar/{paymentId}` para verificar manualmente

### Error de CORS
- Verifica que FrontendUrl coincida con el origen de React

---

## 📝 Notas Adicionales

1. **Moneda**: La integración está configurada para COP (Pesos Colombianos)
2. **Cuotas**: Hasta 12 cuotas permitidas
3. **Tickets**: Excluidos por defecto (solo tarjetas)
4. **Expiración**: Las preferencias expiran en 30 minutos por defecto

---

## 🔗 Recursos Útiles

- Documentación Oficial: https://www.mercadopago.com.co/developers/es/reference
- Panel de Desarrolladores: https://www.mercadopago.com.co/developers/panel
- Estado de Pagos: https://www.mercadopago.com.co/developers/es/guides/resources/status-code-changes
