import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiX, FiSave, FiTag, FiClock, FiImage, FiPackage, FiUploadCloud } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/format';
import { promocionesService, type Promocion } from '../../services/promocionesService';
import { productService } from '../../services/productService';
import type { Producto } from '../../types';
import api from '../../api/axios';

const getLocalDateString = () => new Date().toLocaleDateString('sv-SE');

const formatLocalISO = (dateStr?: string) => {
    if (!dateStr) return '';
    // El backend devuelve fechas en hora de Bogotá, solo formatear para input
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const toISOStringLocal = (localDateTime: string) => {
    if (!localDateTime) return '';
    // Enviar tal cual al backend (hora de Bogotá)
    return localDateTime;
};

type TipoPromocion = 'producto' | 'independiente';

const initialFormState = {
    nombre: '',
    descripcion: '',
    tipoDescuento: 'Porcentaje',
    valor: 0,
    stock: null as number | null,
    fechaInicio: `${getLocalDateString()}T00:00`,
    fechaFin: `${getLocalDateString()}T23:59`,
    activo: true,
    imagenUrl: '',
    productoId: null as number | null,
    precioOriginal: null as number | null,
};

const PromocionesAdmin = () => {
    const [promociones, setPromociones] = useState<Promocion[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<number | null>(null);
    const [formData, setFormData] = useState(initialFormState);

    // Tipo de promoción: asociada a producto o independiente
    const [tipoPromocion, setTipoPromocion] = useState<TipoPromocion>('independiente');

    // Buscador de productos
    const [busquedaProducto, setBusquedaProducto] = useState('');
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
    const productoSearchRef = useRef<HTMLDivElement>(null);

    // Image upload
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchPromociones();
        fetchProductos();
    }, []);

    // Cerrar dropdown de productos al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (productoSearchRef.current && !productoSearchRef.current.contains(e.target as Node)) {
                setShowProductDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchPromociones = async () => {
        try {
            const response = await promocionesService.getAll();
            if (response.success && Array.isArray(response.data)) {
                setPromociones(response.data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar promociones');
        } finally {
            setLoading(false);
        }
    };

    const fetchProductos = async () => {
        try {
            const response = await productService.getAll();
            if (response.success && Array.isArray(response.data)) {
                setProductos(response.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // ===== IMAGE UPLOAD =====
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await uploadImage(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await uploadImage(e.target.files[0]);
        }
    };

    const uploadImage = async (file: File) => {
        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const response = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data && response.data.data && response.data.data.url) {
                setFormData(prev => ({ ...prev, imagenUrl: response.data.data.url }));
                toast.success('Imagen subida correctamente');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al subir la imagen');
        } finally {
            setIsUploading(false);
        }
    };

    // ===== PRODUCTO SELECTOR =====
    const handleSelectProducto = (producto: Producto) => {
        setProductoSeleccionado(producto);
        setFormData(prev => ({ ...prev, productoId: producto.id, imagenUrl: '', precioOriginal: null }));
        setBusquedaProducto(producto.nombre);
        setShowProductDropdown(false);
    };

    const handleClearProducto = () => {
        setProductoSeleccionado(null);
        setFormData(prev => ({ ...prev, productoId: null, precioOriginal: null }));
        setBusquedaProducto('');
    };

    const filteredProductos = productos.filter(p =>
        p.activo && p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase())
    );

    // ===== FORM HANDLERS =====
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked :
            type === 'number' ? Number(value) : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const openNewModal = () => {
        setFormData(initialFormState);
        setTipoPromocion('independiente');
        setProductoSeleccionado(null);
        setBusquedaProducto('');
        setIsEditing(false);
        setShowModal(true);
    };

    const openEditModal = (promo: Promocion) => {
        const hasProducto = !!promo.productoId;
        setTipoPromocion(hasProducto ? 'producto' : 'independiente');

        if (hasProducto) {
            const prod = productos.find(p => p.id === promo.productoId);
            setProductoSeleccionado(prod || null);
            setBusquedaProducto(promo.productoNombre || prod?.nombre || '');
        } else {
            setProductoSeleccionado(null);
            setBusquedaProducto('');
        }

        setFormData({
            nombre: promo.nombre,
            descripcion: promo.descripcion || '',
            tipoDescuento: promo.tipoDescuento,
            valor: promo.valor,
            stock: promo.stock ?? null,
            fechaInicio: formatLocalISO(promo.fechaInicio),
            fechaFin: formatLocalISO(promo.fechaFin),
            activo: promo.activo,
            imagenUrl: promo.imagenUrl || '',
            productoId: promo.productoId || null,
            precioOriginal: promo.precioOriginal ?? null,
        });
        setCurrentId(promo.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nombre.trim()) {
            toast.error('El nombre de la promoción es obligatorio');
            return;
        }
        if (formData.valor <= 0) {
            toast.error('El valor del descuento debe ser mayor a 0');
            return;
        }
        if (tipoPromocion === 'producto' && !formData.productoId) {
            toast.error('Debes seleccionar un producto para este tipo de promoción');
            return;
        }
        if (tipoPromocion === 'independiente' && (!formData.precioOriginal || formData.precioOriginal <= 0)) {
            toast.error('El precio original es obligatorio para promociones independientes');
            return;
        }

        try {
            if (new Date(formData.fechaFin) <= new Date(formData.fechaInicio)) {
                toast.error('La fecha de fin debe ser posterior a la de inicio');
                return;
            }

            const payload = {
                ...formData,
                fechaInicio: toISOStringLocal(formData.fechaInicio),
                fechaFin: toISOStringLocal(formData.fechaFin),
                // Si es tipo producto, limpiar imagenUrl (se usará la del producto)
                // Si es independiente, limpiar productoId
                productoId: tipoPromocion === 'producto' ? formData.productoId : null,
                imagenUrl: tipoPromocion === 'independiente' ? formData.imagenUrl : '',
                // PrecioOriginal solo se envía para independientes; para producto el backend lo toma del producto
                precioOriginal: tipoPromocion === 'independiente' ? formData.precioOriginal : null,
                // Stock solo aplica a independientes; para producto se usa el stock del producto
                stock: tipoPromocion === 'independiente' ? formData.stock : null,
            };

            if (isEditing && currentId) {
                await promocionesService.update(currentId, { ...payload, id: currentId } as any);
                toast.success('Promoción actualizada');
            } else {
                await promocionesService.create(payload as any);
                toast.success('Promoción creada');
            }
            setShowModal(false);
            fetchPromociones();
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar promoción');
        }
    };

    const handleDelete = async (id: number, nombre: string) => {
        if (!window.confirm(`¿Estás seguro de eliminar la promoción "${nombre}"? Esta acción no se puede deshacer.`)) return;
        try {
            await promocionesService.delete(id);
            toast.success('Promoción eliminada correctamente');
            fetchPromociones();
        } catch (error: any) {
            console.error(error);
            const msg = error?.response?.data?.message || 'No se pudo eliminar. Puede que la promoción esté siendo usada.';
            toast.error(msg);
        }
    };

    // Obtener la imagen efectiva de una promoción
    const getPromoImage = (promo: Promocion): string | null => {
        if (promo.productoId && promo.productoImagenUrl) return promo.productoImagenUrl;
        if (promo.imagenUrl) return promo.imagenUrl;
        return null;
    };

    const filteredPromos = promociones.filter((p: Promocion) =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    // Calcula el precio efectivo (del producto o manual) para preview en el formulario
    const getPrecioEfectivo = (): number | null => {
        if (tipoPromocion === 'producto' && productoSeleccionado) {
            return productoSeleccionado.precio;
        }
        if (tipoPromocion === 'independiente' && formData.precioOriginal && formData.precioOriginal > 0) {
            return formData.precioOriginal;
        }
        return null;
    };

    const calcPrecioFinal = (precioOrig: number | null): number | null => {
        if (!precioOrig || precioOrig <= 0 || formData.valor <= 0) return null;
        let resultado: number;
        if (formData.tipoDescuento === 'Porcentaje') {
            resultado = precioOrig * (1 - formData.valor / 100);
        } else {
            resultado = precioOrig - formData.valor;
        }
        return resultado < 0 ? 0 : Math.round(resultado);
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Promociones</h1>
                    <p className="text-gray-500">Gestiona descuentos y ofertas especiales</p>
                </div>
                <button onClick={openNewModal} className="bg-[#7D2121] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-red-900 transition-colors shadow-md">
                    <FiPlus /> Nueva Promoción
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                    <FiSearch className="text-gray-400" />
                    <input
                        className="bg-transparent w-full outline-none text-sm"
                        placeholder="Buscar promoción..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-100 text-gray-500 uppercase font-bold text-xs">
                            <tr>
                                <th className="px-4 py-4">Imagen</th>
                                <th className="px-4 py-4">Nombre</th>
                                <th className="px-4 py-4">Producto</th>
                                <th className="px-4 py-4">Descuento</th>
                                <th className="px-4 py-4">Precios</th>
                                <th className="px-4 py-4">Vigencia</th>
                                <th className="px-4 py-4">Stock</th>
                                <th className="px-4 py-4">Estado</th>
                                <th className="px-4 py-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={9} className="text-center py-8">Cargando...</td></tr>
                            ) : filteredPromos.length === 0 ? (
                                <tr><td colSpan={9} className="text-center py-8 text-gray-400">No hay promociones</td></tr>
                            ) : filteredPromos.map(promo => {
                                const img = getPromoImage(promo);
                                return (
                                    <tr key={promo.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            {img ? (
                                                <img src={img} alt={promo.nombre} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
                                                    <FiImage size={18} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-bold text-gray-800">{promo.nombre}</td>
                                        <td className="px-4 py-3">
                                            {promo.productoId ? (
                                                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">
                                                    <FiPackage size={12} /> {promo.productoNombre || 'Producto'}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-600 px-2 py-1 rounded text-xs font-bold border border-purple-100">
                                                    <FiImage size={12} /> Independiente
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold text-xs">
                                                {promo.tipoDescuento === 'Porcentaje' ? `${promo.valor}%` : formatCurrency(promo.valor)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {promo.precioOriginal ? (
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs text-gray-400 line-through">{formatCurrency(promo.precioOriginal)}</span>
                                                    {promo.precioFinal != null && (
                                                        <span className="text-sm font-black text-green-700">{formatCurrency(promo.precioFinal)}</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1 text-gray-500">
                                                    <span className="font-bold text-[9px] uppercase tracking-tighter bg-gray-100 px-1 rounded">Inicio:</span>
                                                    <span>{new Date(promo.fechaInicio).toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-patisserie-red">
                                                    <span className="font-bold text-[9px] uppercase tracking-tighter bg-red-50 px-1 rounded">Fin:</span>
                                                    <span className="font-bold">{new Date(promo.fechaFin).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs font-bold">
                                            {promo.productoId ? (
                                                <span className="text-gray-400" title="Usa stock del producto">Producto</span>
                                            ) : promo.stock != null ? (
                                                <span className={promo.stock > 0 ? 'text-green-700' : 'text-red-600'}>{promo.stock}</span>
                                            ) : (
                                                <span className="text-gray-300">Ilimitado</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {(() => {
                                                const now = new Date();
                                                const start = new Date(promo.fechaInicio);
                                                const end = new Date(promo.fechaFin);

                                                if (!promo.activo) return <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200 uppercase tracking-tighter">Desactiva</span>;
                                                if (now < start) return <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-tighter">Próxima</span>;
                                                if (now > end) return <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700 border border-red-200 uppercase tracking-tighter">Expirada</span>;
                                                return <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200 uppercase tracking-tighter">Vigente</span>;
                                            })()}
                                        </td>
                                        <td className="px-4 py-3 flex gap-2">
                                            <button onClick={() => openEditModal(promo)} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><FiEdit /></button>
                                            <button onClick={() => handleDelete(promo.id, promo.nombre)} className="text-red-600 hover:bg-red-50 p-2 rounded"><FiTrash2 /></button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ===== MODAL DE CREAR/EDITAR ===== */}
            {showModal && createPortal(
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-4 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-[95vw] md:w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] border border-white/20">
                        <div className="bg-[#7D2121] text-white px-6 md:px-8 py-6 flex justify-between items-center relative overflow-hidden shrink-0">
                            <div className="relative z-10">
                                <h2 className="text-xl font-serif font-bold italic">{isEditing ? 'Editar Promoción' : 'Nueva Oferta Especial'}</h2>
                                <p className="text-xs text-white/70">Configura los detalles y vigencia de tu promoción</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="relative z-10 p-2 hover:bg-white/10 rounded-full transition-colors"><FiX size={24} /></button>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                        </div>
                        <form onSubmit={handleSave} className="p-0 flex flex-col flex-1 overflow-hidden min-h-0 bg-[#fcfcfc]">
                            <div className="p-6 md:p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">

                                {/* SECCIÓN: INFORMACIÓN PRINCIPAL */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-[#7D2121]/10 rounded-lg flex items-center justify-center text-[#7D2121]">
                                            <FiTag size={18} />
                                        </div>
                                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Información de la Oferta</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nombre Público de la Promoción</label>
                                            <input
                                                name="nombre"
                                                placeholder="Ej: Descuento de Verano 2026"
                                                value={formData.nombre}
                                                onChange={handleInputChange}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#7D2121]/20 focus:bg-white rounded-2xl px-5 py-4 text-gray-800 font-bold outline-none transition-all placeholder:text-gray-300"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Descripción Detallada</label>
                                            <textarea
                                                name="descripcion"
                                                placeholder="Describe los beneficios de esta oferta para tus clientes..."
                                                value={formData.descripcion}
                                                onChange={handleInputChange}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#7D2121]/20 focus:bg-white rounded-2xl px-5 py-4 text-sm font-medium text-gray-600 outline-none transition-all resize-none h-28 placeholder:text-gray-300"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECCIÓN: TIPO DE PROMOCIÓN (NUEVO) */}
                                <div className="space-y-6 pt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-[#7D2121]/10 rounded-lg flex items-center justify-center text-[#7D2121]">
                                            <FiImage size={18} />
                                        </div>
                                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Tipo de Promoción</h3>
                                    </div>

                                    {/* Tabs de selección */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setTipoPromocion('producto');
                                                setFormData(prev => ({ ...prev, imagenUrl: '' }));
                                            }}
                                            className={`p-5 rounded-2xl border-2 transition-all text-left ${tipoPromocion === 'producto'
                                                ? 'border-[#7D2121] bg-[#7D2121]/5 shadow-lg shadow-[#7D2121]/10'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tipoPromocion === 'producto' ? 'bg-[#7D2121] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                    <FiPackage size={16} />
                                                </div>
                                                <span className={`text-sm font-black ${tipoPromocion === 'producto' ? 'text-[#7D2121]' : 'text-gray-600'}`}>
                                                    Asociar a Producto
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 leading-relaxed ml-11">
                                                Selecciona un producto del catálogo. Se usará su imagen automáticamente.
                                            </p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setTipoPromocion('independiente');
                                                handleClearProducto();
                                            }}
                                            className={`p-5 rounded-2xl border-2 transition-all text-left ${tipoPromocion === 'independiente'
                                                ? 'border-[#7D2121] bg-[#7D2121]/5 shadow-lg shadow-[#7D2121]/10'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tipoPromocion === 'independiente' ? 'bg-[#7D2121] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                    <FiUploadCloud size={16} />
                                                </div>
                                                <span className={`text-sm font-black ${tipoPromocion === 'independiente' ? 'text-[#7D2121]' : 'text-gray-600'}`}>
                                                    Promoción Independiente
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 leading-relaxed ml-11">
                                                Sube una imagen personalizada para la promoción, banner o campaña.
                                            </p>
                                        </button>
                                    </div>

                                    {/* Contenido según tipo seleccionado */}
                                    {tipoPromocion === 'producto' ? (
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Buscar Producto del Catálogo</label>
                                            <div ref={productoSearchRef} className="relative">
                                                <div className="relative">
                                                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                    <input
                                                        type="text"
                                                        placeholder="Escribe para buscar un producto..."
                                                        value={busquedaProducto}
                                                        onChange={e => {
                                                            setBusquedaProducto(e.target.value);
                                                            setShowProductDropdown(true);
                                                            if (!e.target.value) handleClearProducto();
                                                        }}
                                                        onFocus={() => setShowProductDropdown(true)}
                                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#7D2121]/20 focus:bg-white rounded-2xl pl-11 pr-10 py-4 text-sm font-bold text-gray-700 outline-none transition-all placeholder:text-gray-300"
                                                    />
                                                    {productoSeleccionado && (
                                                        <button
                                                            type="button"
                                                            onClick={handleClearProducto}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                                                        >
                                                            <FiX size={16} />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Dropdown de resultados */}
                                                {showProductDropdown && busquedaProducto && (
                                                    <div className="absolute z-50 top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto">
                                                        {filteredProductos.length === 0 ? (
                                                            <div className="p-4 text-center text-gray-400 text-sm">No se encontraron productos</div>
                                                        ) : (
                                                            filteredProductos.slice(0, 8).map(prod => (
                                                                <button
                                                                    key={prod.id}
                                                                    type="button"
                                                                    onClick={() => handleSelectProducto(prod)}
                                                                    className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors text-left first:rounded-t-2xl last:rounded-b-2xl"
                                                                >
                                                                    {prod.imagenUrl ? (
                                                                        <img src={prod.imagenUrl} alt={prod.nombre} className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0" />
                                                                    ) : (
                                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 shrink-0">
                                                                            <FiPackage size={16} />
                                                                        </div>
                                                                    )}
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="text-sm font-bold text-gray-800 truncate">{prod.nombre}</p>
                                                                        <p className="text-xs text-gray-400">{prod.categoriaNombre} - {formatCurrency(prod.precio)}</p>
                                                                    </div>
                                                                </button>
                                                            ))
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Preview del producto seleccionado */}
                                            {productoSeleccionado && (
                                                <div className="flex items-center gap-4 bg-blue-50/60 border border-blue-100 rounded-2xl p-4">
                                                    {productoSeleccionado.imagenUrl ? (
                                                        <img src={productoSeleccionado.imagenUrl} alt={productoSeleccionado.nombre} className="w-16 h-16 rounded-xl object-cover border border-blue-200 shadow-sm" />
                                                    ) : (
                                                        <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center text-blue-300">
                                                            <FiPackage size={24} />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-gray-800 truncate">{productoSeleccionado.nombre}</p>
                                                        <p className="text-xs text-gray-500">{productoSeleccionado.categoriaNombre} - {formatCurrency(productoSeleccionado.precio)}</p>
                                                        <p className="text-[10px] text-blue-600 font-bold mt-1">La imagen de este producto se usará en la promoción</p>
                                                    </div>
                                                    <div className="shrink-0">
                                                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Vinculado</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        /* Upload de imagen personalizada */
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Imagen de la Promoción</label>

                                            {formData.imagenUrl ? (
                                                <div className="relative group">
                                                    <img
                                                        src={formData.imagenUrl}
                                                        alt="Preview"
                                                        className="w-full h-48 object-cover rounded-2xl border border-gray-200 shadow-sm"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, imagenUrl: '' }))}
                                                        className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div
                                                    onDragOver={handleDragOver}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={handleDrop}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                                                        isDragging
                                                            ? 'border-[#7D2121] bg-[#7D2121]/5'
                                                            : 'border-gray-200 hover:border-[#7D2121]/30 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileSelect}
                                                        className="hidden"
                                                    />
                                                    {isUploading ? (
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="w-10 h-10 border-3 border-[#7D2121]/20 border-t-[#7D2121] rounded-full animate-spin"></div>
                                                            <p className="text-sm font-bold text-gray-500">Subiendo imagen...</p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300">
                                                                <FiUploadCloud size={28} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-600">Arrastra una imagen aquí</p>
                                                                <p className="text-xs text-gray-400 mt-1">o haz clic para seleccionar - JPG, PNG, WebP</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* SECCIÓN: CONFIGURACIÓN ECONÓMICA */}
                                <div className="space-y-6 pt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-[#7D2121]/10 rounded-lg flex items-center justify-center text-[#7D2121]">
                                            <span className="font-black">$</span>
                                        </div>
                                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Precio y Descuento</h3>
                                    </div>

                                    {/* Precio original */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                                            Precio Original del Producto
                                            {tipoPromocion === 'independiente' && <span className="text-red-500 ml-1">*</span>}
                                        </label>
                                        {tipoPromocion === 'producto' && productoSeleccionado ? (
                                            <div className="w-full bg-gray-100 border-2 border-gray-200 rounded-2xl px-5 py-4 text-lg font-black text-gray-500 flex items-center justify-between">
                                                <span>{formatCurrency(productoSeleccionado.precio)}</span>
                                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Precio del producto</span>
                                            </div>
                                        ) : tipoPromocion === 'producto' ? (
                                            <div className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl px-5 py-4 text-sm text-gray-400 italic">
                                                Selecciona un producto para ver su precio
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-400">$</span>
                                                <input
                                                    type="number"
                                                    name="precioOriginal"
                                                    value={formData.precioOriginal ?? ''}
                                                    onChange={e => setFormData(prev => ({ ...prev, precioOriginal: e.target.value ? Number(e.target.value) : null }))}
                                                    placeholder="Ej: 25000"
                                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#7D2121]/20 focus:bg-white rounded-2xl pl-10 pr-5 py-4 text-lg font-black text-gray-800 outline-none transition-all placeholder:text-gray-300 placeholder:font-normal"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Tipo y valor de descuento */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Modalidad de Descuento</label>
                                            <select
                                                name="tipoDescuento"
                                                value={formData.tipoDescuento}
                                                onChange={handleInputChange}
                                                className="w-full bg-gray-50 border-2 border-transparent focus:border-[#7D2121]/20 focus:bg-white rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 outline-none transition-all cursor-pointer appearance-none"
                                            >
                                                <option value="Porcentaje">Porcentaje (%)</option>
                                                <option value="MontoFijo">Monto Fijo ($)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Valor a Descontar</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    name="valor"
                                                    value={formData.valor}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#7D2121]/20 focus:bg-white rounded-2xl px-5 py-4 text-lg font-black text-[#7D2121] outline-none transition-all"
                                                />
                                                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-gray-400">
                                                    {formData.tipoDescuento === 'Porcentaje' ? '%' : '$'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview de precios */}
                                    {(() => {
                                        const precioEfectivo = getPrecioEfectivo();
                                        const precioFinal = calcPrecioFinal(precioEfectivo);
                                        if (precioEfectivo && precioFinal !== null) {
                                            return (
                                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5">
                                                    <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-3">Vista Previa del Precio</p>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-center">
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Original</p>
                                                            <p className="text-lg font-bold text-gray-400 line-through">{formatCurrency(precioEfectivo)}</p>
                                                        </div>
                                                        <div className="text-2xl text-gray-300">&rarr;</div>
                                                        <div className="text-center">
                                                            <p className="text-[9px] font-bold text-green-600 uppercase mb-1">Con Descuento</p>
                                                            <p className="text-2xl font-black text-green-700">{formatCurrency(precioFinal)}</p>
                                                        </div>
                                                        <div className="ml-auto">
                                                            <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-sm font-black">
                                                                {formData.tipoDescuento === 'Porcentaje'
                                                                    ? `-${formData.valor}%`
                                                                    : `-${formatCurrency(formData.valor)}`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] text-gray-500 mt-2">
                                                        Ahorro: <span className="font-bold text-green-700">{formatCurrency(precioEfectivo - precioFinal)}</span>
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>

                                {/* SECCIÓN: VIGENCIA Y CÓDIGO */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-[#7D2121]/10 rounded-lg flex items-center justify-center text-[#7D2121]">
                                                <FiClock size={18} />
                                            </div>
                                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Periodo de Validez</h3>
                                        </div>

                                        <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 space-y-8">
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex justify-between">
                                                    <span>Inicio (Día y Hora)</span>
                                                    <span className="text-[#60A5FA]">Inicia hoy</span>
                                                </label>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="date"
                                                        value={formData.fechaInicio.split('T')[0] || getLocalDateString()}
                                                        onChange={e => setFormData((p: typeof initialFormState) => ({ ...p, fechaInicio: `${e.target.value}T${p.fechaInicio.split('T')[1] || '00:00'}` }))}
                                                        className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-4 text-xs font-bold focus:ring-4 focus:ring-[#7D2121]/5 focus:border-[#7D2121]/30 outline-none transition-all shadow-sm"
                                                    />
                                                    <input
                                                        type="time"
                                                        value={formData.fechaInicio.split('T')[1]?.slice(0, 5) || '00:00'}
                                                        onChange={e => setFormData((p: typeof initialFormState) => ({ ...p, fechaInicio: `${p.fechaInicio.split('T')[0] || getLocalDateString()}T${e.target.value}` }))}
                                                        className="w-28 bg-white border border-gray-200 rounded-xl px-3 py-4 text-xs font-bold focus:ring-4 focus:ring-[#7D2121]/5 focus:border-[#7D2121]/30 outline-none transition-all shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex justify-between">
                                                    <span>Cierre (Día y Hora)</span>
                                                    <span className="text-patisserie-red">Expira pronto</span>
                                                </label>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="date"
                                                        value={formData.fechaFin.split('T')[0] || getLocalDateString()}
                                                        onChange={e => setFormData((p: typeof initialFormState) => ({ ...p, fechaFin: `${e.target.value}T${p.fechaFin.split('T')[1] || '23:59'}` }))}
                                                        className={`flex-1 bg-white border rounded-xl px-4 py-4 text-xs font-bold outline-none focus:ring-4 transition-all shadow-sm ${formData.fechaInicio && formData.fechaFin && new Date(formData.fechaFin) <= new Date(formData.fechaInicio) ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:ring-[#7D2121]/5 focus:border-[#7D2121]/30'}`}
                                                    />
                                                    <input
                                                        type="time"
                                                        value={formData.fechaFin.split('T')[1]?.slice(0, 5) || '23:59'}
                                                        onChange={e => setFormData((p: typeof initialFormState) => ({ ...p, fechaFin: `${p.fechaFin.split('T')[0] || getLocalDateString()}T${e.target.value}` }))}
                                                        className={`w-28 bg-white border rounded-xl px-3 py-4 text-xs font-bold outline-none focus:ring-4 transition-all shadow-sm ${formData.fechaInicio && formData.fechaFin && new Date(formData.fechaFin) <= new Date(formData.fechaInicio) ? 'border-red-300 focus:ring-red-100' : 'border-gray-200 focus:ring-[#7D2121]/5 focus:border-[#7D2121]/30'}`}
                                                    />
                                                </div>
                                            </div>
                                            {formData.fechaInicio && formData.fechaFin && new Date(formData.fechaFin) <= new Date(formData.fechaInicio) && (
                                                <p className="bg-red-50 text-[10px] text-red-600 font-bold p-3 rounded-xl flex items-center gap-2 animate-bounce">
                                                    <FiX /> Error: El cierre debe ser después del inicio
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-[#7D2121]/10 rounded-lg flex items-center justify-center text-[#7D2121]">
                                                <FiEdit size={18} />
                                            </div>
                                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Ajustes Finales</h3>
                                        </div>

                                        <div className="space-y-4">
                                            {tipoPromocion === 'independiente' && (
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stock Disponible</label>
                                                    <input
                                                        type="number"
                                                        name="stock"
                                                        value={formData.stock ?? ''}
                                                        onChange={e => setFormData(prev => ({ ...prev, stock: e.target.value ? Number(e.target.value) : null }))}
                                                        placeholder="Vacío = ilimitado"
                                                        min={0}
                                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-[#7D2121]/20 focus:bg-white rounded-2xl px-5 py-4 text-sm font-black text-gray-700 outline-none transition-all placeholder:text-gray-300 placeholder:font-normal"
                                                    />
                                                    <p className="text-[9px] text-gray-400 ml-1">Deja vacío para stock ilimitado. Solo aplica a promociones independientes.</p>
                                                </div>
                                            )}

                                            <div className="flex flex-col gap-4 bg-[#7D2121]/5 p-6 rounded-3xl border border-[#7D2121]/10">
                                                <p className="text-[10px] font-black text-[#7D2121] uppercase tracking-[2px]">Visibilidad Web</p>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="activo"
                                                        checked={formData.activo}
                                                        onChange={handleInputChange}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7D2121]"></div>
                                                    <span className="ml-3 text-xs font-bold text-gray-700">Mostrar activamente en la tienda</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-4 text-gray-400 font-bold hover:text-gray-800 transition-colors uppercase text-[10px] tracking-widest"
                                >
                                    Descartar
                                </button>
                                <button
                                    type="submit"
                                    className="px-12 py-4 bg-[#7D2121] text-white rounded-2xl hover:bg-red-900 transition-all font-black flex items-center gap-3 shadow-xl shadow-red-900/20 active:scale-95 uppercase text-xs tracking-widest"
                                >
                                    <FiSave size={20} /> Guardar Promoción
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default PromocionesAdmin;
