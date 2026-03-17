using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PastisserieAPI.Core.Entities
{
    public class CarritoItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CarritoId { get; set; }

        /// <summary>
        /// ProductoId puede ser null para promociones independientes que no están asociadas a un producto específico
        /// </summary>
        public int? ProductoId { get; set; }

        [Required]
        public int Cantidad { get; set; }

        public DateTime FechaAgregado { get; set; } = DateTime.UtcNow;

        // Relaciones
        [ForeignKey("CarritoId")]
        public virtual CarritoCompra Carrito { get; set; } = null!;

        [ForeignKey("ProductoId")]
        public virtual Producto? Producto { get; set; }

        // Promoción asociada (opcional, para items agregados desde una promoción)
        public int? PromocionId { get; set; }

        [ForeignKey("PromocionId")]
        public virtual Promocion? Promocion { get; set; }

        /// <summary>
        /// Precio original del producto antes del descuento promocional
        /// </summary>
        [Column(TypeName = "decimal(18,2)")]
        public decimal? PrecioOriginal { get; set; }
    }
}