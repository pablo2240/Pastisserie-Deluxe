import api from '../api/axios';

export interface Envio {
    id: number;
    pedidoId: number;
    repartidorId: number | null;
    nombreRepartidor: string | null;
    nombreCliente: string | null;
    numeroGuia: string | null;
    estado: string;
    fechaDespacho: string;
    fechaEntrega: string | null;
    fechaActualizacion: string;
    direccionEnvio: string | null;
    totalPedido: number;
}

export const enviosService = {
    // Obtener todos los envios (Admin)
    getAllEnvios: async () => {
        const response = await api.get('/envios');
        return response.data;
    },

    // Obtener envio por ID (Admin)
    getEnvioById: async (id: number) => {
        const response = await api.get(`/envios/${id}`);
        return response.data;
    },

    // Actualizar estado de envio (Admin)
    updateEstado: async (id: number, estado: string) => {
        const response = await api.put(`/envios/${id}/estado`, { estado });
        return response.data;
    }
};
