using AutoMapper;
using Microsoft.Extensions.Logging;
using PastisserieAPI.Core.Entities;
using PastisserieAPI.Core.Interfaces;
using PastisserieAPI.Services.DTOs.Request;
using PastisserieAPI.Services.DTOs.Response;
using PastisserieAPI.Services.Services.Interfaces;

namespace PastisserieAPI.Services.Services
{
    public class PedidoService : IPedidoService
    {
        // Comunas permitidas para entrega y sus costos de envío (COP)
        private static readonly Dictionary<string, decimal> CostosEnvioPorComuna = new(StringComparer.OrdinalIgnoreCase)
        {
            { "Guayabal", 5000m },
            { "Belen", 6000m }
        };

        private static readonly Dictionary<string, string> ComunasLabels = new(StringComparer.OrdinalIgnoreCase)
        {
            { "Guayabal", "Comuna 15 - Guayabal" },
            { "Belen", "Comuna 16 - Belén" }
        };

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

        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEmailService _emailService;
        private readonly IInvoiceService _invoiceService;
        private readonly INotificacionService _notificacionService;
        private readonly ITiendaService _tiendaService;
        private readonly ILogger<PedidoService> _logger;

        public PedidoService(IUnitOfWork unitOfWork, IMapper mapper, IEmailService emailService, IInvoiceService invoiceService, INotificacionService notificacionService, ITiendaService tiendaService, ILogger<PedidoService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _emailService = emailService;
            _invoiceService = invoiceService;
            _notificacionService = notificacionService;
            _tiendaService = tiendaService;
            _logger = logger;
        }

