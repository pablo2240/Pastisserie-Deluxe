import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiMapPin, FiPhone, FiTruck, FiChevronRight, FiChevronLeft, FiEdit2, FiPackage, FiDollarSign, FiCreditCard, FiLoader } from 'react-icons/fi';
import { formatCurrency } from '../utils/format';
import { useTiendaStatus } from '../hooks/useTiendaStatus';
import { FiClock } from 'react-icons/fi';
import { orderService } from '../services/orderService';
import { ComunasDisponibles } from '../types';
import type { ComunaKey } from '../types';

// Declare ePayco global from checkout.js
declare global {
    interface Window {
        ePayco?: {
            checkout: {
                configure: (config: { key: string; test: boolean }) => {
                    open: (data: Record<string, unknown>) => void;
                };
            };
        };
    }
}

const Checkout = () => {
    const { carrito, totalItems, clearCart, compraMinima } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState<'shipping' | 'summary' | 'payment' | 'success'>('shipping');
    const [pedidoId, setPedidoId] = useState<number | null>(null);
    const { status } = useTiendaStatus();
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);

    const isClosed = status && !status.estaAbierto;

    // Data State
    const [formData, setFormData] = useState({
        direccion: '',
        comuna: '' as ComunaKey | '',
        telefono: '',
        notas: ''
    });
    const [shake, setShake] = useState(false);

    const total = carrito?.total || 0;

    // Costo de envio dinamico segun la comuna seleccionada
    const costoEnvio = formData.comuna && formData.comuna in ComunasDisponibles
        ? ComunasDisponibles[formData.comuna as ComunaKey].costoEnvio
        : 0;
    const totalConEnvio = total + costoEnvio;

    // Label de la comuna seleccionada
    const comunaLabel = formData.comuna && formData.comuna in ComunasDisponibles
        ? ComunasDisponibles[formData.comuna as ComunaKey].label
        : '';

    const validate = () => {
        if (!formData.direccion || !formData.comuna || !formData.telefono) {
            toast.error("Por favor completa todos los campos de envio");
            return false;
        }
        if (!(formData.comuna in ComunasDisponibles)) {
            toast.error("Por favor selecciona una comuna valida");
            return false;
        }
        return true;
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Step 1: Validate Shipping & Proceed to Summary
    const handleShippingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return;
        }
        setStep('summary');
        window.scrollTo(0, 0);
    };

    // Step 2: Confirm Summary & Create Order, then proceed to Payment
    const handleConfirmOrder = async () => {
        if (isSubmitting) return;
        // Validar compra mínima
        if (typeof compraMinima === 'number' && (total < compraMinima)) {
            toast.error(
                `🚫 No puedes proceder al pago.\n\nLa compra mínima es de ${formatCurrency(compraMinima)}. Te faltan ${formatCurrency(compraMinima - total)}.\n\nPor favor, agrega más productos para completar tu pedido.`,
                {
                    duration: 6000,
                    style: {
                        background: '#FEE2E2',
                        color: '#991B1B',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        padding: '20px',
                        border: '3px solid #DC2626',
                        borderRadius: '12px',
                        maxWidth: '500px'
                    },
                    icon: '🛑'
                }
            );
            return;
        }
        setIsSubmitting(true);
        const loadingToast = toast.loading('Creando tu pedido...');

        try {
            const orderResult = await orderService.createOrder({
                direccion: formData.direccion,
                comuna: formData.comuna,
                telefono: formData.telefono,
                metodoPago: 'ePayco',
                notas: formData.notas
            });

            if (orderResult.success && orderResult.data?.id) {
                setPedidoId(orderResult.data.id);
                toast.success('Pedido creado', { id: loadingToast });
                setStep('payment');
                window.scrollTo(0, 0);
            } else {
                toast.error(orderResult.message || 'Error al crear el pedido', { id: loadingToast });
            }
        } catch (error: unknown) {
            console.error('Error al crear pedido:', error);
            const err = error as { response?: { data?: { message?: string } } };
            const errorMsg = err.response?.data?.message || 'Hubo un error al crear el pedido';
            toast.error(errorMsg, { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Step 3: Open ePayco Standard Checkout
    const handleOpenEpaycoCheckout = useCallback(async () => {
        if (!pedidoId || isLoadingPayment) return;

        // Check ePayco script loaded
        if (!window.ePayco) {
            toast.error('El sistema de pagos no se ha cargado. Recarga la pagina e intenta de nuevo.');
            return;
        }

        setIsLoadingPayment(true);
        const loadingToast = toast.loading('Preparando pago...');

        try {
            // Fetch checkout data from backend
            const result = await orderService.getEpaycoCheckoutData(pedidoId);

            if (!result.success || !result.data) {
                toast.error(result.message || 'Error al preparar el pago', { id: loadingToast });
                return;
            }

            const data = result.data;

            // Configure and open ePayco Standard Checkout
            const handler = window.ePayco!.checkout.configure({
                key: data.publicKey,
                test: data.test
            });

            toast.dismiss(loadingToast);

            handler.open({
                // Required
                name: data.name,
                description: data.description,
                invoice: data.invoice,
                currency: data.currency,
                amount: data.amount,
                tax_base: data.taxBase,
                tax: data.tax,
                country: data.country,
                lang: 'es',

                // Open in external window so "Salir" redirects back to our app
                external: 'true',
                autoclick: 'false',

                // Buyer info
                name_billing: data.buyerFullName,
                email_billing: data.buyerEmail,

                // URLs - ePayco appends ?ref_payco=XXX to url_response automatically
                response: data.urlResponse,
                confirmation: data.urlConfirmation,

                // Extra fields to identify the order
                extra1: data.extra1,
                extra2: data.extra2,

                // Integrity signature and merchant ID for ePayco validation
                p_confirm_method: 'POST',
                p_cust_id_cliente: data.pCustIdCliente,
                integrity: data.signature,
            });

            // Clear cart after opening payment (order already created)
            await clearCart();

        } catch (error: unknown) {
            console.error('Error opening ePayco checkout:', error);
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Error al abrir la pasarela de pago', { id: loadingToast });
        } finally {
            setIsLoadingPayment(false);
        }
    }, [pedidoId, isLoadingPayment, clearCart]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (totalItems === 0 && step !== 'success' && step !== 'payment') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-serif text-gray-800 mb-4">Tu carrito esta vacio</h2>
                <button onClick={() => navigate('/productos')} className="text-patisserie-red font-bold hover:underline">
                    Volver al catalogo
                </button>
            </div>
        );
    }

    const format12h = (time24?: string) => {
        if (!time24) return '--:--';
        try {
            const [hours, minutes] = time24.split(':');
            const h = parseInt(hours, 10);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${h12}:${minutes} ${ampm}`;
        } catch {
            return '--:--';
        }
    };

    if (isClosed && step !== 'success') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-600">
                    <FiClock size={40} />
                </div>
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Tienda Cerrada</h2>
                <p className="text-gray-600 mb-8 max-w-sm">
                    Lo sentimos, actualmente nuestro horno esta descansando.
                    <br />
                    Nuestro horario en Medellin (CO) es:
                    <div className="mt-3 flex gap-2 justify-center">
                        <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-black ring-1 ring-red-100">{format12h(status?.horaApertura)}</span>
                        <span className="text-gray-400 font-bold">a</span>
                        <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-black ring-1 ring-red-100">{format12h(status?.horaCierre)}</span>
                    </div>
                </p>
                <button
                    onClick={() => navigate('/productos')}
                    className="bg-patisserie-dark text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all uppercase tracking-widest text-xs"
                >
                    Volver al Catalogo
                </button>
            </div>
        );
    }

    // --- SUCCESS VIEW ---
    if (step === 'success') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full text-center border-t-8 border-green-500">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <FiCheckCircle size={50} />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-gray-800 mb-4">Compra Exitosa!</h1>
                    <p className="text-gray-600 mb-8 text-lg">
                        Gracias por tu compra. Hemos recibido tu pedido y pronto comenzaremos a prepararlo con los ingredientes mas frescos.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => navigate('/perfil')}
                            className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-all"
                        >
                            Ver Mis Pedidos
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-white text-gray-700 border border-gray-200 font-bold py-3 rounded-xl hover:bg-gray-50 transition-all"
                        >
                            Volver al Inicio
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Helper: determine step index for the step indicator
    const stepIndex = step === 'shipping' ? 0 : step === 'summary' ? 1 : 2;

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 animate-fade-in">
            <div className="container mx-auto max-w-5xl">

                {/* Header Steps */}
                <div className="mb-10">
                    <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6 text-center">Finalizar Compra</h1>
                    <div className="flex items-center justify-center max-w-2xl mx-auto">
                        {/* Step 1 Indicator */}
                        <div className={`flex flex-col items-center z-10 ${stepIndex === 0 ? 'text-patisserie-red' : stepIndex > 0 ? 'text-green-500' : 'text-gray-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-all ${
                                stepIndex === 0 ? 'bg-patisserie-red text-white shadow-lg' :
                                stepIndex > 0 ? 'bg-green-500 text-white' : 'bg-gray-200'
                            }`}>
                                {stepIndex > 0 ? <FiCheckCircle /> : '1'}
                            </div>
                            <span className="font-bold text-sm">Envio</span>
                        </div>

                        {/* Connector line 1-2 */}
                        <div className={`flex-1 h-1 mx-3 rounded-full transition-all duration-500 ${stepIndex >= 1 ? 'bg-green-500' : 'bg-gray-200'}`}></div>

                        {/* Step 2 Indicator */}
                        <div className={`flex flex-col items-center z-10 ${stepIndex === 1 ? 'text-patisserie-red' : stepIndex > 1 ? 'text-green-500' : 'text-gray-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-all ${
                                stepIndex === 1 ? 'bg-patisserie-red text-white shadow-lg' :
                                stepIndex > 1 ? 'bg-green-500 text-white' : 'bg-gray-200'
                            }`}>
                                {stepIndex > 1 ? <FiCheckCircle /> : '2'}
                            </div>
                            <span className="font-bold text-sm">Resumen</span>
                        </div>

                        {/* Connector line 2-3 */}
                        <div className={`flex-1 h-1 mx-3 rounded-full transition-all duration-500 ${stepIndex >= 2 ? 'bg-green-500' : 'bg-gray-200'}`}></div>

                        {/* Step 3 Indicator */}
                        <div className={`flex flex-col items-center z-10 ${stepIndex === 2 ? 'text-patisserie-red' : 'text-gray-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-all ${
                                stepIndex === 2 ? 'bg-patisserie-red text-white shadow-lg' : 'bg-gray-200'
                            }`}>
                                3
                            </div>
                            <span className="font-bold text-sm">Pago</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* MAIN CONTENT AREA */}
                    <div className="lg:col-span-2">

                        {/* STEP 1: SHIPPING FORM */}
                        {step === 'shipping' && (
                            <div className={`bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-slide-in-left ${shake ? 'animate-shake' : ''}`}>
                                <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-4">
                                    <FiTruck className="text-patisserie-red" /> Datos de Envio
                                </h2>

                                <form id="shipping-form" onSubmit={handleShippingSubmit} className="space-y-5" noValidate>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Comuna de Entrega</label>
                                            <select
                                                name="comuna"
                                                className="w-full p-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-patisserie-red/20 focus:border-patisserie-red outline-none transition-all"
                                                value={formData.comuna}
                                                onChange={handleChange}
                                            >
                                                <option value="">Selecciona una comuna</option>
                                                {(Object.keys(ComunasDisponibles) as ComunaKey[]).map((key) => (
                                                    <option key={key} value={key}>
                                                        {ComunasDisponibles[key].label}
                                                    </option>
                                                ))}
                                            </select>
                                            {formData.comuna && formData.comuna in ComunasDisponibles && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Costo de envio: {formatCurrency(ComunasDisponibles[formData.comuna as ComunaKey].costoEnvio)}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Telefono de Contacto</label>
                                            <div className="relative">
                                                <FiPhone className="absolute left-3 top-3.5 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    name="telefono"
                                                    placeholder="Para coordinar la entrega"
                                                    className="w-full pl-10 p-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-patisserie-red/20 focus:border-patisserie-red outline-none transition-all"
                                                    value={formData.telefono}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Direccion de Entrega</label>
                                        <div className="relative">
                                            <FiMapPin className="absolute left-3 top-3.5 text-gray-400" />
                                            <input
                                                type="text"
                                                name="direccion"
                                                placeholder="Calle, Numero, Barrio, Referencias..."
                                                className="w-full pl-10 p-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-patisserie-red/20 focus:border-patisserie-red outline-none transition-all"
                                                value={formData.direccion}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Notas de Entrega (Opcional)</label>
                                        <textarea
                                            name="notas"
                                            placeholder="Instrucciones especiales para el repartidor..."
                                            className="w-full p-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-patisserie-red/20 focus:border-patisserie-red outline-none transition-all resize-none h-24"
                                            value={formData.notas}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            className="bg-gray-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-black transition-all shadow-lg flex items-center gap-2"
                                        >
                                            Revisar Pedido <FiChevronRight />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* STEP 2: ORDER SUMMARY / REVIEW */}
                        {step === 'summary' && (
                            <div className="space-y-6 animate-slide-in-right">

                                {/* Shipping Info Card */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                            <FiTruck className="text-patisserie-red" /> Datos de Envio
                                        </h2>
                                        <button
                                            onClick={() => setStep('shipping')}
                                            className="text-patisserie-red font-bold hover:underline text-sm flex items-center gap-1"
                                        >
                                            <FiEdit2 size={14} /> Editar
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500 font-medium mb-1">Direccion</p>
                                            <p className="text-gray-800 font-bold">{formData.direccion}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 font-medium mb-1">Comuna</p>
                                            <p className="text-gray-800 font-bold">{comunaLabel}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 font-medium mb-1">Telefono</p>
                                            <p className="text-gray-800 font-bold">{formData.telefono}</p>
                                        </div>
                                        {formData.notas && (
                                            <div>
                                                <p className="text-gray-500 font-medium mb-1">Notas</p>
                                                <p className="text-gray-800">{formData.notas}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Products Detail Card */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
                                        <FiPackage className="text-patisserie-red" /> Productos
                                    </h2>
                                    <div className="space-y-4">
                                        {carrito?.items.map((item) => (
                                            <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-gray-800">{item.nombreProducto}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatCurrency(item.precioUnitario)} x {item.cantidad}
                                                    </p>
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">
                                                    {formatCurrency(item.precioUnitario * item.cantidad)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Totals Card */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
                                        <FiDollarSign className="text-patisserie-red" /> Resumen de Costos
                                    </h2>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-gray-600 text-sm">
                                            <span className="font-medium">Subtotal ({carrito?.items.length || 0} productos)</span>
                                            <span className="font-bold">{formatCurrency(total)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600 text-sm">
                                            <span className="font-medium">Domicilio ({comunaLabel})</span>
                                            <span className="font-bold">{formatCurrency(costoEnvio)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-200">
                                            <span className="font-bold text-gray-800 text-lg">Total a Pagar</span>
                                            <span className="text-2xl font-bold text-patisserie-red">{formatCurrency(totalConEnvio)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <button
                                        onClick={() => setStep('shipping')}
                                        className="flex-1 bg-white text-gray-700 border border-gray-200 font-bold py-3 px-6 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <FiChevronLeft /> Editar Datos
                                    </button>
                                    <button
                                        onClick={handleConfirmOrder}
                                        disabled={isSubmitting}
                                        className="flex-1 bg-gray-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Creando pedido...' : 'Confirmar y Pagar'} <FiChevronRight />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: PAYMENT - ePayco */}
                        {step === 'payment' && (
                            <div className="space-y-6 animate-slide-in-right">

                                {/* Summary of Shipping Data */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="font-bold text-gray-700">Enviar a:</p>
                                            <p className="text-gray-600">{formData.direccion}</p>
                                            <p className="text-gray-500">{comunaLabel}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* ePayco Payment Card */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <div className="text-center mb-6">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                            <FiCreditCard className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800">Pagar con ePayco</h3>
                                        <p className="text-sm text-gray-500 mt-1">Pago seguro con tarjeta, PSE, Nequi y mas</p>
                                    </div>

                                    {/* Order Summary */}
                                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                        <div className="flex justify-between items-center text-sm mb-2">
                                            <span className="text-gray-500">Pedido:</span>
                                            <span className="font-medium text-gray-800">#{pedidoId}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm mb-2">
                                            <span className="text-gray-500">Productos:</span>
                                            <span className="font-medium text-gray-800">{carrito?.items.length || 0} item(s)</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                            <span className="font-semibold text-gray-800">Total a pagar:</span>
                                            <span className="text-xl font-bold text-blue-600">
                                                {formatCurrency(totalConEnvio)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Payment Button */}
                                    <div className="space-y-3">
                                        <button
                                            onClick={handleOpenEpaycoCheckout}
                                            disabled={isLoadingPayment || !pedidoId}
                                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center"
                                        >
                                            {isLoadingPayment ? (
                                                <>
                                                    <FiLoader className="w-5 h-5 mr-2 animate-spin" />
                                                    Abriendo pasarela...
                                                </>
                                            ) : (
                                                <>
                                                    <FiCreditCard className="w-5 h-5 mr-2" />
                                                    Pagar con ePayco
                                                </>
                                            )}
                                        </button>

                                        <button
                                            onClick={() => setStep('summary')}
                                            disabled={isLoadingPayment}
                                            className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-semibold rounded-xl transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                    </div>

                                    {/* Security note */}
                                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                                        <FiCheckCircle className="text-green-500" />
                                        <span>Pago procesado de forma segura por ePayco</span>
                                    </div>
                                </div>

                                {!user && (
                                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                                        <p className="text-gray-600">Debes iniciar sesion para continuar con el pago.</p>
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="mt-4 bg-patisserie-red text-white font-bold py-3 px-8 rounded-xl hover:bg-red-600 transition-all"
                                        >
                                            Iniciar Sesion
                                        </button>
                                    </div>
                                )}

                                <div className="text-center">
                                    <button
                                        onClick={() => setStep('summary')}
                                        className="text-gray-400 hover:text-gray-600 text-sm font-medium flex items-center justify-center gap-1 mx-auto"
                                    >
                                        <FiChevronLeft /> Volver al resumen
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ORDER SUMMARY SIDEBAR (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-28">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Resumen del Pedido</h3>

                            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                {carrito?.items.map((item) => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-gray-800 line-clamp-2">{item.nombreProducto}</p>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-xs text-gray-500">Cant: {item.cantidad}</span>
                                                <span className="text-sm font-bold text-gray-900">{formatCurrency(item.precioUnitario * item.cantidad)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 pt-4 space-y-3">
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span className="font-medium">Subtotal</span>
                                    <span className="font-bold">{formatCurrency(total)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Domicilio</span>
                                    <span className="text-gray-700 font-bold">
                                        {costoEnvio > 0 ? formatCurrency(costoEnvio) : 'Selecciona comuna'}
                                    </span>
                                </div>
                                {comunaLabel && (
                                    <div className="text-xs text-gray-500">
                                        {comunaLabel}
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-200">
                                    <span className="font-bold text-gray-800 text-lg">Total a Pagar</span>
                                    <span className="text-2xl font-bold text-patisserie-red">
                                        {costoEnvio > 0 ? formatCurrency(totalConEnvio) : '--'}
                                    </span>
                                </div>

                                {/* Advertencia de compra mínima */}
                                {typeof compraMinima === 'number' && total < compraMinima && (
                                    <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-xl">
                                        <div className="flex items-start gap-3">
                                            <span className="text-red-600 text-2xl">⚠️</span>
                                            <div>
                                                <p className="text-red-900 font-bold text-sm leading-relaxed">
                                                    Compra mínima: <span className="text-red-900 font-black">{formatCurrency(compraMinima)}</span>
                                                </p>
                                                <p className="text-red-700 text-xs font-medium mt-1">
                                                    Faltan {formatCurrency(compraMinima - total)} para proceder
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Security Badge */}
                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <FiCheckCircle className="text-green-500" />
                            <span>Garantia de Satisfaccion 100%</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Checkout;
