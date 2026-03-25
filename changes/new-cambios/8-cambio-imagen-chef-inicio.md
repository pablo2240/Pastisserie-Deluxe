# 8 - Cambio de imagen "Chef decorando" en página de inicio

## ¿Qué se implementó?
Se actualizó la URL de la imagen "Chef decorando" en la página de inicio (home.tsx) cambiando de un video de YouTube a una imagen de Webflow.

## Archivos modificados
- `pastisserie-front/src/pages/home.tsx` (línea 116)

## Problema resuelto
La imagen anterior era un frame de video de YouTube que podía no cargar correctamente. Se reemplazó por una imagen estática de Webflow más confiable.

## Cambio realizado
| Campo | Valor anterior | Valor nuevo |
|-------|----------------|-------------|
| src | `https://i.ytimg.com/vi/EJcNzxikaVI/maxresdefault.jpg` | `https://uploads-ssl.webflow.com/636cd7c004bf297e18d5cfc9/637272b68332ff110a4542a2_In%C3%ADcio%2002%20(Resized).jpg` |

## Cómo probarlo
1. Iniciar el servidor de desarrollo: `npm run dev`
2. Navegar a la página de inicio
3. Verificar que la imagen "Chef decorando" se muestra correctamente

## Impacto en el sistema
- **Frontend**: Cambio visual en la página de inicio
- **Backend**: Sin impacto
- **Base de datos**: Sin impacto