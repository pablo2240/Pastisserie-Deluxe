import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiShoppingBag, FiXCircle } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/format';
import { useTiendaStatus } from '../hooks/useTiendaStatus';
import { FiClock } from 'react-icons/fi';
import { swal } from '../utils/swal';

const Carrito = () => {
    const { carrito, updateCartItem, removeFromCart, clearCart, totalItems, isLoading, compraMinima } = useCart();
    const { isAuthenticated } = useAuth();
    const { status } = useTiendaStatus();
    const navigate = useNavigate();

    // Calcular subtotal (por seguridad, aunque el backend lo envíe)
    const totalCalculado = carrito?.items?.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0) || 0;

    const handleCheckout = () => {
        if (status && !status.estaAbierto) {
            toast.error("La tienda está cerrada en este momento");
            return;
        }
        if (!isAuthenticated) {
            toast.error("Inicia sesión para finalizar la compra");
            navigate('/login');
            return;
        }
        navigate('/checkout');
    };

    // --- ESTADO VACÍO ---
    if (!carrito || carrito.items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pt-20 pb-12 px-4 animate-fade-in">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-gray-100">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-patisserie-red">
                        <FiShoppingBag size={40} />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">Tu carrito está vacío</h2>
                    <p className="text-gray-500 mb-8">¡Nuestros hornos están listos! Agrega algunas delicias para comenzar.</p>
                    <Link
                        to="/productos"
                        className="block w-full bg-patisserie-red text-white font-bold py-3 rounded-xl hover:bg-red-800 transition-colors shadow-md"
                    >
                        Ir al Catálogo
                    </Link>
                </div>
            </div>
        );
    }

    // --- ESTADO CON PRODUCTOS ---
    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12 animate-fade-in">
            <div className="container mx-auto px-4">

                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <FiShoppingBag /> Mi Carrito
                    <span className="text-sm bg-gray-200 text-gray-600 px-3 py-1 rounded-full font-sans font-bold">
                        {totalItems} items
                    </span>
                </h1>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* LISTA DE ITEMS */}
                    <div className="lg:w-2/3 space-y-4">
                        {carrito.items.map((item) => (
                            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center">

                                {/* Imagen */}
                                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                        src={item.imagenUrl || 'https://via.placeholder.com/100'}
                                        alt={item.nombreProducto}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg">{item.nombreProducto}</h3>
                                            {item.promocionId && item.nombrePromocion && (
                                                <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                                    {item.nombrePromocion}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                            title="Eliminar"
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {item.precioOriginal && item.precioOriginal !== item.precioUnitario && (
                                            <span className="text-gray-400 line-through text-sm">{formatCurrency(item.precioOriginal)}</span>
                                        )}
                                        <p className="text-patisserie-red font-bold">{formatCurrency(item.precioUnitario)}</p>
                                    </div>

                                    {/* Controles Cantidad */}
                                    <div className="flex items-center gap-4 mt-3">
                                        <div className="flex items-center border border-gray-200 rounded-lg">
                                            <button
                                                disabled={isLoading || item.cantidad <= 1}
                                                onClick={() => updateCartItem(item.id, item.cantidad - 1)}
                                                className="px-3 py-1 text-gray-500 hover:text-patisserie-red disabled:opacity-30"
                                            >
                                                <FiMinus size={14} />
                                            </button>
                                            <span className="w-8 text-center font-bold text-sm">{item.cantidad}</span>
                                            <button
                                                disabled={isLoading || (!!item.promocionId && item.cantidad >= 3)}
                                                onClick={() => updateCartItem(item.id, item.cantidad + 1)}
                                                className="px-3 py-1 text-gray-500 hover:text-patisserie-red disabled:opacity-30"
                                                title={item.promocionId && item.cantidad >= 3 ? 'Máximo 3 unidades por promoción' : ''}
                                            >
                                                <FiPlus size={14} />
                                            </button>
                                        </div>
                                        <span className="text-sm text-gray-500 font-medium">
                                            Subtotal: <span className="text-gray-900 font-bold">{formatCurrency(item.precioUnitario * item.cantidad)}</span>
                                        </span>
                                        {item.promocionId && item.cantidad >= 3 && (
                                            <span className="text-xs text-amber-600 font-bold">(Max 3)</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={async () => {
                                const confirmed = await swal.deleteConfirm('todo el contenido del carrito');
                                if (confirmed) clearCart();
                            }}
                            className="text-red-500 text-sm font-bold hover:underline flex items-center gap-2 mt-4"
                        >
                            <FiXCircle /> Vaciar Carrito
                        </button>
                    </div>

                    {/* RESUMEN DE PAGO */}
                    <div className="lg:w-1/3">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-28">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Resumen del Pedido</h3>

                            <div className="space-y-3 mb-6 border-b border-gray-100 pb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(totalCalculado)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mb-8">
                                <span className="text-gray-800 font-bold text-lg">Total</span>
                                <span className="text-3xl font-bold text-patisserie-red">
                                    {formatCurrency(totalCalculado)}
                                </span>
                            </div>

                            {/* Advertencia de compra mínima - solo se muestra si no cumple el monto mínimo */}
                            {typeof compraMinima === 'number' && totalCalculado < compraMinima && (
                                <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <span className="text-red-600 text-xl mt-0.5">⚠️</span>
                                        <div>
                                            <p className="text-red-800 font-bold text-sm leading-relaxed">
                                                La compra mínima en esta tienda es de <span className="text-red-900 font-black">{formatCurrency(compraMinima)}</span>
                                            </p>
                                            <p className="text-red-600 text-xs font-medium mt-1">
                                                Te faltan <span className="font-bold">{formatCurrency(compraMinima - totalCalculado)}</span> para completar tu pedido
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Botón Proceder al Pago - solo se muestra si cumple la compra mínima */}
                            {typeof compraMinima !== 'number' || totalCalculado >= compraMinima ? (
                                <>
                                    {status && !status.estaAbierto && (
                                        <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 animate-pulse">
                                            <FiClock className="text-red-600 animate-bounce" />
                                            <div className="text-xs text-red-800 font-bold uppercase tracking-wider">
                                                Tienda Cerrada (Medellín)
                                                <p className="text-[10px] font-medium opacity-70 mt-0.5 normal-case">Vuelve a las {status.horaApertura}</p>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleCheckout}
                                        disabled={isLoading || !!(status && !status.estaAbierto)}
                                        className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 ${(status && !status.estaAbierto)
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed grayscale'
                                            : 'bg-gray-900 text-white hover:bg-patisserie-red hover:shadow-xl'
                                            } disabled:opacity-70`}
                                    >
                                        {isLoading ? 'Procesando...' : (status && !status.estaAbierto) ? 'Cerrado Temporalmente' : 'Proceder al Pago'}
                                    </button>
                                </>
                            ) : null}

                            <Link to="/productos" className="block text-center text-gray-500 text-sm mt-4 hover:text-gray-800 flex items-center justify-center gap-1">
                                <FiArrowLeft /> Seguir Comprando
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Carrito;