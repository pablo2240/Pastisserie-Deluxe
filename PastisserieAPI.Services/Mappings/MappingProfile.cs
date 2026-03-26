using AutoMapper;
using PastisserieAPI.Core.Entities;
using PastisserieAPI.Services.DTOs.Request;
using PastisserieAPI.Services.DTOs.Response;

namespace PastisserieAPI.Services.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // ============ USER MAPPINGS ============
            CreateMap<User, UserResponseDto>()
                .ForMember(dest => dest.Roles, opt => opt.MapFrom(src =>
                    src.UserRoles.Select(ur => ur.Rol.Nombre).ToList()));

            // 👇 NUEVO MAPA: Para convertir la entidad User en el resumen pequeño
            CreateMap<User, UsuarioResumenDto>() // O CreateMap<Usuario, UsuarioResumenDto> según tu entidad
                .ForMember(dest => dest.Nombre, opt => opt.MapFrom(src => src.Nombre))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email));

            CreateMap<RegisterRequestDto, User>()
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.FechaRegistro, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.Activo, opt => opt.MapFrom(src => true))
                .ForMember(dest => dest.EmailVerificado, opt => opt.MapFrom(src => false));

            CreateMap<CreateUserRequestDto, User>()
                .IncludeBase<RegisterRequestDto, User>();

            CreateMap<UpdateUserRequestDto, User>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // ============ PRODUCTO MAPPINGS ============
            CreateMap<Producto, ProductoResponseDto>()
                .ForMember(dest => dest.PromedioCalificacion, opt => opt.MapFrom(src =>
                    src.Reviews.Any(r => r.Aprobada)
                        ? src.Reviews.Where(r => r.Aprobada).Average(r => r.Calificacion)
                        : 0))
                .ForMember(dest => dest.TotalReviews, opt => opt.MapFrom(src =>
                    src.Reviews.Count(r => r.Aprobada)));

            CreateMap<CreateProductoRequestDto, Producto>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.Activo, opt => opt.MapFrom(src => true));

            CreateMap<UpdateProductoRequestDto, Producto>()
                .ForMember(dest => dest.FechaActualizacion, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // ============ PEDIDO MAPPINGS (ACTUALIZADO) ============
            CreateMap<Pedido, PedidoResponseDto>()
                .ForMember(dest => dest.NombreUsuario, opt => opt.MapFrom(src => src.Usuario.Nombre))
                // 👇 ESTA LÍNEA ES LA CLAVE: Mapeamos el objeto completo
                .ForMember(dest => dest.Usuario, opt => opt.MapFrom(src => src.Usuario))
                .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.Items))
                .ForMember(dest => dest.MetodoPago, opt => opt.MapFrom(src => src.MetodoPago.TipoMetodoPago.Nombre))
                .ForMember(dest => dest.DireccionEnvio, opt => opt.MapFrom(src => src.DireccionEnvio));

            CreateMap<PedidoItem, PedidoItemResponseDto>()
                .ForMember(dest => dest.NombreProducto, opt => opt.MapFrom(src => src.Producto != null ? src.Producto.Nombre : "Producto Desconocido"))
                .ForMember(dest => dest.PromocionId, opt => opt.MapFrom(src => src.PromocionId))
                .ForMember(dest => dest.NombrePromocion, opt => opt.MapFrom(src =>
                    src.Promocion != null ? src.Promocion.Nombre : null))
                .ForMember(dest => dest.PrecioOriginal, opt => opt.MapFrom(src => src.PrecioOriginal));

            CreateMap<CreatePedidoRequestDto, Pedido>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.FechaPedido, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.Estado, opt => opt.MapFrom(src => "Pendiente"))
                .ForMember(dest => dest.Aprobado, opt => opt.MapFrom(src => false))
                .ForMember(dest => dest.MetodoPago, opt => opt.Ignore())
                .ForMember(dest => dest.Items, opt => opt.Ignore());

            CreateMap<PedidoItemRequestDto, PedidoItem>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.PedidoId, opt => opt.Ignore())
                .ForMember(dest => dest.PrecioUnitario, opt => opt.Ignore())
                .ForMember(dest => dest.Subtotal, opt => opt.Ignore());

            // ============ CARRITO MAPPINGS ============
            CreateMap<CarritoCompra, CarritoResponseDto>()
                .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.Items))
                .ForMember(dest => dest.Total, opt => opt.MapFrom(src => CalcularTotalCarrito(src)))
                .ForMember(dest => dest.TotalItems, opt => opt.MapFrom(src =>
                    src.Items.Sum(i => i.Cantidad)));

            CreateMap<CarritoItem, CarritoItemResponseDto>()
                .ForMember(dest => dest.NombreProducto, opt => opt.MapFrom(src =>
                    src.Producto != null ? src.Producto.Nombre :
                    (src.Promocion != null ? src.Promocion.Nombre : "Promoción")))
                .ForMember(dest => dest.PrecioUnitario, opt => opt.MapFrom(src =>
                    // Caso 1: Promoción independiente (sin producto)
                    src.ProductoId == null && src.PromocionId != null && src.Promocion != null && src.Promocion.PrecioOriginal.HasValue
                        ? CalcularPrecioFinal(src.Promocion.PrecioOriginal.Value, src.Promocion.TipoDescuento, src.Promocion.Valor) ?? src.Promocion.PrecioOriginal.Value
                    // Caso 2: Producto con promoción
                    : src.PromocionId != null && src.Promocion != null && src.Producto != null
                        ? CalcularPrecioFinal(src.Producto.Precio, src.Promocion.TipoDescuento, src.Promocion.Valor) ?? src.Producto.Precio
                    // Caso 3: Producto sin promoción
                    : src.Producto != null ? src.Producto.Precio : 0))
                .ForMember(dest => dest.Subtotal, opt => opt.MapFrom(src =>
                    // Caso 1: Promoción independiente (sin producto)
                    src.ProductoId == null && src.PromocionId != null && src.Promocion != null && src.Promocion.PrecioOriginal.HasValue
                        ? src.Cantidad * (CalcularPrecioFinal(src.Promocion.PrecioOriginal.Value, src.Promocion.TipoDescuento, src.Promocion.Valor) ?? src.Promocion.PrecioOriginal.Value)
                    // Caso 2: Producto con promoción
                    : src.PromocionId != null && src.Promocion != null && src.Producto != null
                        ? src.Cantidad * (CalcularPrecioFinal(src.Producto.Precio, src.Promocion.TipoDescuento, src.Promocion.Valor) ?? src.Producto.Precio)
                    // Caso 3: Producto sin promoción
                    : src.Producto != null ? src.Cantidad * src.Producto.Precio : 0))
                .ForMember(dest => dest.ImagenUrl, opt => opt.MapFrom(src =>
                    // Usar imagen del producto si existe, sino usar imagen de la promoción
                    src.Producto != null ? src.Producto.ImagenUrl :
                    (src.Promocion != null ? src.Promocion.ImagenUrl : null)))
                .ForMember(dest => dest.PromocionId, opt => opt.MapFrom(src => src.PromocionId))
                .ForMember(dest => dest.NombrePromocion, opt => opt.MapFrom(src =>
                    src.Promocion != null ? src.Promocion.Nombre : null))
                .ForMember(dest => dest.PrecioOriginal, opt => opt.MapFrom(src =>
                    // Para promociones independientes, usar PrecioOriginal de la promoción
                    src.ProductoId == null && src.Promocion != null ? src.Promocion.PrecioOriginal :
                    // Para productos con promoción, usar precio del producto
                    src.PromocionId != null && src.Producto != null ? (decimal?)src.Producto.Precio : null));

            CreateMap<AddToCarritoRequestDto, CarritoItem>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CarritoId, opt => opt.Ignore())
                .ForMember(dest => dest.FechaAgregado, opt => opt.MapFrom(src => DateTime.UtcNow));

            // ============ REVIEW MAPPINGS ============
            CreateMap<Review, ReviewResponseDto>()
                .ForMember(dest => dest.NombreUsuario, opt => opt.MapFrom(src => src.Usuario.Nombre))
                .ForMember(dest => dest.NombreProducto, opt => opt.MapFrom(src => src.Producto.Nombre));

            CreateMap<Notificacion, NotificacionResponseDto>();

            CreateMap<CreateReviewRequestDto, Review>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UsuarioId, opt => opt.Ignore())
                .ForMember(dest => dest.Fecha, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.Aprobada, opt => opt.MapFrom(src => false));

            // ============ DIRECCION MAPPINGS ============
            CreateMap<DireccionEnvio, DireccionEnvioResponseDto>();

            CreateMap<CreateDireccionRequestDto, DireccionEnvio>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UsuarioId, opt => opt.Ignore())
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => DateTime.UtcNow));

            // ============ CATEGORIA MAPPINGS ============
            CreateMap<CategoriaProducto, CategoriaProducto>();

            // ============ PROMOCION MAPPINGS ============
            CreateMap<Promocion, PromocionResponseDto>()
                .ForMember(dest => dest.ProductoNombre, opt => opt.MapFrom(src =>
                    src.Producto != null ? src.Producto.Nombre : null))
                .ForMember(dest => dest.ProductoImagenUrl, opt => opt.MapFrom(src =>
                    src.Producto != null ? src.Producto.ImagenUrl : null))
                .ForMember(dest => dest.ProductoPrecio, opt => opt.MapFrom(src =>
                    src.Producto != null ? (decimal?)src.Producto.Precio : null))
                .ForMember(dest => dest.ProductoStock, opt => opt.MapFrom(src =>
                    src.Producto != null ? (int?)src.Producto.Stock : null))
                .ForMember(dest => dest.PrecioOriginal, opt => opt.MapFrom(src =>
                    src.Producto != null ? (decimal?)src.Producto.Precio : src.PrecioOriginal))
                .ForMember(dest => dest.PrecioFinal, opt => opt.MapFrom(src =>
                    CalcularPrecioFinal(
                        src.Producto != null ? (decimal?)src.Producto.Precio : src.PrecioOriginal,
                        src.TipoDescuento,
                        src.Valor)));
            CreateMap<CreatePromocionRequestDto, Promocion>()
                .ForMember(dest => dest.FechaCreacion, opt => opt.MapFrom(src => DateTime.UtcNow));
            CreateMap<UpdatePromocionRequestDto, Promocion>()
                .ForMember(dest => dest.FechaActualizacion, opt => opt.MapFrom(src => DateTime.UtcNow));
        }

        /// <summary>
        /// Calcula el precio final aplicando el descuento al precio original.
        /// </summary>
        private static decimal? CalcularPrecioFinal(decimal? precioOriginal, string tipoDescuento, decimal valor)
        {
            if (!precioOriginal.HasValue || precioOriginal.Value <= 0) return null;

            decimal resultado;
            if (tipoDescuento == "Porcentaje")
            {
                resultado = precioOriginal.Value * (1 - valor / 100m);
            }
            else // MontoFijo
            {
                resultado = precioOriginal.Value - valor;
            }

            return resultado < 0 ? 0 : Math.Round(resultado, 2);
        }

        /// <summary>
        /// Calcula el total del carrito sumando todos los items con sus respectivos precios.
        /// </summary>
        private static decimal CalcularTotalCarrito(CarritoCompra carrito)
        {
            return carrito.Items.Sum(i =>
            {
                // Caso 1: Promoción independiente (sin producto)
                if (i.ProductoId == null && i.PromocionId != null && i.Promocion != null)
                {
                    if (i.Promocion.PrecioOriginal.HasValue)
                    {
                        var precioPromo = CalcularPrecioFinal(
                            i.Promocion.PrecioOriginal.Value,
                            i.Promocion.TipoDescuento,
                            i.Promocion.Valor) ?? i.Promocion.PrecioOriginal.Value;
                        return i.Cantidad * precioPromo;
                    }
                    return 0;
                }
                // Caso 2: Producto con o sin promoción
                else if (i.Producto != null)
                {
                    if (i.PromocionId != null && i.Promocion != null)
                    {
                        var precioDesc = CalcularPrecioFinal(
                            i.Producto.Precio,
                            i.Promocion.TipoDescuento,
                            i.Promocion.Valor) ?? i.Producto.Precio;
                        return i.Cantidad * precioDesc;
                    }
                    return i.Cantidad * i.Producto.Precio;
                }
                return 0;
            });
        }
    }
}