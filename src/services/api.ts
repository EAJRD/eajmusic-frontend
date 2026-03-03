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

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
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

// Auth Service
export const AuthService = {
  login: (email: string, password: string, rememberMe?: boolean) =>
    api.post<any>('/auth/login', { email, password, rememberMe }),

  register: (name: string, email: string, password: string, accountType?: string) =>
    api.post<any>('/auth/register', { name, email, password, accountType }),

  logout: () => api.post<any>('/auth/logout', {}),

  me: () => api.get<any>('/auth/me'),

  updateProfile: (data: any) => api.patch<any>('/auth/profile', data),

  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) =>
    api.post<any>('/auth/change-password', { currentPassword, newPassword, confirmPassword }),

  refresh: (refreshToken: string) => api.post<any>('/auth/refresh', { refreshToken }),
};

// Artist Service
export const ArtistService = {
  // Stats
  getStats: () => api.get<any>('/artist/stats'),

  // Releases
  getReleases: (params?: { status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return api.get<any>(`/artist/releases${query ? `?${query}` : ''}`);
  },

  getRelease: (id: string) => api.get<any>(`/artist/releases/${id}`),

  createRelease: (data: any) => api.post<any>('/artist/releases', data),

  updateRelease: (id: string, data: any) => api.patch<any>(`/artist/releases/${id}`, data),

  submitRelease: (id: string) =>
    api.post<any>(`/artist/releases/${id}/submit`, { agreedToTerms: true }),

  deleteRelease: (id: string) => api.delete<any>(`/artist/releases/${id}`),

  // Artist Profiles
  getProfiles: () => api.get<any>('/artist/profiles'),

  createProfile: (data: any) => api.post<any>('/artist/profiles', data),

  // Analytics
  getAnalytics: (period?: string) =>
    api.get<any>(`/artist/analytics/overview${period ? `?period=${period}` : ''}`),

  // Wallet
  getWallet: () => api.get<any>('/artist/wallet'),

  requestPayout: (amount: number, method: string, methodDetails: any) =>
    api.post<any>('/artist/wallet/request-payout', { amount, method, methodDetails }),

  // Support
  getTickets: () => api.get<any>('/artist/tickets'),

  createTicket: (subject: string, category: string, message: string) =>
    api.post<any>('/artist/tickets', { subject, category, message }),

  replyToTicket: (ticketId: string, message: string) =>
    api.post<any>(`/artist/tickets/${ticketId}/reply`, { message }),
};

// Admin Service
export const AdminService = {
  // Stats
  getStats: () => api.get<any>('/admin/stats'),

  // Users
  getUsers: (params?: { role?: string; status?: string; search?: string; page?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return api.get<any>(`/admin/users${query ? `?${query}` : ''}`);
  },

  getUser: (id: string) => api.get<any>(`/admin/users/${id}`),

  updateUserStatus: (id: string, status: string) =>
    api.patch<any>(`/admin/users/${id}/status`, { status }),

  updateUserRole: (id: string, role: string) =>
    api.patch<any>(`/admin/users/${id}/role`, { role }),

  // Releases
  getReleases: (params?: { status?: string; search?: string; page?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return api.get<any>(`/admin/releases${query ? `?${query}` : ''}`);
  },

  getPendingReleases: () => api.get<any>('/admin/releases/pending'),

  getRelease: (id: string) => api.get<any>(`/admin/releases/${id}`),

  reviewRelease: (id: string, action: 'APPROVE' | 'REJECT', reason?: string) =>
    api.post<any>(`/admin/releases/${id}/review`, { action, reason }),

  // Takedowns
  getTakedowns: () => api.get<any>('/admin/takedowns'),

  resolveTakedown: (id: string, action: string, resolution: string) =>
    api.post<any>(`/admin/takedowns/${id}/resolve`, { action, resolution }),

  // Payouts
  getPayouts: (params?: { status?: string; page?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return api.get<any>(`/admin/payouts${query ? `?${query}` : ''}`);
  },

  processPayout: (id: string, action: 'COMPLETE' | 'FAIL', transactionId?: string, failureReason?: string) =>
    api.post<any>(`/admin/payouts/${id}/process`, { action, transactionId, failureReason }),

  bulkCompletePayout: (payouts: Array<{ email: string; amount: number; method: string; transactionId: string }>) =>
    api.post<any>('/admin/payouts/bulk-complete', { payouts }),

  // Announcements
  getAnnouncements: () => api.get<any>('/admin/announcements'),

  createAnnouncement: (data: any) => api.post<any>('/admin/announcements', data),

  updateAnnouncement: (id: string, data: any) => api.patch<any>(`/admin/announcements/${id}`, data),

  deleteAnnouncement: (id: string) => api.delete<any>(`/admin/announcements/${id}`),

  // Tickets
  getTickets: (params?: { status?: string; page?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return api.get<any>(`/admin/tickets${query ? `?${query}` : ''}`);
  },

  getTicket: (id: string) => api.get<any>(`/admin/tickets/${id}`),

  replyToTicket: (ticketId: string, message: string, isInternal?: boolean) =>
    api.post<any>(`/admin/tickets/${ticketId}/reply`, { message, isInternal }),

  updateTicketStatus: (ticketId: string, status: string) =>
    api.patch<any>(`/admin/tickets/${ticketId}/status`, { status }),

  // Settings
  getSettings: () => api.get<any>('/admin/settings'),

  updateSetting: (key: string, value: any) =>
    api.post<any>(`/admin/settings/${key}`, { value }),

  // Audit Logs
  getAuditLogs: (params?: { userId?: string; action?: string; page?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return api.get<any>(`/admin/audit-logs${query ? `?${query}` : ''}`);
  },
};

// Upload Service
export const UploadService = {
  uploadAudio: (file: File, releaseId?: string, trackNumber?: number) =>
    api.upload('/upload/audio', file, {
      ...(releaseId && { releaseId }),
      ...(trackNumber !== undefined && { trackNumber: String(trackNumber) }),
    }),

  uploadAudioBatch: (files: File[]) => api.uploadBatch('/upload/audio/batch', files),

  uploadCover: (file: File, releaseId?: string) =>
    api.upload('/upload/cover', file, releaseId ? { releaseId } : undefined),

  uploadAvatar: (file: File) => api.upload('/upload/avatar', file),

  deleteFile: (type: 'audio' | 'images', filename: string) =>
    api.delete<any>(`/upload/${type}/${filename}`),
};

export default api;
