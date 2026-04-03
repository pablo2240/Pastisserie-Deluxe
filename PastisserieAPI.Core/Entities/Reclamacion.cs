using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PastisserieAPI.Core.Entities
{
    public class Reclamacion
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PedidoId { get; set; }

        [Required]
        public int UsuarioId { get; set; }

        public DateTime Fecha { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(1000)]
        public string Motivo { get; set; } = string.Empty;

        /// <summary>Estado de la reclamación: Pendiente, EnRevision, Resuelta, Rechazada.</summary>
        [Required]
        [MaxLength(50)]
        public string Estado { get; set; } = "Pendiente";

        // ============ CAMPOS ADICIONALES DEL DOMICILIARIO ============
        /// <summary>Motivo por el cual el domiciliario marcó como NoEntregado.</summary>
        [MaxLength(1000)]
        public string? MotivoDomiciliario { get; set; }

        /// <summary>Fecha cuando se marcó el pedido como NoEntregado.</summary>
        public DateTime? FechaNoEntrega { get; set; }

        /// <summary>ID del domiciliario que marcó el pedido como NoEntregado.</summary>
        public int? DomiciliarioId { get; set; }

        // ============ RELACIONES ============
        [ForeignKey("PedidoId")]
        public virtual Pedido Pedido { get; set; } = null!;

        [ForeignKey("UsuarioId")]
        public virtual User Usuario { get; set; } = null!;

        [ForeignKey("DomiciliarioId")]
        public virtual User? Domiciliario { get; set; }
    }
}
