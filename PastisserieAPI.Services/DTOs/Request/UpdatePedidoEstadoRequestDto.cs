namespace PastisserieAPI.Services.DTOs.Request
{
    public class UpdatePedidoEstadoRequestDto
    {
        public string Estado { get; set; } = string.Empty;
        public string? Notas { get; set; }
        public string? MotivoNoEntrega { get; set; }
        
        /// <summary>
        /// ID del usuario que realiza el cambio (admin, repartidor, etc.)
        /// </summary>
        public int? UsuarioId { get; set; }
    }
}