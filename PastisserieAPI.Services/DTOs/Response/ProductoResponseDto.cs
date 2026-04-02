namespace PastisserieAPI.Services.DTOs.Response
{
    public class ProductoResponseDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public decimal Precio { get; set; }
        public int Stock { get; set; }
        /// <summary>
        /// Indica si el producto tiene inventario ilimitado (no se valida contra Stock)
        /// </summary>
        public bool StockIlimitado { get; set; }
        public int? StockMinimo { get; set; }
        public int? CategoriaProductoId { get; set; }
        public string? CategoriaNombre { get; set; }
        public string? ImagenUrl { get; set; }
        public bool EsPersonalizable { get; set; }
        public bool Activo { get; set; }
        public double PromedioCalificacion { get; set; }
        public int TotalReviews { get; set; }
    }
}