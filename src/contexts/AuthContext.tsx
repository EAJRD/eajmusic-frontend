import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role: 'ARTIST' | 'LABEL' | 'ADMIN' | 'SUPER_ADMIN';
  status: string;
  avatarUrl: string | null;
  subscription?: {
    plan: string;
    commissionRate: number;
    isActive: boolean;
    expiresAt: string | null;
  };
  artistProfiles?: Array<{
    id: string;
    name: string;
    avatarUrl: string | null;
    isVerified: boolean;
  }>;
  wallet?: {
    availableBalance: number;
    pendingBalance: number;
    lifetimeEarnings: number;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, accountType?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
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

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getStoredToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.user) {
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
      const response = await api.post('/auth/login', { email, password, rememberMe });

      if (response.success && response.accessToken) {
        setStoredTokens(response.accessToken, response.refreshToken);
        setUser(response.user);
        return { success: true };
      }

      return { success: false, error: response.error || 'Login failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  }, []);

  // Register
  const register = useCallback(async (name: string, email: string, password: string, accountType: string = 'ARTIST') => {
    try {
      const response = await api.post('/auth/register', { name, email, password, accountType });

      if (response.success && response.accessToken) {
        setStoredTokens(response.accessToken, response.refreshToken);
        setUser(response.user);
        return { success: true };
      }

      return { success: false, error: response.error || 'Registration failed' };
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
      const response = await api.get('/auth/me');
      if (response.user) {
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
