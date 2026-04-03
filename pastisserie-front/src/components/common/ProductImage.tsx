import { resolveImageUrl } from '../../api/axios';

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: string;
}

/**
 * Componente de imagen que resuelve automáticamente URLs relativas del backend.
 * Si la URL es relativa (/images/...), le antepone la base del API.
 */
export const ProductImage = ({ src, alt, className = '', fallback }: ProductImageProps) => {
  const resolvedSrc = resolveImageUrl(src);
  const fallbackSrc = fallback || 'https://via.placeholder.com/300x200?text=Sin+Imagen';

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        if (target.src !== fallbackSrc) {
          target.src = fallbackSrc;
        }
      }}
    />
  );
};
