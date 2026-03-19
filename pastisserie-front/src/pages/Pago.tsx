import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import { formatCurrency } from '../utils/format';
import toast from 'react-hot-toast';
import { FiCreditCard, FiCheckCircle, FiLock, FiLoader, FiArrowLeft } from 'react-icons/fi';

// Tipos para los datos recibidos por location
interface PedidoData {
    pedidoId: number;
    total: number;
    items: Array<{
        id: number;
        nombreProducto: string;
        cantidad: number;
        precioUnitario: number;
        subtotal: number;
    }>;
    direccion: string;
    comuna: string;
}

const Pago = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { clearCart } = useCart();

    // Obtener datos del pedido desde location state
    const pedidoData = location.state as PedidoData | null;
    const pedidoId = pedidoData?.pedidoId;
    const total = pedidoData?.total || 0;
    const items = pedidoData?.items || [];
    const direccion = pedidoData?.direccion || '';
    const comuna = pedidoData?.comuna || '';

    // Estados del componente
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estado del formulario de tarjeta
    const [cardData, setCardData] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
    });

    // Estado de errores de validación
    const [cardErrors, setCardErrors] = useState<{ [key: string]: string }>({});

    // Verificar que tenemos datos del pedido
    useEffect(() => {
        if (!pedidoId) {
            toast.error('No se encontraron datos del pedido');
            navigate('/carrito');
        }
    }, [pedidoId, navigate]);

    // Formatear número de tarjeta con espacios cada 4 dígitos
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

    // Formatear fecha de expiración como MM/YY
    const formatExpiryDate = (value: string): string => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    // Manejar cambios en los campos del formulario
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

        // Limpiar error cuando el usuario comienza a escribir
        if (cardErrors[name]) {
            setCardErrors({ ...cardErrors, [name]: '' });
        }
    };

    // Validar fecha de expiración
    const validateExpiryDate = (expiry: string): boolean => {
        if (!expiry || expiry.length < 5) return false;

        const [month, year] = expiry.split('/');
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt('20' + year, 10);

        // Verificar que el mes sea válido (1-12)
        if (monthNum < 1 || monthNum > 12) return false;

        // Verificar que la tarjeta no esté expirada
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        if (yearNum < currentYear) return false;
        if (yearNum === currentYear && monthNum < currentMonth) return false;

        return true;
    };

    // Validar formulario de tarjeta
    const validateCard = (): boolean => {
        const errors: { [key: string]: string } = {};
        const cardNumber = cardData.cardNumber.replace(/\s/g, '');

        // Número de tarjeta: exactamente 16 dígitos
        if (!cardNumber || cardNumber.length !== 16) {
            errors.cardNumber = 'El número de tarjeta debe tener exactamente 16 dígitos';
        }

        // Nombre: obligatorio, mínimo 3 caracteres
        if (!cardData.cardName || cardData.cardName.length < 3) {
            errors.cardName = 'Ingresa el nombre del titular (mínimo 3 caracteres)';
        }

        // Fecha: formato MM/YY, no expirada
        if (!cardData.expiryDate || cardData.expiryDate.length < 5) {
            errors.expiryDate = 'Ingresa la fecha de expiración (MM/AA)';
        } else if (!validateExpiryDate(cardData.expiryDate)) {
            errors.expiryDate = 'La fecha de expiración no es válida o la tarjeta está vencida';
        }

        // CVV: exactamente 3 dígitos
        if (!cardData.cvv || cardData.cvv.length !== 3) {
            errors.cvv = 'El CVV debe tener exactamente 3 dígitos';
        }

        setCardErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Procesar el pago
    const handleProcesarPago = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!pedidoId || isLoading) return;

        // Validar formulario
        if (!validateCard()) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await orderService.simularPago(pedidoId);

            if (result.success && result.data?.aprobado) {
                // Limpiar el carrito
                await clearCart();
                // Mostrar éxito
                setIsSuccess(true);
                toast.success('Pago aprobado correctamente');
            } else {
                const errorMsg = result.message || result.data?.mensaje || 'Error al procesar el pago';
                setError(errorMsg);
                toast.error(errorMsg);
            }
        } catch (err: unknown) {
            console.error('Error al procesar pago:', err);
            const error = err as { response?: { data?: { message?: string } } };
            const errorMsg = error.response?.data?.message || 'Hubo un error al procesar el pago. Por favor intenta novamente.';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    // Si el pago fue exitoso, mostrar pantalla de éxito
    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full text-center border-t-8 border-green-500">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <FiCheckCircle size={50} />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-gray-800 mb-4">Pago Exitoso!</h1>
                    <p className="text-gray-600 mb-2 text-lg">
                        Gracias por tu compra. Tu pedido ha sido confirmado.
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

    // Si no hay datos del pedido, no renderizar nada
    if (!pedidoId) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 animate-fade-in">
            <div className="container mx-auto max-w-2xl">

                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <FiArrowLeft /> Volver
                    </button>
                    <h1 className="text-3xl font-serif font-bold text-gray-900 text-center">
                        Completar Pago
                    </h1>
                </div>

                {/* Resumen del pedido */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FiCheckCircle className="text-green-500" /> Resumen del Pedido
                    </h2>

                    {/* Dirección de envío */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <p className="text-sm font-medium text-gray-500 mb-1">Direccion de envio:</p>
                        <p className="text-gray-800">{direccion}</p>
                        {comuna && <p className="text-gray-600 text-sm">{comuna}</p>}
                    </div>

                    {/* Productos */}
                    <div className="space-y-3 mb-4">
                        {items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                                <div className="flex-1">
                                    <p className="text-gray-800 font-medium">{item.nombreProducto}</p>
                                    <p className="text-gray-500">{item.cantidad} x {formatCurrency(item.precioUnitario)}</p>
                                </div>
                                <span className="font-bold text-gray-900">
                                    {formatCurrency(item.subtotal)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Total */}
                    <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-800 text-lg">Total a pagar:</span>
                            <span className="text-2xl font-bold text-patisserie-red">
                                {formatCurrency(total)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Formulario de pago con tarjeta */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <FiCreditCard className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Pagar con Tarjeta de Credito</h3>
                        <p className="text-sm text-gray-500 mt-1">Ingresa los datos de tu tarjeta de credito</p>
                    </div>

                    {/* Mensaje de error general */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                            <p className="text-red-600 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Formulario de tarjeta */}
                    <form onSubmit={handleProcesarPago} className="space-y-4">
                        {/* Número de tarjeta */}
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
                                    disabled={isLoading}
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

                        {/* Nombre del titular */}
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
                                disabled={isLoading}
                                className={`w-full p-3 border rounded-xl outline-none transition-all ${cardErrors.cardName
                                        ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200'
                                        : 'border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-500'
                                    } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                            />
                            {cardErrors.cardName && (
                                <p className="text-red-500 text-xs mt-1">{cardErrors.cardName}</p>
                            )}
                        </div>

                        {/* Fecha de expiración y CVV */}
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
                                    disabled={isLoading}
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
                                        disabled={isLoading}
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

                        {/* Botón de pago */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center mt-6"
                        >
                            {isLoading ? (
                                <>
                                    <FiLoader className="w-5 h-5 mr-2 animate-spin" />
                                    Procesando pago...
                                </>
                            ) : (
                                <>
                                    <FiCreditCard className="w-5 h-5 mr-2" />
                                    Pagar {formatCurrency(total)}
                                </>
                            )}
                        </button>

                        {/* Botón de cancelar */}
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            disabled={isLoading}
                            className="w-full py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-semibold rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                    </form>

                    {/* Nota de seguridad */}
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                        <FiLock className="text-green-500" />
                        <span>Pago seguro - Tus datos estan protegidos</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pago;
