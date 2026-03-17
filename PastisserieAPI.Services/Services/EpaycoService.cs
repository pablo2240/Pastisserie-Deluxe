using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using PastisserieAPI.Core.Interfaces;
using PastisserieAPI.Services.DTOs.Payment;
using PastisserieAPI.Services.Services.Interfaces;

namespace PastisserieAPI.Services.Services
{
    public class EpaycoService : IEpaycoService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;
        private readonly ILogger<EpaycoService> _logger;
        private readonly HttpClient _httpClient;

        // Config values
        private readonly string _publicKey;
        private readonly string _privateKey;
        private readonly string _pCustIdCliente;
        private readonly string _pKey;
        private readonly bool _test;
        private readonly string _backendBaseUrl;
        private readonly string _frontendBaseUrl;

        public EpaycoService(
            IUnitOfWork unitOfWork,
            IConfiguration configuration,
            ILogger<EpaycoService> logger,
            HttpClient httpClient)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
            _logger = logger;
            _httpClient = httpClient;

            var epaycoSection = _configuration.GetSection("Epayco");
            _publicKey = epaycoSection["PublicKey"] ?? throw new InvalidOperationException("Epayco:PublicKey not configured");
            _privateKey = epaycoSection["PrivateKey"] ?? throw new InvalidOperationException("Epayco:PrivateKey not configured");
            _pCustIdCliente = epaycoSection["PCustIdCliente"] ?? throw new InvalidOperationException("Epayco:PCustIdCliente not configured");
            _pKey = epaycoSection["PKey"] ?? throw new InvalidOperationException("Epayco:PKey not configured");
            _test = bool.TryParse(epaycoSection["Test"], out var test) && test;
            _backendBaseUrl = epaycoSection["BackendBaseUrl"] ?? "http://localhost:5176";
            _frontendBaseUrl = epaycoSection["FrontendBaseUrl"] ?? "http://localhost:5173";
        }

        public async Task<EpaycoCheckoutDataDto> GenerateCheckoutDataAsync(int pedidoId, int userId)
        {
            var pedido = await _unitOfWork.Pedidos.GetByIdWithDetailsAsync(pedidoId)
                         ?? await _unitOfWork.Pedidos.GetByIdAsync(pedidoId);

            if (pedido == null)
                throw new Exception($"Pedido #{pedidoId} no encontrado.");

            if (pedido.UsuarioId != userId)
                throw new UnauthorizedAccessException("No tienes permiso para pagar este pedido.");

            if (pedido.Aprobado)
                throw new Exception("Este pedido ya fue pagado.");

            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null)
                throw new Exception("Usuario no encontrado.");

            // Generate integrity signature: SHA-256(p_cust_id_cliente + p_key + ref_payco + invoice + amount + currency)
            // For Standard Checkout, the signature is generated with: p_cust_id_cliente^p_key^invoice^amount^currency
            var amountStr = pedido.Total.ToString("F2", System.Globalization.CultureInfo.InvariantCulture);
            var signaturePayload = $"{_pCustIdCliente}^{_pKey}^{pedidoId}^{amountStr}^COP";
            var signature = ComputeSha256Hash(signaturePayload);

            var itemsDescription = pedido.Items?.Any() == true
                ? string.Join(", ", pedido.Items.Select(i => i.Producto?.Nombre ?? $"Producto #{i.ProductoId}").Take(3))
                : "Pedido Patisserie Deluxe";

            if (pedido.Items?.Count > 3)
                itemsDescription += $" (+{pedido.Items.Count - 3} mas)";

            var checkoutData = new EpaycoCheckoutDataDto
            {
                PublicKey = _publicKey,
                PCustIdCliente = _pCustIdCliente,
                Name = $"Pedido #{pedidoId} - Patisserie Deluxe",
                Description = itemsDescription,
                Invoice = pedidoId.ToString(),
                Currency = "COP",
                Amount = amountStr,
                TaxBase = "0",
                Tax = "0",
                BuyerEmail = user.Email,
                BuyerFullName = user.Nombre,
                Country = "CO",
                UrlResponse = $"{_frontendBaseUrl}/pago/resultado",
                UrlConfirmation = $"{_backendBaseUrl}/api/pagos/webhook/epayco",
                Extra1 = pedidoId.ToString(),
                Extra2 = userId.ToString(),
                Signature = signature,
                Test = _test
            };

            // Update pedido state to PagoPendiente
            if (pedido.Estado == "Pendiente")
            {
                pedido.Estado = "PagoPendiente";
                pedido.FechaActualizacion = DateTime.UtcNow;
                await _unitOfWork.Pedidos.UpdateAsync(pedido);
                await _unitOfWork.SaveChangesAsync();
            }

            _logger.LogInformation("Generated ePayco checkout data for Pedido #{PedidoId}, Amount: {Amount} COP", pedidoId, amountStr);

            return checkoutData;
        }

        public async Task ProcessWebhookAsync(EpaycoWebhookDto webhook)
        {
            _logger.LogInformation(
                "ePayco webhook received: ref_payco={RefPayco}, invoice={Invoice}, cod_response={CodResponse}, transaction_state={State}",
                webhook.x_ref_payco, webhook.x_id_invoice, webhook.x_cod_response, webhook.x_transaction_state);

            // 1. Validate required fields
            if (string.IsNullOrEmpty(webhook.x_ref_payco) || string.IsNullOrEmpty(webhook.x_id_invoice))
            {
                _logger.LogWarning("Webhook missing required fields (ref_payco or id_invoice)");
                return;
            }

            // 2. Validate signature
            if (!ValidateWebhookSignature(webhook))
            {
                _logger.LogWarning("Invalid ePayco webhook signature for ref_payco={RefPayco}", webhook.x_ref_payco);
                return;
            }

            // 3. Parse pedidoId from invoice
            if (!int.TryParse(webhook.x_id_invoice, out int pedidoId))
            {
                _logger.LogWarning("Invalid invoice (pedidoId) in webhook: {Invoice}", webhook.x_id_invoice);
                return;
            }

            // 4. Get the order
            var pedido = await _unitOfWork.Pedidos.GetByIdAsync(pedidoId);
            if (pedido == null)
            {
                _logger.LogWarning("Pedido #{PedidoId} not found for webhook", pedidoId);
                return;
            }

            // 5. Avoid processing if already in a final state
            if (pedido.Estado == "Confirmado" || pedido.Estado == "Cancelado")
            {
                _logger.LogInformation("Pedido #{PedidoId} already in final state: {Estado}. Ignoring webhook.", pedidoId, pedido.Estado);
                return;
            }

            // 6. Store ePayco reference data
            pedido.EpaycoRefPayco = webhook.x_ref_payco;
            pedido.EpaycoTransactionId = webhook.x_transaction_id;
            pedido.EpaycoEstadoTransaccion = webhook.x_transaction_state;
            pedido.EpaycoMetodoPago = webhook.x_franchise;
            pedido.FechaActualizacion = DateTime.UtcNow;

            // 7. Determine order state based on ePayco response code
            // x_cod_response: 1=Accepted, 2=Rejected, 3=Pending, 4=Failed, 6=Reversed, 7=Retained, 8=Started, 9=Expired, 10=Abandoned, 11=Cancelled, 12=Antifraud
            var codResponse = int.TryParse(webhook.x_cod_response, out int cod) ? cod : -1;

            switch (codResponse)
            {
                case 1: // Accepted
                    pedido.Estado = "Confirmado";
                    pedido.Aprobado = true;
                    pedido.FechaAprobacion = DateTime.UtcNow;
                    _logger.LogInformation("Pedido #{PedidoId} APPROVED by ePayco. ref_payco={RefPayco}", pedidoId, webhook.x_ref_payco);
                    break;

                case 2: // Rejected
                case 4: // Failed
                case 6: // Reversed
                case 9: // Expired
                case 10: // Abandoned
                case 11: // Cancelled
                case 12: // Antifraud
                    pedido.Estado = "PagoFallido";
                    pedido.Aprobado = false;
                    _logger.LogWarning("Pedido #{PedidoId} REJECTED/FAILED by ePayco. cod={Cod}, reason={Reason}",
                        pedidoId, codResponse, webhook.x_response_reason_text);
                    break;

                case 3: // Pending
                case 7: // Retained
                case 8: // Started
                    pedido.Estado = "PagoPendiente";
                    _logger.LogInformation("Pedido #{PedidoId} PENDING in ePayco. cod={Cod}", pedidoId, codResponse);
                    break;

                default:
                    _logger.LogWarning("Pedido #{PedidoId} unknown ePayco cod_response: {Cod}", pedidoId, codResponse);
                    pedido.Estado = "PagoPendiente";
                    break;
            }

            // Append payment info to notes
            var notaPago = $"\n---ePayco---\nRef: {webhook.x_ref_payco}\nEstado: {webhook.x_transaction_state}\nCod: {webhook.x_cod_response}\nMetodo: {webhook.x_franchise}\nFecha: {webhook.x_datetime}";
            pedido.NotasCliente = (pedido.NotasCliente ?? "") + notaPago;

            await _unitOfWork.Pedidos.UpdateAsync(pedido);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<EpaycoTransactionResultDto> ValidateTransactionAsync(string refPayco)
        {
            // Query ePayco's REST API to validate the transaction
            var url = $"https://secure.epayco.co/validation/v1/reference/{refPayco}";

            try
            {
                var response = await _httpClient.GetAsync(url);
                var content = await response.Content.ReadAsStringAsync();

                _logger.LogInformation("ePayco validation response for ref={RefPayco}: {StatusCode}, Body={Body}", refPayco, response.StatusCode, content);

                if (!response.IsSuccessStatusCode)
                {
                    return new EpaycoTransactionResultDto
                    {
                        Success = false,
                        RefPayco = refPayco,
                        Status = "Error",
                        ResponseReasonText = $"HTTP {response.StatusCode}"
                    };
                }

                // Parse the JSON response from ePayco
                var json = System.Text.Json.JsonDocument.Parse(content);
                var data = json.RootElement.GetProperty("data");

                var result = new EpaycoTransactionResultDto
                {
                    Success = true,
                    RefPayco = data.TryGetProperty("x_ref_payco", out var rp) ? rp.GetString() ?? refPayco : refPayco,
                    TransactionId = data.TryGetProperty("x_transaction_id", out var tid) ? tid.GetString() ?? "" : "",
                    Status = data.TryGetProperty("x_transaction_state", out var ts) ? ts.GetString() ?? "" : "",
                    CodResponse = data.TryGetProperty("x_cod_response", out var cr) ? (int.TryParse(cr.GetString(), out var c) ? c : cr.TryGetInt32(out var ci) ? ci : 0) : 0,
                    ResponseReasonText = data.TryGetProperty("x_response_reason_text", out var rrt) ? rrt.GetString() ?? "" : "",
                    Amount = data.TryGetProperty("x_amount", out var amt) ? (decimal.TryParse(amt.GetString(), System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var a) ? a : 0) : 0,
                    Currency = data.TryGetProperty("x_currency_code", out var cur) ? cur.GetString() ?? "" : "",
                    PaymentMethod = data.TryGetProperty("x_franchise", out var fr) ? fr.GetString() ?? "" : "",
                    Invoice = data.TryGetProperty("x_id_invoice", out var inv) ? inv.GetString() ?? "" : ""
                };

                // IMPORTANT: Also update the order in our database based on ePayco's response.
                // This compensates for the webhook not arriving (e.g., localhost dev, network issues).
                await SyncOrderFromValidationAsync(result);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating ePayco transaction ref={RefPayco}", refPayco);
                return new EpaycoTransactionResultDto
                {
                    Success = false,
                    RefPayco = refPayco,
                    Status = "Error",
                    ResponseReasonText = ex.Message
                };
            }
        }

        /// <summary>
        /// Updates the order state in the database based on the ePayco validation API response.
        /// This acts as a fallback when the webhook doesn't arrive (e.g., localhost, firewall, etc.).
        /// </summary>
        private async Task SyncOrderFromValidationAsync(EpaycoTransactionResultDto result)
        {
            try
            {
                if (string.IsNullOrEmpty(result.Invoice) || !int.TryParse(result.Invoice, out int pedidoId))
                {
                    _logger.LogWarning("SyncOrderFromValidation: No valid invoice/pedidoId in validation result");
                    return;
                }

                var pedido = await _unitOfWork.Pedidos.GetByIdAsync(pedidoId);
                if (pedido == null)
                {
                    _logger.LogWarning("SyncOrderFromValidation: Pedido #{PedidoId} not found", pedidoId);
                    return;
                }

                // Don't overwrite if already in a final state
                if (pedido.Estado == "Confirmado" || pedido.Estado == "Cancelado")
                {
                    _logger.LogInformation("SyncOrderFromValidation: Pedido #{PedidoId} already in final state {Estado}", pedidoId, pedido.Estado);
                    return;
                }

                // Update ePayco reference fields
                pedido.EpaycoRefPayco = result.RefPayco;
                pedido.EpaycoTransactionId = result.TransactionId;
                pedido.EpaycoEstadoTransaccion = result.Status;
                pedido.EpaycoMetodoPago = result.PaymentMethod;
                pedido.FechaActualizacion = DateTime.UtcNow;

                switch (result.CodResponse)
                {
                    case 1: // Accepted
                        pedido.Estado = "Confirmado";
                        pedido.Aprobado = true;
                        pedido.FechaAprobacion = DateTime.UtcNow;
                        _logger.LogInformation("SyncOrderFromValidation: Pedido #{PedidoId} APPROVED. ref_payco={RefPayco}", pedidoId, result.RefPayco);
                        break;

                    case 2: // Rejected
                    case 4: // Failed
                    case 6: // Reversed
                    case 9: // Expired
                    case 10: // Abandoned
                    case 11: // Cancelled
                    case 12: // Antifraud
                        pedido.Estado = "PagoFallido";
                        pedido.Aprobado = false;
                        _logger.LogWarning("SyncOrderFromValidation: Pedido #{PedidoId} FAILED. cod={Cod}", pedidoId, result.CodResponse);
                        break;

                    case 3: // Pending
                    case 7: // Retained
                    case 8: // Started
                        pedido.Estado = "PagoPendiente";
                        _logger.LogInformation("SyncOrderFromValidation: Pedido #{PedidoId} PENDING. cod={Cod}", pedidoId, result.CodResponse);
                        break;

                    default:
                        _logger.LogWarning("SyncOrderFromValidation: Pedido #{PedidoId} unknown cod_response: {Cod}", pedidoId, result.CodResponse);
                        break;
                }

                await _unitOfWork.Pedidos.UpdateAsync(pedido);
                await _unitOfWork.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SyncOrderFromValidation: Error syncing order from validation result");
            }
        }

        /// <summary>
        /// Validates the ePayco webhook signature.
        /// Signature = SHA-256(p_cust_id_cliente ^ p_key ^ ref_payco ^ x_transaction_id ^ x_amount ^ x_currency_code)
        /// </summary>
        private bool ValidateWebhookSignature(EpaycoWebhookDto webhook)
        {
            if (string.IsNullOrEmpty(webhook.x_signature))
            {
                _logger.LogWarning("Webhook has no signature");
                return false;
            }

            var signaturePayload = $"{_pCustIdCliente}^{_pKey}^{webhook.x_ref_payco}^{webhook.x_transaction_id}^{webhook.x_amount}^{webhook.x_currency_code}";
            var computedSignature = ComputeSha256Hash(signaturePayload);

            var isValid = string.Equals(computedSignature, webhook.x_signature, StringComparison.OrdinalIgnoreCase);

            if (!isValid)
            {
                _logger.LogWarning("Signature mismatch. Expected: {Expected}, Received: {Received}", computedSignature, webhook.x_signature);
            }

            return isValid;
        }

        private static string ComputeSha256Hash(string rawData)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(rawData));
            var builder = new StringBuilder();
            foreach (var b in bytes)
            {
                builder.Append(b.ToString("x2"));
            }
            return builder.ToString();
        }
    }
}
