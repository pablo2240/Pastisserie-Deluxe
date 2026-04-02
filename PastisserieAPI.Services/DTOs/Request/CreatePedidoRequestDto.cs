namespace PastisserieAPI.Services.DTOs.Request
{
    public class CreatePedidoRequestDto
    {
        public int UsuarioId { get; set; }
        public string? MetodoPago { get; set; }
        public int? DireccionEnvioId { get; set; }
        public string? Direccion { get; set; }
        public string? Comuna { get; set; }
        public string? Telefono { get; set; }
        public string? NotasCliente { get; set; }
        public List<PedidoItemRequestDto> Items { get; set; } = new();
        
        // Coordenadas geográficas opcionales
        public double? Latitud { get; set; }
        public double? Longitud { get; set; }
    }

    public class PedidoItemRequestDto
    {
        public int ProductoId { get; set; }
        public int Cantidad { get; set; }
    }
}
