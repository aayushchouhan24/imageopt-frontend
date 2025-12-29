import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Upload,
  Search,
  Grid3x3,
  List,
  Trash2,
  RotateCcw,
  Copy,
  ExternalLink,
  Filter,
  Plus,
  Image as ImageIcon,
  Clock,
  FolderOpen,
  Eye,
  Lock,
  Unlock,
  RefreshCw,
} from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import { UploadModal } from '../components/UploadModal';
import { AssetDetailModal } from '@/components/assets/AssetDetailModal';
import { AssetImage } from '@/components/assets/AssetImage';
import { toast } from 'sonner';
import type { Asset } from '@/types/asset';

export function MediaLibraryPage() {
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => apiClient.getAssets(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asset deleted', {
        description: 'Asset has been moved to trash',
      });
      setSelectedAssets(new Set());
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => apiClient.restoreAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asset restored', {
        description: 'Asset has been restored from trash',
      });
    },
  });

  const assets = data?.data?.assets || [];
  const filteredAssets = assets.filter((asset) =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelectAsset = (id: string) => {
    const newSelected = new Set(selectedAssets);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedAssets(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedAssets.size === filteredAssets.length) {
      setSelectedAssets(new Set());
    } else {
      setSelectedAssets(new Set(filteredAssets.map(a => a._id)));
    }
  };

  const handleBulkDelete = () => {
    selectedAssets.forEach((id) => deleteMutation.mutate(id));
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied', {
      description: 'CDN URL has been copied to clipboard',
    });
  };

  const openAssetDetails = (asset: Asset) => {
    setSelectedAsset(asset);
    setDetailModalOpen(true);
  };

  const handlePrivacyToggle = async (assetId: string, makePrivate: boolean, folder?: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Not authenticated. Please log in again.');
    }
    
    const endpoint = makePrivate ? 'make-private' : 'make-public';
    const url = folder
      ? `http://localhost:5000/api/assets/${assetId}/${endpoint}?folder=${folder}`
      : `http://localhost:5000/api/assets/${assetId}/${endpoint}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update privacy');
    }

    await queryClient.invalidateQueries({ queryKey: ['assets'] });
    return response.json();
  };

  const handleInvalidateCache = async (assetId: string) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Not authenticated. Please log in again.');
    }

    const response = await fetch(
      `http://localhost:5000/api/assets/${assetId}/invalidate-cache`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to invalidate cache');
    }

    return response.json();
  };

  const handleDeleteFromModal = async (assetId: string) => {
    await deleteMutation.mutateAsync(assetId);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Media Library</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your image assets</p>
        </div>
        <Button
          onClick={() => setUploadModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
        >
          <Plus className="h-4 w-4" />
          Upload Assets
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="rounded-xl bg-zinc-900/20 border border-zinc-800/30">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/30">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-medium text-white">All Assets</h2>
            <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 text-xs">
              {filteredAssets.length}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64 h-9 bg-zinc-900/20 border-zinc-800/30 text-sm placeholder:text-zinc-600 focus:border-zinc-700"
              />
            </div>
            
            <Button variant="outline" size="sm" className="border-zinc-800/30 bg-zinc-900/20 text-zinc-400 hover:text-white h-9">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>

            {selectedAssets.size > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                className="border-red-900/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-400 h-9"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selectedAssets.size})
              </Button>
            )}

            <div className="flex items-center border border-zinc-800 rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView('list')}
                className={`h-9 w-9 rounded-none ${
                  view === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/30'
                }`}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView('grid')}
                className={`h-9 w-9 rounded-none ${
                  view === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/30'
                }`}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* List Header (only for list view) */}
        {view === 'list' && filteredAssets.length > 0 && (
          <div className="flex items-center gap-4 px-4 py-2 border-b border-zinc-800/30 text-xs text-zinc-500">
            <Checkbox
              checked={selectedAssets.size === filteredAssets.length && filteredAssets.length > 0}
              onCheckedChange={toggleSelectAll}
              className="border-zinc-700"
            />
            <span className="flex-1">Name</span>
            <span className="w-24">Size</span>
            <span className="w-32">Date</span>
            <span className="w-auto">Actions</span>
          </div>
        )}

        {/* Assets */}
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full bg-zinc-800/50" />
            ))}
          </div>
        ) : filteredAssets.length > 0 ? (
          view === 'list' ? (
            <div className="divide-y divide-zinc-800/30">
              {filteredAssets.map((asset) => (
                <div
                  key={asset._id}
                  className={`flex items-center gap-4 p-4 hover:bg-zinc-800/20 transition-colors group ${
                    selectedAssets.has(asset._id) ? 'bg-zinc-800/20' : ''
                  }`}
                >
                  <Checkbox
                    checked={selectedAssets.has(asset._id)}
                    onCheckedChange={() => toggleSelectAsset(asset._id)}
                    className="border-zinc-700"
                  />
                  
                  {/* Thumbnail */}
                  <div className="h-12 w-12 rounded-lg bg-zinc-800 overflow-hidden shrink-0">
                    <AssetImage
                      asset={asset}
                      alt={asset.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">{asset.name}</p>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-0 text-xs">
                        {asset.mimeType?.split('/')[1]?.toUpperCase() || 'FILE'}
                      </Badge>
                      {asset.isDeleted && (
                        <Badge className="bg-red-500/10 text-red-400 border-0 text-xs">
                          Deleted
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                      <FolderOpen className="h-3 w-3" />
                      {asset.folder || '/'}
                    </p>
                  </div>

                  {/* Size */}
                  <div className="w-24 text-sm text-zinc-400">
                    {formatBytes(asset.sizeBytes)}
                  </div>

                  {/* Date */}
                  <div className="w-32 text-sm text-zinc-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(asset.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>

                  {/* Actions */}
                  <div className="w-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openAssetDetails(asset)}
                      title="View Details"
                      className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyUrl(asset.cloudfrontUrl)}
                      title="Copy URL"
                      className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(asset.cloudfrontUrl, '_blank')}
                      title="Open in New Tab"
                      className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    {asset.isDeleted ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => restoreMutation.mutate(asset._id)}
                        title="Restore"
                        className="h-8 w-8 text-emerald-500 hover:text-emerald-400 hover:bg-zinc-800"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(asset._id)}
                        title="Delete"
                        className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-zinc-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
              {filteredAssets.map((asset) => (
                <div
                  key={asset._id}
                  className={`rounded-xl bg-zinc-900/50 border border-zinc-800/50 overflow-hidden group hover:border-zinc-700/50 transition-all ${
                    selectedAssets.has(asset._id) ? 'ring-2 ring-emerald-500' : ''
                  }`}
                >
                  <div className="aspect-square bg-zinc-900 overflow-hidden relative">
                    <AssetImage
                      asset={asset}
                      alt={asset.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Checkbox
                        checked={selectedAssets.has(asset._id)}
                        onCheckedChange={() => toggleSelectAsset(asset._id)}
                        className="border-white bg-black/50"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openAssetDetails(asset)}
                        title="View Details"
                        className="h-8 w-8 bg-zinc-800/80 text-white hover:bg-zinc-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyUrl(asset.cloudfrontUrl)}
                        title="Copy URL"
                        className="h-8 w-8 bg-zinc-800/80 text-white hover:bg-zinc-700"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(asset.cloudfrontUrl, '_blank')}
                        title="Open"
                        className="h-8 w-8 bg-zinc-800/80 text-white hover:bg-zinc-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                    {asset.isPrivate && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          <Lock className="w-3 h-3 mr-1" />
                          Private
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-white truncate">{asset.name}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {formatBytes(asset.sizeBytes)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-zinc-800/50 mb-4">
              <ImageIcon className="h-8 w-8 text-zinc-600" />
            </div>
            <h3 className="text-base font-medium text-white mb-1">No assets found</h3>
            <p className="text-sm text-zinc-500 mb-4">Upload your first image to get started</p>
            <Button
              onClick={() => setUploadModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Assets
            </Button>
          </div>
        )}
      </div>

      <UploadModal open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} />

      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          onPrivacyToggle={handlePrivacyToggle}
          onInvalidateCache={handleInvalidateCache}
          onDelete={handleDeleteFromModal}
        />
      )}
    </div>
  );
}
