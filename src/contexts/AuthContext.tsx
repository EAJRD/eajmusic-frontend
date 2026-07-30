import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { User } from '../types/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, accountType?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface AuthResponse {
  success?: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
  error?: string;
  message?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token management
const TOKEN_KEY = 'eajmusic_token';
const REFRESH_TOKEN_KEY = 'eajmusic_refresh_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearStoredTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount.
  // Auth is now cookie-based (httpOnly eajmusic_token, sent automatically by
  // the browser), so we can no longer gate this on a localStorage token -
  // the cookie may exist even with an empty/cleared localStorage, and vice
  // versa. Always ask the backend via /auth/me; it's the source of truth.
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get<AuthResponse>('/auth/me');
        if (response && response.user) {
          setUser(response.user);
        } else {
          clearStoredTokens();
        }
      } catch (error) {
        clearStoredTokens();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login
  const login = useCallback(async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password, rememberMe });

      // Cookies set by the backend response are what authenticate subsequent
      // requests now. accessToken/refreshToken in the body are only stored
      // as a harmless fallback; success is determined by getting a user back.
      if (response && response.user) {
        if (response.accessToken && response.refreshToken) {
          setStoredTokens(response.accessToken, response.refreshToken);
        }
        setUser(response.user);
        return { success: true };
      }

      return { success: false, error: response?.error || response?.message || 'Login failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  }, []);

  // Register
  const register = useCallback(async (name: string, email: string, password: string, accountType: string = 'ARTIST') => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', { name, email, password, accountType });

      // Same as login: the cookie is the real auth mechanism, the body's
      // tokens are just a fallback.
      if (response && response.user) {
        if (response.accessToken && response.refreshToken) {
          setStoredTokens(response.accessToken, response.refreshToken);
        }
        setUser(response.user);
        return { success: true };
      }

      return { success: false, error: response?.error || response?.message || 'Registration failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout', {});
    } catch {
      // Ignore errors during logout
    } finally {
      clearStoredTokens();
      setUser(null);
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get<AuthResponse>('/auth/me');
      if (response && response.user) {
        setUser(response.user);
      }
    } catch {
      // Ignore errors
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
