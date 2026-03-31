using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PastisserieAPI.Core.Entities;
using PastisserieAPI.Core.Interfaces;
using PastisserieAPI.Infrastructure.Data;
using PastisserieAPI.Services.DTOs.Common;
using PastisserieAPI.Services.DTOs.Request;
using PastisserieAPI.Services.Services.Interfaces;
using System.Security.Claims;

namespace PastisserieAPI.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PagosController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<PagosController> _logger;
        private readonly INotificacionService _notificacionService;
        private readonly IEmailService _emailService;
        private readonly IInvoiceService _invoiceService;
        private readonly ApplicationDbContext _context;
        private readonly IPedidoService _pedidoService;

        public PagosController(
            IUnitOfWork unitOfWork,
            ILogger<PagosController> logger,
            INotificacionService notificacionService,
            IEmailService emailService,
            IInvoiceService invoiceService,
            ApplicationDbContext context,
            IPedidoService pedidoService)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _notificacionService = notificacionService;
            _emailService = emailService;
            _invoiceService = invoiceService;
            _context = context;
            _pedidoService = pedidoService;
        }

        private int? GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return null;

            return userId;
        }

        private DateTime GetBogotaTime()
        {
            try
            {
                var bogotaZone = TimeZoneInfo.FindSystemTimeZoneById("SA Pacific Standard Time");
                return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, bogotaZone);
            }
            catch
            {
                try
                {
                    var bogotaZone = TimeZoneInfo.FindSystemTimeZoneById("America/Bogota");
                    return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, bogotaZone);
                }
                catch
                {
                    return DateTime.UtcNow.AddHours(-5);
                }
            }
        }

        [HttpPost("registrar-intento/{pedidoId}")]
        [Authorize]
        public async Task<IActionResult> RegistrarIntento(int pedidoId)
        {
            var userId = GetUserId();
            if (!userId.HasValue)
                return Unauthorized(ApiResponse<string>.ErrorResponse("Usuario no identificado"));

            try
            {
                var pedido = await _unitOfWork.Pedidos.GetByIdAsync(pedidoId);
                if (pedido == null)
                    return NotFound(ApiResponse<string>.ErrorResponse("Pedido no encontrado"));

                if (pedido.UsuarioId != userId.Value)
                    return Forbid();

                var registroExistente = await _unitOfWork.RegistrosPago.GetUltimoIntentoAsync(pedidoId);
                if (registroExistente != null && registroExistente.Estado == "Espera")
                {
                    return Ok(ApiResponse<string>.SuccessResponse(null, "Intento ya registrado"));
                }

                var registro = new RegistroPago
                {
                    PedidoId = pedidoId,
                    UsuarioId = userId.Value,
                    Estado = "Espera",
                    FechaIntento = GetBogotaTime()
                };

                await _unitOfWork.RegistrosPago.AddAsync(registro);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Intento de pago registrado para pedido {PedidoId}", pedidoId);
                return Ok(ApiResponse<object>.SuccessResponse(new { registroId = registro.Id }, "Intento registrado"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al registrar intento de pago para pedido {PedidoId}", pedidoId);
                return BadRequest(ApiResponse<string>.ErrorResponse($"Error: {ex.Message}"));
            }
        }

        [HttpPost("abandonar/{pedidoId}")]
        [Authorize]
        public async Task<IActionResult> AbandonarPago(int pedidoId)
        {
            var userId = GetUserId();
            if (!userId.HasValue)
                return Unauthorized(ApiResponse<string>.ErrorResponse("Usuario no identificado"));

            try
            {
                var pedido = await _unitOfWork.Pedidos.GetByIdAsync(pedidoId);
                if (pedido == null)
                    return NotFound(ApiResponse<string>.ErrorResponse("Pedido no encontrado"));

                if (pedido.UsuarioId != userId.Value)
                    return Forbid();

                var registroExistente = await _unitOfWork.RegistrosPago.GetUltimoIntentoAsync(pedidoId);
                if (registroExistente != null && registroExistente.Estado == "Espera")
                {
                    registroExistente.Estado = "Fallido";
                    registroExistente.MensajeError = "Usuario abandonó el proceso de pago";
                    await _unitOfWork.RegistrosPago.UpdateAsync(registroExistente);
                    await _unitOfWork.SaveChangesAsync();

                    _logger.LogInformation("Pago abandonado para pedido {PedidoId}", pedidoId);
                }

                return Ok(ApiResponse<string>.SuccessResponse(null, "Pago marcado como abandonado"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al marcar abandono para pedido {PedidoId}", pedidoId);
                return BadRequest(ApiResponse<string>.ErrorResponse($"Error: {ex.Message}"));
            }
        }

        [HttpPost("simular-pago/{pedidoId}")]
        [Authorize]
        public async Task<IActionResult> SimularPago(int pedidoId)
        {
            var userId = GetUserId();
            if (!userId.HasValue)
                return Unauthorized(ApiResponse<string>.ErrorResponse("Usuario no identificado"));

            try
            {
                var pedido = await _unitOfWork.Pedidos.GetByIdWithDetailsAsync(pedidoId);
                if (pedido == null)
                    return NotFound(ApiResponse<string>.ErrorResponse("Pedido no encontrado"));

                if (pedido.UsuarioId != userId.Value)
                    return Forbid();

                var registroExistente = await _unitOfWork.RegistrosPago.GetUltimoIntentoAsync(pedidoId);
                if (registroExistente != null && registroExistente.Estado == "Exitoso")
                {
                    return Ok(ApiResponse<object>.SuccessResponse(new
                    {
                        pedidoId = pedido.Id,
                        estado = pedido.Estado,
                        aprobado = true,
                        mensaje = "Pago ya confirmado anteriormente"
                    }, "Pago ya aprobado"));
                }

                bool aprobado = true;

                if (aprobado)
                {
                    await DescontarStockAsync(pedido);

                    pedido.Estado = "Confirmado";
                    pedido.Aprobado = true;
                    pedido.FechaAprobacion = GetBogotaTime();
                    await _unitOfWork.Pedidos.UpdateAsync(pedido);

                    if (registroExistente != null)
                    {
                        registroExistente.Estado = "Exitoso";
                        registroExistente.FechaConfirmacion = GetBogotaTime();
                        await _unitOfWork.RegistrosPago.UpdateAsync(registroExistente);
                    }
                    else
                    {
                        var nuevoRegistro = new RegistroPago
                        {
                            PedidoId = pedidoId,
                            UsuarioId = userId.Value,
                            Estado = "Exitoso",
                            FechaIntento = GetBogotaTime(),
                            FechaConfirmacion = GetBogotaTime()
                        };
                        await _unitOfWork.RegistrosPago.AddAsync(nuevoRegistro);
                    }

                    await _unitOfWork.Carritos.ClearCarritoAsync(pedido.UsuarioId);

                    await _unitOfWork.SaveChangesAsync();

                    try
                    {
                        var usuario = await _unitOfWork.Users.GetByIdAsync(userId.Value);
                        if (usuario != null)
                        {
                            var factura = new Factura
                            {
                                PedidoId = pedido.Id,
                                NumeroFactura = $"FAC-{pedido.Id}-{DateTime.UtcNow:yyyyMMdd}",
                                FechaEmision = DateTime.UtcNow,
                                Subtotal = pedido.Subtotal,
                                IVA = 0,
                                Total = pedido.Total
                            };
                            _context.Facturas.Add(factura);
                            await _unitOfWork.SaveChangesAsync();

                            byte[]? pdfBytes = _invoiceService.GenerateInvoicePdf(pedido, usuario);
                            await _emailService.SendOrderConfirmationEmailAsync(usuario.Email, usuario.Nombre, pedido.Id, pedido.Total, pdfBytes);
                        }
                    }
                    catch { }

                    _logger.LogInformation("Pago simulado aprobado para pedido {PedidoId}", pedidoId);

                    // Notificar al usuario que el pago fue aprobado
                    try
                    {
                        await _notificacionService.CrearNotificacionAsync(
                            userId.Value,
                            $"Pago Aprobado - Pedido #{pedido.Id} ✅",
                            $"El pago de tu pedido #{pedido.Id} ha sido aprobado. Tu pedido está siendo preparado.",
                            "Pago",
                            "/history"
                        );
                    }
                    catch (Exception exNotif)
                    {
                        _logger.LogWarning(exNotif, "Error al enviar notificación de pago aprobado para pedido {PedidoId}", pedidoId);
                    }

                    return Ok(ApiResponse<object>.SuccessResponse(new
                    {
                        pedidoId = pedido.Id,
                        estado = pedido.Estado,
                        aprobado = true,
                        mensaje = "Pago aprobado correctamente (simulación)"
                    }, "Pago aprobado"));
                }
                else
                {
                    if (registroExistente != null)
                    {
                        registroExistente.Estado = "Fallido";
                        registroExistente.MensajeError = "Pago rechazado por el procesador";
                        await _unitOfWork.RegistrosPago.UpdateAsync(registroExistente);
                    }

                    await _unitOfWork.SaveChangesAsync();

                    _logger.LogInformation("Pago simulado rechazado para pedido {PedidoId}", pedidoId);

                    // Notificar al usuario que el pago fue rechazado
                    try
                    {
                        await _notificacionService.CrearNotificacionAsync(
                            userId.Value,
                            $"Pago Rechazado - Pedido #{pedido.Id} ❌",
                            $"El pago de tu pedido #{pedido.Id} no pudo ser procesado. Por favor intenta nuevamente o contactanos.",
                            "Pago",
                            "/checkout"
                        );
                    }
                    catch (Exception exNotif)
                    {
                        _logger.LogWarning(exNotif, "Error al enviar notificación de pago rechazado para pedido {PedidoId}", pedidoId);
                    }

                    return BadRequest(ApiResponse<object>.SuccessResponse(new
                    {
                        pedidoId = pedido.Id,
                        aprobado = false,
                        mensaje = "Pago rechazado (simulación)"
                    }, "Pago rechazado"));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al simular pago para pedido {PedidoId}", pedidoId);
                return BadRequest(ApiResponse<string>.ErrorResponse($"Error al procesar pago: {ex.Message}"));
            }
        }

        private async Task DescontarStockAsync(Pedido pedido)
        {
            foreach (var item in pedido.Items)
            {
                if (item.ProductoId.HasValue)
                {
                    var producto = await _unitOfWork.Productos.GetByIdAsync(item.ProductoId.Value);
                    if (producto == null)
                    {
                        _logger.LogWarning("Producto {ProductoId} no encontrado al intentar descontar stock", item.ProductoId.Value);
                        continue;
                    }

                    if (producto.Stock < item.Cantidad)
                    {
                        throw new Exception($"Stock insuficiente para {producto.Nombre}. Disponible: {producto.Stock}, requerido: {item.Cantidad}");
                    }

                    producto.Stock -= item.Cantidad;
                    await _unitOfWork.Productos.UpdateAsync(producto);
                    _logger.LogInformation("Stock actualizado para {ProductoNombre}: {NuevoStock}", producto.Nombre, producto.Stock);
                }

                if (item.PromocionId.HasValue && !item.ProductoId.HasValue)
                {
                    var promocion = await _unitOfWork.Promociones.GetByIdAsync(item.PromocionId.Value);
                    if (promocion == null)
                    {
                        _logger.LogWarning("Promocion {PromocionId} no encontrada al intentar descontar stock", item.PromocionId.Value);
                        continue;
                    }

                    if (promocion.Stock.HasValue && promocion.Stock < item.Cantidad)
                    {
                        throw new Exception($"Stock insuficiente para promoción {promocion.Nombre}. Disponible: {promocion.Stock}, requerido: {item.Cantidad}");
                    }

                    if (promocion.Stock.HasValue)
                    {
                        promocion.Stock -= item.Cantidad;
                        await _unitOfWork.Promociones.UpdateAsync(promocion);
                        _logger.LogInformation("Stock actualizado para promoción {PromocionNombre}: {NuevoStock}", promocion.Nombre, promocion.Stock);
                    }
                }
            }
        }

        [HttpGet("verificar-pedido/{pedidoId}")]
        [Authorize]
        public async Task<IActionResult> VerificarPedido(int pedidoId)
        {
            var userId = GetUserId();
            if (!userId.HasValue)
                return Unauthorized(ApiResponse<string>.ErrorResponse("Usuario no identificado"));

            try
            {
                var pedido = await _unitOfWork.Pedidos.GetByIdAsync(pedidoId);
                if (pedido == null)
                    return NotFound(ApiResponse<string>.ErrorResponse("Pedido no encontrado"));

                if (pedido.UsuarioId != userId.Value)
                    return Forbid();

                var registro = await _unitOfWork.RegistrosPago.GetUltimoIntentoAsync(pedidoId);

                return Ok(ApiResponse<object>.SuccessResponse(new
                {
                    pedidoId = pedido.Id,
                    estado = pedido.Estado,
                    total = pedido.Total,
                    fechaPedido = pedido.FechaPedido,
                    aprobado = pedido.Aprobado,
                    fechaAprobacion = pedido.FechaAprobacion,
                    registroPagoEstado = registro?.Estado
                }));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al verificar pedido {PedidoId}", pedidoId);
                return BadRequest(ApiResponse<string>.ErrorResponse($"Error al verificar pedido: {ex.Message}"));
            }
        }

        /// <summary>
        /// Crea el pedido y procesa el pago en una sola transacción
        /// </summary>
        [HttpPost("crear-y-pagar")]
        [Authorize]
        public async Task<IActionResult> CrearYProcesarPago([FromBody] CreatePedidoRequestDto request)
        {
            var userId = GetUserId();
            if (!userId.HasValue)
                return Unauthorized(ApiResponse<string>.ErrorResponse("Usuario no identificado"));

            try
            {
                // 1. Crear el pedido (sin confirmar aún)
                var pedido = await _pedidoService.CreateAsync(userId.Value, request);
                
                if ( pedido == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("No se pudo crear el pedido. Verifica que el carrito tenga productos."));

                // 2. Simular pago (siempre exitoso para este endpoint)
                // Nota: En producción, esto sería la integración con el procesador de pagos
                var pedidoActualizado = await _pedidoService.UpdateEstadoAsync(pedido.Id, new UpdatePedidoEstadoRequestDto
                {
                    Estado = "Confirmado"
                });

                if (pedidoActualizado == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Error al confirmar el pago"));

                // 3. Limpiar carrito
                await _unitOfWork.Carritos.ClearCarritoAsync(userId.Value);
                await _unitOfWork.SaveChangesAsync();

                return Ok(ApiResponse<object>.SuccessResponse(new
                {
                    pedidoId = pedido.Id,
                    estado = "Confirmado",
                    aprobado = true,
                    mensaje = "Pago procesado exitosamente"
                }, "Pedido creado y pagado correctamente"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear pedido y procesar pago para usuario {UserId}", userId);
                return BadRequest(ApiResponse<string>.ErrorResponse($"Error al procesar el pago: {ex.Message}"));
            }
        }
    }
}
