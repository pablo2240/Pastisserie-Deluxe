namespace PastisserieAPI.Services.DTOs.Payment
{
    /// <summary>
    /// DTO that maps the POST body ePayco sends to the url_confirmation (webhook).
    /// Field names match ePayco's documentation exactly.
    /// </summary>
    public class EpaycoWebhookDto
    {
        public string? x_ref_payco { get; set; }
        public string? x_id_invoice { get; set; }
        public string? x_description { get; set; }
        public string? x_amount { get; set; }
        public string? x_amount_country { get; set; }
        public string? x_amount_ok { get; set; }
        public string? x_tax { get; set; }
        public string? x_amount_base { get; set; }
        public string? x_currency_code { get; set; }
        public string? x_bank_name { get; set; }
        public string? x_cardnumber { get; set; }
        public string? x_quotas { get; set; }
        public string? x_response { get; set; }
        public string? x_approval_code { get; set; }
        public string? x_transaction_id { get; set; }
        public string? x_datetime { get; set; }
        public string? x_response_reason_text { get; set; }

        // Cod_respuesta: 1=Accepted, 2=Rejected, 3=Pending, 4=Failed, etc.
        public string? x_cod_response { get; set; }
        public string? x_cod_transaction_state { get; set; }
        public string? x_transaction_state { get; set; }
        public string? x_franchise { get; set; }
        public string? x_business { get; set; }
        public string? x_customer_doctype { get; set; }
        public string? x_customer_document { get; set; }
        public string? x_customer_name { get; set; }
        public string? x_customer_lastname { get; set; }
        public string? x_customer_email { get; set; }
        public string? x_customer_phone { get; set; }
        public string? x_customer_country { get; set; }
        public string? x_customer_city { get; set; }
        public string? x_customer_address { get; set; }
        public string? x_customer_ip { get; set; }
        public string? x_signature { get; set; }
        public string? x_test_request { get; set; }
        public string? x_extra1 { get; set; }
        public string? x_extra2 { get; set; }
        public string? x_extra3 { get; set; }
    }
}
