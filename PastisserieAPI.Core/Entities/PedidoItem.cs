using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PastisserieAPI.Core.Entities
{
    public class PedidoItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PedidoId { get; set; }

        /// <summary>
        /// ProductoId puede ser null para promociones independientes que no están asociadas a un producto específico
        /// </summary>
        public int? ProductoId { get; set; }

        [Required]
        public int Cantidad { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal PrecioUnitario { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Subtotal { get; set; }

        // Relaciones
        [ForeignKey("PedidoId")]
        public virtual Pedido Pedido { get; set; } = null!;

        [ForeignKey("ProductoId")]
        public virtual Producto? Producto { get; set; }

        // Promoción asociada (opcional, para items comprados con descuento promocional)
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
