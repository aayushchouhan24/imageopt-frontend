import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AssetImage } from '@/components/assets/AssetImage';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatBytes, formatCurrency } from '@/lib/utils';

export function AnalyticsPage() {
  const { data: bandwidthData } = useQuery({
    queryKey: ['bandwidth'],
    queryFn: () => apiClient.getBandwidth(),
  });

  const { data: dailyData, isLoading: dailyLoading } = useQuery({
    queryKey: ['daily-bandwidth'],
    queryFn: () => apiClient.getDailyBandwidth(),
  });

  const { data: assetsData, isLoading: assetsLoading } = useQuery({
    queryKey: ['assets-bandwidth'],
    queryFn: () => apiClient.getAssetsBandwidth(),
  });

  const bandwidth = bandwidthData?.data || { totalBandwidthBytes: 0, totalCostUSD: 0 };
  const dailyBandwidth = dailyData?.data?.daily || [];
  const topAssets = assetsData?.data?.assets || [];

  const totalRequests = dailyBandwidth.reduce((acc, day) => acc + day.requests, 0);

  const stats = [
    {
      label: 'Total Bandwidth',
      value: formatBytes(bandwidth.totalBandwidthBytes || 0),
      icon: BarChart3,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      change: '+12.5%',
      changeUp: true,
    },
    {
      label: 'Total Requests',
      value: totalRequests.toLocaleString(),
      icon: Zap,
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      change: '+8.2%',
      changeUp: true,
    },
    {
      label: 'Total Cost',
      value: formatCurrency(bandwidth.totalCostUSD || 0),
      icon: DollarSign,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
      change: '-3.1%',
      changeUp: false,
    },
    {
      label: 'Avg Daily',
      value: dailyBandwidth.length > 0
        ? formatBytes(dailyBandwidth.reduce((acc, day) => acc + day.bandwidthBytes, 0) / dailyBandwidth.length)
        : '0 B',
      icon: TrendingUp,
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-500',
      change: '+5.4%',
      changeUp: true,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Analytics</h1>
          <p className="text-sm text-zinc-500 mt-1">Track bandwidth usage and costs</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-zinc-800/30 bg-zinc-900/20 text-zinc-400 hover:text-white gap-2">
            <Calendar className="h-4 w-4" />
            Last 30 days
          </Button>
          <Button variant="outline" className="border-zinc-800/30 bg-zinc-900/20 text-zinc-400 hover:text-white gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/20 border border-zinc-800/30"
          >
            <div className={`p-3 rounded-xl ${stat.iconBg}`}>
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm text-zinc-500">{stat.label}</p>
                <span className={`text-xs flex items-center gap-0.5 ${stat.changeUp ? 'text-emerald-500' : 'text-red-400'}`}>
                  {stat.changeUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bandwidth Chart */}
      <div className="rounded-xl bg-zinc-900/20 border border-zinc-800/30 mb-8">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/30">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-medium text-white">Bandwidth Over Time</h2>
            <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 text-xs">
              {dailyBandwidth.length} days
            </Badge>
          </div>
        </div>
        <div className="p-4">
          {dailyLoading ? (
            <Skeleton className="h-80 w-full bg-zinc-800/30" />
          ) : dailyBandwidth.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={dailyBandwidth}>
                <defs>
                  <linearGradient id="bandwidthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#52525b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis
                  stroke="#52525b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatBytes(value)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number | undefined) => [formatBytes(value || 0), 'Bandwidth']}
                />
                <Area 
                  type="monotone" 
                  dataKey="bandwidthBytes" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fill="url(#bandwidthGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center text-center">
              <div className="p-4 rounded-full bg-zinc-800/50 mb-4">
                <BarChart3 className="h-8 w-8 text-zinc-600" />
              </div>
              <p className="text-sm text-zinc-500">No bandwidth data available yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Assets */}
      <div className="rounded-xl bg-zinc-900/20 border border-zinc-800/30">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/30">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-medium text-white">Top Assets by Bandwidth</h2>
            <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 text-xs">
              {topAssets.length}
            </Badge>
          </div>
        </div>
        
        <div className="divide-y divide-zinc-800/50">
          {assetsLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-zinc-800/50" />
              ))}
            </div>
          ) : topAssets.length > 0 ? (
            topAssets.map((asset, index) => (
              <div
                key={asset._id}
                className="flex items-center gap-4 p-4 hover:bg-zinc-800/20 transition-colors group"
              >
                {/* Rank */}
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium ${
                  index === 0 ? 'bg-yellow-500/10 text-yellow-500' :
                  index === 1 ? 'bg-zinc-400/10 text-zinc-400' :
                  index === 2 ? 'bg-orange-500/10 text-orange-600' :
                  'bg-zinc-800 text-zinc-500'
                }`}>
                  {index + 1}
                </div>

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
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(asset.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Size */}
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{formatBytes(asset.sizeBytes)}</p>
                  <p className="text-xs text-zinc-500">Size</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-full bg-zinc-800/50 mb-4">
                <BarChart3 className="h-8 w-8 text-zinc-600" />
              </div>
              <p className="text-sm text-zinc-500">No asset data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
