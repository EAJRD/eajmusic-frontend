import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, API_BASE_URL } from '../services/api';
import { getInsforge } from '../lib/insforge';
import type { User } from '../types/api';

interface AuthResult {
  success: boolean;
  error?: string;
  requireEmailVerification?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  loginWithOAuth: (provider: string, accountType?: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string, accountType?: string) => Promise<AuthResult>;
  verifyEmailCode: (email: string, otp: string, name?: string, accountType?: string) => Promise<AuthResult>;
  resendVerificationCode: (email: string) => Promise<AuthResult>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  resetPasswordWithCode: (email: string, code: string, newPassword: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const OAUTH_VERIFIER_KEY = 'eajmusic_oauth_verifier';
const OAUTH_ACCOUNT_TYPE_KEY = 'eajmusic_oauth_account_type';

interface MeResponse {
  user?: User;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// InsForge (https://insforge.dev) is the credential front door - signup,
// login, OAuth, email verification, and password reset all happen there via
// @insforge/sdk. The moment any of those flows yields a fresh InsForge
// accessToken, it's exchanged here for this API's own httpOnly session
// cookies (POST /auth/sync-insforge-user) - everything else (session
// persistence via /auth/me, RBAC, every other API call) is completely
// unchanged from before.
async function syncInsforgeUser(insforgeAccessToken: string, extra?: { name?: string; accountType?: string }): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/auth/sync-insforge-user`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${insforgeAccessToken}`,
    },
    body: JSON.stringify(extra || {}),
  });
  const data = await res.json();
  if (!res.ok || !data.user) {
    throw new Error(data.message || data.error || 'Failed to sync account');
  }
  return data.user as User;
}

