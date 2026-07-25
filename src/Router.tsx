import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute, ArtistRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import { APP_MODE, goToApp } from './utils/subdomain';

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

// The marketing pages predate react-router in this codebase and still expect an
// `onNavigate(domain)` callback prop instead of <Link>/useNavigate. This adapter
// bridges that legacy prop to real router navigation (and cross-subdomain jumps
// for 'artist'/'admin') without having to touch every call site in those pages.
type MarketingDestination = 'main' | 'artist' | 'admin' | 'login' | 'register' | 'about' | 'support' | 'terms' | 'privacy' | 'careers';

function useMarketingNavigate() {
  const navigate = useNavigate();
  return (destination: MarketingDestination) => {
    switch (destination) {
      case 'main': navigate('/'); break;
      case 'login': navigate('/login'); break;
      case 'register': navigate('/register'); break;
      case 'about': navigate('/about'); break;
      case 'support': navigate('/support'); break;
      case 'terms': navigate('/terms'); break;
      case 'privacy': navigate('/privacy'); break;
      case 'careers': navigate('/careers'); break;
      case 'artist': goToApp('artist', '/'); break;
      case 'admin': goToApp('admin', '/'); break;
      default: navigate('/');
    }
  };
}

const HomeRoute: React.FC = () => <Home onNavigate={useMarketingNavigate()} />;
const AboutUsRoute: React.FC = () => <AboutUs onNavigate={useMarketingNavigate()} />;
const CareersRoute: React.FC = () => <Careers onNavigate={useMarketingNavigate()} />;
const PrivacyPolicyRoute: React.FC = () => <PrivacyPolicy onNavigate={useMarketingNavigate()} />;
const TermsOfServiceRoute: React.FC = () => <TermsOfService onNavigate={useMarketingNavigate()} />;
const MarketingSupportRoute: React.FC = () => <MarketingSupport onNavigate={useMarketingNavigate()} />;

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
    <Route path="/" element={<HomeRoute />} />
    <Route path="/about" element={<AboutUsRoute />} />
    <Route path="/careers" element={<CareersRoute />} />
    <Route path="/privacy" element={<PrivacyPolicyRoute />} />
    <Route path="/terms" element={<TermsOfServiceRoute />} />
    <Route path="/support" element={<MarketingSupportRoute />} />

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
