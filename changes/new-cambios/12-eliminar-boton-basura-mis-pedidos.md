# 12 - Eliminar botones de eliminación en Mis Pedidos

## ¿Qué se implementó?
Se eliminaron los botones de eliminación (icono de basura) de la sección "Mis Pedidos" en el perfil del usuario. Ya no es posible eliminar pedidos desde la interfaz.

## Archivos modificados
- `pastisserie-front/src/pages/perfil.tsx`

## Cambios realizados
1. **Botón en lista de pedidos**: Eliminado el botón de basura que aparecía junto a cada pedido
2. **Botón en modal de detalles**: Eliminado el botón "Eliminar" que aparecía en el modal de detalles del pedido
3. **Función eliminarPedido**: Eliminada la función completa que realizaba la llamada API para eliminar pedidos
4. **Import FiTrash2**: Eliminado el import no utilizado

## Problema resuelto
Anteriormente, al hacer clic en el icono de basura, el sistema eliminaba completamente el pedido de la base de datos. Ahora los pedidos se mantienen intactos en la base de datos ya que no hay función de eliminación.

## Cómo probarlo
1. Iniciar el servidor de desarrollo: `npm run dev`
2. Iniciar sesión como usuario
3. Navegar al perfil y ver la sección "Mis Pedidos"
4. Verificar que no aparece ningún botón de eliminación

## Impacto en el sistema
- **Frontend**: Se eliminaron los botones de eliminación
- **Backend**: Sin cambios
- **Base de datos**: Sin cambios (los pedidos ya no se eliminan)
