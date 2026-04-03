using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PastisserieAPI.Core.Interfaces;
using PastisserieAPI.Services.DTOs.Common;

namespace PastisserieAPI.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UploadController : ControllerBase
    {
        private readonly IBlobStorageService _blobStorageService;
        private readonly ILogger<UploadController> _logger;

        public UploadController(IBlobStorageService blobStorageService, ILogger<UploadController> logger)
        {
            _blobStorageService = blobStorageService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(ApiResponse.ErrorResponse("No se ha seleccionado ningún archivo."));
            }

            try
            {
                // Validar extensión
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest(ApiResponse.ErrorResponse("Tipo de archivo no permitido. Solo se permiten imágenes."));
                }

                // Validar tamaño (max 5MB)
                if (file.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(ApiResponse.ErrorResponse("La imagen no debe superar los 5MB."));
                }

                // Generar nombre único
                var uniqueFileName = $"products/{Guid.NewGuid()}{extension}";

                // Subir a Blob Storage
                using var stream = file.OpenReadStream();
                var fileUrl = await _blobStorageService.UploadFileAsync(stream, uniqueFileName, file.ContentType);

                return Ok(ApiResponse<object>.SuccessResponse(new { url = fileUrl }, "Imagen subida exitosamente"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al subir archivo");
                return StatusCode(500, ApiResponse.ErrorResponse("Error interno al subir la imagen: " + ex.Message));
            }
        }

        [HttpDelete]
        public async Task<IActionResult> Delete([FromQuery] string url)
        {
            if (string.IsNullOrEmpty(url))
            {
                return BadRequest(ApiResponse.ErrorResponse("URL no proporcionada."));
            }

            try
            {
                // Extraer el nombre del blob de la URL
                // URL formato: https://patisserieimages.blob.core.windows.net/images/products/guid.jpg
                var uri = new Uri(url);
                var blobName = uri.AbsolutePath.TrimStart('/');
                // Remover "images/" del path si existe
                if (blobName.StartsWith("images/"))
                {
                    blobName = blobName.Substring("images/".Length);
                }

                await _blobStorageService.DeleteFileAsync(blobName);
                return Ok(ApiResponse<object>.SuccessResponse(null, "Imagen eliminada exitosamente"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar archivo");
                return StatusCode(500, ApiResponse.ErrorResponse("Error interno al eliminar la imagen: " + ex.Message));
            }
        }
    }
}
