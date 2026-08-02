import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AdminService } from '../../../src/services/api';
import type { AdminTab } from '../AdminDashboard';

interface AdminOverviewProps {
  onNavigate?: (tab: AdminTab) => void;
}

const money = (value: unknown): number => {
  const n = typeof value === 'string' ? parseFloat(value) : Number(value);
  return Number.isFinite(n) ? n : 0;
};

const AdminOverview: React.FC<AdminOverviewProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, financeRes] = await Promise.all([
          AdminService.getStats(),
          AdminService.getFinanceOverview(),
        ]);
        setStats(statsRes);
        setChartData((financeRes?.monthlyRevenue || []).map((m: any) => ({
          month: new Date(m.month).toLocaleDateString('en-US', { month: 'short' }),
          revenue: money(m.revenue),
        })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStats(false);
      }
    })();
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
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Artists & Labels</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{loadingStats ? '—' : (stats?.totalUsers ?? 0).toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">people</span>
          </div>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 flex items-center justify-between">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Live Releases</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{loadingStats ? '—' : (stats?.activeReleases ?? 0).toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-500 text-white shadow-lg shadow-purple-500/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">library_music</span>
          </div>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 flex items-center justify-between relative">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Pending Approval</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{loadingStats ? '—' : (stats?.pendingApprovals ?? 0).toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/30 flex items-center justify-center relative">
            <span className="material-symbols-outlined text-xl">fact_check</span>
            {!loadingStats && stats?.pendingApprovals > 0 && (
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
            <p className="text-2xl font-black text-slate-900 dark:text-white">{loadingStats ? '—' : `$${money(stats?.totalRevenue).toLocaleString()}`}</p>
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
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              {loadingStats ? 'Loading chart...' : 'No revenue recorded yet.'}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val: number) => `$${val}`} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#a78bfa' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
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
      </div>
    </div>
  );
};

export default AdminOverview;
