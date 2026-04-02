import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

import type { Producto } from '../../types';
import api from '../../api/axios';
import {
  Edit3, Trash2, Plus, Search, X,
  Save, Image as ImageIcon,
  ChevronUp, ChevronDown, Filter, Layers, AlertCircle
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

import toast from 'react-hot-toast';
import { categoriasService } from '../../api/categoriasService';
import type { Categoria } from '../../api/categoriasService';
import CategoriasModal from '../../components/admin/CategoriasModal';
import { formatCurrency } from '../../utils/format';
import { productService } from '../../services/productService';
import { swal } from '../../utils/swal';

// El tipo Producto ya viene importado desde ../../types

// Estado inicial del formulario adaptado
const initialFormState = {
  nombre: '',
  descripcion: '',
  precio: 0,
  stock: 0,
  stockIlimitado: false,
  categoria: '',
  imagenUrl: '',
  activo: true,
  esPersonalizable: false,
  categoriaId: null as number | null
};

const ProductosAdmin = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroStock, setFiltroStock] = useState<'todos' | 'bajo' | 'agotado'>('todos');
  const [ordenarPor, setOrdenarPor] = useState<'nombre' | 'precio' | 'stock'>('nombre');
  const [ordenDireccion, setOrdenDireccion] = useState<'asc' | 'desc'>('asc');

  // Estados del Modal
  const [showModal, setShowModal] = useState(false);
  const [showCategoriasModal, setShowCategoriasModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<{ nombre?: string; precio?: string; stock?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // DRAG & DROP STATES
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  const location = useLocation();

  useEffect(() => {
    fetchProductos();
    fetchCategorias();

    // Capturar búsqueda desde la URL (AdminLayout)
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setBusqueda(searchParam);
    }
  }, [location.search]);

  const fetchCategorias = async () => {
    try {
      const response = await categoriasService.getAll();
      if (response.success && Array.isArray(response.data)) {
        setCategorias(response.data);
      }
    } catch (error) {
      console.error("Error cargando categorías");
    }
  };

  const fetchProductos = async () => {
    try {
      const response = await productService.getAll();
      let data = [];
      if (Array.isArray(response)) data = response;
      else if (response?.data && Array.isArray(response.data)) data = response.data;

      setProductos(data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  // --- MANEJADORES DEL FORMULARIO ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? Number(value) : value;
    
    // Cuando cambia la categoría, actualizar both categoria string y categoriaId (para el backend)
    if (name === 'categoria') {
      const selectedCat = categorias.find(c => c.nombre === value);
      setFormData(prev => ({ 
        ...prev, 
        categoria: value,
        categoriaId: selectedCat?.id || null,
        categoriaProductoId: selectedCat?.id || null  // También actualizar para el tipo Producto
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: finalValue }));
    }
  };

  const openNewModal = () => {
    setFormData(initialFormState);
    setErrors({});
    setIsEditing(false);
    setShowModal(true);
    document.body.classList.add('overflow-hidden');
  };

  const openEditModal = (producto: Producto) => {
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      stock: producto.stock,
      stockIlimitado: producto.stockIlimitado || false,
      categoria: producto.categoriaNombre || '',
      imagenUrl: producto.imagenUrl || '',
      activo: producto.activo,
      esPersonalizable: producto.esPersonalizable || false,
      categoriaId: producto.categoriaProductoId || null
    });
    setErrors({});
    setCurrentId(producto.id);
    setIsEditing(true);
    setShowModal(true);
    document.body.classList.add('overflow-hidden');
  };

  const validate = () => {
    const newErrors: { nombre?: string; precio?: string; stock?: string } = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (formData.precio <= 0) newErrors.precio = 'El precio debe ser mayor a 0';
    if (formData.stock < 0) newErrors.stock = 'El stock no puede ser negativo';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      if (isEditing && currentId) {
        await productService.update(currentId, formData as Partial<Producto>);
        toast.success('Producto actualizado correctamente');
      } else {
        await productService.create(formData as any);
        toast.success('Producto creado exitosamente');
      }
      setShowModal(false);
      document.body.classList.remove('overflow-hidden');
      fetchProductos();
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar el producto');
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await swal.deleteConfirm(`el producto #${id}`);
    if (!confirmed) return;
    try {
      await productService.delete(id);
      toast.success('Producto eliminado');
      fetchProductos();
    } catch (error) {
      toast.error('No se pudo eliminar');
    }
  };

  const listaSegura = Array.isArray(productos) ? productos : [];

  const productosFiltrados = listaSegura.filter(p => {
    const query = busqueda.toLowerCase().trim();
    const matchesBusqueda = !query ||
      (p.nombre?.toLowerCase() || '').includes(query) ||
      (p.categoriaNombre?.toLowerCase() || '').includes(query) ||
      (p.descripcion?.toLowerCase() || '').includes(query) ||
      p.id.toString() === query || `#${p.id} ` === query || p.id.toString().includes(query);

    const matchesCategoria = !filtroCategoria || p.categoriaNombre === filtroCategoria;

    let matchesStock = true;
    if (filtroStock === 'bajo') matchesStock = !p.stockIlimitado && p.stock > 0 && p.stock < 10;
    else if (filtroStock === 'agotado') matchesStock = !p.stockIlimitado && p.stock <= 0;

    // Si el producto tiene stock ilimitado, nunca coincide con filtros de stock
    if (p.stockIlimitado && (filtroStock === 'bajo' || filtroStock === 'agotado')) {
      matchesStock = false;
    }

    return matchesBusqueda && matchesCategoria && matchesStock;
  });

  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    let valA: any = a[ordenarPor];
    let valB: any = b[ordenarPor];

    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (valA < valB) return ordenDireccion === 'asc' ? -1 : 1;
    if (valA > valB) return ordenDireccion === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleOrden = (key: 'nombre' | 'precio' | 'stock') => {
    if (ordenarPor === key) {
      setOrdenDireccion(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenarPor(key);
      setOrdenDireccion('asc');
    }
  };

  return (
    <div className="animate-fade-in p-2 pb-20">
      {/* Cabecera Premium */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-black text-[#5D1919] tracking-tighter mb-2">Catálogo Maestro</h1>
          <p className="text-gray-500 font-medium text-sm">Control total de inventario, precios y visualización de productos</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowCategoriasModal(true)}
            className="bg-white text-gray-700 border border-gray-100 px-4 py-2.5 rounded-2xl flex items-center gap-3 hover:bg-gray-50 transition-all shadow-sm font-black uppercase tracking-widest text-[10px]"
          >
            <Layers size={16} className="text-gray-400" /> Gestionar Categorías
          </button>
          <button
            onClick={openNewModal}
            className="bg-[#5D1919] text-white px-6 py-2.5 rounded-2xl flex items-center gap-3 hover:bg-[#7D2121] transition-all shadow-xl shadow-[#5D1919]/20 font-black uppercase tracking-widest text-[10px]"
          >
            <Plus size={18} strokeWidth={3} /> Añadir Producto
          </button>
        </div>
      </div>

      {/* Main Container - Premium Card */}
      <div className="bg-white rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
        {/* Filter Bar Redesigned */}
        <div className="p-4 md:p-8 border-b border-gray-50 flex flex-wrap items-center gap-4 bg-[#fcfcfc]">
          <div className="flex-1 min-w-[200px] relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#5D1919] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre, ID o categoría..."
              className="w-full bg-white border border-gray-200 rounded-[1.25rem] pl-12 pr-4 py-3 text-sm font-medium outline-none focus:ring-4 focus:ring-[#5D1919]/5 focus:border-[#5D1919]/20 transition-all shadow-inner"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Colección</span>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="bg-gray-100/50 border-none rounded-xl pl-9 pr-8 py-2.5 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#5D1919]/10 appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <option value="">Todas las Categorías</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Disponibilidad</span>
              <select
                value={filtroStock}
                onChange={(e) => setFiltroStock(e.target.value as any)}
                className="bg-gray-100/50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#5D1919]/10 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <option value="todos">Vistazo General</option>
                <option value="bajo">Stock Crítico</option>
                <option value="agotado">Agotados</option>
              </select>
            </div>

            {(busqueda || filtroCategoria || filtroStock !== 'todos') && (
              <button
                onClick={() => { setBusqueda(''); setFiltroCategoria(''); setFiltroStock('todos'); }}
                className="mt-5 px-4 py-2 text-[10px] font-black text-rose-600 hover:bg-rose-50 rounded-xl transition-all flex items-center gap-2"
              >
                <X size={14} /> Resetear
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-[#fcfcfc] border-b border-gray-50">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Imagen</th>
                <th className="px-8 py-6 cursor-pointer group" onClick={() => toggleOrden('nombre')}>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Producto
                    {ordenarPor === 'nombre' ? (
                      ordenDireccion === 'asc' ? <ChevronUp size={14} className="text-[#5D1919]" /> : <ChevronDown size={14} className="text-[#5D1919]" />
                    ) : <ChevronUp size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </div>
                </th>
                <th className="px-8 py-6 cursor-pointer group" onClick={() => toggleOrden('precio')}>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Precio
                    {ordenarPor === 'precio' ? (
                      ordenDireccion === 'asc' ? <ChevronUp size={14} className="text-[#5D1919]" /> : <ChevronDown size={14} className="text-[#5D1919]" />
                    ) : <ChevronUp size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </div>
                </th>
                <th className="px-8 py-6 cursor-pointer group" onClick={() => toggleOrden('stock')}>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Suministro
                    {ordenarPor === 'stock' ? (
                      ordenDireccion === 'asc' ? <ChevronUp size={14} className="text-[#5D1919]" /> : <ChevronDown size={14} className="text-[#5D1919]" />
                    ) : <ChevronUp size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </div>
                </th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-20 font-serif italic text-gray-400">Cargando catálogo...</td></tr>
              ) : productosOrdenados.map((prod) => (
                <tr key={prod.id} className="hover:bg-[#5D1919]/[0.02] transition-all group">
                  <td className="px-8 py-5">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 overflow-hidden shadow-sm border border-gray-100 group-hover:scale-105 transition-transform duration-500">
                      <img
                        src={prod.imagenUrl || 'https://via.placeholder.com/60'}
                        alt={prod.nombre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-serif font-black text-gray-900 group-hover:text-[#5D1919] transition-colors">{prod.nombre}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">ID: #{prod.id}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-black text-[#5D1919] text-base">{formatCurrency(prod.precio)}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      {prod.stockIlimitado ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border bg-emerald-50 text-emerald-600 border-emerald-100">
                          Ilimitado
                        </span>
                      ) : (
                        <>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border ${prod.stock < 10 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                            {prod.stock} unidades
                          </span>
                          {prod.stock < 10 && (
                            <span className="flex items-center gap-1 text-[9px] font-black text-rose-500 uppercase tracking-tighter ml-1">
                              <AlertCircle size={10} /> {prod.stock === 0 ? 'Agotado' : 'Stock Crítico'}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(prod)}
                        className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-[#5D1919] hover:text-white transition-all shadow-sm border border-gray-100"
                        title="Configurar Parámetros"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id)}
                        className="p-2.5 bg-gray-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-gray-100"
                        title="Retirar del Catálogo"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL (FORMULARIO PRODUCTO) --- */}
      {showModal && createPortal(
        <div role="dialog" className="fixed inset-0 bg-[#5D1919]/20 flex items-center justify-center z-[2000] p-4 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] w-[95vw] md:w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] border border-[#5D1919]/10">
            <div className="bg-[#5D1919] text-white px-6 md:px-10 py-6 md:py-8 flex justify-between items-center shrink-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[5rem] -mr-10 -mt-10"></div>
              <h3 className="font-serif font-black text-2xl tracking-tight">
                {isEditing ? 'Refinar Producto' : 'Nueva Creación'}
              </h3>
              <button
                onClick={() => { setShowModal(false); document.body.classList.remove('overflow-hidden'); }}
                className="hover:bg-white/10 p-2 rounded-full transition-all relative z-10"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 md:p-8 overflow-y-auto flex-1 bg-gradient-to-br from-gray-50 to-gray-100/50 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Columna Izquierda - Imagen y Info Principal */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Card de Imagen */}
                  <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Imagen del Producto</label>
                    <div
                      onClick={() => !isUploading && fileInputRef.current?.click()}
                      className={`relative aspect-square rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group ${
                        isDragging ? 'border-[#5D1919] bg-[#5D1919]/5' : 'border-gray-200 hover:border-[#5D1919]/40'
                      } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {formData.imagenUrl ? (
                        <>
                          <img src={formData.imagenUrl} className="w-full h-full object-cover" alt="preview" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                            <span className="text-white text-xs font-black uppercase tracking-widest">Cambiar</span>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="text-gray-400" size={28} />
                          </div>
                          <span className="text-xs font-medium text-gray-400">Arrastra o sube</span>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                        disabled={isUploading}
                      />
                    </div>
                    {formData.imagenUrl && !isUploading && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, imagenUrl: '' }))}
                        className="w-full mt-4 py-3 bg-rose-50 text-rose-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 size={14} /> Eliminar Imagen
                      </button>
                    )}
                  </div>

                  {/* Card de Estado */}
                  <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Estado</label>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${formData.activo ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-300'}`}></div>
                        <span className={`text-sm font-bold ${formData.activo ? 'text-green-600' : 'text-gray-400'}`}>
                          {formData.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.activo}
                          onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-8 bg-gray-200 peer-checked:bg-[#5D1919] rounded-full transition-all duration-300 shadow-inner"></div>
                        <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-6"></div>
                      </label>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-3">
                      {formData.activo ? 'Visible en catálogo público' : 'Oculto para clientes'}
                    </p>
                  </div>
                </div>

                {/* Columna Derecha - Datos del Producto */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Card Principal */}
                  <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 space-y-5">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Nombre del Producto</label>
                      <input
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className={`w-full bg-gray-50 border rounded-xl px-5 py-3.5 text-base font-semibold focus:ring-4 outline-none transition-all ${
                          errors.nombre 
                            ? 'border-rose-400 focus:ring-rose-100 bg-rose-50/30' 
                            : 'border-gray-200 focus:ring-[#5D1919]/10 focus:border-[#5D1919]'
                        }`}
                        placeholder="Ej: Tarta Ópera Real"
                      />
                      {errors.nombre && (
                        <p className="text-xs text-rose-500 mt-2 font-semibold flex items-center gap-1 ml-1">
                          <AlertCircle size={12} /> {errors.nombre}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Descripción</label>
                      <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-200 px-5 py-3.5 rounded-xl outline-none focus:ring-4 focus:ring-[#5D1919]/10 focus:border-[#5D1919] text-sm resize-none h-28"
                        placeholder="Describe los matices, ingredientes y experiencia del producto..."
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Precio</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                          <input
                            type="number"
                            name="precio"
                            value={formData.precio}
                            onChange={handleInputChange}
                            onFocus={(e) => e.target.select()}
                            className={`w-full bg-gray-50 border pl-8 pr-4 py-3.5 rounded-xl outline-none focus:ring-4 font-semibold ${
                              errors.precio 
                                ? 'border-rose-400 focus:ring-rose-100' 
                                : 'border-gray-200 focus:ring-[#5D1919]/10 focus:border-[#5D1919]'
                            }`}
                          />
                        </div>
                        {errors.precio && <p className="text-xs text-rose-500 font-semibold ml-1"><AlertCircle size={10} /> {errors.precio}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Stock</label>
                        <div className="relative">
                          <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleInputChange}
                            onFocus={(e) => e.target.select()}
                            disabled={formData.stockIlimitado}
                            className={`w-full bg-gray-50 border px-4 py-3.5 rounded-xl outline-none focus:ring-4 font-semibold disabled:bg-gray-100 disabled:text-gray-400 ${
                              errors.stock 
                                ? 'border-rose-400 focus:ring-rose-100' 
                                : 'border-gray-200 focus:ring-[#5D1919]/10 focus:border-[#5D1919]'
                            }`}
                          />
                          {formData.stockIlimitado && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg">ILIMITADO</span>
                          )}
                          {!formData.stockIlimitado && formData.stock === 0 && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-rose-500 bg-rose-100 px-2 py-1 rounded-lg">AGOTADO</span>
                          )}
                          {!formData.stockIlimitado && formData.stock > 0 && formData.stock < 10 && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-lg">BAJO</span>
                          )}
                        </div>
                        {errors.stock && <p className="text-xs text-rose-500 font-semibold ml-1"><AlertCircle size={10} /> {errors.stock}</p>}
                      </div>

                      <div className="flex items-center gap-3 py-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="stockIlimitado"
                            checked={formData.stockIlimitado}
                            onChange={(e) => setFormData(prev => ({ ...prev, stockIlimitado: e.target.checked, stock: e.target.checked ? 0 : prev.stock }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5D1919]/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                          <span className="ml-3 text-sm font-bold text-gray-600">Stock Ilimitado</span>
                        </label>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Categoría</label>
                        <div className="relative">
                          <select
                            name="categoria"
                            value={formData.categoria}
                            onChange={handleInputChange}
                            className="w-full bg-gray-50 border border-gray-200 px-4 py-3.5 rounded-xl outline-none focus:ring-4 focus:ring-[#5D1919]/10 focus:border-[#5D1919] font-semibold appearance-none cursor-pointer"
                          >
                            <option value="">Seleccionar...</option>
                            {categorias.map(cat => (
                              <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                            ))}
                          </select>
                          <Layers className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card de Acciones */}
                  <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button
                      type="button"
                      onClick={() => { setShowModal(false); document.body.classList.remove('overflow-hidden'); }}
                      className="px-8 py-3.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-all rounded-xl hover:bg-gray-100 w-full sm:w-auto"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="w-full sm:w-auto bg-gradient-to-r from-[#5D1919] to-[#7D2121] text-white px-10 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider hover:shadow-xl hover:shadow-[#5D1919]/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save size={18} /> {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div >,
        document.body
      )}

      {/* --- MODAL DE CATEGORÍAS --- */}
      {
        showCategoriasModal && createPortal(
          <CategoriasModal
            onClose={() => setShowCategoriasModal(false)}
            onChange={fetchCategorias}
          />,
          document.body
        )
      }
    </div >
  );
};

export default ProductosAdmin;