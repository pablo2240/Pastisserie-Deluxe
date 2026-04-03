/**
 * Resuelve URLs de imágenes.
 * - Si la URL ya es absoluta (http/https), la devuelve tal cual.
 * - Si es relativa (/images/...), le antepone la URL base del backend API.
 */
export const resolveImageUrl = (url: string | null | undefined): string => {
  if (!url) return 'https://via.placeholder.com/300x200?text=Sin+Imagen';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // URL relativa: anteponer la base del API
  const baseUrl = import.meta.env.VITE_API_URL || '';
  // VITE_API_URL ya incluye /api al final, pero las imágenes están en /images/
  // así que necesitamos la base sin /api
  const apiBase = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
  return `${apiBase}${url}`;
};
