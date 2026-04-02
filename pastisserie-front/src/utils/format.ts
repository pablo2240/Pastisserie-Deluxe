export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

/**
 * Formats a UTC date string using Medellín timezone (UTC-5/America/Bogota).
 * Prevents the one-day offset that occurs late at night when UTC is already the next day.
 */
export const formatMedellinDate = (dateStr: string, options?: Intl.DateTimeFormatOptions): string => {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-CO', {
            timeZone: 'America/Bogota',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            ...options
        });
    } catch {
        return new Date(dateStr).toLocaleDateString();
    }
};

export const formatMedellinDateTime = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return date.toLocaleString('es-CO', {
            timeZone: 'America/Bogota',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return new Date(dateStr).toLocaleString();
    }
};

/**
 * Devuelve un enlace robusto a Google Maps para una dirección en Medellín.
 * Limpia el string y alerta si hay un error obvio.
 */
export function getGoogleMapsUrl(direccion: string, comuna: string): string | null {
    const dirty = `${direccion || ''}`.trim();
    const cleanDireccion = dirty.replace(/\s+/g, ' ').replace(/,{2,}/g, ',').replace(/^,|,$/g, '');
    const cleanComuna = (comuna || '').trim();

    // Validar campos mínimos
    if (!cleanDireccion || cleanDireccion.length < 4) return null;
    if (!cleanComuna || cleanComuna.length < 2) return null;

    const full = `${cleanDireccion}, ${cleanComuna}, Medellín, Colombia`.replace(/,{2,}/g, ',').replace(/^,|,$/g, '');
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(full)}`;
}
