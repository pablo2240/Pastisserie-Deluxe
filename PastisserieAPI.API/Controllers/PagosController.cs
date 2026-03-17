using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PastisserieAPI.Core.Interfaces;
using PastisserieAPI.Services.DTOs.Common;
using PastisserieAPI.Services.DTOs.Payment;
using PastisserieAPI.Services.Services.Interfaces;
using System.Security.Claims;

namespace PastisserieAPI.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PagosController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEpaycoService _epaycoService;
        private readonly ILogger<PagosController> _logger;

        public PagosController(
            IUnitOfWork unitOfWork,
            IEpaycoService epaycoService,
            ILogger<PagosController> logger)
        {
            _unitOfWork = unitOfWork;
            _epaycoService = epaycoService;
            _logger = logger;
        }

        /// <summary>
        /// Generates the checkout data for the frontend to open the ePayco Standard Checkout widget.
        /// Called after order is created.
        /// </summary>
        [HttpPost("epayco/checkout-data/{pedidoId}")]
        [Authorize]
        public async Task<IActionResult> GenerateCheckoutData(int pedidoId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(ApiResponse<string>.ErrorResponse("Usuario no identificado en token"));
            }

            try
            {
                var checkoutData = await _epaycoService.GenerateCheckoutDataAsync(pedidoId, userId);
                return Ok(ApiResponse<EpaycoCheckoutDataDto>.SuccessResponse(checkoutData, "Datos de checkout generados"));
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating ePayco checkout data for pedido {PedidoId}", pedidoId);
                return BadRequest(ApiResponse<string>.ErrorResponse($"Error al generar datos de pago: {ex.Message}"));
            }
        }

        /// <summary>
        /// ePayco webhook endpoint (url_confirmation) - POST handler.
        /// Called by ePayco servers to confirm transaction status. No auth required.
        /// </summary>
        [HttpPost("webhook/epayco")]
        [AllowAnonymous]
        public async Task<IActionResult> EpaycoWebhookPost([FromForm] EpaycoWebhookDto webhook)
        {
            _logger.LogInformation(
                "=== ePayco WEBHOOK POST received === ref_payco={RefPayco}, invoice={Invoice}, cod_response={CodResponse}, transaction_state={State}, amount={Amount}",
                webhook.x_ref_payco, webhook.x_id_invoice, webhook.x_cod_response, webhook.x_transaction_state, webhook.x_amount);

            try
            {
                await _epaycoService.ProcessWebhookAsync(webhook);
                _logger.LogInformation("ePayco webhook processed successfully for ref_payco={RefPayco}", webhook.x_ref_payco);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing ePayco webhook for ref_payco={RefPayco}", webhook.x_ref_payco);
                // Return 200 anyway to avoid ePayco retrying indefinitely
                return Ok();
            }
        }

        /// <summary>
        /// ePayco webhook endpoint (url_confirmation) - GET handler.
        /// ePayco may also send a GET request for confirmation in some configurations.
        /// </summary>
        [HttpGet("webhook/epayco")]
        [AllowAnonymous]
        public async Task<IActionResult> EpaycoWebhookGet(
            [FromQuery] string? x_ref_payco,
            [FromQuery] string? x_id_invoice,
            [FromQuery] string? x_cod_response,
            [FromQuery] string? x_transaction_state,
            [FromQuery] string? x_amount,
            [FromQuery] string? x_currency_code,
            [FromQuery] string? x_signature,
            [FromQuery] string? x_transaction_id,
            [FromQuery] string? x_franchise,
            [FromQuery] string? x_response_reason_text,
            [FromQuery] string? x_datetime,
            [FromQuery] string? x_extra1,
            [FromQuery] string? x_extra2)
        {
            _logger.LogInformation(
                "=== ePayco WEBHOOK GET received === ref_payco={RefPayco}, invoice={Invoice}, cod_response={CodResponse}, transaction_state={State}",
                x_ref_payco, x_id_invoice, x_cod_response, x_transaction_state);

            if (string.IsNullOrEmpty(x_ref_payco))
            {
                _logger.LogWarning("ePayco webhook GET missing ref_payco");
                return Ok();
            }

            try
            {
                var webhook = new EpaycoWebhookDto
                {
                    x_ref_payco = x_ref_payco,
                    x_id_invoice = x_id_invoice,
                    x_cod_response = x_cod_response,
                    x_transaction_state = x_transaction_state,
                    x_amount = x_amount,
                    x_currency_code = x_currency_code,
                    x_signature = x_signature,
                    x_transaction_id = x_transaction_id,
                    x_franchise = x_franchise,
                    x_response_reason_text = x_response_reason_text,
                    x_datetime = x_datetime,
                    x_extra1 = x_extra1,
                    x_extra2 = x_extra2
                };

                await _epaycoService.ProcessWebhookAsync(webhook);
                _logger.LogInformation("ePayco webhook GET processed successfully for ref_payco={RefPayco}", x_ref_payco);
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing ePayco webhook GET for ref_payco={RefPayco}", x_ref_payco);
                return Ok();
            }
        }

        /// <summary>
        /// Validates a transaction with ePayco by ref_payco (authenticated).
        /// Used by the frontend result page to get the real status.
        /// Also updates the order in the database as a side effect.
        /// </summary>
        [HttpGet("epayco/validar/{refPayco}")]
        [Authorize]
        public async Task<IActionResult> ValidateTransaction(string refPayco)
        {
            try
            {
                var result = await _epaycoService.ValidateTransactionAsync(refPayco);
                return Ok(ApiResponse<EpaycoTransactionResultDto>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating ePayco transaction ref={RefPayco}", refPayco);
                return BadRequest(ApiResponse<string>.ErrorResponse($"Error al validar transaccion: {ex.Message}"));
            }
        }

        /// <summary>
        /// Public (anonymous) endpoint to validate and sync a transaction with ePayco.
        /// This is the critical fallback for when the webhook doesn't arrive (e.g. localhost dev).
        /// The frontend payment result page calls this after ePayco redirects the user back.
        /// No JWT required because the user may have lost their session during the redirect.
        /// </summary>
        [HttpGet("epayco/confirmar/{refPayco}")]
        [AllowAnonymous]
        public async Task<IActionResult> ConfirmTransaction(string refPayco)
        {
            _logger.LogInformation("=== Public ePayco confirmation requested for ref_payco={RefPayco} ===", refPayco);

            try
            {
                var result = await _epaycoService.ValidateTransactionAsync(refPayco);

                _logger.LogInformation(
                    "Public ePayco confirmation result: ref={RefPayco}, cod_response={CodResponse}, status={Status}, invoice={Invoice}",
                    result.RefPayco, result.CodResponse, result.Status, result.Invoice);

                return Ok(ApiResponse<EpaycoTransactionResultDto>.SuccessResponse(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in public ePayco confirmation for ref={RefPayco}", refPayco);
                return BadRequest(ApiResponse<string>.ErrorResponse($"Error al confirmar transaccion: {ex.Message}"));
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
                    fechaAprobacion = pedido.FechaAprobacion,
                    epaycoRefPayco = pedido.EpaycoRefPayco,
                    epaycoEstadoTransaccion = pedido.EpaycoEstadoTransaccion
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
