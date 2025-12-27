import type { Asset, DailyBandwidth } from '@/types';

// API client for backend communication

const API_BASE_URL = 'http://localhost:5000';

// Response types
interface AssetsResponse {
  data: { assets: Asset[]; total?: number; page?: number; limit?: number };
}

interface BandwidthResponse {
  data: { totalBandwidthBytes: number; totalCostUSD: number };
}

interface DailyBandwidthResponse {
  data: { daily: DailyBandwidth[] };
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.setToken(null);
        window.location.href = '/login';
      }
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request('/api/auth/me');
  }

  // Asset endpoints
  async getAssets(page = 1, limit = 20): Promise<AssetsResponse> {
    return this.request<AssetsResponse>(`/api/assets?page=${page}&limit=${limit}`);
  }

  async getAsset(id: string) {
    return this.request(`/api/assets/${id}`);
  }

  async getAssetStats(id: string) {
    return this.request(`/api/assets/${id}/stats`);
  }

  async getUploadUrl(data: {
    fileName: string;
    fileType: string;
    fileSize: number;
    folder?: string;
    customFileName?: string;
  }) {
    return this.request('/api/assets/upload-url', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createAsset(data: {
    fileName: string;
    fileType: string;
    fileSize: number;
    s3Key: string;
    s3Bucket: string;
    metadata?: { width?: number; height?: number; format?: string };
  }) {
    return this.request('/api/assets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAsset(id: string) {
    return this.request(`/api/assets/${id}`, { method: 'DELETE' });
  }

  async restoreAsset(id: string) {
    return this.request(`/api/assets/${id}/restore`, { method: 'PUT' });
  }

  // Analytics endpoints
  async getBandwidth(startDate?: string, endDate?: string): Promise<BandwidthResponse> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params}` : '';
    return this.request<BandwidthResponse>(`/api/analytics/bandwidth${query}`);
  }

  async getDailyBandwidth(startDate?: string, endDate?: string): Promise<DailyBandwidthResponse> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params}` : '';
    return this.request<DailyBandwidthResponse>(`/api/analytics/bandwidth/daily${query}`);
  }

  async getAssetsBandwidth(page = 1, limit = 20): Promise<AssetsResponse> {
    return this.request<AssetsResponse>(`/api/analytics/bandwidth/assets?page=${page}&limit=${limit}`);
  }

  // Upload file directly to S3
  async uploadToS3(url: string, file: File) {
    const response = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to S3');
    }
  }
}

export const apiClient = new ApiClient();
