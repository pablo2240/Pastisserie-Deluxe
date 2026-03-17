using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PastisserieAPI.Core.Entities
{
    public class Promocion : IValidatableObject
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Descripcion { get; set; }

        /// <summary>
        /// Tipo de descuento: "Porcentaje" o "MontoFijo"
        /// </summary>
        [Required]
        [MaxLength(20)]
        public string TipoDescuento { get; set; } = "Porcentaje";

        /// <summary>
        /// Valor del descuento (% o monto en dinero)
        /// </summary>
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Valor { get; set; }

        /// <summary>
        /// Stock disponible para la promoción (usado en promociones independientes).
        /// Para promociones con producto, se usa el stock del producto asociado.
        /// </summary>
        public int? Stock { get; set; }

        /// <summary>
        /// Fecha de inicio de la promoción
        /// </summary>
        [Required]
        public DateTime FechaInicio { get; set; }

        /// <summary>
        /// Fecha de fin de la promoción
        /// </summary>
        [Required]
        public DateTime FechaFin { get; set; }

        /// <summary>
        /// Indica si la promoción está activa
        /// </summary>
        public bool Activo { get; set; } = true;

        /// <summary>
        /// Precio original del producto/servicio antes del descuento.
        /// Obligatorio para promociones independientes (sin ProductoId).
        /// Para promociones con producto, se toma del producto asociado si no se especifica.
        /// </summary>
        [Column(TypeName = "decimal(18,2)")]
        public decimal? PrecioOriginal { get; set; }

        /// <summary>
        /// URL de imagen opcional para la promoción (usada en promociones independientes)
        /// </summary>
        [MaxLength(500)]
        public string? ImagenUrl { get; set; }

        /// <summary>
        /// Producto asociado a la promoción (opcional).
        /// Si es null, la promoción es independiente y usa ImagenUrl propia.
        /// </summary>
        [ForeignKey(nameof(Producto))]
        public int? ProductoId { get; set; }
        public Producto? Producto { get; set; }

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        public DateTime? FechaActualizacion { get; set; }

        /// <summary>
        /// Verifica si la promoción está vigente en la fecha actual
        /// </summary>
        public bool EstaVigente()
        {
            var ahora = DateTime.UtcNow;
            return Activo && ahora >= FechaInicio && ahora <= FechaFin;
        }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (FechaFin <= FechaInicio)
            {
                yield return new ValidationResult(
                    "La fecha de fin debe ser posterior a la fecha de inicio.",
                    new[] { nameof(FechaFin) }
                );
            }
        }
    }
}
