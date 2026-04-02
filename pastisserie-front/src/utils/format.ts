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
 * Soporta coordenadas (lat/lng) o fallback a texto.
 * 
 * @param direccion - Dirección textual
 * @param comuna - Comuna/barrio
 * @param latitud - Coordenada de latitud (opcional)
 * @param longitud - Coordenada de longitud (opcional)
 * @param ciudad - Ciudad por defecto
 * @param pais - País por defecto
 */
export function getGoogleMapsUrl(
  direccion: string,
  comuna: string,
  latitud?: number | null,
  longitud?: number | null,
  ciudad = 'Medellín',
  pais = 'Colombia'
): string | null {
  const normalize = (value: string) =>
    (value || '')
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/,{2,}/g, ',')
      .replace(/^,|,$/g, '');

  // PRIORIDAD 1: Si tenemos coordenadas, usar URL directa de Google Maps
  if (latitud != null && longitud != null && !isNaN(latitud) && !isNaN(longitud)) {
    return `https://www.google.com/maps/search/?api=1&query=${latitud},${longitud}`;
  }

  // PRIORIDAD 2: Fallback a dirección textual
  const cleanDireccion = normalize(direccion);
  const cleanComuna = normalize(comuna);

  // Validación más razonable
  if (!cleanDireccion || cleanDireccion.length < 6) return null;

  // Construcción inteligente (evita duplicados)
  const parts = [cleanDireccion, cleanComuna, ciudad, pais]
    .filter(Boolean)
    .join(', ');

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts)}`;
}
