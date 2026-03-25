import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTag, FiPackage, FiShoppingCart } from 'react-icons/fi';
import { promocionesService } from '../services/promocionesService';
import type { Promocion } from '../services/promocionesService';
import { formatCurrency } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// Determina la imagen efectiva de una promoción
const getPromoImage = (promo: Promocion): string => {
  // 1. Si tiene producto asociado, usar imagen del producto
  if (promo.productoId && promo.productoImagenUrl) return promo.productoImagenUrl;
  // 2. Si tiene imagen propia (independiente), usarla
  if (promo.imagenUrl) return promo.imagenUrl;
  // 3. Fallback
  return 'https://images.unsplash.com/photo-1551024601-bec0273fb832?auto=format&fit=crop&q=80&w=400';
};

const Promociones = () => {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { addToCart, isLoading: isCartLoading } = useCart();

  useEffect(() => {
    if (isAuthenticated) {
      fetchPromociones();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchPromociones = async () => {
    try {
      const response = await promocionesService.getAll();
      setPromociones(response.data);
    } catch (error) {
      console.error("Error cargando promociones", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-12 min-h-screen animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold mb-4">Promociones Especiales</h1>
          <p className="text-gray-500">Aprovecha nuestras ofertas y combos por tiempo limitado.</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-red-200 border-t-red-800 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando promociones...</p>
          </div>
        ) : !isAuthenticated ? (
          <div className="text-center py-20 bg-patisserie-cream/50 rounded-3xl border border-patisserie-red/10 max-w-2xl mx-auto shadow-sm">
            <div className="w-20 h-20 bg-patisserie-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiTag className="text-patisserie-red text-3xl" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-4">Ofertas Exclusivas para Miembros</h2>
            <p className="text-gray-600 mb-8 px-6">
              Inicia sesión o regístrate para descubrir nuestras promociones especiales, combos del mes y descuentos exclusivos de nuestra pastelería.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-6">
              <Link to="/login" className="bg-patisserie-red text-white px-8 py-3 rounded-xl font-bold hover:bg-red-800 transition-all shadow-lg hover:shadow-red-800/20">
                Iniciar Sesión
              </Link>
              <Link to="/registro" className="bg-white text-patisserie-dark border border-gray-200 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all">
                Crear Cuenta
              </Link>
            </div>
          </div>
        ) : promociones.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl">
            <p className="text-gray-500 text-lg">No hay promociones activas en este momento.</p>
            <p className="text-gray-400 mt-2">¡Vuelve pronto!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {promociones.map((promo) => (
              <div key={promo.id} className="rounded-2xl p-6 border border-gray-100 flex flex-col sm:flex-row gap-6 items-center shadow-sm hover:shadow-md transition-shadow bg-white hover:bg-red-50/30">
                <img
                  src={getPromoImage(promo)}
                  alt={promo.nombre}
                  className="w-full sm:w-40 h-40 object-cover rounded-xl shadow-sm bg-gray-200"
                />

                <div className="flex-grow text-center sm:text-left">
                  <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold mb-2 shadow-sm uppercase tracking-wider">
                    <FiTag className="inline mr-1" /> {promo.tipoDescuento === 'Porcentaje' ? `${promo.valor}% OFF` : 'OFERTA'}
                  </span>

                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{promo.nombre}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{promo.descripcion}</p>

                  {promo.productoNombre && (
                    <p className="text-xs text-blue-600 font-bold mb-3 flex items-center gap-1 justify-center sm:justify-start">
                      <FiPackage size={12} /> Aplica a: {promo.productoNombre}
                    </p>
                  )}

                  <div className="flex items-end justify-center sm:justify-start gap-3 mb-4">
                    {promo.precioOriginal != null && promo.precioFinal != null ? (
                      <>
                        <span className="text-lg text-gray-400 line-through font-medium">
                          {formatCurrency(promo.precioOriginal)}
                        </span>
                        <span className="text-3xl font-bold text-patisserie-red">
                          {formatCurrency(promo.precioFinal)}
                        </span>
                      </>
                    ) : promo.tipoDescuento === 'MontoFijo' ? (
                      <span className="text-3xl font-bold text-patisserie-red">
                        -{formatCurrency(promo.valor)}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      onClick={() => addToCart(promo.productoId || null, 1, promo.id)}
                      disabled={isCartLoading}
                      className="bg-patisserie-red text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-red-800 transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiShoppingCart /> {isCartLoading ? 'Agregando...' : 'Agregar al carrito'}
                    </button>
                    {promo.productoId && (
                      <Link
                        to={`/productos/${promo.productoId}`}
                        className="bg-patisserie-dark text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors inline-block"
                      >
                        Ver Producto
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Banner inferior */}
        <div className="mt-16 bg-patisserie-red rounded-2xl p-8 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">¡Gran Promoción!</h2>
            <p className="mb-6 opacity-90">Aprovecha esta oferta especial. Máximo 3 productos por promoción.</p>
          </div>
          {/* Círculos decorativos de fondo */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-2xl"></div>
        </div>

      </div>
    </div>
  );
};

export default Promociones;