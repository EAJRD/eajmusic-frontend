import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Icons';
import ThemeToggle from '../../components/ThemeToggle';

// Import the new artist components
import NewRelease from './NewRelease';
import TrackAnalytics from './TrackAnalytics';
import Wallet from './Wallet';

// ===========================================
// PLACEHOLDER COMPONENTS
// ===========================================
const Profile = () => (
  <div className="p-8 max-w-4xl mx-auto">
    <h1 className="text-2xl font-bold text-white mb-4">Profile</h1>
    <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-6">
      <p className="text-slate-400">Your artist profile and account settings will be available here.</p>
    </div>
  </div>
);

const Settings = () => (
  <div className="p-8 max-w-4xl mx-auto">
    <h1 className="text-2xl font-bold text-white mb-4">Settings</h1>
    <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-6">
      <p className="text-slate-400">Account and notification settings will be available here.</p>
    </div>
  </div>
);

const Support = () => (
  <div className="p-8 max-w-4xl mx-auto">
    <h1 className="text-2xl font-bold text-white mb-4">Support</h1>
    <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-6">
      <p className="text-slate-400">Submit and track support tickets here.</p>
    </div>
  </div>
);

// ===========================================
// SUCCESS MODAL
// ===========================================
const SubmissionSuccessModal = ({ onClose, onViewStatus }: { onClose: () => void; onViewStatus: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="bg-dark-900 border border-dark-700 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl"
    >
      <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="material-symbols-outlined text-5xl text-emerald-400">check_circle</span>
      </div>
      <h2 className="text-2xl font-black text-white mb-2">Release Submitted!</h2>
      <p className="text-slate-400 mb-6">
        Your release has been submitted for review. We'll notify you once it's approved.
      </p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={onViewStatus}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-colors"
        >
          View Status
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-dark-800 hover:bg-dark-700 text-white font-bold rounded-xl transition-colors"
        >
          Close
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ===========================================
// ANIMATION VARIANTS
// ===========================================
const pageVariants = {
  initial: { opacity: 0, y: 10 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -10 }
};

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.2
};

// ===========================================
// MAIN COMPONENT
// ===========================================
const ArtistDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'music' | 'analytics' | 'wallet' | 'upload' | 'profile' | 'settings' | 'support'>('overview');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSubmissionComplete = () => {
    setActiveTab('music');
    setShowSuccessModal(true);
  };

  const handleNavClick = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return <NewRelease onComplete={handleSubmissionComplete} onCancel={() => setActiveTab('overview')} />;
      case 'analytics':
        return <TrackAnalytics />;
      case 'music':
        return <MyMusic />;
      case 'wallet':
        return <Wallet />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      case 'support':
        return <Support />;
      case 'overview':
      default:
        return <ArtistOverview onUploadClick={() => setActiveTab('upload')} userName={user?.name || 'Artist'} />;
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
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

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
              onClick={() => handleNavClick('upload')}
              className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
            onClick={() => handleNavClick('overview')}
          />
          <NavItem
            icon="library_music"
            label="My Music"
            isActive={activeTab === 'music'}
            onClick={() => handleNavClick('music')}
          />
          <NavItem
            icon="bar_chart"
            label="Analytics"
            isActive={activeTab === 'analytics'}
            onClick={() => handleNavClick('analytics')}
          />
          <NavItem
            icon="account_balance_wallet"
            label="Wallet & Payouts"
            isActive={activeTab === 'wallet'}
            onClick={() => handleNavClick('wallet')}
          />

          <p className="px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 mt-6">Account</p>
          <NavItem
            icon="person"
            label="Profile"
            isActive={activeTab === 'profile'}
            onClick={() => handleNavClick('profile')}
          />
          <NavItem
            icon="settings"
            label="Settings"
            isActive={activeTab === 'settings'}
            onClick={() => handleNavClick('settings')}
          />
          <NavItem
            icon="help"
            label="Support"
            isActive={activeTab === 'support'}
            onClick={() => handleNavClick('support')}
          />
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-dark-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
              {user?.name?.substring(0, 2).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors" title="Logout">
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-0 min-h-[calc(100vh-64px)] lg:min-h-screen overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modal Overlay */}
      <AnimatePresence>
        {showSuccessModal && (
          <SubmissionSuccessModal
            onClose={() => setShowSuccessModal(false)}
            onViewStatus={() => { setShowSuccessModal(false); setActiveTab('music'); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ===========================================
// HELPER COMPONENTS
// ===========================================
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

const ArtistOverview = ({ onUploadClick, userName }: { onUploadClick: () => void; userName: string }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2">{getGreeting()}, {userName}</h1>
          <p className="text-slate-500 dark:text-slate-400">Here's how your music is performing today.</p>
        </div>
      </header>

      {/* Highlight Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-brand-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-32 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <p className="text-brand-100 text-xs font-bold uppercase tracking-wider mb-1">Total Balance</p>
          <h2 className="text-3xl md:text-4xl font-black mb-4">$3,240.50</h2>
          <button className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors backdrop-blur-sm">
            Withdraw Funds
          </button>
        </motion.div>

        <StatCard label="Total Streams" value="842.5k" change="+12.5%" icon="graphic_eq" color="bg-brand-500" />
        <StatCard label="Monthly Listeners" value="125.2k" change="+5.2%" icon="groups" color="bg-purple-500" />
      </div>

      {/* Recent Releases Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-bold">Your Releases</h3>
          <button className="text-brand-500 text-sm font-bold hover:underline">View All</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Release Card Mock */}
          <div className="group border border-slate-200 dark:border-dark-800 rounded-xl p-4 hover:border-brand-500 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-800 bg-cover bg-center shadow-md relative group-hover:shadow-lg transition-all" style={{ backgroundImage: "url('https://picsum.photos/200/200?random=1')" }}>
                <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-white">play_arrow</span>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">Neon Nights</h4>
                <p className="text-xs text-slate-500">Released Oct 15, 2023</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full">Live</span>
                  <span className="text-[10px] text-slate-400">124k streams</span>
                </div>
              </div>
            </div>
          </div>
          {/* Release Card Mock 2 */}
          <div className="group border border-slate-200 dark:border-dark-800 rounded-xl p-4 hover:border-brand-500 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-800 bg-cover bg-center shadow-md" style={{ backgroundImage: "url('https://picsum.photos/200/200?random=2')" }}></div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">Acoustic Soul</h4>
                <p className="text-xs text-slate-500">Scheduled Oct 22, 2023</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">Pending</span>
                </div>
              </div>
            </div>
          </div>
          {/* Upload CTA Card */}
          <div onClick={onUploadClick} className="border-2 border-dashed border-slate-200 dark:border-dark-800 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/5 transition-all group h-full min-h-[100px]">
            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full mb-2 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-brand-500">add</span>
            </div>
            <p className="text-sm font-bold text-slate-500 group-hover:text-brand-500">Distribute New Music</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-purple-600/10 to-brand-600/10 border border-purple-500/20 rounded-xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <span className="material-symbols-outlined text-purple-400">tips_and_updates</span>
          </div>
          <div>
            <h4 className="font-bold text-white mb-1">Pro Tip: Release on Friday</h4>
            <p className="text-sm text-slate-400">
              Streaming platforms update their editorial playlists on Friday. Schedule your releases for Friday to maximize visibility and playlist consideration.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const MyMusic = () => (
  <div className="p-4 md:p-8 max-w-7xl mx-auto">
    <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-8">My Music Catalog</h1>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 overflow-hidden shadow-sm"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-dark-800 text-xs font-bold text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-4">Release</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Streams</th>
              <th className="px-6 py-4">Revenue</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-dark-800">
            {[
              { title: 'Neon Nights', cover: 'https://picsum.photos/200/200?random=1', status: 'Live', date: 'Oct 15, 2023', streams: '124,500', revenue: '$450.25' },
              { title: 'Summer Vibes', cover: 'https://picsum.photos/200/200?random=2', status: 'Pending', date: 'Oct 22, 2023', streams: '—', revenue: '—' },
              { title: 'Midnight Drive', cover: 'https://picsum.photos/200/200?random=3', status: 'Live', date: 'Sep 30, 2023', streams: '89,200', revenue: '$312.80' },
            ].map((release, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={release.cover} className="w-10 h-10 rounded shadow-sm object-cover" alt="Cover" />
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{release.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    release.status === 'Live'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                  }`}>
                    {release.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{release.date}</td>
                <td className="px-6 py-4 text-sm font-mono text-slate-900 dark:text-white">{release.streams}</td>
                <td className="px-6 py-4 text-sm font-mono text-slate-900 dark:text-white">{release.revenue}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-brand-500">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  </div>
);

const StatCard = ({ label, value, change, icon, color }: { label: string, value: string, change: string, icon: string, color: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 shadow-sm flex items-center justify-between"
  >
    <div>
      <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs font-bold text-emerald-500 mt-1">{change}</p>
    </div>
    <div className={`p-3 rounded-xl ${color} text-white shadow-lg`}>
      <span className="material-symbols-outlined text-xl">{icon}</span>
    </div>
  </motion.div>
);

export default ArtistDashboard;
