import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../../components/Icons';

// Placeholder components (in production these would be in separate files)
const PlansAndCommissions = () => <div className="p-8"><h1 className="text-2xl font-bold">Plans & Commissions</h1><p className="text-slate-500">Coming soon...</p></div>;
const Announcements = () => <div className="p-8"><h1 className="text-2xl font-bold">Announcements</h1><p className="text-slate-500">Coming soon...</p></div>;
const SupportTickets = () => <div className="p-8"><h1 className="text-2xl font-bold">Support Tickets</h1><p className="text-slate-500">Coming soon...</p></div>;
const BrandSettings = () => <div className="p-8"><h1 className="text-2xl font-bold">Brand Settings</h1><p className="text-slate-500">Coming soon...</p></div>;
const ReleasesList = () => <div className="p-8"><h1 className="text-2xl font-bold">Releases</h1><p className="text-slate-500">Coming soon...</p></div>;
const UsersList = () => <div className="p-8"><h1 className="text-2xl font-bold">Users</h1><p className="text-slate-500">Coming soon...</p></div>;
const AdminSettings = () => <div className="p-8"><h1 className="text-2xl font-bold">Admin Settings</h1><p className="text-slate-500">Coming soon...</p></div>;

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'announcements' | 'tickets' | 'brand' | 'releases' | 'users' | 'settings'>('overview');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'plans':
        return <PlansAndCommissions />;
      case 'announcements':
        return <Announcements />;
      case 'tickets':
        return <SupportTickets />;
      case 'brand':
        return <BrandSettings />;
      case 'releases':
        return <ReleasesList />;
      case 'users':
        return <UsersList />;
      case 'settings':
        return <AdminSettings />;
      case 'overview':
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white flex font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white dark:bg-card-dark border-r border-slate-200 dark:border-dark-800 flex flex-col fixed h-full z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-dark-800">
          <Logo className="text-brand-500 w-8 h-8 mr-2" />
          <span className="font-bold text-lg tracking-tight">Admin Portal</span>
        </div>

        <div className="p-4 space-y-1 overflow-y-auto flex-1">
          <p className="px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 mt-2">Main</p>
          <NavItem
            icon="dashboard"
            label="Overview"
            isActive={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <NavItem
            icon="graphic_eq"
            label="Releases"
            isActive={activeTab === 'releases'}
            onClick={() => setActiveTab('releases')}
          />
          <NavItem
            icon="people"
            label="Users & Artists"
            isActive={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
          />

          <p className="px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 mt-6">Management</p>
          <NavItem
            icon="payments"
            label="Plans & Pricing"
            isActive={activeTab === 'plans'}
            onClick={() => setActiveTab('plans')}
          />
          <NavItem
            icon="campaign"
            label="Announcements"
            isActive={activeTab === 'announcements'}
            onClick={() => setActiveTab('announcements')}
          />
          <NavItem
            icon="support_agent"
            label="Support Tickets"
            isActive={activeTab === 'tickets'}
            onClick={() => setActiveTab('tickets')}
            badge="12"
          />

          <p className="px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 mt-6">System</p>
          <NavItem
            icon="palette"
            label="Whitelabel / Brand"
            isActive={activeTab === 'brand'}
            onClick={() => setActiveTab('brand')}
          />
          <NavItem
            icon="settings"
            label="Settings"
            isActive={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
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
      <main className="flex-1 ml-64 min-h-screen">
        {renderContent()}
      </main>
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

const AdminOverview = () => (
  <div className="p-8 max-w-7xl mx-auto space-y-8">
    <header>
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Dashboard Overview</h1>
      <p className="text-slate-500 dark:text-slate-400">Welcome back, Admin. Here's what's happening today.</p>
    </header>

    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard label="Total Artists" value="1,240" change="+12.5%" icon="people" color="bg-blue-500" />
      <StatCard label="Active Releases" value="5,892" change="+3.2%" icon="library_music" color="bg-purple-500" />
      <StatCard label="Pending Approval" value="24" change="Urgent" icon="fact_check" color="bg-amber-500" />
      <StatCard label="Total Revenue" value="$42,500" change="+8.4%" icon="payments" color="bg-emerald-500" />
    </div>

    {/* Recent Activity Section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Recent Signups</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-dark-800 last:border-0">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">New Artist {i}</p>
                  <p className="text-xs text-slate-500">Joined 2h ago</p>
                </div>
              </div>
              <span className="px-2 py-1 rounded text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">Verified</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Pending Releases</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-dark-800 last:border-0">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded bg-slate-200 dark:bg-slate-800"></div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Song Title {i}</p>
                  <p className="text-xs text-slate-500">by Artist Name</p>
                </div>
              </div>
              <button className="px-3 py-1 rounded text-xs bg-brand-600 text-white hover:bg-brand-500 transition-colors">Review</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const StatCard = ({ label, value, change, icon, color }: any) => (
  <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs font-bold text-emerald-500 mt-1">{change}</p>
    </div>
    <div className={`p-3 rounded-xl ${color} text-white shadow-lg shadow-${color.replace('bg-', '')}/30`}>
      <span className="material-symbols-outlined text-xl">{icon}</span>
    </div>
  </div>
);

export default AdminDashboard;