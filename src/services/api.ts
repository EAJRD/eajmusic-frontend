// ===========================================
// EAJMUSIC API SERVICE
// ===========================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Token management
const getToken = (): string | null => localStorage.getItem('eajmusic_token');
const getRefreshToken = (): string | null => localStorage.getItem('eajmusic_refresh_token');

const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('eajmusic_token', accessToken);
  localStorage.setItem('eajmusic_refresh_token', refreshToken);
};

const clearTokens = (): void => {
  localStorage.removeItem('eajmusic_token');
  localStorage.removeItem('eajmusic_refresh_token');
};

// API Error class
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Refresh token logic
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

const refreshTokens = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return null;
    }

    const data = await response.json();
    if (data.accessToken) {
      setTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    }
  } catch {
    clearTokens();
  }

  return null;
};

// Main request function
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers as Record<string, string> | undefined),
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle 401 - try to refresh token
    if (response.status === 401 && token) {
      if (!isRefreshing) {
        isRefreshing = true;
        const newToken = await refreshTokens();
        isRefreshing = false;

        if (newToken) {
          onRefreshed(newToken);

          // Retry the original request
          headers['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(`${API_BASE_URL}${endpoint}`, { ...config, headers });
        } else {
          // Redirect to login
          window.location.href = '/login';
          throw new ApiError('Session expired', 401);
        }
      } else {
        // Wait for token refresh
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(async (newToken) => {
            try {
              headers['Authorization'] = `Bearer ${newToken}`;
              const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, { ...config, headers });
              const data = await retryResponse.json();
              resolve(data);
            } catch (error) {
              reject(error);
            }
          });
        });
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || data.error || 'Request failed',
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Network error', 0);
  }
}

// API object with methods
export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body: any) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: any) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body: any) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),

  // File upload
  upload: async (endpoint: string, file: File, additionalData?: Record<string, string>) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.message || 'Upload failed', response.status, data);
    }

    return data;
  },

  // Batch file upload
  uploadBatch: async (endpoint: string, files: File[]) => {
    const token = getToken();
    const formData = new FormData();

    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.message || 'Upload failed', response.status, data);
    }

    return data;
  },
};

// ===========================================
// SERVICE MODULES
// ===========================================

import type {
  AuthResponse,
  User,
  Release,
  Wallet,
  ArtistStats,
  AdminStats,
  SupportTicket,
  Payout,
  Announcement,
  PaginatedResponse,
} from '../types/api';

// Auth Service
export const AuthService = {
  login: (email: string, password: string, rememberMe?: boolean) =>
    api.post<AuthResponse & { accessToken: string; refreshToken: string; user: User }>('/auth/login', { email, password, rememberMe }),

  register: (name: string, email: string, password: string, accountType?: string) =>
    api.post<AuthResponse & { accessToken: string; refreshToken: string; user: User }>('/auth/register', { name, email, password, accountType }),

  logout: () => api.post<{ success: boolean }>('/auth/logout', {}),

  me: () => api.get<AuthResponse & { user: User }>('/auth/me'),

  updateProfile: (data: Partial<Pick<User, 'name' | 'avatarUrl'>>) =>
    api.patch<User>('/auth/profile', data),

  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) =>
    api.post<{ success: boolean; message: string }>('/auth/change-password', { currentPassword, newPassword, confirmPassword }),

  refresh: (refreshToken: string) =>
    api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken }),

  forgotPassword: (email: string) =>
    api.post<{ success: boolean; message: string }>('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post<{ success: boolean; message: string }>('/auth/reset-password', { token, newPassword }),
};

