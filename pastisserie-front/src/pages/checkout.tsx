import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiMapPin, FiPhone, FiTruck, FiChevronRight, FiChevronLeft, FiEdit2, FiPackage, FiDollarSign, FiCreditCard, FiLock, FiLoader, FiArrowLeft } from 'react-icons/fi';
import { formatCurrency } from '../utils/format';
import { useTiendaStatus } from '../hooks/useTiendaStatus';
import { FiClock } from 'react-icons/fi';
import { orderService } from '../services/orderService';
import { ComunasDisponibles } from '../types';
import type { ComunaKey } from '../types';
import AuthRequiredMessage from '../components/common/AuthRequiredMessage';

const Checkout = () => {
    const { carrito, totalItems, compraMinima, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState<'shipping' | 'summary' | 'payment' | 'success'>('shipping');
    const [pedidoId, setPedidoId] = useState<number | null>(null);
    const { status } = useTiendaStatus();

    const isClosed = status && !status.estaAbierto;

    const [formData, setFormData] = useState({
        direccion: '',
        comuna: '' as ComunaKey | '',
        telefono: '',
        notas: ''
    });
    const [shake, setShake] = useState(false);
    const [autocompletadoPerfil, setAutocompletadoPerfil] = useState(false);

    // Autocompletar datos desde el perfil del usuario
    useEffect(() => {
        if (user && step === 'shipping') {
            const perfilDireccion = (user as any)?.direccion;
            const perfilTelefono = user?.telefono;
            
            if (!formData.direccion && perfilDireccion) {
                setFormData(prev => ({ ...prev, direccion: perfilDireccion }));
                setAutocompletadoPerfil(true);
            }
            if (!formData.telefono && perfilTelefono) {
                setFormData(prev => ({ ...prev, telefono: perfilTelefono }));
                setAutocompletadoPerfil(true);
            }
        }
    }, [user, step]);

    const total = carrito?.total || 0;

    const costoEnvio = formData.comuna && formData.comuna in ComunasDisponibles
        ? ComunasDisponibles[formData.comuna as ComunaKey].costoEnvio
        : 0;
    const totalConEnvio = total + costoEnvio;

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

    const handleShippingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return;
        }
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
        setStep('summary');
        window.scrollTo(0, 0);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const [cardData, setCardData] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
    });

    const [cardErrors, setCardErrors] = useState<{ [key: string]: string }>({});
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    // Eliminamos el registro de intento de pago porque ahora el pedido
    // se crea SOLO cuando el pago es exitoso
    // useEffect(() => {
    //     if (step === 'payment' && pedidoId) {
    //         orderService.registrarIntentoPago(pedidoId).catch(console.error);
    //     }
    // 
    //     return () => {
    //         if (step === 'payment' && pedidoId && !isProcessingPayment) {
    //             orderService.abandonarPago(pedidoId).catch(console.error);
    //         }
    //     };
    // }, [step, pedidoId, isProcessingPayment]);

    const formatCardNumber = (value: string): string => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{1,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        return parts.length ? parts.join(' ') : v;
    };

    const formatExpiryDate = (value: string): string => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'cardNumber') {
            formattedValue = formatCardNumber(value);
        } else if (name === 'expiryDate') {
            formattedValue = formatExpiryDate(value);
        } else if (name === 'cvv') {
            formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4);
        } else if (name === 'cardName') {
            formattedValue = value.replace(/[^a-zA-Z\s]/g, '').toUpperCase();
        }

        setCardData({ ...cardData, [name]: formattedValue });

        if (cardErrors[name]) {
            setCardErrors({ ...cardErrors, [name]: '' });
        }
    };

    const validateExpiryDate = (expiry: string): boolean => {
        if (!expiry || expiry.length < 5) return false;

        const [month, year] = expiry.split('/');
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt('20' + year, 10);

        if (monthNum < 1 || monthNum > 12) return false;

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        if (yearNum < currentYear) return false;
        if (yearNum === currentYear && monthNum < currentMonth) return false;

        return true;
    };

    const validateCard = (): boolean => {
        const errors: { [key: string]: string } = {};
        const cardNumber = cardData.cardNumber.replace(/\s/g, '');

        if (!cardNumber || cardNumber.length !== 16) {
            errors.cardNumber = 'El número de tarjeta debe tener exactamente 16 dígitos';
        }

        if (!cardData.cardName || cardData.cardName.length < 3) {
            errors.cardName = 'Ingresa el nombre del titular (mínimo 3 caracteres)';
        }

        if (!cardData.expiryDate || cardData.expiryDate.length < 5) {
            errors.expiryDate = 'Ingresa la fecha de expiración (MM/AA)';
        } else if (!validateExpiryDate(cardData.expiryDate)) {
            errors.expiryDate = 'La fecha de expiración no es válida o la tarjeta está vencida';
        }

        if (!cardData.cvv || cardData.cvv.length !== 3) {
            errors.cvv = 'El CVV debe tener exactamente 3 dígitos';
        }

        setCardErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleProcesarPago = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isProcessingPayment) return;

        if (!validateCard()) {
            return;
        }

        setIsProcessingPayment(true);
        setPaymentError(null);

        try {
            // Crear pedido Y procesar pago en una sola operación
            const result = await orderService.crearYPagar({
                direccion: formData.direccion,
                comuna: formData.comuna,
                telefono: formData.telefono,
                metodoPago: 'Tarjeta Crédito',
                notas: formData.notas
            });

            if (result.success && result.data?.aprobado) {
                setPedidoId(result.data.pedidoId);
                await clearCart();
                setStep('success');
                toast.success('Pago aprobado correctamente');
            } else {
                const errorMsg = result.message || result.data?.mensaje || 'Error al procesar el pago';
                setPaymentError(errorMsg);
                toast.error(errorMsg);
            }
        } catch (err: unknown) {
            console.error('Error al procesar pago:', err);
            const error = err as { response?: { data?: { message?: string } } };
            const errorMsg = error.response?.data?.message || 'Hubo un error al procesar el pago';
            setPaymentError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const handleVolverAlResumen = () => {
        // Ya no hay pedido que abandonar porque solo se crea cuando el pago es exitoso
        setStep('summary');
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 animate-fade-in">
                <div className="container mx-auto max-w-5xl">
                    <AuthRequiredMessage
                        title="¡Inicia sesión para completar tu compra"
                        message="Para finalizar tu pedido, necesitas tener una cuenta y estar autenticado."
                    />
                </div>
            </div>
        );
    }

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

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full text-center border-t-8 border-green-500">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <FiCheckCircle size={50} />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-gray-800 mb-4">Compra Exitosa!</h1>
                    <p className="text-gray-600 mb-2 text-lg">
                        Gracias por tu compra. Hemos recibido tu pedido y pronto comenzaremos a prepararlo.
                    </p>
                    <p className="text-gray-500 mb-6 text-sm">
                        Numero de pedido: <span className="font-bold text-gray-800">#{pedidoId}</span>
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                        <p className="text-green-800 font-medium">
                            Recibiras una confirmacion por correo electronico con los detalles de tu pedido.
                        </p>
                    </div>
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

    const stepIndex = step === 'shipping' ? 0 : step === 'summary' ? 1 : 2;

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 animate-fade-in">
            <div className="container mx-auto max-w-5xl">
                <div className="mb-10">
                    <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6 text-center">Finalizar Compra</h1>
                    <div className="flex items-center justify-center max-w-2xl mx-auto">
                        <div className={`flex flex-col items-center z-10 ${stepIndex === 0 ? 'text-patisserie-red' : stepIndex > 0 ? 'text-green-500' : 'text-gray-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-all ${stepIndex === 0 ? 'bg-patisserie-red text-white shadow-lg' :
                                stepIndex > 0 ? 'bg-green-500 text-white' : 'bg-gray-200'
                                }`}>
                                {stepIndex > 0 ? <FiCheckCircle /> : '1'}
                            </div>
                            <span className="font-bold text-sm">Envio</span>
                        </div>

                        <div className={`flex-1 h-1 mx-3 rounded-full transition-all duration-500 ${stepIndex >= 1 ? 'bg-green-500' : 'bg-gray-200'}`}></div>

                        <div className={`flex flex-col items-center z-10 ${stepIndex === 1 ? 'text-patisserie-red' : stepIndex > 1 ? 'text-green-500' : 'text-gray-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-all ${stepIndex === 1 ? 'bg-patisserie-red text-white shadow-lg' :
                                stepIndex > 1 ? 'bg-green-500 text-white' : 'bg-gray-200'
                                }`}>
                                {stepIndex > 1 ? <FiCheckCircle /> : '2'}
                            </div>
                            <span className="font-bold text-sm">Resumen</span>
                        </div>

                        <div className={`flex-1 h-1 mx-3 rounded-full transition-all duration-500 ${stepIndex >= 2 ? 'bg-green-500' : 'bg-gray-200'}`}></div>

                        <div className={`flex flex-col items-center z-10 ${stepIndex === 2 ? 'text-patisserie-red' : 'text-gray-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-all ${stepIndex === 2 ? 'bg-patisserie-red text-white shadow-lg' : 'bg-gray-200'
                                }`}>
                                3
                            </div>
                            <span className="font-bold text-sm">Pago</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {step === 'shipping' && (
                            <div className={`bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-slide-in-left ${shake ? 'animate-shake' : ''}`}>
                                <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-4">
                                    <FiTruck className="text-patisserie-red" /> Datos de Envio
                                </h2>

                                {autocompletadoPerfil && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                                        <p className="text-xs text-blue-700 font-medium">
                                            <FiEdit2 className="inline mr-1" />
                                            Algunos datos han sido autocompletados desde tu perfil. Puedes modificarlos antes de confirmar tu pedido.
                                        </p>
                                    </div>
                                )}

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

                        {step === 'summary' && (
                            <div className="space-y-6 animate-slide-in-right">
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

                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <button
                                        onClick={() => setStep('shipping')}
                                        className="flex-1 bg-white text-gray-700 border border-gray-200 font-bold py-3 px-6 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <FiChevronLeft /> Editar Datos
                                    </button>
                                    <button
                                        onClick={() => setStep('payment')}
                                        className="flex-1 bg-gray-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2"
                                    >
                                        Ir a Pagar <FiChevronRight />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 'payment' && (
                            <div className="space-y-6 animate-slide-in-right">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="font-bold text-gray-700">Enviar a:</p>
                                            <p className="text-gray-600">{formData.direccion}</p>
                                            <p className="text-gray-500">{comunaLabel}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <div className="text-center mb-6">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                            <FiCreditCard className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800">Pagar con Tarjeta de Credito</h3>
                                        <p className="text-sm text-gray-500 mt-1">Ingresa los datos de tu tarjeta de credito</p>
                                    </div>

                                    {paymentError && (
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                                            <p className="text-red-600 text-sm font-medium">{paymentError}</p>
                                        </div>
                                    )}

                                    <form onSubmit={handleProcesarPago} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                Numero de Tarjeta
                                            </label>
                                            <div className="relative">
                                                <FiCreditCard className="absolute left-3 top-3.5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    name="cardNumber"
                                                    placeholder="1234 5678 9012 3456"
                                                    maxLength={19}
                                                    value={cardData.cardNumber}
                                                    onChange={handleCardChange}
                                                    disabled={isProcessingPayment}
                                                    className={`w-full pl-10 p-3 border rounded-xl outline-none transition-all ${cardErrors.cardNumber
                                                        ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200'
                                                        : 'border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-500'
                                                        } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                                />
                                            </div>
                                            {cardErrors.cardNumber && (
                                                <p className="text-red-500 text-xs mt-1">{cardErrors.cardNumber}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                Nombre del Titular
                                            </label>
                                            <input
                                                type="text"
                                                name="cardName"
                                                placeholder="JUAN PEREZ"
                                                maxLength={30}
                                                value={cardData.cardName}
                                                onChange={handleCardChange}
                                                disabled={isProcessingPayment}
                                                className={`w-full p-3 border rounded-xl outline-none transition-all ${cardErrors.cardName
                                                    ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200'
                                                    : 'border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-500'
                                                    } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                            />
                                            {cardErrors.cardName && (
                                                <p className="text-red-500 text-xs mt-1">{cardErrors.cardName}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                                    Fecha de Expiracion
                                                </label>
                                                <input
                                                    type="text"
                                                    name="expiryDate"
                                                    placeholder="MM/AA"
                                                    maxLength={5}
                                                    value={cardData.expiryDate}
                                                    onChange={handleCardChange}
                                                    disabled={isProcessingPayment}
                                                    className={`w-full p-3 border rounded-xl outline-none transition-all ${cardErrors.expiryDate
                                                        ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200'
                                                        : 'border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-500'
                                                        } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                                />
                                                {cardErrors.expiryDate && (
                                                    <p className="text-red-500 text-xs mt-1">{cardErrors.expiryDate}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                                    CVV
                                                </label>
                                                <div className="relative">
                                                    <FiLock className="absolute left-3 top-3.5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        name="cvv"
                                                        placeholder="123"
                                                        maxLength={3}
                                                        value={cardData.cvv}
                                                        onChange={handleCardChange}
                                                        disabled={isProcessingPayment}
                                                        className={`w-full pl-10 p-3 border rounded-xl outline-none transition-all ${cardErrors.cvv
                                                            ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200'
                                                            : 'border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-500'
                                                            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                                    />
                                                </div>
                                                {cardErrors.cvv && (
                                                    <p className="text-red-500 text-xs mt-1">{cardErrors.cvv}</p>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isProcessingPayment}
                                            className="w-full py-4 bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center mt-6"
                                        >
                                            {isProcessingPayment ? (
                                                <>
                                                    <FiLoader className="w-5 h-5 mr-2 animate-spin" />
                                                    Procesando pago...
                                                </>
                                            ) : (
                                                <>
                                                    <FiCreditCard className="w-5 h-5 mr-2" />
                                                    Pagar {formatCurrency(totalConEnvio)}
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleVolverAlResumen}
                                            disabled={isProcessingPayment}
                                            className="w-full py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                                        >
                                            <FiArrowLeft /> Volver al resumen
                                        </button>
                                    </form>

                                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                                        <FiLock className="text-green-500" />
                                        <span>Pago seguro - Tus datos estan protegidos</span>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <button
                                        onClick={handleVolverAlResumen}
                                        className="text-gray-400 hover:text-gray-600 text-sm font-medium flex items-center justify-center gap-1 mx-auto"
                                    >
                                        <FiChevronLeft /> Volver al resumen
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

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
