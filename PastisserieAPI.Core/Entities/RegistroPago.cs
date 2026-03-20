using System;
using System.Collections.Generic;

namespace PastisserieAPI.Core.Entities
{
    public class RegistroPago
    {
        public int Id { get; set; }
        public int PedidoId { get; set; }
        public int UsuarioId { get; set; }
        public string Estado { get; set; } = "Espera"; // Espera, Exitoso, Fallido
        public DateTime FechaIntento { get; set; } = DateTime.UtcNow;
        public DateTime? FechaConfirmacion { get; set; }
        public string? MensajeError { get; set; }
        public string? ReferenciaExterna { get; set; }
        public virtual Pedido? Pedido { get; set; }
    }
}
