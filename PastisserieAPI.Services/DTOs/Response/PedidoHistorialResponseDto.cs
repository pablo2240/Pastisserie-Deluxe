namespace PastisserieAPI.Services.DTOs.Response
{
    public class PedidoHistorialResponseDto
    {
        public int Id { get; set; }
        public int PedidoId { get; set; }
        public string EstadoAnterior { get; set; } = string.Empty;
        public string EstadoNuevo { get; set; } = string.Empty;
        public DateTime FechaCambio { get; set; }
        public int? CambiadoPor { get; set; }
        public string? Notas { get; set; }
    }
}
