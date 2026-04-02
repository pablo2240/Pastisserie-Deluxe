namespace PastisserieAPI.Services.DTOs.Request
{
    public class CreateProductoRequestDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public decimal Precio { get; set; }
        public int Stock { get; set; }
        /// <summary>
        /// Si es true, el producto tiene inventario ilimitado y no se valida contra Stock
        /// </summary>
        public bool StockIlimitado { get; set; } = false;
        public int? StockMinimo { get; set; }
        public int? CategoriaProductoId { get; set; }
        public string? ImagenUrl { get; set; }
        public bool EsPersonalizable { get; set; } = false;
    }
}