using AutoMapper;
using Microsoft.EntityFrameworkCore;
using PastisserieAPI.Core.Entities;
using PastisserieAPI.Core.Interfaces;
using PastisserieAPI.Infrastructure.Data;
using PastisserieAPI.Services.DTOs.Request;
using PastisserieAPI.Services.DTOs.Response;
using PastisserieAPI.Services.Services.Interfaces;

namespace PastisserieAPI.Services.Services
{
    public class CarritoService : ICarritoService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ApplicationDbContext _context;

        public CarritoService(IUnitOfWork unitOfWork, IMapper mapper, ApplicationDbContext context)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _context = context;
        }

        /// <summary>
        /// Obtiene la configuración de la tienda desde la base de datos
        /// </summary>
        private async Task<ConfiguracionTienda?> GetConfiguracionAsync()
        {
            return await _context.ConfiguracionTienda.FirstOrDefaultAsync();
        }

        public async Task<CarritoResponseDto?> GetByUsuarioIdAsync(int usuarioId)
        {
            var carrito = await _unitOfWork.Carritos.GetByUsuarioIdWithItemsAsync(usuarioId);

            if (carrito == null)
            {
                // Crear carrito si no existe
                carrito = new CarritoCompra
                {
                    UsuarioId = usuarioId,
                    FechaCreacion = DateTime.UtcNow
                };

                await _unitOfWork.Carritos.AddAsync(carrito);
                await _unitOfWork.SaveChangesAsync();
            }

            return _mapper.Map<CarritoResponseDto>(carrito);
        }

        public async Task<CarritoResponseDto> AddItemAsync(int usuarioId, AddToCarritoRequestDto request)
        {
            // Validar que se envíe al menos ProductoId o PromocionId
            if (!request.ProductoId.HasValue && !request.PromocionId.HasValue)
                throw new Exception("Debe especificar un ProductoId o una PromocionId");

            // Obtener o crear carrito
            var carrito = await _unitOfWork.Carritos.GetByUsuarioIdWithItemsAsync(usuarioId);

            if (carrito == null)
            {
                carrito = new CarritoCompra
                {
                    UsuarioId = usuarioId,
                    FechaCreacion = DateTime.UtcNow
                };

                await _unitOfWork.Carritos.AddAsync(carrito);
                await _unitOfWork.SaveChangesAsync();

                // Recargar con items
                carrito = await _unitOfWork.Carritos.GetByUsuarioIdWithItemsAsync(usuarioId);
            }

            Producto? producto = null;
            Promocion? promocion = null;

            // Validar promoción si se envía
            if (request.PromocionId.HasValue)
            {
                promocion = await _unitOfWork.Promociones.GetByIdAsync(request.PromocionId.Value);
                if (promocion == null)
                    throw new Exception("Promoción no encontrada");

                if (!promocion.Activo || !promocion.EstaVigente())
                    throw new Exception("La promoción no está vigente");

                // Para promociones independientes (sin ProductoId en la promoción)
                if (promocion.ProductoId == null)
                {
                    // Validar stock de la promoción
                    if (promocion.Stock.HasValue)
                    {
                        var unidadesEnCarritoParaPromo = carrito!.Items
                            .Where(i => i.PromocionId == request.PromocionId.Value)
                            .Sum(i => i.Cantidad);

                        if (unidadesEnCarritoParaPromo + request.Cantidad > promocion.Stock.Value)
                            throw new Exception($"Stock promocional insuficiente. Solo quedan {promocion.Stock.Value - unidadesEnCarritoParaPromo} unidades disponibles");
                    }

                    // Regla de negocio: máximo 3 unidades por promoción independiente por usuario
                    var unidadesPromoEnCarrito = carrito!.Items
                        .Where(i => i.PromocionId == request.PromocionId.Value)
                        .Sum(i => i.Cantidad);

                    if (unidadesPromoEnCarrito + request.Cantidad > 3)
                        throw new Exception($"Solo puedes agregar hasta 3 unidades de esta promoción. Ya tienes {unidadesPromoEnCarrito} en el carrito");

                    // Para promociones independientes, usar el ProductoId del request si existe
                    // Si no, necesitamos crear un "producto virtual" o manejar null
                    if (!request.ProductoId.HasValue)
                    {
                        // Esta es una promoción independiente pura, sin producto asociado
                        // Verificar si ya existe en el carrito
                        var itemExistentePromo = carrito.Items.FirstOrDefault(i =>
                            i.PromocionId == request.PromocionId && i.ProductoId == null);

                        if (itemExistentePromo != null)
                        {
                            itemExistentePromo.Cantidad += request.Cantidad;

                            // Re-validar límite de 3 unidades
                            if (itemExistentePromo.Cantidad > 3)
                                throw new Exception("Solo puedes agregar hasta 3 unidades de esta promoción");
                        }
                        else
                        {
                            // Agregar nuevo item de promoción independiente
                            var nuevoItem = new CarritoItem
                            {
                                CarritoId = carrito.Id,
                                ProductoId = null,
                                Cantidad = request.Cantidad,
                                FechaAgregado = DateTime.UtcNow,
                                PromocionId = request.PromocionId,
                                PrecioOriginal = null
                            };

                            carrito.Items.Add(nuevoItem);
                        }

                        carrito.FechaActualizacion = DateTime.UtcNow;
                        await _unitOfWork.SaveChangesAsync();

                        var carritoActualizadoPromo = await _unitOfWork.Carritos.GetByUsuarioIdWithItemsAsync(usuarioId);
                        return _mapper.Map<CarritoResponseDto>(carritoActualizadoPromo!);
                    }
                }
                else
                {
                    // Promoción asociada a producto: usar el ProductoId de la promoción
                    if (!request.ProductoId.HasValue)
                        request.ProductoId = promocion.ProductoId;
                }
            }

            // Si llegamos aquí, debemos tener un ProductoId
            if (!request.ProductoId.HasValue)
                throw new Exception("ProductoId es requerido para productos normales");

            // Verificar que el producto exista
            producto = await _unitOfWork.Productos.GetByIdAsync(request.ProductoId.Value);

            if (producto == null || !producto.Activo)
                throw new Exception("Producto no encontrado o inactivo");

            // Validar stock solo si el producto NO tiene inventario ilimitado
            if (!producto.StockIlimitado && producto.Stock < request.Cantidad)
                throw new Exception($"Stock insuficiente. Solo hay {producto.Stock} unidades disponibles");

            // Validar límite de unidades por producto (regla de negocio configurable)
            var configuracion = await GetConfiguracionAsync();
            if (configuracion != null && configuracion.LimitarUnidadesPorProducto)
            {
                var unidadesExistentes = carrito!.Items
                    .Where(i => i.ProductoId == request.ProductoId)
                    .Sum(i => i.Cantidad);

                var totalUnidades = unidadesExistentes + request.Cantidad;

                if (totalUnidades > configuracion.MaxUnidadesPorProducto)
                {
                    throw new Exception($"Solo puedes agregar hasta {configuracion.MaxUnidadesPorProducto} unidades de este producto. Ya tienes {unidadesExistentes} en el carrito");
                }
            }

            // Si hay promoción asociada a producto, validar límite de 3 unidades
            if (request.PromocionId.HasValue)
            {
                var unidadesPromoEnCarrito = carrito!.Items
                    .Where(i => i.PromocionId == request.PromocionId.Value && i.ProductoId == request.ProductoId)
                    .Sum(i => i.Cantidad);

                if (unidadesPromoEnCarrito + request.Cantidad > 3)
                    throw new Exception($"Solo puedes agregar hasta 3 unidades de este producto con esta promoción. Ya tienes {unidadesPromoEnCarrito} en el carrito");
            }

            // Verificar si el producto ya está en el carrito (misma promoción o sin promoción)
            var itemExistente = carrito!.Items.FirstOrDefault(i =>
                i.ProductoId == request.ProductoId && i.PromocionId == request.PromocionId);

            if (itemExistente != null)
            {
                itemExistente.Cantidad += request.Cantidad;

                if (producto.Stock < itemExistente.Cantidad)
                    throw new Exception($"Stock insuficiente. Solo hay {producto.Stock} unidades disponibles");

                // Re-validar límite de 3 unidades para items promocionales
                if (request.PromocionId.HasValue && itemExistente.Cantidad > 3)
                    throw new Exception($"Solo puedes agregar hasta 3 unidades de este producto con esta promoción");
            }
            else
            {
                // Agregar nuevo item
                var nuevoItem = new CarritoItem
                {
                    CarritoId = carrito.Id,
                    ProductoId = request.ProductoId,
                    Cantidad = request.Cantidad,
                    FechaAgregado = DateTime.UtcNow,
                    PromocionId = request.PromocionId,
                    PrecioOriginal = request.PromocionId.HasValue ? producto.Precio : null
                };

                carrito.Items.Add(nuevoItem);
            }

            carrito.FechaActualizacion = DateTime.UtcNow;
            await _unitOfWork.SaveChangesAsync();

            // Recargar carrito con items actualizados
            var carritoActualizado = await _unitOfWork.Carritos.GetByUsuarioIdWithItemsAsync(usuarioId);
            return _mapper.Map<CarritoResponseDto>(carritoActualizado!);
        }

        public async Task<CarritoResponseDto?> UpdateItemAsync(int usuarioId, int itemId, UpdateCarritoItemRequestDto request)
        {
            var carrito = await _unitOfWork.Carritos.GetByUsuarioIdWithItemsAsync(usuarioId);

            if (carrito == null)
                return null;

            var item = carrito.Items.FirstOrDefault(i => i.Id == itemId);

            if (item == null)
                return null;

            // Para promociones independientes (sin ProductoId), solo validar límite de 3 unidades
            if (!item.ProductoId.HasValue && item.PromocionId.HasValue)
            {
                if (request.Cantidad > 3)
                    throw new Exception("Solo puedes tener hasta 3 unidades de esta promoción");

                item.Cantidad = request.Cantidad;
                carrito.FechaActualizacion = DateTime.UtcNow;

                await _unitOfWork.SaveChangesAsync();

                var carritoActualizadoPromo = await _unitOfWork.Carritos.GetByUsuarioIdWithItemsAsync(usuarioId);
                return _mapper.Map<CarritoResponseDto>(carritoActualizadoPromo!);
            }

            // Para items con producto, verificar stock
            if (item.ProductoId.HasValue)
            {
                var producto = await _unitOfWork.Productos.GetByIdAsync(item.ProductoId.Value);

                if (producto == null)
                    throw new Exception("Producto no encontrado");

                if (producto.Stock < request.Cantidad)
                    throw new Exception($"Stock insuficiente. Solo hay {producto.Stock} unidades disponibles");

                // Validar límite de unidades por producto (regla de negocio configurable)
                var configuracion = await GetConfiguracionAsync();
                if (configuracion != null && configuracion.LimitarUnidadesPorProducto)
                {
                    if (request.Cantidad > configuracion.MaxUnidadesPorProducto)
                    {
                        throw new Exception($"Solo puedes agregar hasta {configuracion.MaxUnidadesPorProducto} unidades de este producto");
                    }
                }

                // Validar límite de 3 unidades para items promocionales
                if (item.PromocionId.HasValue && request.Cantidad > 3)
                    throw new Exception("Solo puedes tener hasta 3 unidades de este producto con esta promoción");
            }

            item.Cantidad = request.Cantidad;
            carrito.FechaActualizacion = DateTime.UtcNow;

            await _unitOfWork.SaveChangesAsync();

            var carritoActualizado = await _unitOfWork.Carritos.GetByUsuarioIdWithItemsAsync(usuarioId);
            return _mapper.Map<CarritoResponseDto>(carritoActualizado!);
        }

        public async Task<bool> RemoveItemAsync(int usuarioId, int itemId)
        {
            var carrito = await _unitOfWork.Carritos.GetByUsuarioIdWithItemsAsync(usuarioId);

            if (carrito == null)
                return false;

            var item = carrito.Items.FirstOrDefault(i => i.Id == itemId);

            if (item == null)
                return false;

            carrito.Items.Remove(item);
            carrito.FechaActualizacion = DateTime.UtcNow;

            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ClearCarritoAsync(int usuarioId)
        {
            var carrito = await _unitOfWork.Carritos.GetByUsuarioIdAsync(usuarioId);

            if (carrito == null)
                return false;

            await _unitOfWork.Carritos.ClearCarritoAsync(carrito.Id);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }
    }
}