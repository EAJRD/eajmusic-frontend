import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute, ArtistRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import { APP_MODE } from './utils/subdomain';

// Lazy load components for better performance
const Home = lazy(() => import('../apps/marketing/Home'));
const AboutUs = lazy(() => import('../apps/marketing/AboutUs'));
const Careers = lazy(() => import('../apps/marketing/Careers'));
const PrivacyPolicy = lazy(() => import('../apps/marketing/PrivacyPolicy'));
const TermsOfService = lazy(() => import('../apps/marketing/TermsOfService'));
const MarketingSupport = lazy(() => import('../apps/marketing/Support'));
const Login = lazy(() => import('../apps/auth/Login'));
const Register = lazy(() => import('../apps/auth/Register'));
const ForgotPassword = lazy(() => import('../apps/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../apps/auth/ResetPassword'));
const ArtistDashboard = lazy(() => import('../apps/artist/Dashboard'));
const AdminDashboard = lazy(() => import('../apps/admin/AdminDashboard'));

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

// artist.eajmusic.com — the artist dashboard app owns the whole domain
const ArtistAppRoutes: React.FC = () => (
  <Routes>
    <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
    <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
    <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
    <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />
    <Route
      path="/*"
      element={
        <ArtistRoute>
          <ArtistDashboard />
        </ArtistRoute>
      }
    />
  </Routes>
);

// eaj.eajmusic.com — the distributor admin app owns the whole domain
const AdminAppRoutes: React.FC = () => (
  <Routes>
    <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
    <Route path="/register" element={<Navigate to="/login" replace />} />
    <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
    <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />
    <Route
      path="/*"
      element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      }
    />
  </Routes>
);

// eajmusic.com (and local dev without ?app=) — marketing site + path-based apps
const MainAppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<AboutUs />} />
    <Route path="/careers" element={<Careers />} />
    <Route path="/privacy" element={<PrivacyPolicy />} />
    <Route path="/terms" element={<TermsOfService />} />
    <Route path="/support" element={<MarketingSupport />} />

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
    <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
    <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />

    <Route
      path="/dashboard/*"
      element={
        <ArtistRoute>
          <ArtistDashboard />
        </ArtistRoute>
      }
    />

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
);

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          {APP_MODE === 'artist' && <ArtistAppRoutes />}
          {APP_MODE === 'admin' && <AdminAppRoutes />}
          {APP_MODE === 'main' && <MainAppRoutes />}
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRouter;
