import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';

const ResultadoPago = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'approved' | 'pending' | 'rejected' | 'error'>('loading');
    const [retryCount, setRetryCount] = useState(0);
    const [redirectCountdown, setRedirectCountdown] = useState(5);
    const [transactionInfo, setTransactionInfo] = useState<{
        refPayco?: string;
        pedidoId?: string;
        estado?: string;
        amount?: string;
        paymentMethod?: string;
    }>({});

    // ePayco sends ref_payco as a query param when redirecting to url_response.
    // It may also include extra1 (pedidoId), extra2 (userId), etc.
    const refPayco = searchParams.get('ref_payco');
    const pedidoIdParam = searchParams.get('pedido_id') || searchParams.get('extra1');

    const checkPaymentStatus = useCallback(async () => {
        try {
            // Primary strategy: Use ref_payco to validate directly with ePayco API via our anonymous backend endpoint.
            // This is the most reliable path because:
            // 1. It doesn't require JWT (user may have lost session during ePayco redirect)
            // 2. It queries ePayco's API for the real transaction status
            // 3. It updates the order in our DB as a side effect (compensating for missed webhook)
            if (refPayco) {
                try {
                    const result = await orderService.confirmarTransaccionEpayco(refPayco);
                    if (result.success && result.data) {
                        const data = result.data;
                        setTransactionInfo({
                            refPayco: data.refPayco,
                            pedidoId: data.invoice || pedidoIdParam || undefined,
                            estado: data.status,
                            amount: data.amount ? `$${Number(data.amount).toLocaleString('es-CO')}` : undefined,
                            paymentMethod: data.paymentMethod || undefined,
                        });

                        // Map cod_response to UI status
                        if (data.codResponse === 1) {
                            setStatus('approved');
                            return;
                        } else if (data.codResponse === 3 || data.codResponse === 7 || data.codResponse === 8) {
                            // 3=Pending, 7=Retained, 8=Started - these are all "pending" states
                            setStatus('pending');
                            return;
                        } else {
                            // 2=Rejected, 4=Failed, 6=Reversed, 9=Expired, 10=Abandoned, 11=Cancelled, 12=Antifraud
                            setStatus('rejected');
                            return;
                        }
                    }
                } catch (confirmErr) {
                    console.warn('Anonymous confirmation failed, trying authenticated endpoint...', confirmErr);
                }

                // Fallback: try authenticated validation endpoint (if user still has JWT)
                try {
                    const result = await orderService.validarTransaccionEpayco(refPayco);
                    if (result.success && result.data) {
                        const data = result.data;
                        setTransactionInfo({
                            refPayco: data.refPayco,
                            pedidoId: data.invoice || pedidoIdParam || undefined,
                            estado: data.status,
                            amount: data.amount ? `$${Number(data.amount).toLocaleString('es-CO')}` : undefined,
                            paymentMethod: data.paymentMethod || undefined,
                        });

                        if (data.codResponse === 1) {
                            setStatus('approved');
                        } else if (data.codResponse === 3 || data.codResponse === 7 || data.codResponse === 8) {
                            setStatus('pending');
                        } else {
                            setStatus('rejected');
                        }
                        return;
                    }
                } catch (authErr) {
                    console.warn('Authenticated validation also failed:', authErr);
                }
            }

            // Secondary strategy: If we have pedidoId, check pedido status via authenticated endpoint
            if (pedidoIdParam) {
                try {
                    const pedidoResult = await orderService.verificarPedido(Number(pedidoIdParam));
                    if (pedidoResult.success && pedidoResult.data) {
                        const pedido = pedidoResult.data;

                        // If pedido has ref_payco but isn't confirmed, try to validate and sync
                        if (pedido.epaycoRefPayco && pedido.estado !== 'Confirmado' && pedido.estado !== 'PagoFallido') {
                            try {
                                const validateResult = await orderService.confirmarTransaccionEpayco(pedido.epaycoRefPayco);
                                if (validateResult.success && validateResult.data) {
                                    const data = validateResult.data;
                                    setTransactionInfo({
                                        refPayco: data.refPayco,
                                        pedidoId: pedidoIdParam,
                                        estado: data.status,
                                        amount: data.amount ? `$${Number(data.amount).toLocaleString('es-CO')}` : undefined,
                                        paymentMethod: data.paymentMethod || undefined,
                                    });
                                    if (data.codResponse === 1) {
                                        setStatus('approved');
                                    } else if (data.codResponse === 3 || data.codResponse === 7 || data.codResponse === 8) {
                                        setStatus('pending');
                                    } else {
                                        setStatus('rejected');
                                    }
                                    return;
                                }
                            } catch (syncErr) {
                                console.warn('Sync via ref_payco from pedido failed:', syncErr);
                            }
                        }

                        // Use the pedido state directly
                        setTransactionInfo({
                            pedidoId: pedidoIdParam,
                            refPayco: pedido.epaycoRefPayco || undefined,
                            estado: pedido.estado
                        });

                        if (pedido.aprobado || pedido.estado === 'Confirmado') {
                            setStatus('approved');
                        } else if (pedido.estado === 'PagoFallido') {
                            setStatus('rejected');
                        } else {
                            setStatus('pending');
                        }
                        return;
                    }
                } catch (pedidoErr) {
                    console.warn('Pedido verification failed:', pedidoErr);
                }
            }

            // No ref_payco and no pedidoId - unknown state
            setStatus('pending');
        } catch (err) {
            console.error('Error checking payment status:', err);
            setStatus('error');
        }
    }, [refPayco, pedidoIdParam]);

    useEffect(() => {
        checkPaymentStatus();
    }, [checkPaymentStatus]);

    // Auto-retry for pending payments (ePayco may take a few seconds to process)
    useEffect(() => {
        if (status === 'pending' && retryCount < 3) {
            const timer = setTimeout(() => {
                setRetryCount(prev => prev + 1);
                checkPaymentStatus();
            }, 5000); // Retry every 5 seconds, up to 3 times
            return () => clearTimeout(timer);
        }
    }, [status, retryCount, checkPaymentStatus]);

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

    const handleManualRetry = () => {
        setStatus('loading');
        setRetryCount(0);
        checkPaymentStatus();
    };

    const statusConfig = {
        loading: {
            icon: '...',
            bgColor: 'bg-gray-50 border-gray-200',
            iconBg: 'bg-gray-100 text-gray-600',
            title: 'Verificando pago...',
            titleColor: 'text-gray-800',
            message: 'Estamos verificando el estado de tu pago con ePayco. Por favor espera un momento.',
            messageColor: 'text-gray-600'
        },
        approved: {
            icon: '\u2713',
            bgColor: 'bg-green-50 border-green-200',
            iconBg: 'bg-green-100 text-green-600',
            title: 'Pago Aprobado',
            titleColor: 'text-green-800',
            message: `Tu pago ha sido procesado exitosamente. Tu pedido esta siendo preparado. Redirigiendo a tu perfil en ${redirectCountdown}s...`,
            messageColor: 'text-green-700'
        },
        pending: {
            icon: '\u23F3',
            bgColor: 'bg-yellow-50 border-yellow-200',
            iconBg: 'bg-yellow-100 text-yellow-600',
            title: 'Pago Pendiente',
            titleColor: 'text-yellow-800',
            message: 'Tu pago esta siendo procesado. Te notificaremos cuando se confirme. Puedes verificar el estado en tu perfil.',
            messageColor: 'text-yellow-700'
        },
        rejected: {
            icon: '\u2717',
            bgColor: 'bg-red-50 border-red-200',
            iconBg: 'bg-red-100 text-red-600',
            title: 'Pago Rechazado',
            titleColor: 'text-red-800',
            message: 'Tu pago no pudo ser procesado. Puedes intentarlo de nuevo o contactarnos.',
            messageColor: 'text-red-700'
        },
        error: {
            icon: '!',
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
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${config.iconBg}`}>
                        {status === 'loading' ? (
                            <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                        ) : (
                            config.icon
                        )}
                    </div>
                </div>

                {/* Title */}
                <h2 className={`text-2xl font-bold text-center mb-2 ${config.titleColor}`}>
                    {config.title}
                </h2>

                {/* Message */}
                <p className={`text-center mb-6 ${config.messageColor}`}>
                    {config.message}
                </p>

                {/* Transaction Info */}
                {(transactionInfo.pedidoId || transactionInfo.refPayco) && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                        {transactionInfo.pedidoId && (
                            <p className="text-sm text-gray-600 text-center">
                                <span className="font-medium">Numero de pedido:</span> #{transactionInfo.pedidoId}
                            </p>
                        )}
                        {transactionInfo.refPayco && (
                            <p className="text-sm text-gray-600 text-center">
                                <span className="font-medium">Ref. ePayco:</span> {transactionInfo.refPayco}
                            </p>
                        )}
                        {transactionInfo.amount && (
                            <p className="text-sm text-gray-600 text-center">
                                <span className="font-medium">Monto:</span> {transactionInfo.amount}
                            </p>
                        )}
                        {transactionInfo.paymentMethod && (
                            <p className="text-sm text-gray-600 text-center">
                                <span className="font-medium">Metodo:</span> {transactionInfo.paymentMethod}
                            </p>
                        )}
                        {transactionInfo.estado && (
                            <p className="text-sm text-gray-600 text-center">
                                <span className="font-medium">Estado:</span> {transactionInfo.estado}
                            </p>
                        )}
                    </div>
                )}

                {/* Retry button for pending/error states */}
                {(status === 'pending' || status === 'error') && (
                    <div className="mb-4">
                        <button
                            onClick={handleManualRetry}
                            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200 text-sm"
                        >
                            Verificar estado nuevamente
                        </button>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Link
                        to="/perfil"
                        className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors duration-200 text-center ${
                            status === 'approved'
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : status === 'rejected'
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-gray-700 hover:bg-gray-800 text-white'
                        }`}
                    >
                        Ver Mis Pedidos
                    </Link>
                    <Link
                        to="/"
                        className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors duration-200 text-center bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                        Volver al Inicio
                    </Link>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
            `}</style>
        </div>
    );
};

export default ResultadoPago;
