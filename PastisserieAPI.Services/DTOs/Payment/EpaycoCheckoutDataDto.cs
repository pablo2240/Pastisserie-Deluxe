namespace PastisserieAPI.Services.DTOs.Payment
{
    /// <summary>
    /// Data the backend sends to the frontend so it can open the ePayco Standard Checkout widget.
    /// These fields map to ePayco's checkout.js configuration object.
    /// </summary>
    public class EpaycoCheckoutDataDto
    {
        // Merchant keys (public, safe to expose to frontend)
        public string PublicKey { get; set; } = string.Empty;
        public string PCustIdCliente { get; set; } = string.Empty;

        // Transaction info
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Invoice { get; set; } = string.Empty; // Our order ID as string
        public string Currency { get; set; } = "COP";
        public string Amount { get; set; } = string.Empty;
        public string TaxBase { get; set; } = "0";
        public string Tax { get; set; } = "0";

        // Buyer info
        public string BuyerEmail { get; set; } = string.Empty;
        public string BuyerFullName { get; set; } = string.Empty;

        // Country
        public string Country { get; set; } = "CO";

        // URLs for ePayco to call/redirect
        public string UrlResponse { get; set; } = string.Empty; // Frontend result page
        public string UrlConfirmation { get; set; } = string.Empty; // Backend webhook endpoint

        // Extra data
        public string Extra1 { get; set; } = string.Empty; // pedidoId
        public string Extra2 { get; set; } = string.Empty; // userId

        // Signature for integrity validation
        public string Signature { get; set; } = string.Empty;

        // Test mode
        public bool Test { get; set; }
    }
}