        public async Task<PedidoResponseDto> CreateAsync(int userId, CreatePedidoRequestDto request)
        {
            // 0. Validar horario laboral
            await ValidarHorarioLaboralAsync();

            _logger.LogInformation("CreateAsync: Buscando carrito para usuarioId={UserId}", userId);

            // 1. Obtener el carrito
            var carritoActual = await _unitOfWork.Carritos.GetByUsuarioIdWithItemsAsync(userId);

            _logger.LogInformation("CreateAsync: Carrito encontrado: {CarritoId}, Items count: {ItemsCount}",
                carritoActual?.Id, carritoActual?.Items?.Count ?? 0);

            if (carritoActual == null)
            {
                _logger.LogWarning("CreateAsync: El carrito es NULL para usuarioId={UserId}", userId);
                throw new Exception("El carrito está vacío o no existe.");
            }

            if (!carritoActual.Items.Any())
            {
                _logger.LogWarning("CreateAsync: El carrito existe pero no tiene items. CarritoId={CarritoId}", carritoActual.Id);
                throw new Exception("El carrito está vacío o no existe.");
            }

            // 2. Mapeo inicial
            var pedido = _mapper.Map<Pedido>(request);
            pedido.UsuarioId = userId;
            pedido.FechaPedido = GetBogotaTime();
            pedido.FechaCreacion = GetBogotaTime();

            // Order starts as Pendiente, not approved until ePayco confirms payment
            pedido.Estado = "Pendiente";
            pedido.Aprobado = false;

            // Inject shipping/order info into notes for admin visibility
            var infoEnvio = string.Empty;
            if (!string.IsNullOrEmpty(request.Direccion)) infoEnvio += $"Direccion: {request.Direccion}";
            if (!string.IsNullOrEmpty(request.Comuna))
            {
                var comunaLabel = ComunasLabels.TryGetValue(request.Comuna, out var label) ? label : request.Comuna;
                infoEnvio += $"\nComuna: {comunaLabel}";
            }
            if (!string.IsNullOrEmpty(request.MetodoPago)) infoEnvio += $"\nPago: ePayco";

            pedido.NotasCliente = string.IsNullOrEmpty(pedido.NotasCliente)
                ? infoEnvio
                : $"{pedido.NotasCliente}\n---\n{infoEnvio}";

            // Determine payment method record in DB (ePayco - payment will be processed externally)
            var todosMetodos = await _unitOfWork.MetodosPagoUsuario.GetAllAsync();
            MetodoPagoUsuario? metodoSeleccionado = todosMetodos.FirstOrDefault(m => m.UsuarioId == userId);

            if (metodoSeleccionado == null)
            {
                var todosTipos = await _unitOfWork.TiposMetodoPago.GetAllAsync();
                var tipo = todosTipos.FirstOrDefault(t => t.Nombre.Contains("ePayco"))
                          ?? todosTipos.FirstOrDefault(t => t.Nombre.Contains("Tarjeta"))
                          ?? todosTipos.FirstOrDefault();

                if (tipo == null)
                {
                    tipo = new TipoMetodoPago { Nombre = "ePayco", Descripcion = "Pagos con ePayco", Activo = true };
                    await _unitOfWork.TiposMetodoPago.AddAsync(tipo);
                    await _unitOfWork.SaveChangesAsync();
                }

                metodoSeleccionado = new MetodoPagoUsuario
                {
                    UsuarioId = userId,
                    TipoMetodoPagoId = tipo.Id,
                    UltimosDigitos = "0000",
                    TokenPago = "EPAYCO_PENDING",
                    EsPredeterminado = true,
                    FechaCreacion = GetBogotaTime()
                };

                await _unitOfWork.MetodosPagoUsuario.AddAsync(metodoSeleccionado);
                await _unitOfWork.SaveChangesAsync();
            }

            pedido.MetodoPagoId = metodoSeleccionado.Id;

            decimal subtotal = 0;
            var pedidoItems = new List<PedidoItem>();

            // 3. Validar Stock de TODOS los items antes de proceder
            foreach (var itemCart in carritoActual.Items)
            {
                // Para items con producto
                if (itemCart.ProductoId.HasValue)
                {
                    var producto = itemCart.Producto;
                    if (producto == null)
                        throw new Exception("Producto no encontrado en el carrito");

                    if (producto.Stock < itemCart.Cantidad)
                    {
                        throw new Exception($"No hay suficiente stock para {producto.Nombre}. Disponible: {producto.Stock}, Solicitado: {itemCart.Cantidad}");
                    }
                }

                // Validar stock de promociones independientes (sin producto vinculado)
                if (itemCart.PromocionId.HasValue && itemCart.Promocion != null
                    && itemCart.Promocion.Stock.HasValue && !itemCart.Promocion.ProductoId.HasValue)
                {
                    if (itemCart.Promocion.Stock.Value < itemCart.Cantidad)
                    {
                        throw new Exception($"No hay suficiente stock promocional para '{itemCart.Promocion.Nombre}'. Disponible: {itemCart.Promocion.Stock.Value}, Solicitado: {itemCart.Cantidad}");
                    }
                }
            }

            foreach (var itemCart in carritoActual.Items)
            {
                decimal precioUnitario;
                decimal? precioOriginal = null;
                
                // Caso 1: Item es una promoción independiente (sin ProductoId)
                if (!itemCart.ProductoId.HasValue && itemCart.PromocionId.HasValue && itemCart.Promocion != null)
                {
                    // Verificar que la promoción tenga precio original definido
                    if (!itemCart.Promocion.PrecioOriginal.HasValue)
                    {
                        throw new Exception($"La promoción '{itemCart.Promocion.Nombre}' no tiene precio definido");
                    }

                    // Calcular el precio final aplicando el descuento
                    precioOriginal = itemCart.Promocion.PrecioOriginal.Value;
                    var precioCalculado = CalcularPrecioFinal(
                        itemCart.Promocion.PrecioOriginal.Value, 
                        itemCart.Promocion.TipoDescuento, 
                        itemCart.Promocion.Valor
                    );

                    precioUnitario = precioCalculado ?? itemCart.Promocion.PrecioOriginal.Value;
                }
                // Caso 2: Item es un producto (con o sin promoción asociada)
                else if (itemCart.ProductoId.HasValue)
                {
                    var producto = itemCart.Producto;
                    if (producto == null)
                        throw new Exception("Producto no encontrado");

                    // Compute effective unit price: use promo-discounted price if applicable
                    precioUnitario = producto.Precio;
                    if (itemCart.PromocionId.HasValue && itemCart.Promocion != null)
                    {
                        var precioDescontado = CalcularPrecioFinal(producto.Precio, itemCart.Promocion.TipoDescuento, itemCart.Promocion.Valor);
                        if (precioDescontado.HasValue)
                            precioUnitario = precioDescontado.Value;
                        
                        precioOriginal = itemCart.PrecioOriginal ?? producto.Precio;
                    }
                }
                else
                {
                    throw new Exception("Item de carrito inválido: debe tener ProductoId o PromocionId");
                }

                var pedidoItem = new PedidoItem
                {
                    ProductoId = itemCart.ProductoId,
                    Cantidad = itemCart.Cantidad,
                    PrecioUnitario = precioUnitario,
                    Subtotal = precioUnitario * itemCart.Cantidad,
                    PromocionId = itemCart.PromocionId,
                    PrecioOriginal = precioOriginal
                };

                subtotal += pedidoItem.Subtotal;
                pedidoItems.Add(pedidoItem);

                // Descontar Stock del producto (si aplica)
                if (itemCart.ProductoId.HasValue && itemCart.Producto != null)
                {
                    var producto = itemCart.Producto;
                    if (producto.Stock >= itemCart.Cantidad)
                    {
                        producto.Stock -= itemCart.Cantidad;
                        await _unitOfWork.Productos.UpdateAsync(producto);
                    }
                }

                // Descontar Stock de promoción independiente (sin producto vinculado)
                if (itemCart.PromocionId.HasValue && itemCart.Promocion != null
                    && itemCart.Promocion.Stock.HasValue && !itemCart.Promocion.ProductoId.HasValue)
                {
                    itemCart.Promocion.Stock -= itemCart.Cantidad;
                    await _unitOfWork.Promociones.UpdateAsync(itemCart.Promocion);
                }
            }

            // 4. Totales (IVA REMOVIDO, DOMICILIO CALCULADO POR COMUNA)
            decimal costoEnvio = 5000m; // Valor por defecto
            if (!string.IsNullOrEmpty(request.Comuna))
            {
                if (!CostosEnvioPorComuna.TryGetValue(request.Comuna, out costoEnvio))
                {
                    throw new Exception($"La comuna '{request.Comuna}' no es válida para entregas. Comunas permitidas: {string.Join(", ", ComunasLabels.Values)}");
                }
            }
            pedido.CostoEnvio = costoEnvio;
            pedido.Total = subtotal + pedido.CostoEnvio;
            pedido.IVA = 0;
            pedido.Subtotal = subtotal;

            // 5. Guardar Pedido (Cabecera)
            await _unitOfWork.Pedidos.AddAsync(pedido);
            await _unitOfWork.SaveChangesAsync();

            // 6. Relacionar Items con el ID del pedido creado
            foreach (var item in pedidoItems)
            {
                item.PedidoId = pedido.Id;
                pedido.Items.Add(item);
            }
            // Actualizamos el pedido con sus items
            await _unitOfWork.Pedidos.UpdateAsync(pedido);

            // 7. Vaciar Carrito (Usando el ID del carrito, NO del usuario)
            await _unitOfWork.Carritos.ClearCarritoAsync(carritoActual.Id);

            // 8. Historial
            var historial = new PedidoHistorial
            {
                PedidoId = pedido.Id,
                EstadoAnterior = "",
                EstadoNuevo = pedido.Estado,
                FechaCambio = GetBogotaTime(),
                CambiadoPor = userId,
                Notas = "Pedido creado exitosamente"
            };
            // Nota: Si PedidoHistorial es una tabla aparte, agrégala al DbSet, si es colección:
            // pedido.Historial.Add(historial); 
            // await _unitOfWork.SaveChangesAsync();

            // Guardamos cambios finales
            await _unitOfWork.SaveChangesAsync();

            // 9. Retorno con datos completos (Include)
            var pedidoCompleto = await _unitOfWork.Pedidos.GetByIdWithDetailsAsync(pedido.Id)
                                 ?? await _unitOfWork.Pedidos.GetByIdAsync(pedido.Id);

            // 10. Notificación al usuario
            try
            {
                await _notificacionService.CrearNotificacionAsync(
                    userId,
                    "Pedido Recibido 🍰",
                    $"Tu pedido #{pedido.Id} ha sido creado exitosamente. Total: ${pedido.Total:N0} COP.",
                    "Pedido",
                    "/history"
                );
            }
            catch { }

            // 11. Enviar Correo de Confirmación y Factura (Fire and forget, or awaited)
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user != null)
                {
                    // Send order confirmation along with invoice
                    byte[]? pdfBytes = null;
                    if (pedidoCompleto != null)
                    {
                        pdfBytes = _invoiceService.GenerateInvoicePdf(pedidoCompleto, user);
                    }

                    await _emailService.SendOrderConfirmationEmailAsync(user.Email, user.Nombre, pedido.Id, pedido.Total, pdfBytes);
                }
            }
            catch { /* Ignorar errores de correo para no fallar el pedido */ }

