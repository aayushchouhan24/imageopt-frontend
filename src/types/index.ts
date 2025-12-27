// Type definitions for ImageOpt platform

export interface User {
  _id: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
    token: string;
  };
}

export interface Asset {
  _id: string;
  ownerId: string;
  name: string;
  type: 'image' | 'video' | 'file';
  mimeType?: string;
  folder?: string;
  s3Bucket: string;
  s3Key: string;
  cloudfrontUrl: string;
  sizeBytes: number;
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
  };
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssetStats {
  assetId: string;
  totalBandwidthBytes: number;
  totalRequests: number;
  totalCost: number;
}

export interface BandwidthData {
  totalBandwidthBytes: number;
  totalBandwidthGB: number;
  totalCostUSD: number;
  assets: Asset[];
}

export interface DailyBandwidth {
  date: string;
  bandwidthBytes: number;
  bandwidthGB: number;
  requests: number;
  costUSD: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
