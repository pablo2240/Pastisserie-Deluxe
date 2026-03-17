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