            return _mapper.Map<PedidoResponseDto>(pedidoCompleto);
        }

        // --- MÉTODOS DE LECTURA ---

        // 👇 ESTE ES EL QUE NECESITA EL DASHBOARD
        public async Task<List<PedidoResponseDto>> GetAllAsync()
        {
            // Llama al repositorio que modificamos anteriormente (con los Includes de Usuario)
            var pedidos = await _unitOfWork.Pedidos.GetAllAsync();
            return _mapper.Map<List<PedidoResponseDto>>(pedidos);
        }

        public async Task<PedidoResponseDto?> GetByIdAsync(int id)
        {
            var pedido = await _unitOfWork.Pedidos.GetByIdWithDetailsAsync(id) ?? await _unitOfWork.Pedidos.GetByIdAsync(id);
            return pedido == null ? null : _mapper.Map<PedidoResponseDto>(pedido);
        }

        public async Task<List<PedidoResponseDto>> GetByUsuarioIdAsync(int usuarioId)
        {
            var pedidos = await _unitOfWork.Pedidos.GetByUsuarioIdAsync(usuarioId);
            return _mapper.Map<List<PedidoResponseDto>>(pedidos);
        }

        public async Task<List<PedidoResponseDto>> GetByEstadoAsync(string estado)
        {
            var pedidos = await _unitOfWork.Pedidos.GetByEstadoAsync(estado);
            return _mapper.Map<List<PedidoResponseDto>>(pedidos);
        }

        public async Task<List<PedidoResponseDto>> GetPedidosPendientesAsync()
        {
            var pedidos = await _unitOfWork.Pedidos.GetPedidosPendientesAsync();
            return _mapper.Map<List<PedidoResponseDto>>(pedidos);
        }

        public async Task<PedidoResponseDto?> UpdateEstadoAsync(int id, UpdatePedidoEstadoRequestDto request)
        {
            var pedido = await _unitOfWork.Pedidos.GetByIdAsync(id);
            if (pedido == null) return null;

            // Validar horario para acciones de cocina/preparación (excepto si es una re-asignación de un pedido fallido)
            var estadosRestringidos = new[] { "EnProceso" };
            if (estadosRestringidos.Contains(request.Estado, StringComparer.OrdinalIgnoreCase) && pedido.Estado != "NoEntregado")
            {
                await ValidarHorarioLaboralAsync();
            }

            pedido.Estado = request.Estado;
            pedido.FechaActualizacion = GetBogotaTime();

            // Al entregar, registrar la fecha real de entrega
            if (request.Estado == "Entregado")
            {
                pedido.FechaEntrega = GetBogotaTime();
                pedido.MotivoNoEntrega = null; // Limpiar si antes falló
            }

            // Si el estado es NoEntregado, registrar motivo y fecha de falla
            if (request.Estado == "NoEntregado")
            {
                if (string.IsNullOrWhiteSpace(request.MotivoNoEntrega))
                {
                    throw new Exception("El motivo de no entrega es obligatorio.");
                }

                pedido.FechaNoEntrega = GetBogotaTime();
                pedido.MotivoNoEntrega = request.MotivoNoEntrega;
                pedido.FechaEntrega = null;
            }

            // Si se pasa de NoEntregado a Pendiente o Confirmado (reintento)
            if (request.Estado == "Pendiente" && pedido.Estado == "NoEntregado")
            {
                pedido.FechaNoEntrega = null;
                pedido.RepartidorId = null; // LIMPIAR REPARTIDOR PARA REASIGNACIÓN
            }
            else if ((request.Estado == "Pendiente" || request.Estado == "Confirmado") && pedido.Estado == "NoEntregado")
            {
                pedido.FechaNoEntrega = null;
            }

            await _unitOfWork.Pedidos.UpdateAsync(pedido);
            await _unitOfWork.SaveChangesAsync();

            // Notificar al usuario del cambio de estado
            try
            {
                var estadoMensaje = request.Estado switch
                {
                    "EnProceso" => "está siendo preparado 👨‍🍳",
                    "EnCamino" => "está en camino 🚚",
                    "Entregado" => "fue entregado exitosamente ✅",
                    "NoEntregado" => "no pudo ser entregado. Por favor contáctanos. ❌",
                    "Cancelado" => "fue cancelado 🚫",
                    _ => $"cambió a {request.Estado}"
                };
                await _notificacionService.CrearNotificacionAsync(
                    pedido.UsuarioId,
                    $"Pedido #{pedido.Id} - {request.Estado}",
                    $"Tu pedido #{pedido.Id} {estadoMensaje}.",
                    "Pedido",
                    "/history"
                );

                if (request.Estado == "NoEntregado")
                {
                    var admins = (await _unitOfWork.Users.GetAllAsync()).Where(u => u.Id == 1 || (u.Email != null && u.Email.Contains("admin")));
                    foreach (var admin in admins)
                    {
                        await _notificacionService.CrearNotificacionAsync(
                            admin.Id,
                            "Alerta: Pedido Fallido ❌",
                            $"El pedido #{pedido.Id} no pudo ser entregado. Motivo: {request.MotivoNoEntrega}.",
                            "Pedido",
                            "/admin/pedidos"
                        );
                    }
                }
            }
            catch { }

            // Enviar correo de cambio de estado
            try
            {
                var user = await _unitOfWork.Users.GetByIdAsync(pedido.UsuarioId);
                if (user != null)
                {
                    if (request.Estado == "Entregado")
                    {
                        var pedidoCompleto = await _unitOfWork.Pedidos.GetByIdWithDetailsAsync(pedido.Id) ?? pedido;
                        var pdfBytes = _invoiceService.GenerateInvoicePdf(pedidoCompleto, user);
                        await _emailService.SendInvoiceEmailAsync(user.Email, user.Nombre, pedido.Id, pdfBytes);
                    }
                    else
                    {
                        await _emailService.SendOrderStatusUpdateEmailAsync(user.Email, user.Nombre, pedido.Id, request.Estado);
                    }
                }
            }
            catch { }

            return _mapper.Map<PedidoResponseDto>(pedido);
        }

        public async Task<bool> AprobarPedidoAsync(int id, int aprobadoPor)
        {
            var pedido = await _unitOfWork.Pedidos.GetByIdAsync(id);
            if (pedido == null) return false;

            pedido.Aprobado = true;
            pedido.FechaAprobacion = GetBogotaTime();
            pedido.Estado = "Confirmado";
            await _unitOfWork.Pedidos.UpdateAsync(pedido);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<PedidoResponseDto?> AsignarRepartidorAsync(int pedidoId, int repartidorId)
        {
            var pedido = await _unitOfWork.Pedidos.GetByIdAsync(pedidoId);
            if (pedido == null) return null;

            // Bloquear asignación si el pedido ya fue entregado
            if (pedido.Estado == "Entregado")
                throw new Exception("No se puede modificar el repartidor de un pedido ya entregado.");

            // CONTROL DE CARGA: Máximo 5 pedidos activos por repartidor
            var pedidosActivos = await _unitOfWork.Pedidos.GetAllAsync();
            var cargaActual = pedidosActivos.Count(p => p.RepartidorId == repartidorId && (p.Estado == "EnCamino" || p.Estado == "Confirmado"));

            if (cargaActual >= 5)
            {
                throw new Exception("El repartidor ya tiene demasiados pedidos asignados (máximo 5).");
            }

            pedido.RepartidorId = repartidorId;
            pedido.Estado = "EnCamino"; // Al asignar repartidor, pasa a EnCamino
            pedido.FechaActualizacion = DateTime.UtcNow;

            await _unitOfWork.Pedidos.UpdateAsync(pedido);
            await _unitOfWork.SaveChangesAsync();

            // Notificar al usuario y al repartidor
            try
            {
                await _notificacionService.CrearNotificacionAsync(
                    pedido.UsuarioId,
                    $"Pedido #{pedido.Id} - En Camino 🚚",
                    $"Tu pedido #{pedido.Id} ha sido asignado a un repartidor y está en camino.",
                    "Pedido",
                    "/history"
                );

                var repartidor = await _unitOfWork.Users.GetByIdAsync(repartidorId);
                var cliente = await _unitOfWork.Users.GetByIdAsync(pedido.UsuarioId);

                if (repartidor != null)
                {
                    await _notificacionService.CrearNotificacionAsync(
                        repartidorId,
                        $"Nuevo Pedido Asignado #{pedido.Id} 📦",
                        $"Se te ha asignado el Pedido #{pedido.Id}. Revisa tu panel de entregas.",
                        "Asignacion",
                        "/repartidor/pedidos"
                    );

                    // Enviar Correo al Repartidor
                    await _emailService.SendRepartidorAssignmentEmailAsync(
                        repartidor.Email,
                        repartidor.Nombre,
                        pedido.Id,
                        cliente?.Nombre ?? "Cliente",
                        pedido.DireccionEnvio?.Direccion ?? "Ver en app"
                    );
                }
            }
            catch { }

            return _mapper.Map<PedidoResponseDto>(pedido);
        }

        public async Task<List<PedidoResponseDto>> GetByRepartidorIdAsync(int repartidorId)
        {
            var pedidos = await _unitOfWork.Pedidos.GetAllAsync();
            var filtrados = pedidos.Where(p => p.RepartidorId == repartidorId).ToList();
            return _mapper.Map<List<PedidoResponseDto>>(filtrados);
        }

        public async Task<bool> DeleteAsync(int id, int userId, bool isAdmin)
        {
            var pedido = await _unitOfWork.Pedidos.GetByIdWithDetailsAsync(id)
                         ?? await _unitOfWork.Pedidos.GetByIdAsync(id);
            if (pedido == null) return false;

            // Authorization: admin can delete any, user can only delete their own
            if (!isAdmin && pedido.UsuarioId != userId)
                throw new Exception("No tienes permiso para eliminar este pedido.");

            // Restore stock for each item in the order
            if (pedido.Items != null)
            {
                foreach (var item in pedido.Items)
                {
                    // Solo restaurar stock si el item tiene ProductoId (no es promoción independiente)
                    if (item.ProductoId.HasValue)
                    {
                        var producto = await _unitOfWork.Productos.GetByIdAsync(item.ProductoId.Value);
                        if (producto != null)
                        {
                            producto.Stock += item.Cantidad;
                            await _unitOfWork.Productos.UpdateAsync(producto);
                        }
                    }

                    // Restaurar stock de promoción independiente si aplica
                    if (item.PromocionId.HasValue && !item.ProductoId.HasValue)
                    {
                        var promocion = await _unitOfWork.Promociones.GetByIdAsync(item.PromocionId.Value);
                        if (promocion != null && promocion.Stock.HasValue)
                        {
                            promocion.Stock += item.Cantidad;
                            await _unitOfWork.Promociones.UpdateAsync(promocion);
                        }
                    }
                }
            }

            // EF cascade will handle PedidoItem, PedidoHistorial, Factura, Envio, PersonalizadoConfig
            await _unitOfWork.Pedidos.DeleteAsync(pedido);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Pedido #{PedidoId} eliminado por userId={UserId} (isAdmin={IsAdmin}). Stock restaurado.", id, userId, isAdmin);

            return true;
        }

        // ============ HELPER PRIVADO: Validar Horario Laboral ============
        private async Task ValidarHorarioLaboralAsync()
        {
            var config = await _tiendaService.GetConfiguracionAsync();
            if (config == null) return;

            if (!_tiendaService.EstaAbierto(config))
            {
                throw new Exception("La tienda está cerrada actualmente.");
            }
        }

        /// <summary>
        /// Calcula el precio final aplicando el descuento (porcentaje o monto fijo).
        /// Misma lógica que MappingProfile.CalcularPrecioFinal.
        /// </summary>
        private static decimal? CalcularPrecioFinal(decimal precioOriginal, string tipoDescuento, decimal valor)
        {
            if (precioOriginal <= 0) return null;

            decimal resultado;
            if (tipoDescuento == "Porcentaje")
            {
                resultado = precioOriginal * (1 - valor / 100m);
            }
            else // MontoFijo
            {
                resultado = precioOriginal - valor;
            }

            return resultado < 0 ? 0 : Math.Round(resultado, 2);
        }
    }
}
