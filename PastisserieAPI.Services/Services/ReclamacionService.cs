using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PastisserieAPI.Core.Entities;
using PastisserieAPI.Core.Interfaces;
using PastisserieAPI.Services.DTOs.Response;
using PastisserieAPI.Services.Services.Interfaces;

namespace PastisserieAPI.Services.Services
{
    public class ReclamacionService : IReclamacionService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly INotificacionService _notificacionService;
        private readonly ILogger<ReclamacionService> _logger;

        public ReclamacionService(IUnitOfWork unitOfWork, INotificacionService notificacionService, ILogger<ReclamacionService> logger)
        {
            _unitOfWork = unitOfWork;
            _notificacionService = notificacionService;
            _logger = logger;
        }

        public async Task<ReclamacionResponseDto> CreateAsync(int usuarioId, int pedidoId, string motivo)
        {
            // 1. Verificar que el pedido existe
            var pedido = await _unitOfWork.Pedidos.GetByIdAsync(pedidoId);
            if (pedido == null)
                throw new Exception("Pedido no encontrado.");

            // 2. Verificar que el pedido pertenece al usuario
            if (pedido.UsuarioId != usuarioId)
                throw new Exception("No tienes permiso para reclamar este pedido.");

            // 3. Verificar que el pedido está en estado "NoEntregado"
            if (pedido.Estado != "NoEntregado")
                throw new Exception("Solo puedes reclamar pedidos que no fueron entregados. Si tu pedido fue entregado exitosamente, no puedes generar una reclamación.");

            // 4. Verificar plazo de 3 días hábiles desde la fecha de no entrega
            if (pedido.FechaNoEntrega.HasValue)
            {
                var fechaNoEntrega = pedido.FechaNoEntrega.Value;
                var fechaActual = DateTime.UtcNow.AddHours(-5); // Hora de Colombia
                
                // Calcular días hábiles transcurridos
                var diasHabiles = 0;
                var fechaTemporal = fechaNoEntrega.Date;
                
                while (fechaTemporal <= fechaActual.Date)
                {
                    // No contar domingos (DayOfWeek.Sunday = 0)
                    if (fechaTemporal.DayOfWeek != DayOfWeek.Sunday)
                    {
                        diasHabiles++;
                    }
                    fechaTemporal = fechaTemporal.AddDays(1);
                }
                
                // DiasHabiles-1 porque el día de no entrega cuenta como día 1
                var diasTranscurridos = diasHabiles - 1;
                
                if (diasTranscurridos > 3)
                {
                    throw new Exception($"El plazo para reclamar ha vencido. Tienes 3 días hábiles desde la fecha de no entrega ({fechaNoEntrega:dd/MM/yyyy}) para crear una reclamación.");
                }
            }

            // 5. Verificar que no haya ya una reclamación pendiente para el mismo pedido
            var existente = await _unitOfWork.Reclamaciones.FindAsync(r => r.PedidoId == pedidoId && r.UsuarioId == usuarioId && r.Estado == "Pendiente");
            if (existente.Any())
                throw new Exception("Ya tienes una reclamación pendiente para este pedido.");

            // 6. Crear la reclamación (incluir datos del domiciliario si existen)
            var reclamacion = new Reclamacion
            {
                PedidoId = pedidoId,
                UsuarioId = usuarioId,
                Fecha = DateTime.UtcNow.AddHours(-5),
                Motivo = motivo,
                Estado = "Pendiente",
                // Datos del domiciliario (registrados cuando se marcó como NoEntregado)
                MotivoDomiciliario = pedido.MotivoNoEntrega,
                FechaNoEntrega = pedido.FechaNoEntrega,
                DomiciliarioId = pedido.RepartidorId
            };

            await _unitOfWork.Reclamaciones.AddAsync(reclamacion);
            await _unitOfWork.SaveChangesAsync();

            // 7. Notificar al usuario
            try
            {
                await _notificacionService.CrearNotificacionAsync(
                    usuarioId,
                    "Reclamación Recibida",
                    $"Tu reclamación para el Pedido #{pedidoId} ha sido registrada y está en revisión.",
                    "Reclamacion",
                    "/reclamaciones"
                );

                // Notificar también al(los) Administrador(es)
                var admins = (await _unitOfWork.Users.GetAllAsync()).Where(u => u.Id == 1 || (u.Email != null && u.Email.Contains("admin")));
                foreach (var admin in admins)
                {
                    await _notificacionService.CrearNotificacionAsync(
                        admin.Id,
                        "Nueva Reclamación ⚠️",
                        $"El usuario #{usuarioId} ha creado una reclamación para el Pedido #{pedidoId}.",
                        "Reclamacion",
                        "/admin/reclamaciones"
                    );
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error al enviar notificación de reclamación para usuario {UsuarioId}, pedido {PedidoId}", usuarioId, pedidoId);
            }

            var usuario = await _unitOfWork.Users.GetByIdAsync(usuarioId);
            return MapToDto(reclamacion, usuario?.Nombre ?? "");
        }

        public async Task<List<ReclamacionResponseDto>> GetByUsuarioIdAsync(int usuarioId)
        {
            var reclamaciones = await _unitOfWork.Reclamaciones.FindAsync(r => r.UsuarioId == usuarioId);
            var lista = reclamaciones.OrderByDescending(r => r.Fecha).ToList();

            var dtos = new List<ReclamacionResponseDto>();
            foreach (var r in lista)
            {
                var usuario = await _unitOfWork.Users.GetByIdAsync(r.UsuarioId);
                var domiciliario = r.DomiciliarioId.HasValue ? await _unitOfWork.Users.GetByIdAsync(r.DomiciliarioId.Value) : null;
                dtos.Add(MapToDto(r, usuario?.Nombre ?? "", domiciliario?.Nombre));
            }
            return dtos;
        }

        public async Task<List<ReclamacionResponseDto>> GetAllAsync()
        {
            var reclamaciones = await _unitOfWork.Reclamaciones.GetAllAsync();
            var lista = reclamaciones.OrderByDescending(r => r.Fecha).ToList();

            var dtos = new List<ReclamacionResponseDto>();
            foreach (var r in lista)
            {
                var usuario = await _unitOfWork.Users.GetByIdAsync(r.UsuarioId);
                var domiciliario = r.DomiciliarioId.HasValue ? await _unitOfWork.Users.GetByIdAsync(r.DomiciliarioId.Value) : null;
                dtos.Add(MapToDto(r, usuario?.Nombre ?? "", domiciliario?.Nombre));
            }
            return dtos;
        }

        public async Task<ReclamacionResponseDto?> UpdateEstadoAsync(int id, string estado)
        {
            var reclamacion = await _unitOfWork.Reclamaciones.GetByIdAsync(id);
            if (reclamacion == null) return null;

            reclamacion.Estado = estado;
            await _unitOfWork.Reclamaciones.UpdateAsync(reclamacion);
            await _unitOfWork.SaveChangesAsync();

            // Notificar al usuario del cambio
            try
            {
                await _notificacionService.CrearNotificacionAsync(
                    reclamacion.UsuarioId,
                    "Actualización de Reclamación",
                    $"Tu reclamación para el Pedido #{reclamacion.PedidoId} ha sido actualizada: {estado}.",
                    "Reclamacion",
                    "/reclamaciones"
                );
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error al enviar notificación de actualización de reclamación {ReclamacionId}", id);
            }

            var usuario = await _unitOfWork.Users.GetByIdAsync(reclamacion.UsuarioId);
            var domiciliario = reclamacion.DomiciliarioId.HasValue ? await _unitOfWork.Users.GetByIdAsync(reclamacion.DomiciliarioId.Value) : null;
            return MapToDto(reclamacion, usuario?.Nombre ?? "", domiciliario?.Nombre);
        }

        private ReclamacionResponseDto MapToDto(Reclamacion r, string nombreUsuario, string? nombreDomiciliario = null)
        {
            return new ReclamacionResponseDto
            {
                Id = r.Id,
                PedidoId = r.PedidoId,
                UsuarioId = r.UsuarioId,
                NombreUsuario = nombreUsuario,
                Fecha = r.Fecha,
                Motivo = r.Motivo,
                Estado = r.Estado,
                MotivoDomiciliario = r.MotivoDomiciliario,
                FechaNoEntrega = r.FechaNoEntrega,
                DomiciliarioId = r.DomiciliarioId,
                NombreDomiciliario = nombreDomiciliario
            };
        }
    }
}
