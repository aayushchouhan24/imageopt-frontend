import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { AssetImage } from '@/components/assets/AssetImage';
import {
  Copy,
  Download,
  Lock,
  Unlock,
  RefreshCw,
  Trash2,
  Clock,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import type {
  Asset,
  AssetStats,
  SignedUrlResponse,
  TransformationParams,
} from '@/types/asset';

interface AssetDetailModalProps {
  asset: Asset;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrivacyToggle: (assetId: string, makePrivate: boolean, folder?: string) => Promise<void>;
  onInvalidateCache: (assetId: string) => Promise<void>;
  onDelete: (assetId: string) => Promise<void>;
}

export function AssetDetailModal({
  asset,
  open,
  onOpenChange,
  onPrivacyToggle,
  onInvalidateCache,
  onDelete,
}: AssetDetailModalProps) {
  const [stats, setStats] = useState<AssetStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [signedUrl, setSignedUrl] = useState<SignedUrlResponse | null>(null);
  const [loadingSignedUrl, setLoadingSignedUrl] = useState(false);
  const [expirySeconds, setExpirySeconds] = useState(3600);
  const [transformations, setTransformations] = useState<TransformationParams>({});
  const [targetFolder, setTargetFolder] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch asset stats
  const fetchAssetStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }
      const response = await fetch(
        `http://localhost:5000/api/assets/${asset._id}/stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      // Handle both possible response structures
      const statsData = data.data?.stats || data.data;
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  }, [asset._id]);

  useEffect(() => {
    if (open && asset._id) {
      fetchAssetStats();
    }
  }, [open, asset._id, fetchAssetStats]);

  const generateSignedUrl = async () => {
    try {
      setLoadingSignedUrl(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Build query params
      const params = new URLSearchParams();
      params.append('expiresIn', expirySeconds.toString());
      if (transformations.format) params.append('format', transformations.format);
      if (transformations.width) params.append('width', transformations.width.toString());
      if (transformations.height)
        params.append('height', transformations.height.toString());
      if (transformations.quality)
        params.append('quality', transformations.quality.toString());

      const response = await fetch(
        `http://localhost:5000/api/assets/${asset._id}/signed-url?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to generate signed URL');
      const data = await response.json();
      setSignedUrl(data.data);

      toast.success('Signed URL generated', {
        description: `Valid for ${Math.floor(data.data.expiresInSeconds / 60)} minutes`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate signed URL';
      toast.error('Error', {
        description: errorMessage,
      });
    } finally {
      setLoadingSignedUrl(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied!', {
        description: 'URL copied to clipboard',
      });
    } catch {
      toast.error('Error', {
        description: 'Failed to copy to clipboard',
      });
    }
  };

  const handlePrivacyToggle = async () => {
    try {
      setIsProcessing(true);
      await onPrivacyToggle(asset._id, !asset.isPrivate, targetFolder || undefined);
      toast.success('Success', {
        description: `Asset moved to ${!asset.isPrivate ? 'private' : 'public'} folder`,
      });
      onOpenChange(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update privacy';
      toast.error('Error', {
        description: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInvalidateCache = async () => {
    try {
      setIsProcessing(true);
      await onInvalidateCache(asset._id);
      toast.success('Cache invalidation initiated', {
        description: 'It may take a few minutes to propagate',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to invalidate cache';
      toast.error('Error', {
        description: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      setIsProcessing(true);
      await onDelete(asset._id);
      toast.success('Asset deleted', {
        description: 'Asset moved to trash',
      });
      onOpenChange(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete asset';
      toast.error('Error', {
        description: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            {asset.name}
          </DialogTitle>
          <DialogDescription className="flex gap-2">
            {asset.isPrivate ? (
              <Badge variant="secondary" className="gap-1">
                <Lock className="w-3 h-3" />
                Private
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <Unlock className="w-3 h-3" />
                Public
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-zinc-800">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="urls">URLs</TabsTrigger>
            <TabsTrigger value="signed-url">Signed URL</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-4">
            <div className="bg-zinc-950 rounded-lg p-4 flex items-center justify-center" style={{ minHeight: '300px' }}>
              {asset.type === 'image' ? (
                <AssetImage
                  asset={asset}
                  alt={asset.name}
                  style={{ maxHeight: '400px' }}
                  className="max-w-full object-contain rounded-md"
                  loading="lazy"
                />
              ) : (
                <div className="text-zinc-500 text-center">
                  <ImageIcon className="w-16 h-16 mx-auto mb-2" />
                  <p>Preview not available for this file type</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-zinc-400">File Name</Label>
                <p className="text-white font-medium">{asset.name}</p>
              </div>
              <div>
                <Label className="text-zinc-400">Size</Label>
                <p className="text-white font-medium">{formatBytes(asset.sizeBytes)}</p>
              </div>
              <div>
                <Label className="text-zinc-400">Type</Label>
                <p className="text-white font-medium capitalize">{asset.type}</p>
              </div>
              <div>
                <Label className="text-zinc-400">Created</Label>
                <p className="text-white font-medium">{formatDate(asset.createdAt)}</p>
              </div>
              {asset.metadata && (
                <>
                  {asset.metadata.width && (
                    <div>
                      <Label className="text-zinc-400">Dimensions</Label>
                      <p className="text-white font-medium">
                        {asset.metadata.width} × {asset.metadata.height}px
                      </p>
                    </div>
                  )}
                  {asset.metadata.format && (
                    <div>
                      <Label className="text-zinc-400">Format</Label>
                      <p className="text-white font-medium uppercase">
                        {asset.metadata.format}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          {/* URLs Tab */}
          <TabsContent value="urls" className="space-y-3">
            <div className="space-y-2">
              <Label className="text-zinc-400">Original URL</Label>
              <div className="flex gap-2">
                <Input
                  value={asset.cloudfrontUrl}
                  readOnly
                  className="bg-zinc-950 border-zinc-800 text-white font-mono text-sm"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(asset.cloudfrontUrl)}
                  className="border-zinc-800"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400">WebP (Optimized)</Label>
              <div className="flex gap-2">
                <Input
                  value={`${asset.cloudfrontUrl}/format=webp`}
                  readOnly
                  className="bg-zinc-950 border-zinc-800 text-white font-mono text-sm"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(`${asset.cloudfrontUrl}/format=webp`)}
                  className="border-zinc-800"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400">Thumbnail (200px)</Label>
              <div className="flex gap-2">
                <Input
                  value={`${asset.cloudfrontUrl}/format=webp,width=200`}
                  readOnly
                  className="bg-zinc-950 border-zinc-800 text-white font-mono text-sm"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    copyToClipboard(`${asset.cloudfrontUrl}/format=webp,width=200`)
                  }
                  className="border-zinc-800"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-800 mt-4">
              <p className="text-sm text-zinc-400">
                💡 Append transformations to the URL: <code className="text-blue-400">/format=webp,width=800,quality=80</code>
              </p>
            </div>
          </TabsContent>

          {/* Signed URL Tab */}
          <TabsContent value="signed-url" className="space-y-4">
            {asset.isPrivate ? (
              <>
                <div className="space-y-3">
                  <div>
                    <Label className="text-zinc-400">Expires In (seconds)</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Slider
                        value={[expirySeconds]}
                        onValueChange={([value]) => setExpirySeconds(value)}
                        min={60}
                        max={604800}
                        step={60}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={expirySeconds}
                        onChange={(e) => setExpirySeconds(Number(e.target.value))}
                        className="w-24 bg-zinc-950 border-zinc-800 text-white"
                      />
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      {Math.floor(expirySeconds / 3600)} hours {Math.floor((expirySeconds % 3600) / 60)} minutes
                    </p>
                  </div>

                  <Separator className="bg-zinc-800" />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-zinc-400">Format</Label>
                      <Select
                        value={transformations.format || 'original'}
                        onValueChange={(value) => {
                          const formatValue = value === 'original' ? undefined : value;
                          setTransformations({ 
                            ...transformations, 
                            format: formatValue as 'jpeg' | 'png' | 'webp' | 'avif' | undefined
                          });
                        }}
                      >
                        <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                          <SelectValue placeholder="Original" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800">
                          <SelectItem value="original">Original</SelectItem>
                          <SelectItem value="jpeg">JPEG</SelectItem>
                          <SelectItem value="png">PNG</SelectItem>
                          <SelectItem value="webp">WebP</SelectItem>
                          <SelectItem value="avif">AVIF</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-zinc-400">Quality</Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={transformations.quality || ''}
                        onChange={(e) =>
                          setTransformations({
                            ...transformations,
                            quality: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder="80"
                        className="bg-zinc-950 border-zinc-800 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-zinc-400">Width (px)</Label>
                      <Input
                        type="number"
                        value={transformations.width || ''}
                        onChange={(e) =>
                          setTransformations({
                            ...transformations,
                            width: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder="Auto"
                        className="bg-zinc-950 border-zinc-800 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-zinc-400">Height (px)</Label>
                      <Input
                        type="number"
                        value={transformations.height || ''}
                        onChange={(e) =>
                          setTransformations({
                            ...transformations,
                            height: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder="Auto"
                        className="bg-zinc-950 border-zinc-800 text-white"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={generateSignedUrl}
                    disabled={loadingSignedUrl}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {loadingSignedUrl ? 'Generating...' : 'Generate Signed URL'}
                  </Button>
                </div>

                {signedUrl && (
                  <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <Label className="text-zinc-400">Signed URL</Label>
                        <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expires: {new Date(signedUrl.expiresAt).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(signedUrl.signedUrl)}
                        className="border-zinc-800"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <Input
                      value={signedUrl.signedUrl}
                      readOnly
                      className="bg-zinc-900 border-zinc-800 text-white font-mono text-xs"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="bg-zinc-950 rounded-lg p-6 border border-zinc-800 text-center">
                <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400">
                  This asset is public. Signed URLs are only needed for private assets.
                </p>
                <Button
                  onClick={handlePrivacyToggle}
                  disabled={isProcessing}
                  className="mt-4 bg-zinc-800 hover:bg-zinc-700"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Make Private
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            {loadingStats ? (
              <div className="text-center py-8 text-zinc-500">Loading stats...</div>
            ) : stats ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
                  <Label className="text-zinc-400">Total Requests</Label>
                  <p className="text-2xl font-bold text-white mt-1">{(stats.totalRequests || 0).toLocaleString()}</p>
                </div>
                <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
                  <Label className="text-zinc-400">Bandwidth Used</Label>
                  <p className="text-2xl font-bold text-white mt-1">
                    {stats.totalGB !== undefined ? stats.totalGB.toFixed(2) : '0.00'} GB
                  </p>
                </div>
                <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
                  <Label className="text-zinc-400">Cache Hit Ratio</Label>
                  <p className="text-2xl font-bold text-green-500 mt-1">{stats.cacheHitRatio || '0%'}</p>
                </div>
                <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
                  <Label className="text-zinc-400">Estimated Cost</Label>
                  <p className="text-2xl font-bold text-white mt-1">
                    ${stats.estimatedCostUSD !== undefined ? stats.estimatedCostUSD.toFixed(4) : '0.0000'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500">No analytics data available</div>
            )}
          </TabsContent>
        </Tabs>

        <Separator className="bg-zinc-800" />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(asset.cloudfrontUrl, '_blank')}
            className="border-zinc-800"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>

          <Button
            variant="outline"
            onClick={handlePrivacyToggle}
            disabled={isProcessing}
            className="border-zinc-800"
          >
            {asset.isPrivate ? (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                Make Public
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Make Private
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleInvalidateCache}
            disabled={isProcessing}
            className="border-zinc-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Invalidate Cache
          </Button>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isProcessing}
            className="ml-auto"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>

        {!asset.isPrivate && (
          <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-800">
            <Label className="text-zinc-400">Target Folder (for Make Public)</Label>
            <Input
              value={targetFolder}
              onChange={(e) => setTargetFolder(e.target.value)}
              placeholder="Leave empty to use default"
              className="mt-2 bg-zinc-900 border-zinc-800 text-white"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
