namespace PastisserieAPI.Services.DTOs.Payment
{
    /// <summary>
    /// Result of validating a transaction via ePayco's API.
    /// </summary>
    public class EpaycoTransactionResultDto
    {
        public bool Success { get; set; }
        public string RefPayco { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // Aceptada, Rechazada, Pendiente, Fallida
        public int CodResponse { get; set; }
        public string ResponseReasonText { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty; // Franchise
        public string Invoice { get; set; } = string.Empty; // Our pedidoId
    }
}
