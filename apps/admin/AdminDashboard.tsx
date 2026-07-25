import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/contexts/AuthContext';
import { Logo } from '../../components/Icons';
import AdminOverview from './pages/AdminOverview';
import PlansAndCommissions from './pages/PlansAndCommissions';
import Announcements from './pages/Announcements';
import SupportTickets from './pages/SupportTickets';
import BrandSettings from './pages/BrandSettings';
import ReleasesList from './pages/ReleasesList';
import UsersList from './pages/UsersList';
import AdminSettings from './pages/AdminSettings';
import FinanceHub from './pages/FinanceHub';
import AuditLog from './pages/AuditLog';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'announcements' | 'tickets' | 'brand' | 'releases' | 'users' | 'settings' | 'finance' | 'audit'>('overview');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
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
      case 'finance':
        return <FinanceHub />;
      case 'audit':
        return <AuditLog />;
      case 'overview':
      default:
        return <AdminOverview onNavigate={setActiveTab} />;
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
            icon="account_balance"
            label="Finance Hub"
            isActive={activeTab === 'finance'}
            onClick={() => setActiveTab('finance')}
          />
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
            icon="history"
            label="Audit Log"
            isActive={activeTab === 'audit'}
            onClick={() => setActiveTab('audit')}
          />
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
              {(user?.name || 'Admin').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.name || 'Admin'}</p>
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
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${isActive
        ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800 hover:text-slate-900 dark:hover:text-white'
      }`}
  >
    <span className={`material-symbols-outlined text-[20px] ${isActive ? 'filled' : ''}`}>{icon}</span>
    <span>{label}</span>
    {badge && (
      <span className="ml-auto bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 text-[10px] font-black px-1.5 py-0.5 rounded-full">{badge}</span>
    )}
  </button>
);

export default AdminDashboard;