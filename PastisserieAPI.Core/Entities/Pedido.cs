using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PastisserieAPI.Core.Entities
{
    public class Pedido
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UsuarioId { get; set; }

        public DateTime FechaPedido { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(50)]
        public string Estado { get; set; } = "Pendiente";

        [Required]
        [MaxLength(100)]
        public string MetodoPago { get; set; } = "Efectivo";

        public int? DireccionEnvioId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Subtotal { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal CostoEnvio { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Total { get; set; }

        public bool Aprobado { get; set; } = false;

        public DateTime? FechaAprobacion { get; set; }

        public DateTime? FechaEntregaEstimada { get; set; }

        public DateTime? FechaEntrega { get; set; }

        [MaxLength(1000)]
        public string? NotasCliente { get; set; }

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public DateTime? FechaActualizacion { get; set; }

        public int? RepartidorId { get; set; }

        [MaxLength(500)]
        public string? MotivoNoEntrega { get; set; }

        public DateTime? FechaNoEntrega { get; set; }

        // Relaciones
        [ForeignKey("UsuarioId")]
        public virtual User Usuario { get; set; } = null!;

        [ForeignKey("RepartidorId")]
        public virtual User? Repartidor { get; set; }

        [ForeignKey("DireccionEnvioId")]
        public virtual DireccionEnvio? DireccionEnvio { get; set; }

        public virtual ICollection<PedidoItem> Items { get; set; } = new List<PedidoItem>();
        public virtual ICollection<PedidoHistorial> Historial { get; set; } = new List<PedidoHistorial>();
    }
}