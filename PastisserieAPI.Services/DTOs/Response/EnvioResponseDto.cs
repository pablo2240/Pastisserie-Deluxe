namespace PastisserieAPI.Services.DTOs.Response
{
    public class EnvioResponseDto
    {
        public int Id { get; set; }
        public int PedidoId { get; set; }
        public int? RepartidorId { get; set; }
        public string? NombreRepartidor { get; set; }
        public string? NombreCliente { get; set; }
        public string? NumeroGuia { get; set; }
        public string Estado { get; set; } = string.Empty;
        public DateTime FechaDespacho { get; set; }
        public DateTime? FechaEntrega { get; set; }
        public DateTime FechaActualizacion { get; set; }
        public string? DireccionEnvio { get; set; }
        public decimal TotalPedido { get; set; }
    }
}
