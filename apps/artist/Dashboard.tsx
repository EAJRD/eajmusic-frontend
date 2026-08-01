import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { ArtistService, AuthService, UploadService } from '../../src/services/api';
import { isLabel } from '../../src/utils/capabilities';
import { Logo } from '../../components/Icons';
import ThemeToggle from '../../components/ThemeToggle';
import NewRelease from './pages/NewRelease';
import TrackAnalytics from './pages/TrackAnalytics';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import ArtistSettings from './pages/ArtistSettings';
import LabelSettings from './pages/LabelSettings';
import Support from './pages/Support';
import Catalog from './pages/Catalog';
import ReleaseDetail from './pages/ReleaseDetail';
import PaymentMethods from './pages/PaymentMethods';
import SubmissionSuccessModal from './components/SubmissionSuccessModal';

const ArtistDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'music' | 'analytics' | 'wallet' | 'payment-methods' | 'upload' | 'profile' | 'settings' | 'support' | 'artists'>('overview');
  const [selectedReleaseId, setSelectedReleaseId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleSubmissionComplete = () => {
    setActiveTab('overview');
    setSelectedReleaseId(null);
    setShowSuccessModal(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return <NewRelease onComplete={handleSubmissionComplete} onCancel={() => setActiveTab('overview')} />;
      case 'analytics':
        return <TrackAnalytics />;
      case 'music':
        return selectedReleaseId ? (
          <ReleaseDetail releaseId={selectedReleaseId} onBack={() => setSelectedReleaseId(null)} />
        ) : (
          <Catalog onSelectRelease={setSelectedReleaseId} />
        );
      case 'wallet':
        return <Wallet />;
      case 'payment-methods':
        return <PaymentMethods />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return isLabel(user) ? <LabelSettings /> : <ArtistSettings />;
      case 'support':
        return <Support />;
      case 'artists':
        return <ManagedArtists />;
      case 'overview':
      default:
        return isLabel(user)
          ? <LabelOverview onUploadClick={() => setActiveTab('upload')} />
          : <ArtistOverview onUploadClick={() => setActiveTab('upload')} />;
    }
  };

  return (
    <div className="min-h-screen bg-sonic-bg text-sonic-text flex flex-col lg:flex-row font-sonic">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-sonic-card border-b border-sonic-border sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Logo className="text-sonic-primary w-8 h-8" />
          <span className="font-bold text-lg tracking-tight text-sonic-text">EAJMUSIC</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-sonic-text-dim hover:text-sonic-primary transition-colors"
        >
          <span className="material-symbols-outlined text-3xl">menu</span>
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sonic-card border-r border-sonic-border flex flex-col
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-sonic-border">
          <div className="flex items-center">
            <Logo className="text-sonic-primary w-8 h-8 mr-2" />
            <div className="leading-tight">
              <span className="block font-bold text-lg tracking-tight text-sonic-text">EAJMUSIC</span>
              <span className="hidden lg:block text-[10px] uppercase tracking-wider text-sonic-text-dim">{isLabel(user) ? 'Label Portal' : 'Artist Portal'}</span>
            </div>
          </div>
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-sonic-text-dim hover:text-sonic-text"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-4 space-y-1 overflow-y-auto flex-1">
          <div className="mb-6 px-2">
            <button
              onClick={() => { setActiveTab('upload'); setIsMobileMenuOpen(false); }}
              className="w-full bg-sonic-primary hover:bg-sonic-primary/90 text-sonic-primary-ink font-bold py-3 rounded flex items-center justify-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined">add_circle</span>
              New Release
            </button>
          </div>

          <p className="px-4 text-xs font-bold text-sonic-text-dim uppercase tracking-wider mb-2 mt-2">Menu</p>
          <NavItem
            icon="dashboard"
            label="Overview"
            isActive={activeTab === 'overview'}
            onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }}
          />
          <NavItem
            icon="library_music"
            label="My Music"
            isActive={activeTab === 'music'}
            onClick={() => { setActiveTab('music'); setSelectedReleaseId(null); setIsMobileMenuOpen(false); }}
          />
          {isLabel(user) && (
            <NavItem
              icon="groups"
              label="Managed Artists"
              isActive={activeTab === 'artists'}
              onClick={() => { setActiveTab('artists'); setIsMobileMenuOpen(false); }}
            />
          )}
          <NavItem
            icon="bar_chart"
            label="Analytics"
            isActive={activeTab === 'analytics'}
            onClick={() => { setActiveTab('analytics'); setIsMobileMenuOpen(false); }}
          />
          <NavItem
            icon="account_balance_wallet"
            label="Wallet & Payouts"
            isActive={activeTab === 'wallet'}
            onClick={() => { setActiveTab('wallet'); setIsMobileMenuOpen(false); }}
          />
          <NavItem
            icon="credit_card"
            label="Payment Methods"
            isActive={activeTab === 'payment-methods'}
            onClick={() => { setActiveTab('payment-methods'); setIsMobileMenuOpen(false); }}
          />

          <p className="px-4 text-xs font-bold text-sonic-text-dim uppercase tracking-wider mb-2 mt-6">Account</p>
          <NavItem
            icon="person"
            label="Profile"
            isActive={activeTab === 'profile'}
            onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }}
          />
          <NavItem
            icon="settings"
            label="Settings"
            isActive={activeTab === 'settings'}
            onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
          />
          <NavItem
            icon="help"
            label="Support"
            isActive={activeTab === 'support'}
            onClick={() => { setActiveTab('support'); setIsMobileMenuOpen(false); }}
          />
        </div>

        <div className="p-4 border-t border-sonic-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sonic-primary flex items-center justify-center text-sonic-primary-ink font-bold text-xs">
              {(user?.name || 'Artist').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate text-sonic-text">{user?.name || 'Artist'}</p>
              <p className="text-xs text-sonic-text-dim truncate">{user?.email || ''}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="text-sonic-text-dim hover:text-sonic-text transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-0 min-h-[calc(100vh-64px)] lg:min-h-screen">
        <VerifyEmailBanner />
        {renderContent()}
      </main>

      {!isLabel(user) && <OnboardingWizard />}

      {/* Modal Overlay */}
      {showSuccessModal && (
        <SubmissionSuccessModal
          onClose={() => setShowSuccessModal(false)}
          onViewStatus={() => { setShowSuccessModal(false); setActiveTab('music'); }}
        />
      )}
    </div>
  );
};

