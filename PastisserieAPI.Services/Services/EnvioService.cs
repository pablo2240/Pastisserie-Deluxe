using PastisserieAPI.Core.Interfaces;
using PastisserieAPI.Services.DTOs.Response;
using PastisserieAPI.Services.Services.Interfaces;

namespace PastisserieAPI.Services.Services
{
    public class EnvioService : IEnvioService
    {
        private readonly IUnitOfWork _unitOfWork;

        public EnvioService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<List<EnvioResponseDto>> GetAllAsync()
        {
            var envios = await _unitOfWork.Envios.GetAllAsync();
            var lista = envios.OrderByDescending(e => e.FechaDespacho).ToList();

            var dtos = new List<EnvioResponseDto>();
            foreach (var e in lista)
            {
                var pedido = await _unitOfWork.Pedidos.GetByIdWithDetailsAsync(e.PedidoId);
                var repartidor = e.RepartidorId.HasValue
                    ? await _unitOfWork.Users.GetByIdAsync(e.RepartidorId.Value)
                    : null;

                dtos.Add(MapToDto(e, pedido, repartidor?.Nombre, pedido?.Usuario?.Nombre));
            }
            return dtos;
        }

        public async Task<EnvioResponseDto?> GetByIdAsync(int id)
        {
            var envio = await _unitOfWork.Envios.GetByIdAsync(id);
            if (envio == null) return null;

            var pedido = await _unitOfWork.Pedidos.GetByIdWithDetailsAsync(envio.PedidoId);
            var repartidor = envio.RepartidorId.HasValue
                ? await _unitOfWork.Users.GetByIdAsync(envio.RepartidorId.Value)
                : null;

            return MapToDto(envio, pedido, repartidor?.Nombre, pedido?.Usuario?.Nombre);
        }

        public async Task<EnvioResponseDto?> UpdateEstadoAsync(int id, string estado)
        {
            var envio = await _unitOfWork.Envios.GetByIdAsync(id);
            if (envio == null) return null;

            envio.Estado = estado;
            envio.FechaActualizacion = DateTime.UtcNow;

            if (estado == "Entregado")
                envio.FechaEntrega = DateTime.UtcNow;

            await _unitOfWork.Envios.UpdateAsync(envio);
            await _unitOfWork.SaveChangesAsync();

            return await GetByIdAsync(id);
        }

        private EnvioResponseDto MapToDto(
            PastisserieAPI.Core.Entities.Envio envio,
            PastisserieAPI.Core.Entities.Pedido? pedido,
            string? nombreRepartidor,
            string? nombreCliente)
        {
            return new EnvioResponseDto
            {
                Id = envio.Id,
                PedidoId = envio.PedidoId,
                RepartidorId = envio.RepartidorId,
                NombreRepartidor = nombreRepartidor,
                NombreCliente = nombreCliente,
                NumeroGuia = envio.NumeroGuia,
                Estado = envio.Estado,
                FechaDespacho = envio.FechaDespacho,
                FechaEntrega = envio.FechaEntrega,
                FechaActualizacion = envio.FechaActualizacion,
                DireccionEnvio = pedido?.DireccionEnvio?.Direccion,
                TotalPedido = pedido?.Total ?? 0
            };
        }
    }
}