function errorMessage(error: any, fallback: string): string {
  return error?.message || fallback;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Session persistence across reloads never touches InsForge - this API's
  // own httpOnly cookie (set by syncInsforgeUser at login/signup time) is
  // the ongoing source of truth, exactly as before, and /auth/me is a plain
  // fetch that never imports the InsForge SDK. The one exception is landing
  // back from an OAuth redirect (?insforge_code=...): InsForge's SDK never
  // exposes a reusable access token after the fact, so that one-time code
  // has to be exchanged and synced right here, on the page it redirects
  // back to (see loginWithOAuth below) - and only then does this pull in
  // the SDK chunk, via the plain string check below (no SDK needed just to
  // look for a query param).
  useEffect(() => {
    const init = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('insforge_code');

      if (code) {
        const codeVerifier = sessionStorage.getItem(OAUTH_VERIFIER_KEY) || undefined;
        const accountType = sessionStorage.getItem(OAUTH_ACCOUNT_TYPE_KEY) || 'ARTIST';
        sessionStorage.removeItem(OAUTH_VERIFIER_KEY);
        sessionStorage.removeItem(OAUTH_ACCOUNT_TYPE_KEY);

        params.delete('insforge_code');
        const cleanQuery = params.toString();
        window.history.replaceState({}, '', window.location.pathname + (cleanQuery ? `?${cleanQuery}` : '') + window.location.hash);

        try {
          const insforge = await getInsforge();
          const { data, error } = await insforge.auth.exchangeOAuthCode(code, codeVerifier);
          if (!error && data?.accessToken) {
            const syncedUser = await syncInsforgeUser(data.accessToken, { accountType });
            setUser(syncedUser);
            setIsLoading(false);
            return;
          }
        } catch {
          // Fall through to the normal /auth/me check below.
        }
      }

      try {
        const response = await api.get<MeResponse>('/auth/me');
        setUser(response?.user || null);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const insforge = await getInsforge();
      const { data, error } = await insforge.auth.signInWithPassword({ email, password });

      if (error) {
        if (error.statusCode === 403) {
          return { success: false, error: 'Please verify your email address to continue.', requireEmailVerification: true };
        }
        return { success: false, error: error.message || 'Invalid email or password' };
      }

      if (!data?.accessToken) {
        return { success: false, error: 'Login failed' };
      }

      const syncedUser = await syncInsforgeUser(data.accessToken);
      setUser(syncedUser);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: errorMessage(error, 'Login failed') };
    }
  }, []);

  // Manual PKCE flow (not the SDK's automatic in-browser detection): the
  // automatic flow never surfaces the resulting accessToken to app code, and
  // sync-insforge-user needs that token. skipBrowserRedirect gets us
  // {url, codeVerifier} instead of an immediate redirect; codeVerifier is
  // stashed in sessionStorage (survives the full-page navigation to the
  // provider and back) and consumed by the exchange in the effect above.
  const loginWithOAuth = useCallback(async (provider: string, accountType: string = 'ARTIST'): Promise<AuthResult> => {
    try {
      const insforge = await getInsforge();
      const redirectTo = `${window.location.origin}/login`;
      const { data, error } = await insforge.auth.signInWithOAuth(provider, {
        redirectTo,
        skipBrowserRedirect: true,
      });

      if (error || !data?.url) {
        return { success: false, error: error?.message || 'Failed to start sign-in' };
      }

      if (data.codeVerifier) {
        sessionStorage.setItem(OAUTH_VERIFIER_KEY, data.codeVerifier);
      }
      sessionStorage.setItem(OAUTH_ACCOUNT_TYPE_KEY, accountType);

      window.location.href = data.url;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: errorMessage(error, 'Failed to start sign-in') };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, accountType: string = 'ARTIST'): Promise<AuthResult> => {
    try {
      const insforge = await getInsforge();
      const { data, error } = await insforge.auth.signUp({ email, password, name });

      if (error) {
        return { success: false, error: error.message || 'Registration failed' };
      }

      if (data?.requireEmailVerification) {
        return { success: true, requireEmailVerification: true };
      }

      if (data?.accessToken) {
        const syncedUser = await syncInsforgeUser(data.accessToken, { name, accountType });
        setUser(syncedUser);
        return { success: true };
      }

      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      return { success: false, error: errorMessage(error, 'Registration failed') };
    }
  }, []);

  const verifyEmailCode = useCallback(async (email: string, otp: string, name?: string, accountType?: string): Promise<AuthResult> => {
    try {
      const insforge = await getInsforge();
      const { data, error } = await insforge.auth.verifyEmail({ email, otp });

      if (error) {
        return { success: false, error: error.message || 'Invalid or expired code' };
      }
      if (!data?.accessToken) {
        return { success: false, error: 'Verification failed' };
      }

      const syncedUser = await syncInsforgeUser(data.accessToken, { name, accountType });
      setUser(syncedUser);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: errorMessage(error, 'Verification failed') };
    }
  }, []);

  const resendVerificationCode = useCallback(async (email: string): Promise<AuthResult> => {
    try {
      const insforge = await getInsforge();
      const { error } = await insforge.auth.resendVerificationEmail({ email });
      if (error) return { success: false, error: error.message || 'Failed to resend code' };
      return { success: true };
    } catch (error: any) {
      return { success: false, error: errorMessage(error, 'Failed to resend code') };
    }
  }, []);

  const forgotPassword = useCallback(async (email: string): Promise<AuthResult> => {
    try {
      const insforge = await getInsforge();
      const { error } = await insforge.auth.sendResetPasswordEmail({ email });
      if (error) return { success: false, error: error.message || 'Failed to send reset code' };
      return { success: true };
    } catch (error: any) {
      return { success: false, error: errorMessage(error, 'Failed to send reset code') };
    }
  }, []);

  const resetPasswordWithCode = useCallback(async (email: string, code: string, newPassword: string): Promise<AuthResult> => {
    try {
      const insforge = await getInsforge();
      const { data: exchangeData, error: exchangeError } = await insforge.auth.exchangeResetPasswordToken({ email, code });
      if (exchangeError || !exchangeData?.token) {
        return { success: false, error: exchangeError?.message || 'Invalid or expired code' };
      }

      const { error: resetError } = await insforge.auth.resetPassword({ newPassword, otp: exchangeData.token });
      if (resetError) {
        return { success: false, error: resetError.message || 'Failed to reset password' };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: errorMessage(error, 'Failed to reset password') };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const insforge = await getInsforge();
      await insforge.auth.signOut();
    } catch {
      // Ignore - still clear the local session below regardless.
    }
    try {
      await api.post('/auth/logout', {});
    } catch {
      // Ignore errors during logout
    } finally {
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get<MeResponse>('/auth/me');
      if (response?.user) {
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
    loginWithOAuth,
    register,
    verifyEmailCode,
    resendVerificationCode,
    forgotPassword,
    resetPasswordWithCode,
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
