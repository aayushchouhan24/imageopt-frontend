// Asset types
export interface Asset {
  _id: string;
  name: string;
  type: 'image' | 'video' | 'file';
  sizeBytes: number;
  s3Key: string;
  s3Bucket: string;
  cloudfrontUrl: string;
  isPrivate: boolean;
  isDeleted: boolean;
  originalFolder?: string | null;
  ownerId: string;
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface AssetStats {
  assetId: string;
  assetName: string;
  totalRequests: number;
  totalBytes: number;
  totalGB: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRatio: string;
  estimatedCostUSD: number;
}

export interface SignedUrlResponse {
  signedUrl: string;
  expiresAt: string;
  expiresInSeconds: number;
  asset: {
    id: string;
    name: string;
  };
  transformations?: Record<string, string>;
}

export interface CacheInvalidationResponse {
  message: string;
  asset: {
    id: string;
    name: string;
    s3Key: string;
  };
  invalidation: {
    id: string;
    status: string;
    paths: string[];
  };
}

export interface PrivacyUpdateResponse {
  message: string;
  asset: {
    id: string;
    name: string;
    isPrivate: boolean;
    newS3Key: string;
    cloudfrontUrl: string;
    folder?: string;
  };
}

export interface FolderInfo {
  folder: string;
  count: number;
}

export interface TransformationParams {
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  width?: number;
  height?: number;
  quality?: number;
}
