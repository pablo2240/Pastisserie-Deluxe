namespace PastisserieAPI.Core.Enums
{
    public enum EstadoPedido
    {
        Pendiente,
        PagoPendiente,
        Confirmado,
        PagoFallido,
        EnProceso,
        EnPreparacion,
        Listo,
        EnCamino,
        Entregado,
        NoEntregado,
        Cancelado
    }
}