// Helper Components
const NavItem = ({ icon, label, isActive, onClick, badge }: { icon: string, label: string, isActive: boolean, onClick: () => void, badge?: string }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 pl-3 pr-4 py-2.5 rounded text-sm font-medium transition-colors border-l-2 ${isActive
      ? 'border-sonic-primary bg-sonic-elevated text-sonic-primary'
      : 'border-transparent text-sonic-text-dim hover:bg-sonic-elevated hover:text-sonic-text'
      }`}
  >
    <span className={`material-symbols-outlined text-[20px] ${isActive ? 'filled' : ''}`}>{icon}</span>
    <span>{label}</span>
    {badge && (
      <span className="ml-auto bg-sonic-elevated text-sonic-error border border-sonic-error/40 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>
    )}
  </button>
);

interface OverviewStats {
  totalStreams: number;
  totalRevenue: number;
  availableBalance: number;
  pendingBalance: number;
  monthlyListeners: number;
  followers: number;
}

interface OverviewRelease {
  id: string;
  title: string;
  status: string;
  releaseDate: string;
  createdAt: string;
  coverArtUrl?: string | null;
}

const formatCompactNumber = (n: number): string => {
  if (!Number.isFinite(n)) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(Math.round(n));
};

const formatCurrency = (n: number): string =>
  `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const RELEASE_STATUS_STYLES: Record<string, string> = {
  LIVE: 'bg-sonic-primary/10 text-sonic-primary border border-sonic-primary/30',
  PENDING: 'bg-sonic-elevated text-sonic-text-dim border border-sonic-border',
  APPROVED: 'bg-sonic-primary/5 text-sonic-primary/80 border border-sonic-primary/20',
  DRAFT: 'bg-sonic-elevated text-sonic-text-dim border border-sonic-border',
  REJECTED: 'bg-sonic-error/10 text-sonic-error border border-sonic-error/30',
  TAKEDOWN: 'bg-sonic-error/10 text-sonic-error border border-sonic-error/30',
};

const ArtistOverview = ({ onUploadClick }: { onUploadClick: () => void }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [releases, setReleases] = useState<OverviewRelease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [statsRes, releasesRes] = await Promise.all([
          ArtistService.getStats(),
          ArtistService.getReleases({ limit: 3 }),
        ]);
        if (cancelled) return;
        setStats(statsRes);
        setReleases(releasesRes?.data || []);
      } catch {
        // Network/backend unavailable — the zero-state below still renders cleanly.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-sonic-text mb-2">Good Morning, {firstName}</h1>
          <p className="text-sonic-text-dim">Here's how your music is performing today.</p>
        </div>
      </header>

      {/* Highlight Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-sonic-card rounded-lg border border-sonic-border p-6 relative overflow-hidden">
          <p className="text-sonic-text-dim text-xs font-bold uppercase tracking-wider mb-1">Available Balance</p>
          <h2 className="text-4xl font-black mb-4 text-sonic-primary font-mono">{loading ? '—' : formatCurrency(stats?.availableBalance || 0)}</h2>
          <button className="bg-sonic-elevated hover:bg-sonic-primary text-sonic-text hover:text-sonic-primary-ink text-xs font-bold px-4 py-2 rounded transition-colors">Withdraw Funds</button>
        </div>

        <StatCard
          label="Total Streams"
          value={loading ? '—' : formatCompactNumber(stats?.totalStreams || 0)}
          icon="graphic_eq"
          color="text-sonic-primary"
        />
        <StatCard
          label="Monthly Listeners"
          value={loading ? '—' : formatCompactNumber(stats?.monthlyListeners || 0)}
          icon="groups"
          color="text-sonic-text"
        />
      </div>

      {/* Recent Releases Section */}
      <div className="bg-sonic-card rounded-lg border border-sonic-border p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-sonic-text">Your Releases</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!loading && releases.map((release) => (
            <div key={release.id} className="group border border-sonic-border rounded-lg p-4 hover:border-sonic-primary transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div
                  className="size-16 rounded bg-sonic-elevated bg-cover bg-center relative"
                  style={release.coverArtUrl ? { backgroundImage: `url('${release.coverArtUrl}')` } : undefined}
                >
                  {!release.coverArtUrl && (
                    <div className="absolute inset-0 flex items-center justify-center text-sonic-text-dim">
                      <span className="material-symbols-outlined">album</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sonic-text group-hover:text-sonic-primary transition-colors truncate">{release.title}</h4>
                  <p className="text-xs text-sonic-text-dim">
                    {release.status === 'LIVE' ? 'Released' : 'Scheduled'} {new Date(release.releaseDate || release.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${RELEASE_STATUS_STYLES[release.status] || RELEASE_STATUS_STYLES.DRAFT}`}>
                      {release.status.charAt(0) + release.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!loading && releases.length === 0 && (
            <div className="col-span-full text-center py-6 text-sonic-text-dim text-sm">
              You haven't released any music yet.
            </div>
          )}
          {/* Upload CTA Card */}
          <div onClick={onUploadClick} className="border-2 border-dashed border-sonic-border rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-sonic-primary hover:bg-sonic-primary/5 transition-all group h-full min-h-[100px]">
            <div className="bg-sonic-elevated p-2 rounded-full mb-2 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-sonic-text-dim group-hover:text-sonic-primary">add</span>
            </div>
            <p className="text-sm font-bold text-sonic-text-dim group-hover:text-sonic-primary">Distribute New Music</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// A LABEL account doesn't earn streams/royalties itself (money flows to each
// managed artist's own Wallet - see prisma/schema.prisma) so the balance/
// streams cards from ArtistOverview would just show misleading zeros here.
// This shows what actually matters to a label instead: how many artists it
// manages and the aggregate release activity across all of them (GET
// /artist/releases now returns that aggregate for role=LABEL).
const LabelOverview = ({ onUploadClick }: { onUploadClick: () => void }) => {
  const { user } = useAuth();
  const [labelName, setLabelName] = useState('');
  const [artistCount, setArtistCount] = useState(0);
  const [releases, setReleases] = useState<OverviewRelease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [labelRes, releasesRes] = await Promise.all([
          ArtistService.getLabel(),
          ArtistService.getReleases({ limit: 6 }),
        ]);
        if (cancelled) return;
        setLabelName(labelRes?.ownedLabel?.name || '');
        setArtistCount(labelRes?.managedArtists?.length || 0);
        setReleases(releasesRes?.data || []);
      } catch {
        // Zero-state below still renders cleanly.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-sonic-text mb-2">{labelName || user?.name || 'Your Label'}</h1>
          <p className="text-sonic-text-dim">Here's what's happening across your roster today.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard label="Managed Artists" value={loading ? '—' : artistCount} icon="groups" color="text-sonic-primary" />
        <StatCard label="Releases (all artists)" value={loading ? '—' : releases.length} icon="library_music" color="text-sonic-text" />
      </div>

      <div className="bg-sonic-card rounded-lg border border-sonic-border p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-sonic-text">Recent Releases</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!loading && releases.map((release) => (
            <div key={release.id} className="group border border-sonic-border rounded-lg p-4 hover:border-sonic-primary transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div
                  className="size-16 rounded bg-sonic-elevated bg-cover bg-center relative"
                  style={release.coverArtUrl ? { backgroundImage: `url('${release.coverArtUrl}')` } : undefined}
                >
                  {!release.coverArtUrl && (
                    <div className="absolute inset-0 flex items-center justify-center text-sonic-text-dim">
                      <span className="material-symbols-outlined">album</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sonic-text group-hover:text-sonic-primary transition-colors truncate">{release.title}</h4>
                  <p className="text-xs text-sonic-text-dim truncate">{(release as any).artistName || ''}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${RELEASE_STATUS_STYLES[release.status] || RELEASE_STATUS_STYLES.DRAFT}`}>
                      {release.status.charAt(0) + release.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!loading && releases.length === 0 && (
            <div className="col-span-full text-center py-6 text-sonic-text-dim text-sm">
              No releases from your artists yet.
            </div>
          )}
          <div onClick={onUploadClick} className="border-2 border-dashed border-sonic-border rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-sonic-primary hover:bg-sonic-primary/5 transition-all group h-full min-h-[100px]">
            <div className="bg-sonic-elevated p-2 rounded-full mb-2 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-sonic-text-dim group-hover:text-sonic-primary">add</span>
            </div>
            <p className="text-sm font-bold text-sonic-text-dim group-hover:text-sonic-primary">Distribute New Music</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, change, icon, color }: any) => (
  <div className="bg-sonic-card rounded-lg border border-sonic-border p-6 flex items-center justify-between">
    <div>
      <p className="text-sonic-text-dim text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-black text-sonic-text font-mono">{value}</p>
      {change && <p className="text-xs font-bold text-sonic-primary mt-1">{change}</p>}
    </div>
    <div className={`p-3 rounded-lg bg-sonic-elevated ${color || 'text-sonic-primary'}`}>
      <span className="material-symbols-outlined text-xl">{icon}</span>
    </div>
  </div>
);

const VerifyEmailBanner = () => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!user || user.emailVerified || dismissed) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await AuthService.resendVerification();
      setSent(true);
    } catch {
      // Non-fatal - banner just stays put so they can try again.
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm font-medium bg-amber-500 text-slate-900">
      <div className="flex items-center gap-2 min-w-0">
        <span className="material-symbols-outlined text-[18px] shrink-0">mail</span>
        <span className="truncate">
          {sent ? 'Verification email sent — check your inbox.' : 'Please verify your email address.'}
          {!sent && (
            <button onClick={handleResend} disabled={sending} className="ml-2 underline font-bold disabled:opacity-50">
              {sending ? 'Sending...' : 'Resend email'}
            </button>
          )}
        </span>
      </div>
      <button onClick={() => setDismissed(true)} className="shrink-0 opacity-80 hover:opacity-100 transition-opacity" aria-label="Dismiss">
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
};

// Mandatory, non-dismissible: shown once, right after account creation,
// blocking distribution until the artist provides an artistic name,
// birthdate, an official ID document, and picks a plan. Gated on the
// backend's own `onboardingCompletedAt` (not a localStorage flag that a
// cleared browser could bypass) - POST /artist/onboarding + POST
// /upload/id-document are what actually unblock POST /artist/releases.
const PLAN_OPTIONS: { value: 'FREE' | 'PRO' | 'LABEL_PLUS'; label: string; desc: string }[] = [
  { value: 'FREE', label: 'Free', desc: 'Lanzamientos con 45 días de anticipación. Sello fijo EAJMUSIC.' },
  { value: 'PRO', label: 'Pro', desc: 'Lanzamientos con 21 días de anticipación. Gestión completa de Sellos.' },
  { value: 'LABEL_PLUS', label: 'Label+', desc: 'Todo lo de Pro, además de gestionar varios artistas bajo tu sello.' },
];

const OnboardingWizard = () => {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [artistName, setArtistName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [plan, setPlan] = useState<'FREE' | 'PRO' | 'LABEL_PLUS'>('FREE');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!user || user.role !== 'ARTIST' || user.onboardingCompletedAt) return null;

  const maxDob = new Date();
  maxDob.setFullYear(maxDob.getFullYear() - 13);
  const maxDobStr = maxDob.toISOString().split('T')[0];

  const goNext = () => {
    setError('');
    if (step === 1) {
      if (!artistName.trim()) return setError('Ingresa tu nombre artístico.');
      if (!dateOfBirth) return setError('Ingresa tu fecha de nacimiento.');
      if (dateOfBirth > maxDobStr) return setError('Debes tener al menos 13 años.');
    }
    if (step === 2 && !idDocument) return setError('Sube un documento de identificación oficial.');
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!idDocument) return setError('Sube un documento de identificación oficial.');
    setSaving(true);
    setError('');
    try {
      const uploaded = await UploadService.uploadIdDocument(idDocument);
      await ArtistService.completeOnboarding({
        artistName: artistName.trim(),
        dateOfBirth,
        idDocumentUrl: uploaded.url,
        idDocumentKey: uploaded.key,
        plan,
      });
      await refreshUser();
    } catch (err: any) {
      setError(err.message || 'No pudimos completar el onboarding. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-sonic-card border border-sonic-border rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-6">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className={`h-1.5 flex-1 rounded-full ${step >= n ? 'bg-sonic-primary' : 'bg-sonic-border'}`} />
          ))}
        </div>

        {error && (
          <div className="bg-sonic-error/10 border border-sonic-error/30 text-sonic-error px-3 py-2 rounded text-xs font-medium">{error}</div>
        )}

        {step === 1 && (
          <>
            <div>
              <h2 className="text-xl font-black text-sonic-text mb-1">Bienvenido a EAJMUSIC</h2>
              <p className="text-sm text-sonic-text-dim">Completa tu registro inicial antes de distribuir tu música.</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-sonic-text-dim uppercase mb-1 block">Nombre Artístico</label>
                <input
                  type="text"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="Cómo te conoce tu audiencia"
                  className="w-full bg-sonic-elevated border border-sonic-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-sonic-primary text-sonic-text"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-sonic-text-dim uppercase mb-1 block">Fecha de Nacimiento</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  max={maxDobStr}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full bg-sonic-elevated border border-sonic-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-sonic-primary text-sonic-text"
                />
              </div>
            </div>
            <button onClick={goNext} className="w-full px-5 py-2.5 rounded text-sm font-bold bg-sonic-primary text-sonic-primary-ink hover:bg-sonic-primary/90">
              Continuar
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <h2 className="text-xl font-black text-sonic-text mb-1">Verificación de Identidad</h2>
              <p className="text-sm text-sonic-text-dim">Sube una identificación oficial (JPG, PNG o PDF). Solo la usamos para verificar tu identidad como distribuidor.</p>
            </div>
            <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-sonic-border rounded-lg p-6 cursor-pointer hover:border-sonic-primary transition-colors">
              <span className="material-symbols-outlined text-2xl text-sonic-text-dim">badge</span>
              <span className="text-xs font-bold text-sonic-text-dim text-center">{idDocument ? idDocument.name : 'Buscar archivo'}</span>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={(e) => setIdDocument(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
            <div className="flex justify-between items-center">
              <button onClick={() => setStep(1)} className="text-sm font-bold text-sonic-text-dim hover:text-sonic-text">Atrás</button>
              <button onClick={goNext} className="px-5 py-2 rounded text-sm font-bold bg-sonic-primary text-sonic-primary-ink hover:bg-sonic-primary/90">
                Continuar
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <h2 className="text-xl font-black text-sonic-text mb-1">Elige tu Plan</h2>
              <p className="text-sm text-sonic-text-dim">Puedes empezar en Free y subir de plan cuando quieras desde Settings.</p>
            </div>
            <div className="space-y-2">
              {PLAN_OPTIONS.map((p) => (
                <label key={p.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${plan === p.value ? 'border-sonic-primary bg-sonic-primary/5' : 'border-sonic-border'}`}>
                  <input type="radio" name="plan" checked={plan === p.value} onChange={() => setPlan(p.value)} className="mt-1" />
                  <div>
                    <p className="text-sm font-bold text-sonic-text">{p.label}</p>
                    <p className="text-xs text-sonic-text-dim">{p.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <button onClick={() => setStep(2)} disabled={saving} className="text-sm font-bold text-sonic-text-dim hover:text-sonic-text disabled:opacity-50">Atrás</button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-5 py-2 rounded text-sm font-bold bg-sonic-primary text-sonic-primary-ink hover:bg-sonic-primary/90 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Empezar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ManagedArtists = () => {
  const [artists, setArtists] = useState<{ id: string; name: string; email: string; avatarUrl: string | null }[]>([]);
  const [labelName, setLabelName] = useState('');
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'create' | 'claim' | null>(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const loadArtists = async () => {
    try {
      const res = await ArtistService.getLabel();
      setArtists(res?.managedArtists || []);
      setLabelName(res?.ownedLabel?.name || '');
    } catch {
      // Non-fatal - just shows an empty list.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadArtists(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback('');
    try {
      if (mode === 'create') {
        await ArtistService.inviteLabelArtist({ name: form.name, email: form.email });
        setFeedback(`Invitación enviada a ${form.email}. Aparecerá en tu lista una vez que la acepte.`);
        setForm({ name: '', email: '' });
        setMode(null);
      } else {
        // Prevalidate first so a rejection never looks like a false
        // "success" - the claim POST enforces the same rule server-side
        // regardless, this just gives a real reason before attempting it.
        const check = await ArtistService.checkArtistClaimEligibility(form.email);
        if (!check?.eligible) {
          setFeedback(check?.message || 'Este artista no se puede reclamar.');
          return;
        }
        await ArtistService.claimLabelArtist(form.email);
        setFeedback(`${form.email} ahora está bajo tu Sello.`);
        setForm({ name: '', email: '' });
        setMode(null);
      }
      loadArtists();
    } catch (err: any) {
      setFeedback(err.message || 'No se pudo completar la acción.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-sonic-text mb-1">Managed Artists</h1>
          <p className="text-sonic-text-dim">{labelName ? `Artists distributing under ${labelName}.` : 'Artists under your label.'}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setMode('claim'); setFeedback(''); }} className="px-4 py-2 rounded text-sm font-bold border border-sonic-border text-sonic-text hover:border-sonic-primary hover:text-sonic-primary transition-colors">
            Reclamar Artista
          </button>
          <button onClick={() => { setMode('create'); setFeedback(''); }} className="px-4 py-2 rounded text-sm font-bold bg-sonic-primary text-sonic-primary-ink hover:brightness-95 transition-all">
            + Crear Artista
          </button>
        </div>
      </header>

      {feedback && (
        <div className="bg-sonic-primary/10 border border-sonic-primary/30 text-sonic-text px-4 py-3 rounded text-sm">{feedback}</div>
      )}

      {mode && (
        <form onSubmit={handleSubmit} className="bg-sonic-card rounded-lg border border-sonic-border p-6 space-y-4">
          <h3 className="font-bold text-sonic-text">
            {mode === 'create' ? 'Crear un nuevo artista bajo tu Sello' : 'Reclamar un artista existente'}
          </h3>
          {mode === 'create' && (
            <input
              type="text"
              required
              placeholder="Nombre artístico"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full bg-sonic-elevated border border-sonic-border rounded px-4 py-2.5 text-sm text-sonic-text focus:outline-none focus:border-sonic-primary"
            />
          )}
          <input
            type="email"
            required
            placeholder={mode === 'create' ? 'Correo del artista' : 'Correo del artista a reclamar'}
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full bg-sonic-elevated border border-sonic-border rounded px-4 py-2.5 text-sm text-sonic-text focus:outline-none focus:border-sonic-primary"
          />
          {mode === 'claim' && (
            <p className="text-xs text-sonic-text-dim">Solo puedes reclamar artistas que aún están en el sello EAJMUSIC por defecto (no gestionados por otro Sello).</p>
          )}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setMode(null)} className="text-sm font-bold text-sonic-text-dim hover:text-sonic-text">Cancelar</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 rounded text-sm font-bold bg-sonic-primary text-sonic-primary-ink hover:brightness-95 disabled:opacity-50">
              {submitting ? 'Enviando...' : mode === 'create' ? 'Crear Artista' : 'Reclamar Artista'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-sonic-card rounded-lg border border-sonic-border divide-y divide-sonic-border">
        {loading && <div className="p-8 text-center text-sonic-text-dim">Loading...</div>}
        {!loading && artists.length === 0 && (
          <div className="p-8 text-center text-sonic-text-dim">No artists are under your label yet.</div>
        )}
        {!loading && artists.map((a) => (
          <div key={a.id} className="flex items-center gap-4 p-4">
            <div
              className="size-10 rounded-full bg-sonic-elevated bg-cover bg-center shrink-0"
              style={a.avatarUrl ? { backgroundImage: `url('${a.avatarUrl}')` } : undefined}
            />
            <div className="min-w-0">
              <p className="font-bold text-sonic-text truncate">{a.name}</p>
              <p className="text-xs text-sonic-text-dim truncate">{a.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtistDashboard;