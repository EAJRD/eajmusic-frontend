import { Release, ArtistStats, AdminStats, User, Report, TakedownRequest } from '../types';

// Use environment variable with fallback to localhost for development
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Session management
let currentSessionId: string | null = localStorage.getItem('sessionId');
let currentUser: User | null = null;

const getHeaders = () => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (currentSessionId) {
    headers['x-session-id'] = currentSessionId;
  }
  return headers;
};

export const AuthService = {
  login: async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        currentSessionId = data.sessionId;
        currentUser = data.user;
        localStorage.setItem('sessionId', data.sessionId);
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  register: async (name: string, email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (data.success) {
        currentSessionId = data.sessionId;
        currentUser = data.user;
        localStorage.setItem('sessionId', data.sessionId);
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch {
      return { success: false, error: 'Network error' };
    }
  },

  logout: async (): Promise<void> => {
    if (currentSessionId) {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: currentSessionId })
      });
    }
    currentSessionId = null;
    currentUser = null;
    localStorage.removeItem('sessionId');
  },

  getCurrentUser: async (): Promise<User | null> => {
    if (!currentSessionId) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        currentUser = data.user;
        return data.user;
      }
      return null;
    } catch {
      return null;
    }
  },

  isAuthenticated: () => !!currentSessionId,
  getUser: () => currentUser
};

export const ArtistService = {
  getStats: async (): Promise<ArtistStats> => {
    const res = await fetch(`${API_BASE}/artist/stats`, { headers: getHeaders() });
    return res.json();
  },
  getReleases: async (): Promise<Release[]> => {
    const res = await fetch(`${API_BASE}/artist/releases`, { headers: getHeaders() });
    return res.json();
  },
  getReports: async (): Promise<Report[]> => {
    // Mock for now since server doesn't have reports endpoint yet
    return [
      { id: 'r1', type: 'WALLET', title: 'October 2023 Payout', date: 'Oct 2023', downloadUrl: '#', createdAt: '2023-11-01' }
    ];
  },
  createRelease: async (release: Omit<Release, 'id' | 'streams' | 'revenue' | 'status' | 'date'>): Promise<Release> => {
    const res = await fetch(`${API_BASE}/artist/releases`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(release)
    });
    return res.json();
  },
  getAnalytics: async () => {
    const res = await fetch(`${API_BASE}/artist/analytics/tracks`, { headers: getHeaders() });
    return res.json();
  }
};

export const AdminService = {
  getStats: async (): Promise<AdminStats> => {
    const res = await fetch(`${API_BASE}/admin/stats`, { headers: getHeaders() });
    return res.json();
  },
  getPendingReleases: async (): Promise<Release[]> => {
    const res = await fetch(`${API_BASE}/admin/pending`, { headers: getHeaders() });
    return res.json();
  },
  getAllReleases: async (): Promise<Release[]> => {
    const res = await fetch(`${API_BASE}/admin/releases`, { headers: getHeaders() });
    return res.json();
  },
  getAllUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE}/admin/users`, { headers: getHeaders() });
    return res.json();
  },
  getTakedowns: async (): Promise<TakedownRequest[]> => {
    const res = await fetch(`${API_BASE}/admin/takedowns`, { headers: getHeaders() });
    return res.json();
  },
  approveRelease: async (releaseId: string): Promise<boolean> => {
    const res = await fetch(`${API_BASE}/admin/approve/${releaseId}`, {
      method: 'POST',
      headers: getHeaders()
    });
    const data = await res.json();
    return data.success;
  },
  rejectRelease: async (releaseId: string): Promise<boolean> => {
    const res = await fetch(`${API_BASE}/admin/reject/${releaseId}`, {
      method: 'POST',
      headers: getHeaders()
    });
    const data = await res.json();
    return data.success;
  },
  suspendUser: async (userId: string): Promise<boolean> => {
    const res = await fetch(`${API_BASE}/admin/user/status/${userId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ status: 'Suspended' })
    });
    const data = await res.json();
    return data.success;
  },
  activateUser: async (userId: string): Promise<boolean> => {
    const res = await fetch(`${API_BASE}/admin/user/status/${userId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ status: 'Active' })
    });
    const data = await res.json();
    return data.success;
  },
  resolveTakedown: async (takedownId: string, action: 'delete' | 'dismiss'): Promise<boolean> => {
    const res = await fetch(`${API_BASE}/admin/takedowns/${takedownId}/resolve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action })
    });
    const data = await res.json();
    return data.success;
  },
  getPlans: async () => {
    const res = await fetch(`${API_BASE}/admin/plans`, { headers: getHeaders() });
    return res.json();
  },
  updatePlans: async (plans: Record<string, unknown>): Promise<boolean> => {
    const res = await fetch(`${API_BASE}/admin/plans`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(plans)
    });
    const data = await res.json();
    return data.success;
  },
  getAnnouncements: async () => {
    const res = await fetch(`${API_BASE}/admin/announcements`, { headers: getHeaders() });
    return res.json();
  },
  createAnnouncement: async (announcement: Record<string, unknown>) => {
    const res = await fetch(`${API_BASE}/admin/announcements`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(announcement)
    });
    return res.json();
  },
  getTickets: async () => {
    const res = await fetch(`${API_BASE}/admin/tickets`, { headers: getHeaders() });
    return res.json();
  },
  getBrandSettings: async () => {
    const res = await fetch(`${API_BASE}/admin/brand`, { headers: getHeaders() });
    return res.json();
  },
  updateBrandSettings: async (settings: Record<string, unknown>): Promise<boolean> => {
    const res = await fetch(`${API_BASE}/admin/brand`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(settings)
    });
    const data = await res.json();
    return data.success;
  }
};