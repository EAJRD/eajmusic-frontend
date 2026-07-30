// ===========================================
// EAJMUSIC API SERVICE
// ===========================================

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// ===========================================
// AUTH: cookie-based (primary) + localStorage (fallback)
// ===========================================
// Auth is now carried by httpOnly cookies (eajmusic_token / eajmusic_refresh)
// set by the backend and scoped to `.eajmusic.com` in production, so the
// browser attaches them automatically on requests to any subdomain as long
// as `credentials: 'include'` is set. localStorage tokens are kept ONLY as a
// harmless fallback for the `Authorization: Bearer` header (useful during
// rollback / for tooling) - they are no longer the source of truth.

// Token management (fallback only)
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

// CSRF (double-submit cookie): the backend sets a NON-httpOnly
// `eajmusic_csrf` cookie on login/register/refresh. Every mutating request
// must echo it back as the `X-CSRF-Token` header, except the auth endpoints
// that run before any CSRF cookie could exist, and public/anonymous routes.
const CSRF_COOKIE_NAME = 'eajmusic_csrf';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const CSRF_EXEMPT_EXACT_ENDPOINTS = new Set(['/auth/login', '/auth/register']);

const getCsrfTokenFromCookie = (): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CSRF_COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const isCsrfExempt = (endpoint: string): boolean =>
  CSRF_EXEMPT_EXACT_ENDPOINTS.has(endpoint) || endpoint.startsWith('/public/');

// Endpoints where a 401 is an expected, non-fatal outcome (e.g. "am I
// logged in?") or where a 401 means "bad credentials" rather than "session
// expired" - these must NOT trigger the refresh-then-redirect-to-login flow.
const AUTH_FLOW_ENDPOINTS = new Set(['/auth/login', '/auth/register', '/auth/me', '/auth/logout', '/auth/refresh']);

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
  // The httpOnly `eajmusic_refresh` cookie (sent automatically via
  // credentials:'include') is what actually authenticates this call now.
  // The localStorage refresh token, if present, is only sent in the body as
  // a backward-compatible fallback - it is NOT required to attempt refresh.
  const refreshToken = getRefreshToken();

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(refreshToken ? { refreshToken } : {}),
    });

    if (!response.ok) {
      clearTokens();
      return null;
    }

    const data = await response.json();
    if (data.accessToken) {
      if (data.refreshToken) {
        setTokens(data.accessToken, data.refreshToken);
      }
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
  const method = (options.method || 'GET').toUpperCase();
  const needsCsrf = MUTATING_METHODS.has(method) && !isCsrfExempt(endpoint);
  const csrfToken = needsCsrf ? getCsrfTokenFromCookie() : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(csrfToken && { [CSRF_HEADER_NAME]: csrfToken }),
    ...(options.headers as Record<string, string> | undefined),
  };

  const config: RequestInit = {
    ...options,
    headers,
    // Required so the browser attaches the httpOnly eajmusic_* cookies
    // (and the readable csrf cookie) on cross-subdomain requests.
    credentials: 'include',
  };

  try {
    let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle 401 - try to refresh the session via the httpOnly refresh
    // cookie. Skipped for auth-flow endpoints where a 401 is an expected,
    // non-fatal outcome (e.g. "am I logged in?" or "bad credentials") -
    // redirecting to /login from those would be wrong.
    if (response.status === 401 && !AUTH_FLOW_ENDPOINTS.has(endpoint)) {
      if (!isRefreshing) {
        isRefreshing = true;
        const newToken = await refreshTokens();
        isRefreshing = false;

        if (newToken) {
          onRefreshed(newToken);

          // Retry the original request. The refresh call rotates the CSRF
          // cookie too, so re-read it before retrying a mutating request.
          headers['Authorization'] = `Bearer ${newToken}`;
          if (needsCsrf) {
            const freshCsrfToken = getCsrfTokenFromCookie();
            if (freshCsrfToken) headers[CSRF_HEADER_NAME] = freshCsrfToken;
          }
          response = await fetch(`${API_BASE_URL}${endpoint}`, { ...config, headers, credentials: 'include' });
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
              if (needsCsrf) {
                const freshCsrfToken = getCsrfTokenFromCookie();
                if (freshCsrfToken) headers[CSRF_HEADER_NAME] = freshCsrfToken;
              }
              const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, { ...config, headers, credentials: 'include' });
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
  upload: async <T>(endpoint: string, file: File, additionalData?: Record<string, string>): Promise<T> => {
    const token = getToken();
    const csrfToken = getCsrfTokenFromCookie();
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(csrfToken && { [CSRF_HEADER_NAME]: csrfToken }),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.message || 'Upload failed', response.status, data);
    }

    return data as T;
  },

  // Batch file upload
  uploadBatch: async <T>(endpoint: string, files: File[]): Promise<T> => {
    const token = getToken();
    const csrfToken = getCsrfTokenFromCookie();
    const formData = new FormData();

    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(csrfToken && { [CSRF_HEADER_NAME]: csrfToken }),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.message || 'Upload failed', response.status, data);
    }

    return data as T;
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
  Testimonial,
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

  // Creates an employee account (SUPPORT/REVIEWER/FINANCE/ADMIN) — SUPER_ADMIN only.
  // If `password` is omitted, the backend generates a one-time temporary
  // password and returns it as `temporaryPassword` (never recoverable again).
  createEmployee: (data: { name: string; email: string; role: 'SUPPORT' | 'REVIEWER' | 'FINANCE' | 'ADMIN'; password?: string; permissions?: string[] }) =>
    api.post<{ success: boolean; message: string; user: User; temporaryPassword?: string }>('/admin/users', data),

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

  // Testimonial moderation — requires the `testimonials:moderate` permission
  // (ADMIN and SUPER_ADMIN have it by default).
  getTestimonials: (params?: { status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return api.get<PaginatedResponse<Testimonial>>(`/admin/testimonials${query ? `?${query}` : ''}`);
  },

  moderateTestimonial: (id: string, status: 'APPROVED' | 'REJECTED') =>
    api.patch<{ success: boolean; message: string; testimonial: Testimonial }>(`/admin/testimonials/${id}`, { status }),
};

