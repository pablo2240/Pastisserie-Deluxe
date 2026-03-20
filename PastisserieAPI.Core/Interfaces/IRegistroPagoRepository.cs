using PastisserieAPI.Core.Entities;

namespace PastisserieAPI.Core.Interfaces
{
    public interface IRegistroPagoRepository
    {
        Task<RegistroPago?> GetByIdAsync(int id);
        Task<IEnumerable<RegistroPago>> GetAllAsync();
        Task<RegistroPago> AddAsync(RegistroPago entity);
        Task UpdateAsync(RegistroPago entity);
        Task DeleteAsync(RegistroPago entity);
        Task<RegistroPago?> GetByPedidoIdAsync(int pedidoId);
        Task<IEnumerable<RegistroPago>> GetByUsuarioIdAsync(int usuarioId);
        Task<RegistroPago?> GetUltimoIntentoAsync(int pedidoId);
    }
}
