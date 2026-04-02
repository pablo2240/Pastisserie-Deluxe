namespace PastisserieAPI.Services.DTOs.Request
{
    public class CreateDireccionRequestDto
    {
        public string NombreCompleto { get; set; } = string.Empty;
        public string Direccion { get; set; } = string.Empty;
        public string? Barrio { get; set; }
        public string? Referencia { get; set; }
        public string? Comuna { get; set; }
        public string Telefono { get; set; } = string.Empty;
        public bool EsPredeterminada { get; set; } = false;
        
        // Coordenadas geográficas opcionales
        public double? Latitud { get; set; }
        public double? Longitud { get; set; }
    }
}