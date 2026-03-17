using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PastisserieAPI.Services.DTOs.Common;
using PastisserieAPI.Services.Services.Interfaces;

namespace PastisserieAPI.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class EnviosController : ControllerBase
    {
        private readonly IEnvioService _envioService;

        public EnviosController(IEnvioService envioService)
        {
            _envioService = envioService;
        }

        /// <summary>Admin: Obtiene todos los envios.</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _envioService.GetAllAsync();
            return Ok(ApiResponse<object>.SuccessResponse(result));
        }

        /// <summary>Admin: Obtiene un envio por ID.</summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _envioService.GetByIdAsync(id);
            if (result == null)
                return NotFound(ApiResponse<string>.ErrorResponse("Envio no encontrado"));
            return Ok(ApiResponse<object>.SuccessResponse(result));
        }

        /// <summary>Admin: Actualiza el estado de un envio.</summary>
        [HttpPut("{id}/estado")]
        public async Task<IActionResult> UpdateEstado(int id, [FromBody] UpdateEstadoEnvioRequest request)
        {
            var result = await _envioService.UpdateEstadoAsync(id, request.Estado);
            if (result == null)
                return NotFound(ApiResponse<string>.ErrorResponse("Envio no encontrado"));
            return Ok(ApiResponse<object>.SuccessResponse(result, "Estado del envio actualizado"));
        }
    }

    public class UpdateEstadoEnvioRequest
    {
        public string Estado { get; set; } = string.Empty;
    }
}
