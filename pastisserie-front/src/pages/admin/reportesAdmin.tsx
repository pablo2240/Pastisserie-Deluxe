import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FiAlertCircle, FiX, FiUser, FiClock, FiEye
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { reclamacionesService, type Reclamacion } from '../../services/reclamacionesService';
import { formatMedellinDate, formatMedellinDateTime } from '../../utils/format';

const ReportesAdmin = () => {
  // Reclamaciones (Solicitud de reporte)
  const [reclamaciones, setReclamaciones] = useState<Reclamacion[]>([]);
  const [loadingReclamos, setLoadingReclamos] = useState(true);
  const [selectedReclamo, setSelectedReclamo] = useState<Reclamacion | null>(null);

  useEffect(() => {
    fetchReclamaciones();
  }, []);

  const fetchReclamaciones = async () => {
    try {
      setLoadingReclamos(true);
      const response = await reclamacionesService.getAllReclamaciones();
      setReclamaciones(response.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar solicitudes de reporte');
    } finally {
      setLoadingReclamos(false);
    }
  };

  const updateReclamoEstado = async (id: number, estado: string) => {
    try {
      await reclamacionesService.updateEstado(id, estado);
      toast.success('Estado actualizado');
      fetchReclamaciones();
      setSelectedReclamo(null);
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const getReclamoStatusStyle = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'EnRevision': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Resuelta': return 'bg-green-100 text-green-700 border-green-200';
      case 'Rechazada': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Map estado labels for display
  const getReclamoEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return 'No entregado';
      case 'EnRevision': return 'En Revision';
      case 'Resuelta': return 'Entregado';
      case 'Rechazada': return 'Rechazada';
      default: return estado;
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
        <p className="text-gray-500">Gestiona solicitudes de reporte.</p>
      </div>

      {/* === SOLICITUD DE REPORTE (Reclamaciones) === */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
              <tr>
<th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Pedido</th>
                <th className="px-6 py-4">Detalle</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingReclamos ? (
                <tr><td colSpan={6} className="text-center py-10">Cargando...</td></tr>
              ) : reclamaciones.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No hay solicitudes de reporte.</td></tr>
              ) : (
                reclamaciones.sort((a, b) => b.id - a.id).map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-2">
                      <div className="p-1 bg-gray-100 rounded text-gray-500"><FiUser /></div>
                      {r.nombreUsuario || `Usuario #${r.usuarioId}`}
                    </td>
                    <td className="px-6 py-4 font-bold">#{r.pedidoId}</td>
                    <td className="px-6 py-4 max-w-[250px] truncate" title={r.motivo}>{r.motivo}</td>
                    <td className="px-6 py-4">{formatMedellinDate(r.fecha)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getReclamoStatusStyle(r.estado)}`}>
                        {getReclamoEstadoLabel(r.estado)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedReclamo(r)}
                        className="bg-gray-100 hover:bg-[#7D2121] hover:text-white text-gray-600 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all font-bold text-xs mx-auto shadow-sm"
                      >
                        <FiEye /> Detalle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* === MODAL DETALLE RECLAMO === */}
      {selectedReclamo && createPortal(
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh] overflow-hidden animate-scale-in">
            <div className="bg-[#7D2121] text-white px-6 py-5 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2"><FiAlertCircle /> Solicitud de Reporte</h2>
                <p className="text-white/70 text-xs mt-1">{formatMedellinDateTime(selectedReclamo.fecha)}</p>
              </div>
              <button onClick={() => setSelectedReclamo(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-xs">Usuario:</span>
                  <span className="font-bold text-gray-800 text-sm">{selectedReclamo.nombreUsuario || `Usuario #${selectedReclamo.usuarioId}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-xs">Pedido:</span>
                  <span className="font-bold text-[#7D2121] text-sm">#{selectedReclamo.pedidoId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Estado:</span>
                  <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getReclamoStatusStyle(selectedReclamo.estado)}`}>
                    {getReclamoEstadoLabel(selectedReclamo.estado)}
                  </span>
                </div>
              </div>

              {/* Información del Domiciliario (si existe) */}
              {selectedReclamo.motivoDomiciliario && (
                <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Reporte del Domiciliario</h3>
                  <div className="bg-orange-50 rounded-xl p-5 border border-orange-100 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-orange-600 text-xs">Domiciliario:</span>
                      <span className="font-bold text-gray-800 text-sm">{selectedReclamo.nombreDomiciliario || 'Domiciliario'}</span>
                    </div>
                    {selectedReclamo.fechaNoEntrega && (
                      <div className="flex justify-between">
                        <span className="text-orange-600 text-xs">Fecha No Entrega:</span>
                        <span className="font-bold text-gray-800 text-sm">{formatMedellinDateTime(selectedReclamo.fechaNoEntrega)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-orange-600 text-xs">Motivo:</span>
                      <span className="font-bold text-gray-800 text-sm">{selectedReclamo.motivoDomiciliario}</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Descripcion de la solicitud</h3>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedReclamo.motivo}</p>
                </div>
              </div>

              {/* Estado control */}
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <FiClock className="text-[#7D2121]" /> Actualizar Estado
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {['Pendiente', 'EnRevision', 'Resuelta', 'Rechazada'].map((estado) => (
                    <button
                      key={estado}
                      onClick={() => updateReclamoEstado(selectedReclamo.id, estado)}
                      disabled={selectedReclamo.estado === estado}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${selectedReclamo.estado === estado
                        ? 'bg-[#7D2121] text-white border-[#7D2121] cursor-default'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#7D2121] hover:text-[#7D2121]'
                        }`}
                    >
                      {estado === 'Pendiente' ? 'No entregado' : estado === 'Resuelta' ? 'Entregado' : estado === 'EnRevision' ? 'En Revision' : estado}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t flex justify-end shrink-0">
              <button
                onClick={() => setSelectedReclamo(null)}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold text-sm transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ReportesAdmin;
