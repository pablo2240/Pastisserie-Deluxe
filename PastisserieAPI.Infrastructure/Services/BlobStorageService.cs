using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using PastisserieAPI.Core.Interfaces;

namespace PastisserieAPI.Infrastructure.Services
{
    public class BlobStorageService : IBlobStorageService
    {
        private readonly BlobContainerClient _containerClient;
        private readonly string _baseUrl;

        public BlobStorageService(string connectionString, string containerName, string baseUrl)
        {
            _containerClient = new BlobContainerClient(connectionString, containerName);
            // La URL completa del blob incluye el contenedor: baseUrl/containerName/blobName
            _baseUrl = $"{baseUrl.TrimEnd('/')}/{containerName}";
        }

        public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
        {
            var blobClient = _containerClient.GetBlobClient(fileName);

            var options = new BlobUploadOptions
            {
                HttpHeaders = new BlobHttpHeaders
                {
                    ContentType = contentType
                }
            };

            fileStream.Position = 0;
            await blobClient.UploadAsync(fileStream, options);

            return $"{_baseUrl}/{blobClient.Name}";
        }

        public async Task DeleteFileAsync(string fileName)
        {
            var blobClient = _containerClient.GetBlobClient(fileName);
            await blobClient.DeleteIfExistsAsync();
        }
    }
}
