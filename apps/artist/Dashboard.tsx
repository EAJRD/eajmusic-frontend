import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/contexts/AuthContext';
import { ArtistService } from '../../src/services/api';
import { Logo } from '../../components/Icons';
import ThemeToggle from '../../components/ThemeToggle';
import ConnectionStatusBadge from '../../components/ConnectionStatusBadge';
import NewRelease from './pages/NewRelease';
import TrackAnalytics from './pages/TrackAnalytics';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Support from './pages/Support';
import Catalog from './pages/Catalog';
import PaymentMethods from './pages/PaymentMethods';
import SubmissionSuccessModal from './components/SubmissionSuccessModal';

const ArtistDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'music' | 'analytics' | 'wallet' | 'payment-methods' | 'upload' | 'profile' | 'settings' | 'support'>('overview');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Mock function to simulate a submission completion
  const handleSubmissionComplete = () => {
    setActiveTab('music');
    setShowSuccessModal(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return <NewRelease onComplete={handleSubmissionComplete} onCancel={() => setActiveTab('overview')} />;
      case 'analytics':
        return <TrackAnalytics />;
      case 'music':
        return <Catalog />;
      case 'wallet':
        return <Wallet />;
      case 'payment-methods':
        return <PaymentMethods />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      case 'support':
        return <Support />;
      case 'overview':
      default:
        return <ArtistOverview onUploadClick={() => setActiveTab('upload')} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white flex flex-col lg:flex-row font-sans">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-dark-800 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Logo className="text-brand-500 w-8 h-8" />
          <span className="font-bold text-lg tracking-tight">Artist Portal</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-slate-500 hover:text-brand-500 transition-colors"
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
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-card-dark border-r border-slate-200 dark:border-dark-800 flex flex-col 
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-dark-800">
          <div className="flex items-center">
            <Logo className="text-brand-500 w-8 h-8 mr-2" />
            <span className="font-bold text-lg tracking-tight">Artist Portal</span>
          </div>
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-4 space-y-1 overflow-y-auto flex-1">
          <div className="mb-6 px-2">
            <button
              onClick={() => { setActiveTab('upload'); setIsMobileMenuOpen(false); }}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="material-symbols-outlined">add_circle</span>
              New Release
            </button>
          </div>

          <p className="px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 mt-2">Menu</p>
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
            onClick={() => { setActiveTab('music'); setIsMobileMenuOpen(false); }}
          />
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

          <p className="px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 mt-6">Account</p>
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

        <div className="p-4 border-t border-slate-200 dark:border-dark-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
              {(user?.name || 'Artist').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.name || 'Artist'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="text-slate-400 hover:text-white"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-0 min-h-[calc(100vh-64px)] lg:min-h-screen">
        {renderContent()}
      </main>

      {/* Modal Overlay */}
      {showSuccessModal && (
        <SubmissionSuccessModal
          onClose={() => setShowSuccessModal(false)}
          onViewStatus={() => { setShowSuccessModal(false); setActiveTab('music'); }}
        />
      )}

      {/* Connection Status Indicator */}
      <ConnectionStatusBadge position="bottom-right" showText={true} />
    </div>
  );
};

// Helper Components
const NavItem = ({ icon, label, isActive, onClick, badge }: { icon: string, label: string, isActive: boolean, onClick: () => void, badge?: string }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800 hover:text-slate-900 dark:hover:text-white'
      }`}
  >
    <span className={`material-symbols-outlined text-[20px] ${isActive ? 'filled' : ''}`}>{icon}</span>
    <span>{label}</span>
    {badge && (
      <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>
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
  LIVE: 'bg-emerald-500/10 text-emerald-500',
  PENDING: 'bg-amber-500/10 text-amber-500',
  APPROVED: 'bg-sky-500/10 text-sky-500',
  DRAFT: 'bg-slate-500/10 text-slate-400',
  REJECTED: 'bg-rose-500/10 text-rose-500',
  TAKEDOWN: 'bg-rose-500/10 text-rose-500',
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
        setReleases(releasesRes?.releases || []);
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
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Good Morning, {firstName}</h1>
          <p className="text-slate-500 dark:text-slate-400">Here's how your music is performing today.</p>
        </div>
      </header>

      {/* Highlight Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-brand-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <p className="text-brand-100 text-xs font-bold uppercase tracking-wider mb-1">Available Balance</p>
          <h2 className="text-4xl font-black mb-4">{loading ? '—' : formatCurrency(stats?.availableBalance || 0)}</h2>
          <button className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors backdrop-blur-sm">Withdraw Funds</button>
        </div>

        <StatCard
          label="Total Streams"
          value={loading ? '—' : formatCompactNumber(stats?.totalStreams || 0)}
          icon="graphic_eq"
          color="bg-brand-500"
        />
        <StatCard
          label="Monthly Listeners"
          value={loading ? '—' : formatCompactNumber(stats?.monthlyListeners || 0)}
          icon="groups"
          color="bg-purple-500"
        />
      </div>

      {/* Recent Releases Section */}
      <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">Your Releases</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!loading && releases.map((release) => (
            <div key={release.id} className="group border border-slate-200 dark:border-dark-800 rounded-xl p-4 hover:border-brand-500 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div
                  className="size-16 rounded-lg bg-slate-200 dark:bg-slate-800 bg-cover bg-center shadow-md relative group-hover:shadow-lg transition-all"
                  style={release.coverArtUrl ? { backgroundImage: `url('${release.coverArtUrl}')` } : undefined}
                >
                  {!release.coverArtUrl && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined">album</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors truncate">{release.title}</h4>
                  <p className="text-xs text-slate-500">
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
            <div className="col-span-full text-center py-6 text-slate-400 text-sm">
              You haven't released any music yet.
            </div>
          )}
          {/* Upload CTA Card */}
          <div onClick={onUploadClick} className="border-2 border-dashed border-slate-200 dark:border-dark-800 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/5 transition-all group h-full min-h-[100px]">
            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full mb-2 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-brand-500">add</span>
            </div>
            <p className="text-sm font-bold text-slate-500 group-hover:text-brand-500">Distribute New Music</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, change, icon, color }: any) => (
  <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      {change && <p className="text-xs font-bold text-emerald-500 mt-1">{change}</p>}
    </div>
    <div className={`p-3 rounded-xl ${color} text-white shadow-lg shadow-${color.replace('bg-', '')}/30`}>
      <span className="material-symbols-outlined text-xl">{icon}</span>
    </div>
  </div>
);

export default ArtistDashboard;