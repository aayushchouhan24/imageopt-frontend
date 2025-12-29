import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AssetImage } from '@/components/assets/AssetImage';
import { 
  Upload,
  Calendar
} from 'lucide-react';
import { formatBytes, formatCurrency } from '@/lib/utils';

export function DashboardPage() {
  const { data: assetsData, isLoading: assetsLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => apiClient.getAssets(1, 10),
  });

  const { data: bandwidthData } = useQuery({
    queryKey: ['bandwidth'],
    queryFn: () => apiClient.getBandwidth(),
  });

  const assets = assetsData?.data?.assets || [];
  const bandwidth = bandwidthData?.data || { totalBandwidthBytes: 0, totalCostUSD: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your media assets</p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload New
        </Button>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Statistics</CardTitle>
            <CardDescription>Performance overview and key metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {assetsLoading ? (
              [...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))
            ) : (
              <>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-muted-foreground">Total</span>
                  </div>
                  <span className="text-sm font-medium">{assets.length}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-muted-foreground">Active</span>
                  </div>
                  <span className="text-sm font-medium">{assets.filter(a => !a.isDeleted).length}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-sm text-muted-foreground">Deleted</span>
                  </div>
                  <span className="text-sm font-medium">{assets.filter(a => a.isDeleted).length}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span className="text-sm text-muted-foreground">Bandwidth</span>
                  </div>
                  <span className="text-sm font-medium">{formatBytes(bandwidth.totalBandwidthBytes)}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-sm text-muted-foreground">Cost</span>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(bandwidth.totalCostUSD)}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                    <span className="text-sm text-muted-foreground">Avg Size</span>
                  </div>
                  <span className="text-sm font-medium">
                    {assets.length > 0 ? formatBytes(assets.reduce((sum, a) => sum + a.sizeBytes, 0) / assets.length) : '0 B'}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Uploads Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
            <CardDescription>Latest added assets</CardDescription>
          </CardHeader>
          <CardContent>
            {assetsLoading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : assets.length > 0 ? (
              <div className="space-y-2">
                {assets.slice(0, 6).map((asset) => (
                  <div
                    key={asset._id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0">
                      <AssetImage
                        asset={asset}
                        alt={asset.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{asset.name}</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(asset.sizeBytes)}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(asset.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-3 rounded-full bg-muted mb-3">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No assets yet</p>
                <p className="text-xs text-muted-foreground mt-1">Upload your first image to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
