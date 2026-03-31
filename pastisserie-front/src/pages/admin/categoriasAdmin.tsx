import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { categoriasService } from '../../api/categoriasService';
import { FiEdit, FiTrash2, FiPlus, FiFolder, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { swal } from '../../utils/swal';

interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  activa?: boolean;
}

const CategoriasAdmin = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await categoriasService.getAll();
      setCategorias(response.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    
    try {
      if (editando) {
        await categoriasService.update(editando.id, formData);
        toast.success('Categoría actualizada');
      } else {
        await categoriasService.create(formData);
        toast.success('Categoría creada');
      }
      setShowModal(false);
      setEditando(null);
      setFormData({ nombre: '', descripcion: '' });
      fetchCategorias();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar categoría');
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await swal.deleteConfirm('esta categoría');
    if (!confirmed) return;
    try {
      await api.delete(`/categorias/${id}`);
      toast.success('Categoría eliminada');
      fetchCategorias();
    } catch (error) {
      toast.error('Error al eliminar. Puede que tenga productos asociados.');
    }
  };

  const abrirEditar = (cat: Categoria) => {
    setEditando(cat);
    setFormData({ nombre: cat.nombre, descripcion: cat.descripcion || '' });
    setShowModal(true);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>
          <p className="text-gray-500">Organiza tus productos</p>
        </div>
        <button 
          onClick={() => { setShowModal(true); setEditando(null); setFormData({ nombre: '', descripcion: '' }); }}
          className="bg-[#7D2121] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-red-900 transition-colors shadow-md"
        >
          <FiPlus /> Nueva Categoría
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={3} className="text-center py-8">Cargando...</td></tr>
              ) : categorias.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-8">No hay categorías registradas.</td></tr>
              ) : (
                categorias.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">#{cat.id}</td>
                    <td className="px-6 py-4 font-bold text-gray-800 flex items-center gap-2">
                        <FiFolder className="text-[#EBCfa8]" /> {cat.nombre}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => abrirEditar(cat)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editando ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button 
                onClick={() => { setShowModal(false); setEditando(null); }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D2121] focus:border-transparent"
                  placeholder="Ej: Tortas, Panadería, Postres"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D2121] focus:border-transparent"
                  placeholder="Descripción opcional..."
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-[#7D2121] text-white py-2 px-4 rounded-lg hover:bg-red-900 transition-colors font-medium"
              >
                {editando ? 'Actualizar' : 'Crear'}
              </button>
              <button
                onClick={() => { setShowModal(false); setEditando(null); }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriasAdmin;
