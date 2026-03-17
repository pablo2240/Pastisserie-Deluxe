namespace PastisserieAPI.Services.DTOs.Request
{
    public class AddToCarritoRequestDto
    {
        /// <summary>
        /// ID del producto. Opcional si se está agregando una promoción independiente.
        /// </summary>
        public int? ProductoId { get; set; }
        public int Cantidad { get; set; } = 1;
        /// <summary>
        /// ID de la promoción asociada (opcional, para items agregados desde una promoción)
        /// </summary>
        public int? PromocionId { get; set; }
    }
}