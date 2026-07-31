import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/contexts/AuthContext';
import { Logo } from '../../components/Icons';
import ConnectionStatusBadge from '../../components/ConnectionStatusBadge';
import AdminOverview from './pages/AdminOverview';
import PlansAndCommissions from './pages/PlansAndCommissions';
import Announcements from './pages/Announcements';
import SupportTickets from './pages/SupportTickets';
import BrandSettings from './pages/BrandSettings';
import ReleasesList from './pages/ReleasesList';
import UsersList from './pages/UsersList';
import AdminSettings from './pages/AdminSettings';
import FinanceHub from './pages/FinanceHub';
import Team from './pages/Team';
import TestimonialModeration from './pages/TestimonialModeration';

export type AdminTab = 'overview' | 'plans' | 'announcements' | 'tickets' | 'brand' | 'releases' | 'users' | 'settings' | 'finance' | 'team' | 'testimonials';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const selectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
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
      case 'team':
        return <Team />;
      case 'testimonials':
        return <TestimonialModeration />;
      case 'overview':
      default:
        return <AdminOverview onNavigate={selectTab} />;
    }
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
            onClick={() => selectTab('overview')}
          />
          <NavItem
            icon="graphic_eq"
            label="Releases"
            isActive={activeTab === 'releases'}
            onClick={() => selectTab('releases')}
          />
          <NavItem
            icon="people"
            label="Users & Artists"
            isActive={activeTab === 'users'}
            onClick={() => selectTab('users')}
          />

          <p className="px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 mt-6">Management</p>
          <NavItem
            icon="account_balance"
            label="Finance Hub"
            isActive={activeTab === 'finance'}
            onClick={() => selectTab('finance')}
          />
          <NavItem
            icon="payments"
            label="Plans & Pricing"
            isActive={activeTab === 'plans'}
            onClick={() => selectTab('plans')}
          />
          <NavItem
            icon="campaign"
            label="Announcements"
            isActive={activeTab === 'announcements'}
            onClick={() => selectTab('announcements')}
          />
          <NavItem
            icon="support_agent"
            label="Support Tickets"
            isActive={activeTab === 'tickets'}
            onClick={() => selectTab('tickets')}
          />
          {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
            <NavItem
              icon="reviews"
              label="Testimonials"
              isActive={activeTab === 'testimonials'}
              onClick={() => selectTab('testimonials')}
            />
          )}

          <p className="px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 mt-6">System</p>
          {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
            <NavItem
              icon="badge"
              label="Team"
              isActive={activeTab === 'team'}
              onClick={() => selectTab('team')}
            />
          )}
          <NavItem
            icon="palette"
            label="Whitelabel / Brand"
            isActive={activeTab === 'brand'}
            onClick={() => selectTab('brand')}
          />
          <NavItem
            icon="settings"
            label="Settings"
            isActive={activeTab === 'settings'}
            onClick={() => selectTab('settings')}
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
      <main className="flex-1 lg:ml-0 min-h-[calc(100vh-64px)] lg:min-h-screen">
        {renderContent()}
      </main>

      {/* Connection Status Indicator */}
      <ConnectionStatusBadge position="bottom-right" showText={true} />
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
