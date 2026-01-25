import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute, ArtistRoute, PublicOnlyRoute } from './components/ProtectedRoute';

// Lazy load components for better performance
const Home = lazy(() => import('./apps/marketing/Home'));
const Login = lazy(() => import('./apps/auth/Login'));
const Register = lazy(() => import('./apps/auth/Register'));
const ArtistDashboard = lazy(() => import('./apps/artist/Dashboard'));
const AdminDashboard = lazy(() => import('./apps/admin/AdminDashboard'));

// Loading fallback
const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-600 dark:text-slate-400 font-medium">Loading...</p>
    </div>
  </div>
);

// 404 Page
const NotFound: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950">
    <div className="text-center">
      <h1 className="text-6xl font-black text-brand-600 mb-4">404</h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">Page not found</p>
      <a
        href="/"
        className="px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors"
      >
        Go Home
      </a>
    </div>
  </div>
);

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />

            {/* Auth Routes - Only for non-authenticated users */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              }
            />

            {/* Artist Dashboard Routes */}
            <Route
              path="/dashboard/*"
              element={
                <ArtistRoute>
                  <ArtistDashboard />
                </ArtistRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* Legacy redirects */}
            <Route path="/artist" element={<Navigate to="/dashboard" replace />} />
            <Route path="/app" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRouter;
