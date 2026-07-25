import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminOverviewProps {
  onNavigate?: (tab: string) => void;
}

const mockStats = {
  totalArtists: 1240,
  activeReleases: 5892,
  pendingApproval: 24,
  totalRevenue: 42500,
};

const mockChartData = [
  { month: 'Jan', revenue: 2000 },
  { month: 'Feb', revenue: 2400 },
  { month: 'Mar', revenue: 2800 },
  { month: 'Apr', revenue: 3200 },
  { month: 'May', revenue: 3900 },
  { month: 'Jun', revenue: 4100 },
  { month: 'Jul', revenue: 4800 },
  { month: 'Aug', revenue: 5200 },
  { month: 'Sep', revenue: 6000 },
  { month: 'Oct', revenue: 6400 },
  { month: 'Nov', revenue: 7100 },
  { month: 'Dec', revenue: 8500 },
];

const mockLogs = [
  { id: 1, action: 'USER_REGISTERED', user: 'Alex Smith', timeAgo: '2h ago' },
  { id: 2, action: 'RELEASE_SUBMITTED', user: 'Sarah Beats', timeAgo: '3h ago' },
  { id: 3, action: 'RELEASE_APPROVED', user: 'System', timeAgo: '5h ago' },
  { id: 4, action: 'PAYOUT_COMPLETED', user: 'System', timeAgo: '1d ago' },
  { id: 5, action: 'USER_LOGIN', user: 'Mike Jordan', timeAgo: '1d ago' },
];

const getActionConfig = (action: string) => {
  switch (action) {
    case 'USER_REGISTERED': return { icon: 'person_add', color: 'text-blue-500 bg-blue-500/10', text: 'User Registered' };
    case 'RELEASE_SUBMITTED': return { icon: 'upload', color: 'text-purple-500 bg-purple-500/10', text: 'Release Submitted' };
    case 'RELEASE_APPROVED': return { icon: 'check_circle', color: 'text-emerald-500 bg-emerald-500/10', text: 'Release Approved' };
    case 'PAYOUT_COMPLETED': return { icon: 'payments', color: 'text-emerald-500 bg-emerald-500/10', text: 'Payout Completed' };
    case 'USER_LOGIN': return { icon: 'login', color: 'text-slate-500 bg-slate-500/10', text: 'User Login' };
    default: return { icon: 'info', color: 'text-slate-500 bg-slate-500/10', text: 'Action' };
  }
};

const AdminOverview: React.FC<AdminOverviewProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState(mockStats);
  const [logs, setLogs] = useState(mockLogs);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const json = await res.json();
          setStats(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStats(false);
      }
    };
    
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/admin/audit-logs?limit=10', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const json = await res.json();
          setLogs(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingLogs(false);
      }
    };

    fetchStats();
    fetchLogs();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Dashboard Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold">Your platform at a glance</p>
      </header>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 flex items-center justify-between">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Artists</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalArtists.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">people</span>
          </div>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 flex items-center justify-between">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Active Releases</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.activeReleases.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-500 text-white shadow-lg shadow-purple-500/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">library_music</span>
          </div>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 flex items-center justify-between relative">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Pending Approval</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.pendingApproval.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/30 flex items-center justify-center relative">
            <span className="material-symbols-outlined text-xl">fact_check</span>
            {stats.pendingApproval > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 flex items-center justify-between">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">${stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">payments</span>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 shadow-sm">
        <h3 className="text-lg font-black mb-6 text-slate-900 dark:text-white">Revenue (Last 12 Months)</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `$${val}`} dx={-10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#a78bfa' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => onNavigate?.('releases')}
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-card-dark border border-slate-200 dark:border-dark-800 rounded-xl hover:border-brand-500 dark:hover:border-brand-500 transition-colors group"
            >
              <div className="p-4 rounded-full bg-slate-50 dark:bg-dark-900 group-hover:bg-brand-50 dark:group-hover:bg-brand-500/10 transition-colors mb-3">
                <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-brand-500 transition-colors">rate_review</span>
              </div>
              <span className="font-bold text-slate-700 dark:text-slate-300">Review Pending Releases</span>
            </button>
            
            <button 
              onClick={() => onNavigate?.('finance')}
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-card-dark border border-slate-200 dark:border-dark-800 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors group"
            >
              <div className="p-4 rounded-full bg-slate-50 dark:bg-dark-900 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 transition-colors mb-3">
                <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-emerald-500 transition-colors">account_balance</span>
              </div>
              <span className="font-bold text-slate-700 dark:text-slate-300">Process Payouts</span>
            </button>

            <button 
              onClick={() => onNavigate?.('tickets')}
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-card-dark border border-slate-200 dark:border-dark-800 rounded-xl hover:border-amber-500 dark:hover:border-amber-500 transition-colors group"
            >
              <div className="p-4 rounded-full bg-slate-50 dark:bg-dark-900 group-hover:bg-amber-50 dark:group-hover:bg-amber-500/10 transition-colors mb-3">
                <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-amber-500 transition-colors">support_agent</span>
              </div>
              <span className="font-bold text-slate-700 dark:text-slate-300">View Support Tickets</span>
            </button>

            <button 
              onClick={() => onNavigate?.('announcements')}
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-card-dark border border-slate-200 dark:border-dark-800 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
            >
              <div className="p-4 rounded-full bg-slate-50 dark:bg-dark-900 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-colors mb-3">
                <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-blue-500 transition-colors">campaign</span>
              </div>
              <span className="font-bold text-slate-700 dark:text-slate-300">Create Announcement</span>
            </button>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 flex flex-col h-full shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Recent Activity</h3>
            <button 
              onClick={() => onNavigate?.('audit')}
              className="text-sm font-bold text-brand-500 hover:text-brand-600 transition-colors"
            >
              View All
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4">
            {logs.map((log) => {
              const config = getActionConfig(log.action);
              return (
                <div key={log.id} className="flex items-center gap-4 py-2">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <span className="material-symbols-outlined">{config.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{config.text}</p>
                    <p className="text-xs font-medium text-slate-500">by {log.user}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-400">{log.timeAgo}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Release Pipeline */}
      <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 shadow-sm">
        <h3 className="text-lg font-black mb-4 text-slate-900 dark:text-white">Release Pipeline</h3>
        <div className="w-full bg-slate-100 dark:bg-dark-900 rounded-full h-8 flex overflow-hidden">
          <div className="bg-slate-400 flex items-center justify-center text-xs font-bold text-white px-2" style={{ width: '15%' }}>Draft (15%)</div>
          <div className="bg-amber-500 flex items-center justify-center text-xs font-bold text-white px-2" style={{ width: '10%' }}>Pending (10%)</div>
          <div className="bg-emerald-500 flex items-center justify-center text-xs font-bold text-white px-2" style={{ width: '70%' }}>Live (70%)</div>
          <div className="bg-rose-500 flex items-center justify-center text-xs font-bold text-white px-2" style={{ width: '5%' }}>Rej. (5%)</div>
        </div>
      </div>

    </div>
  );
};

export default AdminOverview;
