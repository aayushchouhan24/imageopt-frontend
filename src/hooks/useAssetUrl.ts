import { useState, useEffect } from 'react';
import type { Asset } from '@/types/asset';

/**
 * Hook to get the correct URL for an asset
 * - For public assets: returns the CloudFront URL directly
 * - For private assets: fetches and returns a signed URL
 */
export function useAssetUrl(asset: Asset | null | undefined, expirySeconds: number = 3600) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!asset) {
      setUrl(null);
      return;
    }

    // If asset is public, use CloudFront URL directly
    if (!asset.isPrivate) {
      setUrl(asset.cloudfrontUrl);
      return;
    }

    // If asset is private, fetch signed URL
    const fetchSignedUrl = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('Not authenticated');
        }

        const response = await fetch(
          `http://localhost:5000/api/assets/${asset._id}/signed-url?expirySeconds=${expirySeconds}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch signed URL');
        }

        const data = await response.json();
        setUrl(data.data.signedUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load asset');
        // Fallback to regular URL as last resort
        setUrl(asset.cloudfrontUrl);
      } finally {
        setLoading(false);
      }
    };

    fetchSignedUrl();
  }, [asset, expirySeconds]);

  return { url, loading, error };
}