// Public Service (unauthenticated endpoints)
export const PublicService = {
  submitTestimonial: (artistId: string, data: { quote: string; photoUrl?: string }) =>
    api.post<{ success: boolean; message: string; testimonial: { id: string; status: string } }>(
      `/public/testimonials/${artistId}`,
      data
    ),

  // Cacheable, unauthenticated brand/theming config (colors, logo, favicon).
  // Backend returns `{ siteName, primaryColor, logoUrl, faviconUrl }` today
  // (see eajmusic-api src/routes/public.js DEFAULT_BRAND_CONFIG) but the
  // stored `brand_config` PlatformSetting can carry additional whitelabel
  // fields (e.g. secondaryColor, fontFamily) once an admin publishes them —
  // see ThemeContext's `BrandConfig` type for the full shape this app reads.
  getTheme: () => api.get<Record<string, unknown>>('/public/theme'),
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

  // NOTE: unlike `/upload/audio`, the `/upload/cover` and `/upload/avatar`
  // backend routes (eajmusic-api src/routes/upload.js) still nest the
  // result under a `file` key: `{ success, message, file: { url, key, ... } }`.
  uploadCover: (file: File, releaseId?: string) =>
    api.upload<{ success: boolean; message?: string; file: { url: string; key: string; filename?: string; originalName?: string; size?: number } }>('/upload/cover', file, releaseId ? { releaseId } : undefined),

  uploadAvatar: (file: File) =>
    api.upload<{ success: boolean; message?: string; file: { url: string; key: string } }>('/upload/avatar', file),

  deleteFile: (type: 'audio' | 'images', filename: string) =>
    api.delete<{ success: boolean }>(`/upload/${type}/${filename}`),
};

export default api;
