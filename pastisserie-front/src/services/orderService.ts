import api from '../api/axios';

// Interfaces (deben coincidir con lo que devuelve tu Backend)
export interface PedidoItem {
  productoId: number;
  nombreProducto?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  usuarioId: number;
  usuarioNombre?: string;
  fechaPedido: string;
  total: number;
  estado: string;
  direccionEnvio?: string;
  items: PedidoItem[];
}

export interface SimularPagoResponse {
  success: boolean;
  data?: {
    pedidoId: number;
    estado: string;
    aprobado: boolean;
    mensaje: string;
  };
  message?: string;
}

export const orderService = {
  // 1. Crear pedido (Checkout)
  createOrder: async (orderData: {
    direccion: string,
    comuna: string,
    telefono: string,
    metodoPago: string,
    notas?: string
  }) => {
    const payload = {
      MetodoPagoId: 0,
      DireccionEnvioId: null,
      MetodoPago: orderData.metodoPago,
      Direccion: orderData.direccion,
      Comuna: orderData.comuna,
      NotasCliente: `Telefono: ${orderData.telefono}${orderData.notas ? ` | Notas: ${orderData.notas}` : ''}`,
      Items: []
    };

    const response = await api.post('/pedidos', payload);
    return response.data;
  },

  // 2. Simular pago (para pruebas/desarrollo)
  simularPago: async (pedidoId: number): Promise<SimularPagoResponse> => {
    const response = await api.post(`/pagos/simular-pago/${pedidoId}`);
    return response.data;
  },

  // 3. Verificar pedido status
  verificarPedido: async (pedidoId: number) => {
    const response = await api.get(`/pagos/verificar-pedido/${pedidoId}`);
    return response.data;
  },

  // 4. Obtener mis pedidos (Cliente)
  getMyOrders: async () => {
    const response = await api.get('/pedidos/mis-pedidos');
    return response.data.data || response.data;
  },

  // 5. Obtener TODOS los pedidos (Admin)
  getAllOrders: async () => {
    const response = await api.get('/pedidos');
    return response.data.data || response.data;
  },

  // 6. Cambiar estado (Admin)
  updateStatus: async (pedidoId: number, nuevoEstado: string) => {
    const response = await api.put(`/pedidos/${pedidoId}/estado`, {
      estado: nuevoEstado
    });
    return response.data;
  },

  // 7. Eliminar pedido (Admin o Usuario propietario)
  deleteOrder: async (pedidoId: number) => {
    const response = await api.delete(`/pedidos/${pedidoId}`);
    return response.data;
  },

  // 8. Registrar intento de pago (entrada a sección de pago)
  registrarIntentoPago: async (pedidoId: number) => {
    const response = await api.post(`/pagos/registrar-intento/${pedidoId}`);
    return response.data;
  },

  // 9. Abandonar pago (usuario sale sin completar)
  abandonarPago: async (pedidoId: number) => {
    const response = await api.post(`/pagos/abandonar/${pedidoId}`);
    return response.data;
  },

  // 10. Obtener historial de cambios de estado
  getHistorial: async (pedidoId: number) => {
    const response = await api.get(`/pedidos/${pedidoId}/historial`);
    return response.data.data || response.data;
  }
};