// Artist Service
export const ArtistService = {
  getStats: () => api.get<ArtistStats>('/artist/stats'),

  getReleases: (params?: { status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return api.get<PaginatedResponse<Release>>(`/artist/releases${query ? `?${query}` : ''}`);
  },

  getRelease: (id: string) => api.get<Release>(`/artist/releases/${id}`),

  createRelease: (data: Partial<Release>) => api.post<Release>('/artist/releases', data),

  updateRelease: (id: string, data: Partial<Release>) => api.patch<Release>(`/artist/releases/${id}`, data),

  submitRelease: (id: string) =>
    api.post<{ success: boolean; message: string }>(`/artist/releases/${id}/submit`, { agreedToTerms: true }),

  deleteRelease: (id: string) => api.delete<{ success: boolean }>(`/artist/releases/${id}`),

  getProfiles: () => api.get<Array<{ id: string; name: string; avatarUrl: string | null; isVerified: boolean }>>('/artist/profiles'),

  createProfile: (data: { name: string; bio?: string }) =>
    api.post<{ id: string; name: string }>('/artist/profiles', data),

  updateProfile: (id: string, data: Partial<{ name: string; bio: string; avatarUrl: string }>) =>
    api.patch<{ success: boolean }>(`/artist/profiles/${id}`, data),

  getAnalytics: (period?: string) =>
    api.get<{ streams: number; revenue: number; topCountries: Array<{ country: string; streams: number }> }>(
      `/artist/analytics/overview${period ? `?period=${period}` : ''}`
    ),

  getWallet: () => api.get<Wallet>('/artist/wallet'),

  requestPayout: (amount: number, method: string, methodDetails: { accountNumber?: string; email?: string; phone?: string }) =>
    api.post<{ success: boolean; payoutId: string }>('/artist/wallet/request-payout', { amount, method, methodDetails }),

  getTickets: () => api.get<SupportTicket[]>('/artist/tickets'),

  createTicket: (subject: string, category: string, message: string, priority?: string) =>
    api.post<SupportTicket>('/artist/tickets', { subject, category, message, priority }),

  replyToTicket: (ticketId: string, message: string) =>
    api.post<{ success: boolean }>(`/artist/tickets/${ticketId}/reply`, { message }),
};

// Admin Service
export const AdminService = {
  getStats: () => api.get<AdminStats>('/admin/stats'),

  getUsers: (params?: { role?: string; status?: string; search?: string; page?: number }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return api.get<PaginatedResponse<User>>(`/admin/users${query ? `?${query}` : ''}`);
  },

  getUser: (id: string) => api.get<User>(`/admin/users/${id}`),

  updateUserStatus: (id: string, status: string) =>
    api.patch<User>(`/admin/users/${id}/status`, { status }),

  updateUserRole: (id: string, role: string) =>
    api.patch<User>(`/admin/users/${id}/role`, { role }),

  updateUserPlan: (id: string, plan: string) =>
    api.patch<User>(`/admin/users/${id}/plan`, { plan }),

  getReleases: (params?: { status?: string; search?: string; page?: number }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return api.get<PaginatedResponse<Release>>(`/admin/releases${query ? `?${query}` : ''}`);
  },

  getPendingReleases: () => api.get<Release[]>('/admin/releases/pending'),

  getRelease: (id: string) => api.get<Release>(`/admin/releases/${id}`),

  reviewRelease: (id: string, action: 'APPROVE' | 'REJECT', reason?: string) =>
    api.post<{ success: boolean; message: string }>(`/admin/releases/${id}/review`, { action, reason }),

  getTakedowns: () => api.get<Array<{ id: string; releaseId: string; reason: string; status: string; createdAt: string }>>('/admin/takedowns'),

  resolveTakedown: (id: string, action: string, resolution: string) =>
    api.post<{ success: boolean }>(`/admin/takedowns/${id}/resolve`, { action, resolution }),

  getPayouts: (params?: { status?: string; page?: number }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return api.get<PaginatedResponse<Payout>>(`/admin/payouts${query ? `?${query}` : ''}`);
  },

  processPayout: (id: string, action: 'COMPLETE' | 'FAIL', transactionId?: string, failureReason?: string) =>
    api.post<{ success: boolean }>(`/admin/payouts/${id}/process`, { action, transactionId, failureReason }),

  bulkCompletePayout: (payouts: Array<{ email: string; amount: number; method: string; transactionId: string }>) =>
    api.post<{ success: boolean; processed: number }>('/admin/payouts/bulk-complete', { payouts }),

  getAnnouncements: () => api.get<Announcement[]>('/admin/announcements'),

  createAnnouncement: (data: { title: string; content: string; type: string }) =>
    api.post<Announcement>('/admin/announcements', data),

  updateAnnouncement: (id: string, data: Partial<Announcement>) =>
    api.patch<Announcement>(`/admin/announcements/${id}`, data),

  deleteAnnouncement: (id: string) => api.delete<{ success: boolean }>(`/admin/announcements/${id}`),

  getTickets: (params?: { status?: string; page?: number }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return api.get<PaginatedResponse<SupportTicket>>(`/admin/tickets${query ? `?${query}` : ''}`);
  },

  getTicket: (id: string) => api.get<SupportTicket>(`/admin/tickets/${id}`),

  replyToTicket: (ticketId: string, message: string, isInternal?: boolean) =>
    api.post<{ success: boolean }>(`/admin/tickets/${ticketId}/reply`, { message, isInternal }),

  updateTicketStatus: (ticketId: string, status: string) =>
    api.patch<{ success: boolean }>(`/admin/tickets/${ticketId}/status`, { status }),

  getSettings: () => api.get<Record<string, { value: unknown; description: string }>>('/admin/settings'),

  updateSetting: (key: string, value: unknown, description?: string) =>
    api.put<{ success: boolean }>(`/admin/settings/${key}`, { value, description }),

  getAuditLogs: (params?: { userId?: string; action?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return api.get<PaginatedResponse<{ id: string; action: string; userId: string; createdAt: string }>>(
      `/admin/audit-logs${query ? `?${query}` : ''}`
    );
  },

  getFinanceOverview: () => api.get<{ totalRevenue: number; pendingPayouts: number; completedPayouts: number; monthlyRevenue: Array<{ month: string; amount: number }> }>('/admin/finance/overview'),
};

// Upload Service
export const UploadService = {
  uploadAudio: (file: File, releaseId?: string, trackNumber?: number) =>
    api.upload<{ url: string; key: string; durationMs: number }>('/upload/audio', file, {
      ...(releaseId && { releaseId }),
      ...(trackNumber !== undefined && { trackNumber: String(trackNumber) }),
    }),

  uploadAudioBatch: (files: File[]) =>
    api.uploadBatch<Array<{ url: string; key: string; filename: string }>>('/upload/audio/batch', files),

  uploadCover: (file: File, releaseId?: string) =>
    api.upload<{ url: string; key: string }>('/upload/cover', file, releaseId ? { releaseId } : undefined),

  uploadAvatar: (file: File) =>
    api.upload<{ url: string; key: string }>('/upload/avatar', file),

  deleteFile: (type: 'audio' | 'images', filename: string) =>
    api.delete<{ success: boolean }>(`/upload/${type}/${filename}`),
};

export default api;
