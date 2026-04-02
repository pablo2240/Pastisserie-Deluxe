using AutoMapper;
using Microsoft.Extensions.Logging;
using PastisserieAPI.Core.Entities;
using PastisserieAPI.Core.Interfaces;
using PastisserieAPI.Services.DTOs.Request;
using PastisserieAPI.Services.DTOs.Response;
using PastisserieAPI.Services.Services.Interfaces;
using PastisserieAPI.Infrastructure.Data;

namespace PastisserieAPI.Services.Services
{
    public class PedidoService : IPedidoService
    {
        // Valores por defecto si no hay configuración
        private static readonly Dictionary<string, decimal> CostosEnvioPorComunaDefault = new(StringComparer.OrdinalIgnoreCase)
        {
            { "Guayabal", 5000m },
            { "Belen", 6000m }
        };

        private static readonly Dictionary<string, string> ComunasLabels = new(StringComparer.OrdinalIgnoreCase)
        {
            { "Guayabal", "Comuna 15 - Guayabal" },
            { "Belen", "Comuna 16 - Belén" }
        };

        private Dictionary<string, decimal> GetCostosEnvioDesdeConfig(ConfiguracionTienda? config)
        {
            if (string.IsNullOrEmpty(config?.CostosEnvioPorComuna))
            {
                return CostosEnvioPorComunaDefault;
            }

            try
            {
                var costos = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, decimal>>(
                    config.CostosEnvioPorComuna, 
                    new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                );
                return costos ?? CostosEnvioPorComunaDefault;
            }
            catch
            {
                _logger.LogWarning("Error al parsear CostosEnvioPorComuna, usando valores por defecto");
                return CostosEnvioPorComunaDefault;
            }
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

        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEmailService _emailService;
        private readonly IInvoiceService _invoiceService;
        private readonly INotificacionService _notificacionService;
        private readonly ITiendaService _tiendaService;
        private readonly ILogger<PedidoService> _logger;
        private readonly ApplicationDbContext _context;

        public PedidoService(IUnitOfWork unitOfWork, IMapper mapper, IEmailService emailService, IInvoiceService invoiceService, INotificacionService notificacionService, ITiendaService tiendaService, ILogger<PedidoService> logger, ApplicationDbContext context)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _emailService = emailService;
            _invoiceService = invoiceService;
            _notificacionService = notificacionService;
            _tiendaService = tiendaService;
            _logger = logger;
            _context = context;
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

            // Order starts as Pendiente, not approved until payment is confirmed
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
            if (!string.IsNullOrEmpty(request.MetodoPago)) 
            {
                infoEnvio += $"\nPago: {request.MetodoPago}";
                pedido.MetodoPago = request.MetodoPago;
            }
            else
            {
                pedido.MetodoPago = "Efectivo";
            }

            pedido.NotasCliente = string.IsNullOrEmpty(pedido.NotasCliente)
                ? infoEnvio
                : $"{pedido.NotasCliente}\n---\n{infoEnvio}";

            // Crear DireccionEnvio con los datos del checkout (captura estática)
            if (!string.IsNullOrEmpty(request.Direccion) || !string.IsNullOrEmpty(request.Comuna))
            {
                var usuario = await _unitOfWork.Users.GetByIdAsync(userId);
                var direccionEnvio = new DireccionEnvio
                {
                    UsuarioId = userId,
                    NombreCompleto = usuario?.Nombre ?? "Cliente",
                    Direccion = request.Direccion ?? string.Empty,
                    Comuna = request.Comuna,
                    Barrio = null,
                    Referencia = request.NotasCliente,
                    Telefono = request.Telefono ?? usuario?.Telefono ?? string.Empty,
                    EsPredeterminada = false,
                    FechaCreacion = GetBogotaTime(),
                    // Guardar coordenadas si vienen en el request
                    Latitud = request.Latitud,
                    Longitud = request.Longitud
                };

                await _unitOfWork.DireccionesEnvio.AddAsync(direccionEnvio);
                await _unitOfWork.SaveChangesAsync();
                pedido.DireccionEnvioId = direccionEnvio.Id;
            }

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

                    // Validar stock solo si el producto NO tiene inventario ilimitado
                    if (!producto.StockIlimitado && producto.Stock < itemCart.Cantidad)
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
            }

            // 4. Totales (IVA REMOVIDO, DOMICILIO CALCULADO POR COMUNA)
            var config = await _tiendaService.GetConfiguracionAsync();
            var costosDesdeConfig = GetCostosEnvioDesdeConfig(config);
            
            decimal costoEnvio = 5000m; // Valor por defecto
            if (!string.IsNullOrEmpty(request.Comuna))
            {
                if (!costosDesdeConfig.TryGetValue(request.Comuna, out costoEnvio))
                {
                    throw new Exception($"La comuna '{request.Comuna}' no es válida para entregas. Comunas permitidas: {string.Join(", ", costosDesdeConfig.Keys)}");
                }
            }
            pedido.CostoEnvio = costoEnvio;
            pedido.Total = subtotal + pedido.CostoEnvio;
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

            // 7. Historial - Registro inicial del pedido
            var historialInicial = new PedidoHistorial
            {
                PedidoId = pedido.Id,
                EstadoAnterior = "",
                EstadoNuevo = pedido.Estado,
                FechaCambio = GetBogotaTime(),
                CambiadoPor = userId,
                Notas = "Pedido creado exitosamente"
            };
            _context.PedidoHistoriales.Add(historialInicial);

            // Guardamos cambios finales
            await _unitOfWork.SaveChangesAsync();

