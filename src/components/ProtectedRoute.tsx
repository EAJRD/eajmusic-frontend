import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
    // Redirect based on user role
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
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
    // Redirect based on role
    const from = (location.state as any)?.from?.pathname;

    if (from) {
      return <Navigate to={from} replace />;
    }

    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
