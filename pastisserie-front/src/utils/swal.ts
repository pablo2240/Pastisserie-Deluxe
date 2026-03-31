import Swal from 'sweetalert2';

// Colores del tema Patisserie
const COLORS = {
    primary: '#5D1919',
    primaryLight: '#7D2121',
    red: '#F85555',
    cream: '#FFFCF5',
    dark: '#1F2937',
    gray: '#6B7280',
    lightGray: '#F3F4F6',
    white: '#FFFFFF'
};

// Tipografías del tema
const FONTS = {
    fontFamily: '"Montserrat", sans-serif',
    titleFont: '"Playfair Display", serif',
    confirmButtonFont: '"Montserrat", sans-serif'
};

// Inicializar estilos CSS
const initStyles = () => {
    // Verificar si ya se inicializó
    if (document.getElementById('sweetalert2-pastisserie-styles')) return;

    const style = document.createElement('style');
    style.id = 'sweetalert2-pastisserie-styles';
    style.textContent = `
        .sweetalert2-popup {
            border-radius: 2rem !important;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
            border: 1px solid rgba(93, 25, 25, 0.1) !important;
            font-family: ${FONTS.fontFamily} !important;
            padding: 1.5rem !important;
        }
        .sweetalert2-title {
            font-family: ${FONTS.titleFont} !important;
            font-size: 1.5rem !important;
            font-weight: 700 !important;
            color: ${COLORS.dark} !important;
            margin-bottom: 0.5rem !important;
            padding: 0 !important;
        }
        .sweetalert2-html {
            font-family: ${FONTS.fontFamily} !important;
            font-size: 0.95rem !important;
            color: ${COLORS.gray} !important;
            line-height: 1.6 !important;
        }
        .sweetalert2-confirm {
            background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%) !important;
            color: white !important;
            border: none !important;
            box-shadow: 0 10px 15px -3px rgba(93, 25, 25, 0.3), 0 4px 6px -2px rgba(93, 25, 25, 0.15) !important;
        }
        .sweetalert2-confirm:hover {
            background: linear-gradient(135deg, ${COLORS.primaryLight} 0%, #9D2929 100%) !important;
            transform: translateY(-1px) !important;
        }
        .sweetalert2-cancel {
            background: ${COLORS.lightGray} !important;
            color: ${COLORS.dark} !important;
            border: 1px solid #E5E7EB !important;
        }
        .sweetalert2-cancel:hover {
            background: #E5E7EB !important;
        }
        .sweetalert2-input {
            border-radius: 1rem !important;
            border: 1px solid ${COLORS.lightGray} !important;
            padding: 0.75rem 1rem !important;
            font-family: ${FONTS.fontFamily} !important;
        }
        .sweetalert2-input:focus {
            outline: none !important;
            border-color: ${COLORS.primary} !important;
            box-shadow: 0 0 0 3px rgba(93, 25, 25, 0.1) !important;
        }
        @keyframes sweetalert2-show {
            0% { opacity: 0; transform: scale(0.9); }
            100% { opacity: 1; transform: scale(1); }
        }
        @keyframes sweetalert2-hide {
            0% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0.95); }
        }
        .swal2-show { animation: sweetalert2-show 0.3s ease-out !important; }
        .swal2-hide { animation: sweetalert2-hide 0.2s ease-in forwards !important; }
    `;
    document.head.appendChild(style);
};

/**
 * Inicializa SweetAlert2 con el tema de Patisserie
 * Llamar en el entry point de la app
 */
export const initSweetAlert = () => {
    initStyles();
};

/**
 * Funciones helper para SweetAlert2 con tema Patisserie
 */
