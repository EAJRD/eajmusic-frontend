import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Icons';

// Import the new admin components
import PayoutsImport from './PayoutsImport';
import ContentModeration from './ContentModeration';
import UserManagement from './UserManagement';

// ===========================================
// PLACEHOLDER COMPONENTS
// ===========================================
const PlansAndCommissions = () => (
  <div className="p-8 max-w-4xl mx-auto">
    <h1 className="text-2xl font-bold text-white mb-4">Plans & Commissions</h1>
    <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-6">
      <p className="text-slate-400">Subscription plan management will be available here.</p>
    </div>
  </div>
);

const Announcements = () => (
  <div className="p-8 max-w-4xl mx-auto">
    <h1 className="text-2xl font-bold text-white mb-4">Announcements</h1>
    <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-6">
      <p className="text-slate-400">Platform announcements management will be available here.</p>
    </div>
  </div>
);

const SupportTickets = () => (
  <div className="p-8 max-w-4xl mx-auto">
    <h1 className="text-2xl font-bold text-white mb-4">Support Tickets</h1>
    <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-6">
      <p className="text-slate-400">Support ticket management will be available here.</p>
    </div>
  </div>
);

const BrandSettings = () => (
  <div className="p-8 max-w-4xl mx-auto">
    <h1 className="text-2xl font-bold text-white mb-4">Brand Settings</h1>
    <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-6">
      <p className="text-slate-400">Whitelabel and branding settings will be available here.</p>
    </div>
  </div>
);

const AdminSettings = () => (
  <div className="p-8 max-w-4xl mx-auto">
    <h1 className="text-2xl font-bold text-white mb-4">Admin Settings</h1>
    <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-6">
      <p className="text-slate-400">System settings and configuration will be available here.</p>
    </div>
  </div>
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
const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'moderation' | 'users' | 'payouts' | 'plans' | 'announcements' | 'tickets' | 'brand' | 'settings'
  >('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'moderation':
        return <ContentModeration />;
      case 'users':
        return <UserManagement />;
      case 'payouts':
        return <PayoutsImport />;
      case 'plans':
        return <PlansAndCommissions />;
      case 'announcements':
        return <Announcements />;
      case 'tickets':
        return <SupportTickets />;
      case 'brand':
        return <BrandSettings />;
      case 'settings':
        return <AdminSettings />;
      case 'overview':
      default:
        return <AdminOverview />;
    }
  };

  const handleNavClick = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white flex flex-col lg:flex-row font-sans">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-dark-800 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Logo className="text-brand-500 w-8 h-8" />
          <span className="font-bold text-lg tracking-tight">Admin Portal</span>
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
            <span className="font-bold text-lg tracking-tight">Admin Portal</span>
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
          <p className="px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 mt-2">Main</p>
          <NavItem
            icon="dashboard"
            label="Overview"
            isActive={activeTab === 'overview'}
            onClick={() => handleNavClick('overview')}
          />
          <NavItem
            icon="fact_check"
            label="Content Moderation"
            isActive={activeTab === 'moderation'}
            onClick={() => handleNavClick('moderation')}
            badge="24"
          />
          <NavItem
            icon="people"
            label="Users & Artists"
            isActive={activeTab === 'users'}
            onClick={() => handleNavClick('users')}
          />
          <NavItem
            icon="payments"
            label="Payout Import"
            isActive={activeTab === 'payouts'}
            onClick={() => handleNavClick('payouts')}
          />

          <p className="px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 mt-6">Management</p>
          <NavItem
            icon="monetization_on"
            label="Plans & Pricing"
            isActive={activeTab === 'plans'}
            onClick={() => handleNavClick('plans')}
          />
          <NavItem
            icon="campaign"
            label="Announcements"
            isActive={activeTab === 'announcements'}
            onClick={() => handleNavClick('announcements')}
          />
          <NavItem
            icon="support_agent"
            label="Support Tickets"
            isActive={activeTab === 'tickets'}
            onClick={() => handleNavClick('tickets')}
            badge="12"
          />

          <p className="px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 mt-6">System</p>
          <NavItem
            icon="palette"
            label="Whitelabel / Brand"
            isActive={activeTab === 'brand'}
            onClick={() => handleNavClick('brand')}
          />
          <NavItem
            icon="settings"
            label="Settings"
            isActive={activeTab === 'settings'}
            onClick={() => handleNavClick('settings')}
          />
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-dark-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-xs">
              {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.name || 'Admin'}</p>
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

