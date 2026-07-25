import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { APP_MODE, goToApp } from '../utils/subdomain';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'ARTIST' | 'LABEL' | 'ADMIN' | 'SUPER_ADMIN'>;
  redirectTo?: string;
}

// Loading spinner component
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-600 dark:text-slate-400 font-medium">Loading...</p>
    </div>
  </div>
);

// Sends the user to wherever their role actually lives — same-origin path on
// the unified domain, or a full cross-subdomain redirect on artist./eaj.
const RoleHomeRedirect: React.FC<{ role: 'ARTIST' | 'LABEL' | 'ADMIN' | 'SUPER_ADMIN' }> = ({ role }) => {
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const targetMode = isAdmin ? 'admin' : 'artist';

  useEffect(() => {
    if (APP_MODE !== 'main') {
      goToApp(targetMode, '/');
    }
  }, [targetMode]);

  if (APP_MODE === 'main') {
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }

  return <LoadingSpinner />;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = '/login',
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <RoleHomeRedirect role={user.role} />;
  }

  return <>{children}</>;
};

// Admin-only route
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} redirectTo="/login">
    {children}
  </ProtectedRoute>
);

// Artist route (artists and labels)
export const ArtistRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['ARTIST', 'LABEL', 'ADMIN', 'SUPER_ADMIN']}>
    {children}
  </ProtectedRoute>
);

// Public route - redirects authenticated users
export const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated && user) {
    const from = (location.state as any)?.from?.pathname;

    if (from && APP_MODE === 'main') {
      return <Navigate to={from} replace />;
    }

    return <RoleHomeRedirect role={user.role} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
