import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute, AdminRoute, ArtistRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import AnnouncementBanner from '../components/AnnouncementBanner';
import { APP_MODE } from './utils/subdomain';

// ===========================================
// Build-time app-mode gating for code-splitting
// ===========================================
// `VITE_APP_MODE` is a build-time env var (see package.json's build:main /
// build:artist / build:eaj scripts). Vite statically replaces
// `import.meta.env.VITE_APP_MODE` with a literal string before Rollup builds
// the module graph, so the ternaries below fold to `null` for the branches
// that don't apply — which lets Rollup's dead-code elimination drop the
// unreached `import()` calls (and therefore the target module's whole chunk)
// entirely from that build's output, instead of merely leaving them
// unreached-but-present at runtime.
//
// When VITE_APP_MODE is unset (plain `npm run dev` / `vite build`), every
// branch below evaluates to "needed", so all three apps stay lazy-loadable —
// preserving today's runtime hostname/?app= switching for local dev.
const BUILD_MODE = import.meta.env.VITE_APP_MODE as string | undefined;
const NEEDS_MAIN = BUILD_MODE === undefined || BUILD_MODE === 'main';
const NEEDS_ARTIST = NEEDS_MAIN || BUILD_MODE === 'artist';
const NEEDS_ADMIN = NEEDS_MAIN || BUILD_MODE === 'admin';

// Marketing-only pages — only needed by the "main" (eajmusic.com) build.
const Home = (NEEDS_MAIN ? lazy(() => import('../apps/marketing/Home')) : null) as any;
const AboutUs = (NEEDS_MAIN ? lazy(() => import('../apps/marketing/AboutUs')) : null) as any;
const Careers = (NEEDS_MAIN ? lazy(() => import('../apps/marketing/Careers')) : null) as any;
const PrivacyPolicy = (NEEDS_MAIN ? lazy(() => import('../apps/marketing/PrivacyPolicy')) : null) as any;
const TermsOfService = (NEEDS_MAIN ? lazy(() => import('../apps/marketing/TermsOfService')) : null) as any;
const MarketingSupport = (NEEDS_MAIN ? lazy(() => import('../apps/marketing/Support')) : null) as any;
const ShareTestimonial = (NEEDS_MAIN ? lazy(() => import('../apps/marketing/ShareTestimonial')) : null) as any;
const Talent = (NEEDS_MAIN ? lazy(() => import('../apps/marketing/Talent')) : null) as any;

// Shared auth pages — needed by all three apps (main, artist, admin).
const Login = lazy(() => import('../apps/auth/Login'));
const Register = lazy(() => import('../apps/auth/Register'));
const ForgotPassword = lazy(() => import('../apps/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../apps/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('../apps/auth/VerifyEmail'));
const AcceptInvite = lazy(() => import('../apps/auth/AcceptInvite'));

// Artist dashboard — needed by "main" (embeds /dashboard) and the "artist" build.
const ArtistDashboard = (NEEDS_ARTIST ? lazy(() => import('../apps/artist/Dashboard')) : null) as any;

// Admin dashboard — needed by "main" (embeds /admin) and the "admin"(eaj) build.
const AdminDashboard = (NEEDS_ADMIN ? lazy(() => import('../apps/admin/AdminDashboard')) : null) as any;

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
    <Route path="/verify-email" element={<VerifyEmail />} />
    <Route path="/accept-invite" element={<PublicOnlyRoute><AcceptInvite /></PublicOnlyRoute>} />
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
    <Route path="/verify-email" element={<VerifyEmail />} />
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
    <Route path="/share/:artistId" element={<ShareTestimonial />} />
    <Route path="/talent" element={<Talent />} />

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
    <Route path="/verify-email" element={<VerifyEmail />} />
    <Route path="/accept-invite" element={<PublicOnlyRoute><AcceptInvite /></PublicOnlyRoute>} />

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
      <ThemeProvider>
        <AuthProvider>
          <AnnouncementBanner />
          <Suspense fallback={<PageLoader />}>
            {APP_MODE === 'artist' && <ArtistAppRoutes />}
            {APP_MODE === 'admin' && <AdminAppRoutes />}
            {APP_MODE === 'main' && <MainAppRoutes />}
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default AppRouter;
