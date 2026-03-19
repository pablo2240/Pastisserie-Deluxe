import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { FiCheckCircle, FiClock, FiXCircle, FiAlertCircle, FiArrowRight } from 'react-icons/fi';

const ResultadoPago = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'approved' | 'pending' | 'rejected' | 'error'>('loading');
    const [redirectCountdown, setRedirectCountdown] = useState(5);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_pedidoInfo, setPedidoInfo] = useState<{
        pedidoId?: number;
        estado?: string;
    }>({});

    // Get estado from query param (passed from checkout after simulado payment)
    const estadoParam = searchParams.get('estado');
    const pedidoIdParam = searchParams.get('pedido_id');

    useEffect(() => {
        // For simulated payments, the estado is passed directly from checkout
        if (estadoParam) {
            if (estadoParam === 'aprobado') {
                setStatus('approved');
            } else if (estadoParam === 'pendiente') {
                setStatus('pending');
            } else {
                setStatus('rejected');
            }
        } else if (pedidoIdParam) {
            // Fallback: verify pedido status via API
            const verifyPedido = async () => {
                try {
                    const result = await orderService.verificarPedido(Number(pedidoIdParam));
                    if (result.success && result.data) {
                        const pedido = result.data;
                        setPedidoInfo({
                            pedidoId: pedido.id,
                            estado: pedido.estado,
                        });

                        if (pedido.estado === 'Confirmado' || pedido.estado === 'Aprobado' || pedido.aprobado) {
                            setStatus('approved');
                        } else if (pedido.estado === 'Pendiente') {
                            setStatus('pending');
                        } else {
                            setStatus('rejected');
                        }
                    } else {
                        setStatus('error');
                    }
                } catch (error) {
                    console.error('Error verifying pedido:', error);
                    setStatus('error');
                }
            };
            verifyPedido();
        } else {
            setStatus('error');
        }
    }, [estadoParam, pedidoIdParam]);

    // Auto-redirect to profile after 5 seconds when payment is approved
    useEffect(() => {
        if (status === 'approved') {
            if (redirectCountdown <= 0) {
                navigate('/perfil');
                return;
            }
            const timer = setTimeout(() => {
                setRedirectCountdown(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [status, redirectCountdown, navigate]);

    const statusConfig = {
        loading: {
            icon: <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />,
            bgColor: 'bg-gray-50 border-gray-200',
            iconBg: 'bg-gray-100 text-gray-600',
            title: 'Verificando pago...',
            titleColor: 'text-gray-800',
            message: 'Estamos verificando el estado de tu pago. Por favor espera un momento.',
            messageColor: 'text-gray-600'
        },
        approved: {
            icon: <FiCheckCircle className="w-10 h-10" />,
            bgColor: 'bg-green-50 border-green-200',
            iconBg: 'bg-green-100 text-green-600',
            title: 'Pago Aprobado',
            titleColor: 'text-green-800',
            message: `Tu pago ha sido procesado exitosamente. Tu pedido #${pedidoIdParam} esta siendo preparado. Redirigiendo a tu perfil en ${redirectCountdown}s...`,
            messageColor: 'text-green-700'
        },
        pending: {
            icon: <FiClock className="w-10 h-10" />,
            bgColor: 'bg-yellow-50 border-yellow-200',
            iconBg: 'bg-yellow-100 text-yellow-600',
            title: 'Pago Pendiente',
            titleColor: 'text-yellow-800',
            message: 'Tu pago esta siendo procesado. Te notificaremos cuando se confirme. Puedes verificar el estado en tu perfil.',
            messageColor: 'text-yellow-700'
        },
        rejected: {
            icon: <FiXCircle className="w-10 h-10" />,
            bgColor: 'bg-red-50 border-red-200',
            iconBg: 'bg-red-100 text-red-600',
            title: 'Pago Rechazado',
            titleColor: 'text-red-800',
            message: 'Tu pago no pudo ser procesado. Por favor contactanos para mas informacion.',
            messageColor: 'text-red-700'
        },
        error: {
            icon: <FiAlertCircle className="w-10 h-10" />,
            bgColor: 'bg-gray-50 border-gray-200',
            iconBg: 'bg-gray-100 text-gray-600',
            title: 'Error de Verificacion',
            titleColor: 'text-gray-800',
            message: 'No pudimos verificar tu pago. Por favor revisa tu perfil o contactanos.',
            messageColor: 'text-gray-600'
        }
    };

    const config = statusConfig[status];

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div
                className={`max-w-md w-full bg-white rounded-2xl shadow-sm border p-8 animate-fade-in ${config.bgColor}`}
                style={{ animation: 'fadeIn 0.5s ease-in-out' }}
            >
                {/* Status Icon */}
                <div className="flex justify-center mb-6">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${config.iconBg}`}>
                        {config.icon}
                    </div>
                </div>

                {/* Title */}
                <h2 className={`text-2xl font-bold text-center mb-4 ${config.titleColor}`}>
                    {config.title}
                </h2>

                {/* Message */}
                <p className={`text-center mb-8 ${config.messageColor}`}>
                    {config.message}
                </p>

                {/* Order Info */}
                {pedidoIdParam && (
                    <div className="bg-white/50 rounded-lg p-4 mb-6 text-center">
                        <p className="text-sm text-gray-600">Numero de Pedido</p>
                        <p className="text-xl font-bold text-gray-800">#{pedidoIdParam}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    {status === 'approved' ? (
                        <Link
                            to="/perfil"
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            Ver mis pedidos <FiArrowRight />
                        </Link>
                    ) : status === 'rejected' || status === 'error' ? (
                        <Link
                            to="/checkout"
                            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            Intentar de nuevo
                        </Link>
                    ) : null}

                    <Link
                        to="/"
                        className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors text-center"
                    >
                        Volver al inicio
                    </Link>
                </div>

                {/* Footer Note */}
                {status === 'approved' && (
                    <p className="text-xs text-center text-gray-500 mt-6">
                        Gracias por tu compra en Pâtisserie Deluxe
                    </p>
                )}
            </div>
        </div>
    );
};

export default ResultadoPago;