export const swal = {
    success: (title: string, message?: string) => {
        initStyles();
        return Swal.fire({
            icon: 'success',
            title,
            html: message,
            confirmButtonColor: COLORS.primary,
            customClass: {
                popup: 'sweetalert2-popup',
                title: 'sweetalert2-title',
                htmlContainer: 'sweetalert2-html',
                confirmButton: 'sweetalert2-confirm'
            }
        });
    },

    error: (title: string, message?: string) => {
        initStyles();
        return Swal.fire({
            icon: 'error',
            title,
            html: message,
            confirmButtonColor: COLORS.primary,
            customClass: {
                popup: 'sweetalert2-popup',
                title: 'sweetalert2-title',
                htmlContainer: 'sweetalert2-html',
                confirmButton: 'sweetalert2-confirm'
            }
        });
    },

    warning: (title: string, message?: string) => {
        initStyles();
        return Swal.fire({
            icon: 'warning',
            title,
            html: message,
            confirmButtonColor: COLORS.primary,
            customClass: {
                popup: 'sweetalert2-popup',
                title: 'sweetalert2-title',
                htmlContainer: 'sweetalert2-html',
                confirmButton: 'sweetalert2-confirm'
            }
        });
    },

    info: (title: string, message?: string) => {
        initStyles();
        return Swal.fire({
            icon: 'info',
            title,
            html: message,
            confirmButtonColor: COLORS.primary,
            customClass: {
                popup: 'sweetalert2-popup',
                title: 'sweetalert2-title',
                htmlContainer: 'sweetalert2-html',
                confirmButton: 'sweetalert2-confirm'
            }
        });
    },

    question: (title: string, message?: string) => {
        initStyles();
        return Swal.fire({
            icon: 'question',
            title,
            html: message,
            confirmButtonColor: COLORS.primary,
            customClass: {
                popup: 'sweetalert2-popup',
                title: 'sweetalert2-title',
                htmlContainer: 'sweetalert2-html',
                confirmButton: 'sweetalert2-confirm'
            }
        });
    },

    confirm: async (
        title: string,
        message?: string,
        confirmText: string = 'Confirmar',
        cancelText: string = 'Cancelar'
    ): Promise<boolean> => {
        initStyles();
        const result = await Swal.fire({
            icon: 'question',
            title,
            html: message,
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
            confirmButtonColor: COLORS.primary,
            cancelButtonColor: COLORS.gray,
            customClass: {
                popup: 'sweetalert2-popup',
                title: 'sweetalert2-title',
                htmlContainer: 'sweetalert2-html',
                confirmButton: 'sweetalert2-confirm',
                cancelButton: 'sweetalert2-cancel'
            }
        });
        return result.isConfirmed;
    },

    deleteConfirm: async (itemName: string): Promise<boolean> => {
        initStyles();
        const result = await Swal.fire({
            icon: 'warning',
            title: '¿Estás seguro?',
            html: `Se eliminará <strong>${itemName}</strong> de forma permanente. Esta acción no se puede deshacer.`,
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: COLORS.red,
            cancelButtonColor: COLORS.gray,
            customClass: {
                popup: 'sweetalert2-popup',
                title: 'sweetalert2-title',
                htmlContainer: 'sweetalert2-html',
                confirmButton: 'sweetalert2-confirm',
                cancelButton: 'sweetalert2-cancel'
            }
        });
        return result.isConfirmed;
    },

    input: async (title: string, message?: string, inputPlaceholder?: string): Promise<string | null> => {
        initStyles();
        const result = await Swal.fire({
            title,
            html: message,
            input: 'text',
            inputPlaceholder: inputPlaceholder || 'Ingrese el valor',
            showCancelButton: true,
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: COLORS.primary,
            cancelButtonColor: COLORS.gray,
            customClass: {
                popup: 'sweetalert2-popup',
                title: 'sweetalert2-title',
                htmlContainer: 'sweetalert2-html',
                confirmButton: 'sweetalert2-confirm',
                cancelButton: 'sweetalert2-cancel',
                input: 'sweetalert2-input'
            },
            inputValidator: (value) => {
                if (!value?.trim()) return 'Por favor ingresa un valor';
                return null;
            }
        });
        return result.value || null;
    },

    successWithAction: async (
        title: string,
        message: string,
        buttonText: string,
        onClick?: () => void
    ): Promise<void> => {
        initStyles();
        await Swal.fire({
            icon: 'success',
            title,
            html: message,
            showConfirmButton: true,
            confirmButtonText: buttonText,
            confirmButtonColor: COLORS.primary,
            customClass: {
                popup: 'sweetalert2-popup',
                title: 'sweetalert2-title',
                htmlContainer: 'sweetalert2-html',
                confirmButton: 'sweetalert2-confirm'
            }
        });
        if (onClick) onClick();
    }
};

export default swal;