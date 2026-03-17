using PastisserieAPI.Services.DTOs.Response;

namespace PastisserieAPI.Services.Services.Interfaces
{
    public interface IEnvioService
    {
        Task<List<EnvioResponseDto>> GetAllAsync();
        Task<EnvioResponseDto?> GetByIdAsync(int id);
        Task<EnvioResponseDto?> UpdateEstadoAsync(int id, string estado);
    }
}
