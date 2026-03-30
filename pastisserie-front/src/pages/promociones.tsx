import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiTag, FiPackage, FiShoppingCart, FiClock, FiCheck } from 'react-icons/fi';
import { promocionesService } from '../services/promocionesService';
import type { Promocion } from '../services/promocionesService';
import { formatCurrency } from '../utils/format';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const POLLING_INTERVAL_MS = 10000;

const getPromoImage = (promo: Promocion): string => {
  if (promo.productoId && promo.productoImagenUrl) return promo.productoImagenUrl;
  if (promo.imagenUrl) return promo.imagenUrl;
  return 'https://images.unsplash.com/photo-1551024601-bec0273fb832?auto=format&fit=crop&q=80&w=400';
};

const isPromocionIndependiente = (promo: Promocion): boolean => {
  return promo.productoId === null || promo.productoId === undefined;
};

const isAgotada = (promo: Promocion): boolean => {
  if (isPromocionIndependiente(promo)) {
    return promo.stock != null && promo.stock <= 0;
  }
  return promo.productoStock != null && promo.productoStock <= 0;
};

const Promociones = () => {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { addToCart, isLoading: isCartLoading } = useCart();

  const fetchPromociones = useCallback(async () => {
    try {
      const response = await promocionesService.getActivas();
      setPromociones(response.data);
    } catch (error) {
      console.error("Error cargando promociones", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPromociones();
      const pollingInterval = setInterval(fetchPromociones, POLLING_INTERVAL_MS);
      return () => clearInterval(pollingInterval);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, fetchPromociones]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-patisserie-red rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm font-medium">Cargando promociones...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-patisserie-red/10 blur-3xl rounded-full"></div>
            <div className="relative bg-white border border-gray-100 rounded-[2rem] p-12 shadow-xl shadow-gray-200/50">
              <div className="w-24 h-24 bg-patisserie-red rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FiTag className="text-white text-4xl" />
              </div>
              <h2 className="text-3xl font-serif font-black text-patisserie-dark mb-4">Ofertas Exclusivas</h2>
              <p className="text-gray-500 mb-8 text-lg">
                Inicia sesión para descubrir nuestras promociones especiales, combos del mes y descuentos exclusivos.
              </p>
              <div className="flex flex-col gap-3">
                <Link 
                  to="/login" 
                  className="w-full bg-patisserie-red text-white px-8 py-4 rounded-xl font-bold hover:bg-patisserie-red/90 transition-all shadow-lg shadow-patisserie-red/20"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  to="/registro" 
                  className="w-full bg-gray-100 text-gray-700 border border-gray-200 px-8 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Crear Cuenta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-patisserie-red/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <span className="inline-block px-4 py-1.5 bg-patisserie-red text-white text-xs font-black uppercase tracking-[0.3em] rounded-full mb-4 shadow-lg">
              Ofertas Limitadas
            </span>
            <h1 className="text-5xl md:text-6xl font-serif font-black text-patisserie-dark mb-4">
              Promociones <span className="text-patisserie-red">Especiales</span>
            </h1>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Descubre nuestros combos exclusivos y descuentos por tiempo limitado. 
              ¡No te los pierdas!
            </p>
          </div>
        </div>

        {promociones.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiTag className="text-white/30 text-3xl" />
            </div>
            <p className="text-white/40 text-xl mb-2">No hay promociones activas</p>
            <p className="text-white/20 text-sm">¡Vuelve pronto para nuevas ofertas!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promociones.map((promo, index) => (
              <div 
                key={promo.id} 
                className="group relative bg-white rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-patisserie-red/10 transition-all duration-500 hover:-translate-y-1 border border-gray-100"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Badge de descuento */}
                <div className="absolute top-4 left-4 z-20">
                  <div className="bg-patisserie-red text-white px-4 py-2 rounded-xl font-black text-sm shadow-lg flex items-center gap-2">
                    <FiTag size={16} />
                    {promo.tipoDescuento === 'Porcentaje' ? `-${promo.valor}%` : `-${formatCurrency(promo.valor)}`}
                  </div>
                </div>

                {/* Imagen */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={getPromoImage(promo)}
                    alt={promo.nombre}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Stock info overlay */}
                  {isAgotada(promo) && (
                    <div className="absolute top-4 right-4 bg-gray-800 text-white px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider">
                      Agotado
                    </div>
                  )}

                  {/* Producto info */}
                  {promo.productoNombre && (
                    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 text-white/90 text-sm">
                      <FiPackage size={14} />
                      <span className="font-medium truncate">{promo.productoNombre}</span>
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-6">
                  <h3 className="text-2xl font-serif font-black text-patisserie-dark mb-2 group-hover:text-patisserie-red transition-colors">
                    {promo.nombre}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {promo.descripcion || '¡No te pierdas esta oferta especial!'}
                  </p>

                  {/* Precios */}
                  <div className="flex items-baseline gap-3 mb-6">
                    {promo.precioOriginal != null && promo.precioFinal != null ? (
                      <>
                        <span className="text-3xl font-black text-patisserie-dark">
                          {formatCurrency(promo.precioFinal)}
                        </span>
                        <span className="text-lg text-gray-400 line-through font-medium">
                          {formatCurrency(promo.precioOriginal)}
                        </span>
                        <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                          Ahorra {formatCurrency(promo.precioOriginal - promo.precioFinal)}
                        </span>
                      </>
                    ) : promo.tipoDescuento === 'MontoFijo' ? (
                      <span className="text-3xl font-black text-patisserie-dark">
                        -{formatCurrency(promo.valor)}
                      </span>
                    ) : null}
                  </div>

                  {/* Fechas */}
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-6">
                    <div className="flex items-center gap-1.5">
                      <FiClock size={14} />
                      <span>Desde: {new Date(promo.fechaInicio).toLocaleDateString('es-CO')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      <span>Hasta: {new Date(promo.fechaFin).toLocaleDateString('es-CO')}</span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-3">
                    {isAgotada(promo) ? (
                      <button
                        disabled
                        className="flex-1 bg-gray-100 text-gray-400 px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                        <FiCheck size={18} /> Agotado
                      </button>
                    ) : (
                      <button
                        onClick={() => addToCart(promo.productoId || null, 1, promo.id)}
                        disabled={isCartLoading}
                        className="flex-1 bg-patisserie-red text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-patisserie-red/90 transition-all shadow-lg shadow-patisserie-red/20 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <FiShoppingCart size={18} /> 
                        {isCartLoading ? 'Agregando...' : 'Agregar al Carrito'}
                      </button>
                    )}
                    {promo.productoId && (
                      <Link
                        to={`/productos/${promo.productoId}`}
                        className="px-4 py-3.5 border-2 border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:border-patisserie-red hover:text-patisserie-red transition-all"
                      >
                        Ver
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-patisserie-red/10 blur-3xl rounded-3xl"></div>
          <div className="relative bg-patisserie-dark rounded-3xl p-8 md:p-12 text-center border border-gray-100">
            <h2 className="text-2xl md:text-3xl font-serif font-black text-white mb-3">
              ¿Quieres ser el primero en ver nuestras ofertas?
            </h2>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              Síguenos en redes sociales y activa las notificaciones para no perderte ninguna promoción.
            </p>
            <div className="flex justify-center gap-4">
              <Link 
                to="/productos" 
                className="bg-white text-patisserie-dark px-8 py-3.5 rounded-xl font-bold hover:bg-gray-100 transition-all"
              >
                Ver Catálogo Completo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promociones;
