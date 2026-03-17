using PastisserieAPI.Services.DTOs.Payment;

namespace PastisserieAPI.Services.Services.Interfaces
{
    public interface IEpaycoService
    {
        /// <summary>
        /// Generates the checkout data needed by the frontend to open the ePayco Standard Checkout widget.
        /// </summary>
        Task<EpaycoCheckoutDataDto> GenerateCheckoutDataAsync(int pedidoId, int userId);

        /// <summary>
        /// Processes the ePayco webhook (url_confirmation) to validate and update the order status.
        /// </summary>
        Task ProcessWebhookAsync(EpaycoWebhookDto webhook);

        /// <summary>
        /// Validates a transaction by querying ePayco's API using the ref_payco.
        /// Returns the transaction status from ePayco.
        /// </summary>
        Task<EpaycoTransactionResultDto> ValidateTransactionAsync(string refPayco);
    }
}
