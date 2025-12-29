import { useAssetUrl } from '@/hooks/useAssetUrl';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Image as ImageIcon } from 'lucide-react';
import type { Asset } from '@/types/asset';

interface AssetImageProps {
  asset: Asset;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'eager' | 'lazy';
  fallback?: React.ReactNode;
  expirySeconds?: number;
}

/**
 * Component that automatically handles displaying both public and private assets
 * - Public assets: displays directly using CloudFront URL
 * - Private assets: fetches and uses signed URL
 */
export function AssetImage({
  asset,
  alt,
  className = '',
  style,
  loading = 'lazy',
  fallback,
  expirySeconds = 3600,
}: AssetImageProps) {
  const { url, loading: urlLoading, error } = useAssetUrl(asset, expirySeconds);

  // Show loading state
  if (urlLoading || !url) {
    return (
      <div className={`flex items-center justify-center bg-zinc-900 ${className}`} style={style}>
        <Skeleton className="w-full h-full bg-zinc-800" />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`flex items-center justify-center bg-zinc-900 ${className}`} style={style}>
        {fallback || (
          <div className="text-center text-zinc-500 p-4">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-xs">Failed to load image</p>
          </div>
        )}
      </div>
    );
  }

  // Show image
  if (asset.type === 'image') {
    return (
      <img
        src={url}
        alt={alt || asset.name}
        className={className}
        style={style}
        loading={loading}
        onError={(e) => {
          // Fallback on image load error
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          if (target.nextElementSibling) {
            (target.nextElementSibling as HTMLElement).style.display = 'flex';
          }
        }}
      />
    );
  }

  // Non-image file types
  return (
    <div className={`flex items-center justify-center bg-zinc-900 ${className}`} style={style}>
      <div className="text-center text-zinc-500">
        <ImageIcon className="w-8 h-8 mx-auto mb-2" />
        <p className="text-xs">{asset.type}</p>
      </div>
    </div>
  );
}
