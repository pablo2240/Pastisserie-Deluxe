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

export interface EpaycoCheckoutData {
  publicKey: string;
  pCustIdCliente: string;
  name: string;
  description: string;
  invoice: string;
  currency: string;
  amount: string;
  taxBase: string;
  tax: string;
  buyerEmail: string;
  buyerFullName: string;
  country: string;
  urlResponse: string;
  urlConfirmation: string;
  extra1: string;
  extra2: string;
  signature: string;
  test: boolean;
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

  // 2. Get ePayco checkout data for a pedido
  getEpaycoCheckoutData: async (pedidoId: number): Promise<{ success: boolean; data: EpaycoCheckoutData; message: string }> => {
    const response = await api.post(`/pagos/epayco/checkout-data/${pedidoId}`);
    return response.data;
  },

  // 3. Verify pedido status
  verificarPedido: async (pedidoId: number) => {
    const response = await api.get(`/pagos/verificar-pedido/${pedidoId}`);
    return response.data;
  },

  // 4. Validate ePayco transaction by ref_payco (authenticated)
  validarTransaccionEpayco: async (refPayco: string) => {
    const response = await api.get(`/pagos/epayco/validar/${refPayco}`);
    return response.data;
  },

  // 4b. Confirm ePayco transaction by ref_payco (anonymous - no JWT required)
  // This is the critical endpoint for post-payment confirmation when user may not have a session
  confirmarTransaccionEpayco: async (refPayco: string) => {
    const response = await api.get(`/pagos/epayco/confirmar/${refPayco}`);
    return response.data;
  },

  // 5. Obtener mis pedidos (Cliente)
  getMyOrders: async () => {
    const response = await api.get('/pedidos/mis-pedidos');
    return response.data.data || response.data;
  },

  // 6. Obtener TODOS los pedidos (Admin)
  getAllOrders: async () => {
    const response = await api.get('/pedidos');
    return response.data.data || response.data;
  },

  // 7. Cambiar estado (Admin)
  updateStatus: async (pedidoId: number, nuevoEstado: string) => {
    const response = await api.put(`/pedidos/${pedidoId}/estado`, {
      estado: nuevoEstado
    });
    return response.data;
  },

  // 8. Eliminar pedido (Admin o Usuario propietario)
  deleteOrder: async (pedidoId: number) => {
    const response = await api.delete(`/pedidos/${pedidoId}`);
    return response.data;
  }
};