            // 10. Notificar a los administradores de nuevo pedido
            try
            {
                var admins = (await _unitOfWork.Users.GetAllAsync())
                    .Where(u => u.Id == 1 || (u.Email != null && u.Email.Contains("admin")));
                foreach (var admin in admins)
                {
                    await _notificacionService.CrearNotificacionAsync(
                        admin.Id,
                        $"Nuevo Pedido #{pedido.Id} 🛒",
                        $"Se ha realizado un nuevo pedido por ${pedido.Total:N0}. Revisa los detalles en el panel de administración.",
                        "Pedido",
                        "/admin/pedidos"
                    );
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error al enviar notificación de nuevo pedido a administradores");
            }

            // 11. Retorno con datos completos (Include)
            var pedidoCompleto = await _unitOfWork.Pedidos.GetByIdWithDetailsAsync(pedido.Id)
                                 ?? await _unitOfWork.Pedidos.GetByIdAsync(pedido.Id);

            return _mapper.Map<PedidoResponseDto>(pedidoCompleto);
        }

        // --- MÉTODOS DE LECTURA ---

        // 👇 ESTE ES EL QUE NECESITA EL DASHBOARD
        public async Task<List<PedidoResponseDto>> GetAllAsync()
        {
            // Llama al repositorio que modificamos anteriormente (con los Includes de Usuario)
            var pedidos = await _unitOfWork.Pedidos.GetAllAsync();
            var pedidosDto = _mapper.Map<List<PedidoResponseDto>>(pedidos);
            
            // Transformar "Confirmado" a "Pendiente" para el admin
            // (El cliente ve "Confirmado", el admin ve "Pendiente" para gestión operativa)
            foreach (var pedido in pedidosDto)
            {
                if (pedido.Estado == "Confirmado")
                {
                    pedido.Estado = "Pendiente";
                }
            }
            
            return pedidosDto;
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

            // Guardar estado anterior para el historial
            var estadoAnterior = pedido.Estado;

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
            if (request.Estado == "Pendiente" && estadoAnterior == "NoEntregado")
            {
                pedido.FechaNoEntrega = null;
                pedido.RepartidorId = null; // LIMPIAR REPARTIDOR PARA REASIGNACIÓN
            }
            else if ((request.Estado == "Pendiente" || request.Estado == "Confirmado") && estadoAnterior == "NoEntregado")
            {
                pedido.FechaNoEntrega = null;
            }

            await _unitOfWork.Pedidos.UpdateAsync(pedido);
            await _unitOfWork.SaveChangesAsync();

            // Crear registro de historial
            var historial = new PedidoHistorial
            {
                PedidoId = pedido.Id,
                EstadoAnterior = estadoAnterior,
                EstadoNuevo = request.Estado,
                FechaCambio = GetBogotaTime(),
                Notas = request.MotivoNoEntrega,
                CambiadoPor = request.UsuarioId
            };
            _context.PedidoHistoriales.Add(historial);

            // NOTA: Ya NO se crea automáticamente una reclamación cuando el pedido se marca como "NoEntregado"
            // El cliente deberá crear la reclamación manualmente desde su perfil
            
            await _unitOfWork.SaveChangesAsync();

            // Notificar al usuario del cambio de estado
            try
            {
                var estadoMensaje = request.Estado switch
                {
                    "EnProceso" => "está siendo preparado 👨‍🍳",
                    "EnCamino" => "está en camino 🚚",
                    "Entregado" => "fue entregado exitosamente ✅",
                    "NoEntregado" => "no pudo ser entregado. Por favor contactanos para crear una reclamación. ❌",
                    "Cancelado" => "fue cancelado 🚫",
                    _ => $"cambió a {request.Estado}"
                };

                // Enlace dinámico según el estado
                var enlace = request.Estado switch
                {
                    "NoEntregado" => $"/reclamaciones?pedidoId={pedido.Id}",
                    _ => "/history"
                };

                await _notificacionService.CrearNotificacionAsync(
                    pedido.UsuarioId,
                    $"Pedido #{pedido.Id} - {request.Estado}",
                    $"Tu pedido #{pedido.Id} {estadoMensaje}",
                    "Pedido",
                    enlace
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
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error al enviar notificación de cambio de estado para pedido {PedidoId}", pedido.Id);
            }

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
                    else if (request.Estado == "NoEntregado")
                    {
                        // Correo especial de no entrega con motivo y plazo para reclamar
                        await _emailService.SendDeliveryFailedEmailAsync(
                            user.Email, 
                            user.Nombre, 
                            pedido.Id, 
                            request.MotivoNoEntrega ?? "Motivo no registrado",
                            pedido.FechaNoEntrega ?? GetBogotaTime()
                        );
                    }
                    else
                    {
                        await _emailService.SendOrderStatusUpdateEmailAsync(user.Email, user.Nombre, pedido.Id, request.Estado);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error al enviar correo de cambio de estado para pedido {PedidoId}", pedido.Id);
            }

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
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error al enviar notificación/email de asignación de repartidor para pedido {PedidoId}", pedido.Id);
            }

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
                    // Solo restaurar stock si el item tiene ProductoId Y el producto NO tiene inventario ilimitado
                    if (item.ProductoId.HasValue)
                    {
                        var producto = await _unitOfWork.Productos.GetByIdAsync(item.ProductoId.Value);
                        if (producto != null && !producto.StockIlimitado)
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

            // EF cascade will handle PedidoItem, PedidoHistorial, Factura, PersonalizadoConfig
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
