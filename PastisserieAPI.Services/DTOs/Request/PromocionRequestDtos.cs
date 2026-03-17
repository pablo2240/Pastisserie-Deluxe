using System;

namespace PastisserieAPI.Services.DTOs.Request
{
    public class CreatePromocionRequestDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public string TipoDescuento { get; set; } = "Porcentaje";
        public decimal Valor { get; set; }
        /// <summary>
        /// Stock disponible para la promoción (requerido para independientes sin ProductoId)
        /// </summary>
        public int? Stock { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public bool Activo { get; set; } = true;
        public string? ImagenUrl { get; set; }
        /// <summary>
        /// ID del producto asociado (null para promociones independientes)
        /// </summary>
        public int? ProductoId { get; set; }
        /// <summary>
        /// Precio original antes del descuento.
        /// Obligatorio para promociones independientes (sin ProductoId).
        /// </summary>
        public decimal? PrecioOriginal { get; set; }
    }

    public class UpdatePromocionRequestDto : CreatePromocionRequestDto
    {
        public int Id { get; set; }
    }
}
