import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Usar el proxy de Vite para evitar problemas de SSL local
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

        const isPublicEndpoint = publicEndpoints.some(endpoint =>
            error.config?.url?.includes(endpoint)
        );

        if (error.response && error.response.status === 401) {
            const hadToken = !!localStorage.getItem('token');
            const currentPath = window.location.pathname;

            // No redirigir si es un endpoint público o si estamos en checkout/proceso de pago
            const isCheckoutPage = currentPath.includes('/checkout') || currentPath.includes('/carrito') || currentPath.includes('/pago/');

            if (hadToken && !isPublicEndpoint && !isCheckoutPage) {
                console.warn('Sesión expirada. Redirigiendo al login...');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            } else if (!hadToken && !isPublicEndpoint) {
                // Guardar la URL actual para retornar después del login
                sessionStorage.setItem('returnUrl', window.location.href);
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Solo redirigir al login si no estamos en una página de autenticación
                if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
                    window.location.href = '/login';
                }
            }
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