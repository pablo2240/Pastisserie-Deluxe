namespace PastisserieAPI.Core.Interfaces
{
    public interface IBlobStorageService
    {
        /// <summary>
        /// Sube un archivo a Azure Blob Storage y devuelve la URL pública.
        /// </summary>
        Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType);

        /// <summary>
        /// Elimina un archivo de Azure Blob Storage por su nombre.
        /// </summary>
        Task DeleteFileAsync(string fileName);
    }
}
