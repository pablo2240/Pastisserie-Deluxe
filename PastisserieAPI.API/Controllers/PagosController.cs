using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PastisserieAPI.Core.Interfaces;
using PastisserieAPI.Services.DTOs.Common;
using System.Security.Claims;

namespace PastisserieAPI.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PagosController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<PagosController> _logger;

        public PagosController(
            IUnitOfWork unitOfWork,
            ILogger<PagosController> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        /// <summary>
        /// Simula la aprobación de un pago (para entorno de desarrollo/pruebas)
        /// </summary>
        [HttpPost("simular-pago/{pedidoId}")]
        [Authorize]
        public async Task<IActionResult> SimularPago(int pedidoId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(ApiResponse<string>.ErrorResponse("Usuario no identificado en token"));
            }

            try
            {
                var pedido = await _unitOfWork.Pedidos.GetByIdAsync(pedidoId);

                if (pedido == null)
                {
                    return NotFound(ApiResponse<string>.ErrorResponse("Pedido no encontrado"));
                }

                if (pedido.UsuarioId != userId)
                {
                    return Forbid();
                }

                // Simular pago aprobado
                pedido.Estado = "Confirmado";
                pedido.Aprobado = true;
                pedido.FechaAprobacion = DateTime.UtcNow;
                await _unitOfWork.Pedidos.UpdateAsync(pedido);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Pago simulado aprobado para pedido {PedidoId}", pedidoId);

                return Ok(ApiResponse<object>.SuccessResponse(new
                {
                    pedidoId = pedido.Id,
                    estado = pedido.Estado,
                    aprobado = pedido.Aprobado,
                    mensaje = "Pago aprobado correctamente (simulación)"
                }, "Pago aprobado"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al simular pago para pedido {PedidoId}", pedidoId);
                return BadRequest(ApiResponse<string>.ErrorResponse($"Error al procesar pago: {ex.Message}"));
            }
        }

        /// <summary>
        /// Verifica el estado de un pedido del usuario autenticado
        /// </summary>
        [HttpGet("verificar-pedido/{pedidoId}")]
        [Authorize]
        public async Task<IActionResult> VerificarPedido(int pedidoId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(ApiResponse<string>.ErrorResponse("Usuario no identificado en token"));
            }

            try
            {
                var pedido = await _unitOfWork.Pedidos.GetByIdAsync(pedidoId);

                if (pedido == null)
                {
                    return NotFound(ApiResponse<string>.ErrorResponse("Pedido no encontrado"));
                }

                if (pedido.UsuarioId != userId)
                {
                    return Forbid();
                }

                return Ok(ApiResponse<object>.SuccessResponse(new
                {
                    pedidoId = pedido.Id,
                    estado = pedido.Estado,
                    total = pedido.Total,
                    fechaPedido = pedido.FechaPedido,
                    aprobado = pedido.Aprobado,
                    fechaAprobacion = pedido.FechaAprobacion
                }));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al verificar pedido {PedidoId}", pedidoId);
                return BadRequest(ApiResponse<string>.ErrorResponse($"Error al verificar pedido: {ex.Message}"));
            }
        }
    }
}
