import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api', // Variable de entorno para producción, proxy local para desarrollo
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // Timeout de 30 segundos para operaciones de pago
});

// Interceptor de solicitud para agregar token JWT
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor de respuesta para manejar errores globales
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // URLs públicas que no deben redirigir al login
        const publicEndpoints = [
            '/configuracion',
            '/categorias',
            '/productos',
            '/promociones',
            '/tienda/status',
            '/auth/login',
            '/auth/register',
            '/pagos/epayco/confirmar'
        ];

        // Verificar si es un endpoint público
        publicEndpoints.some(endpoint =>
            error.config?.url?.includes(endpoint)
        );

        if (error.response && error.response.status === 401) {
            const hadToken = !!localStorage.getItem('token');

            // Limpiar localStorage solo si el usuario tenía un token
            if (hadToken) {
                console.warn('Sesión expirada. Limpiando credenciales...');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }

            // Emitir evento custom para que las páginas puedan manejar el 401
            window.dispatchEvent(new CustomEvent('auth:unauthorized', {
                detail: { hadToken }
            }));
        }

        // Manejar errores 403 (Forbidden)
        if (error.response && error.response.status === 403) {
            console.error('Acceso prohibido:', error.response.data);
        }

        // Manejar errores de red
        if (!error.response) {
            console.error('Error de red. Verifica tu conexión a internet.');
        }

        return Promise.reject(error);
    }
);

export default api;

/**
 * Obtiene la URL base del API (sin /api al final).
 * Útil para resolver URLs de imágenes y recursos estáticos.
 */
export const getApiBaseUrl = (): string => {
  const baseURL = import.meta.env.VITE_API_URL || '';
  // Remover /api del final si existe
  return baseURL.endsWith('/api') ? baseURL.slice(0, -4) : baseURL;
};

/**
 * Resuelve una URL de imagen.
 * - Si ya es absoluta (http/https), la devuelve tal cual.
 * - Si es relativa (/images/...), le antepone la base del API.
 */
export const resolveImageUrl = (url: string | null | undefined): string => {
  if (!url) return 'https://via.placeholder.com/300x200?text=Sin+Imagen';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${getApiBaseUrl()}${url}`;
};