const AdminOverview = () => (
  <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
    <header>
      <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2">Dashboard Overview</h1>
      <p className="text-slate-500 dark:text-slate-400">Welcome back, Admin. Here's what's happening today.</p>
    </header>

    {/* Stats Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <StatCard label="Total Artists" value="1,240" change="+12.5%" icon="people" color="bg-blue-500" />
      <StatCard label="Active Releases" value="5,892" change="+3.2%" icon="library_music" color="bg-purple-500" />
      <StatCard label="Pending Approval" value="24" change="Urgent" icon="fact_check" color="bg-amber-500" />
      <StatCard label="Total Revenue" value="$42,500" change="+8.4%" icon="payments" color="bg-emerald-500" />
    </div>

    {/* Recent Activity Section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 shadow-sm"
      >
        <h3 className="text-lg font-bold mb-4">Recent Signups</h3>
        <div className="space-y-4">
          {[
            { name: 'Alex Rivera', time: '2h ago', avatar: 'https://picsum.photos/100/100?random=50' },
            { name: 'Sarah Chen', time: '4h ago', avatar: 'https://picsum.photos/100/100?random=51' },
            { name: 'Marcus J.', time: '6h ago', avatar: 'https://picsum.photos/100/100?random=52' },
            { name: 'Emma Wilson', time: '8h ago', avatar: 'https://picsum.photos/100/100?random=53' },
            { name: 'James Parker', time: '12h ago', avatar: 'https://picsum.photos/100/100?random=54' },
          ].map((user, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-dark-800 last:border-0">
              <div className="flex items-center gap-3">
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-slate-500">Joined {user.time}</p>
                </div>
              </div>
              <span className="px-2 py-1 rounded text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 font-bold">Verified</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 shadow-sm"
      >
        <h3 className="text-lg font-bold mb-4">Pending Releases</h3>
        <div className="space-y-4">
          {[
            { title: 'Neon Horizons', artist: 'Alex Rivera', cover: 'https://picsum.photos/100/100?random=60' },
            { title: 'Summer Vibes', artist: 'Sarah Chen', cover: 'https://picsum.photos/100/100?random=61' },
            { title: 'Urban Nights', artist: 'M.J. Beats', cover: 'https://picsum.photos/100/100?random=62' },
            { title: 'Acoustic Soul', artist: 'Emma Wilson', cover: 'https://picsum.photos/100/100?random=63' },
            { title: 'Electric Dreams', artist: 'James P.', cover: 'https://picsum.photos/100/100?random=64' },
          ].map((release, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-dark-800 last:border-0">
              <div className="flex items-center gap-3">
                <img src={release.cover} alt={release.title} className="w-8 h-8 rounded object-cover shadow-sm" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{release.title}</p>
                  <p className="text-xs text-slate-500">by {release.artist}</p>
                </div>
              </div>
              <button className="px-3 py-1 rounded text-xs bg-brand-600 text-white hover:bg-brand-500 transition-colors font-bold">Review</button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>

    {/* Quick Actions */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-r from-brand-600/10 to-purple-600/10 border border-brand-500/20 rounded-xl p-6"
    >
      <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
      <div className="flex flex-wrap gap-3">
        <button className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">add</span>
          New Announcement
        </button>
        <button className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">download</span>
          Export Reports
        </button>
        <button className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">settings</span>
          Platform Settings
        </button>
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
      <p className={`text-xs font-bold mt-1 ${change === 'Urgent' ? 'text-amber-500' : 'text-emerald-500'}`}>{change}</p>
    </div>
    <div className={`p-3 rounded-xl ${color} text-white shadow-lg`}>
      <span className="material-symbols-outlined text-xl">{icon}</span>
    </div>
  </motion.div>
);

export default AdminDashboard;
