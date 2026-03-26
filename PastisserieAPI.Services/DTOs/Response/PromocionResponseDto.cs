using System;

namespace PastisserieAPI.Services.DTOs.Response
{
    public class PromocionResponseDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public string TipoDescuento { get; set; } = "Porcentaje";
        public decimal Valor { get; set; }
        /// <summary>
        /// Stock disponible para la promoción (para independientes)
        /// </summary>
        public int? Stock { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public bool Activo { get; set; }
        public string? ImagenUrl { get; set; }
        /// <summary>
        /// ID del producto asociado (null si es promoción independiente)
        /// </summary>
        public int? ProductoId { get; set; }
        /// <summary>
        /// Nombre del producto asociado (para mostrar en UI sin fetch adicional)
        /// </summary>
        public string? ProductoNombre { get; set; }
        /// <summary>
        /// URL de imagen del producto asociado
        /// </summary>
        public string? ProductoImagenUrl { get; set; }
        /// <summary>
        /// Precio del producto asociado (para referencia en UI)
        /// </summary>
        public decimal? ProductoPrecio { get; set; }
        /// <summary>
        /// Precio original antes del descuento.
        /// Para promociones con producto: se toma del producto.
        /// Para independientes: valor ingresado por el admin.
        /// </summary>
        public decimal? PrecioOriginal { get; set; }
        /// <summary>
        /// Precio final calculado después de aplicar el descuento.
        /// Computado en el servidor: PrecioEfectivo - descuento.
        /// </summary>
        public decimal? PrecioFinal { get; set; }
        /// <summary>
        /// Stock del producto asociado (para promociones con producto)
        /// </summary>
        public int? ProductoStock { get; set; }
    }
}
