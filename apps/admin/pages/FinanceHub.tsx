import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AdminService } from '../../../src/services/api';

const TABS = ['PENDING', 'COMPLETED', 'FAILED'] as const;
type TabStatus = typeof TABS[number];

const money = (value: unknown): number => {
  const n = typeof value === 'string' ? parseFloat(value) : Number(value);
  return Number.isFinite(n) ? n : 0;
};

const FinanceHub: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [payoutsLoading, setPayoutsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabStatus>('PENDING');

  const [actioningPayout, setActioningPayout] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'Complete' | 'Reject' | null>(null);
  const [actionInput, setActionInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setStatsLoading(true);
      try {
        const res = await AdminService.getFinanceOverview();
        setStats(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load finance overview.');
      } finally {
        setStatsLoading(false);
      }
    })();
  }, []);

  const fetchPayouts = useCallback(async () => {
    setPayoutsLoading(true);
    try {
      const res = await AdminService.getPayouts({ status: activeTab });
      setPayouts(res?.payouts || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load payouts.');
    } finally {
      setPayoutsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const handlePayoutAction = async () => {
    if (!actioningPayout || !actionType || !actionInput.trim()) return;

    setActionLoading(true);
    try {
      await AdminService.processPayout(
        actioningPayout.id,
        actionType === 'Complete' ? 'COMPLETE' : 'FAIL',
        actionType === 'Complete' ? actionInput : undefined,
        actionType === 'Reject' ? actionInput : undefined
      );

      setPayouts((prev) => prev.filter((p) => p.id !== actioningPayout.id));
      setActioningPayout(null);
      setActionType(null);
      setActionInput('');
    } catch (err: any) {
      setError(err.message || 'Failed to process payout.');
    } finally {
      setActionLoading(false);
    }
  };

  const chartData = (stats?.monthlyRevenue || []).map((m: any) => ({
    month: new Date(m.month).toLocaleDateString('en-US', { month: 'short' }),
    revenue: money(m.revenue),
    commission: money(m.commission),
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Finance Hub</h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold">Manage revenue, commissions, and artist payouts.</p>
      </header>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold">Dismiss</button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
            <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
            <p className="text-xs font-bold uppercase tracking-wider">Gross Revenue</p>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{statsLoading ? '—' : `$${money(stats?.totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}</p>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <span className="material-symbols-outlined text-lg">savings</span>
            <p className="text-xs font-bold uppercase tracking-wider">Commission Earned</p>
          </div>
          <p className="text-3xl font-black text-emerald-500">{statsLoading ? '—' : `$${money(stats?.totalCommissions).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}</p>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <span className="material-symbols-outlined text-lg">payments</span>
            <p className="text-xs font-bold uppercase tracking-wider">Total Paid Out</p>
          </div>
          <p className="text-3xl font-black text-blue-500">{statsLoading ? '—' : `$${money(stats?.totalPayoutsAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}</p>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-6xl text-amber-500">pending_actions</span>
          </div>
          <div className="flex items-center gap-2 text-amber-500 mb-2 relative z-10">
            <span className="material-symbols-outlined text-lg">pending_actions</span>
            <p className="text-xs font-bold uppercase tracking-wider">Pending Payouts</p>
          </div>
          <div className="relative z-10">
            <p className="text-3xl font-black text-amber-500">{statsLoading ? '—' : `$${money(stats?.pendingPayoutsAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}</p>
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-1">{statsLoading ? '—' : stats?.pendingPayoutsCount || 0} requests</p>
          </div>
        </div>
      </div>

      {/* Revenue vs Commission Chart */}
      <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 shadow-sm">
        <h3 className="text-lg font-black mb-6 text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-brand-500">monitoring</span>
          Revenue vs Commission (Last 12 Months)
        </h3>
        <div className="h-80 w-full">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              {statsLoading ? 'Loading chart...' : 'No revenue recorded yet.'}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCom" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `$${val / 1000}k`} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ fontWeight: 'bold' }}
                  formatter={(value: number | undefined) => [`$${(value ?? 0).toLocaleString()}`, undefined]}
                />
                <Area type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#7c3aed" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="commission" name="Commission" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCom)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Payouts Queue */}
      <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-dark-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">receipt_long</span>
            Payouts Queue
          </h3>

          <div className="flex bg-slate-100 dark:bg-dark-900 rounded-lg p-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${activeTab === tab ? 'bg-white dark:bg-card-dark text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-dark-900/50 border-b border-slate-200 dark:border-dark-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                <th className="px-6 py-4">Artist</th>
                <th className="px-6 py-4">Method & Details</th>
                <th className="px-6 py-4">Requested</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-dark-800">
              {payoutsLoading && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">Loading payouts...</td></tr>
              )}
              {!payoutsLoading && payouts.map(payout => (
                <React.Fragment key={payout.id}>
                  <tr className="hover:bg-slate-50 dark:hover:bg-dark-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{payout.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-500">{payout.user?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 text-sm">
                          {payout.method === 'paypal' ? 'account_balance_wallet' : 'account_balance'}
                        </span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{String(payout.method).replace('_', ' ')}</span>
                      </div>
                      {payout.transactionId && <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-1">TXN: {payout.transactionId}</p>}
                      {payout.failureReason && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">Reason: {payout.failureReason}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {payout.requestedAt ? new Date(payout.requestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-black text-slate-900 dark:text-white">${money(payout.amount).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {payout.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setActioningPayout(payout); setActionType('Complete'); }}
                            className="p-1.5 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded transition-colors"
                            title="Complete Payout"
                          >
                            <span className="material-symbols-outlined text-sm">check</span>
                          </button>
                          <button
                            onClick={() => { setActioningPayout(payout); setActionType('Reject'); }}
                            className="p-1.5 bg-rose-100 hover:bg-rose-200 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 text-rose-700 dark:text-rose-400 rounded transition-colors"
                            title="Reject Payout"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${payout.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-500/30'}`}>
                          {payout.status}
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* Inline Action Form */}
                  {actioningPayout?.id === payout.id && (
                    <tr>
                      <td colSpan={5} className="bg-slate-50 dark:bg-dark-900/80 p-4 border-b border-slate-200 dark:border-dark-800">
                        <div className="flex items-end gap-4 max-w-2xl ml-auto">
                          <div className="flex-1">
                            <label className={`text-xs font-bold mb-1 block ${actionType === 'Complete' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                              {actionType === 'Complete' ? 'Transaction ID / Reference (Required)' : 'Reason for Rejection (Required)'}
                            </label>
                            <input
                              type="text"
                              autoFocus
                              value={actionInput}
                              onChange={(e) => setActionInput(e.target.value)}
                              placeholder={actionType === 'Complete' ? 'e.g. TXN-123456789' : 'e.g. Invalid bank details'}
                              className={`w-full px-3 py-2 bg-white dark:bg-card-dark border rounded-lg text-sm focus:outline-none ${actionType === 'Complete' ? 'border-emerald-200 dark:border-emerald-500/30 focus:border-emerald-500' : 'border-rose-200 dark:border-rose-500/30 focus:border-rose-500'}`}
                            />
                          </div>
                          <button
                            onClick={() => { setActioningPayout(null); setActionInput(''); setActionType(null); }}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handlePayoutAction}
                            disabled={!actionInput.trim() || actionLoading}
                            className={`px-4 py-2 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 ${actionType === 'Complete' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}
                          >
                            {actionLoading ? 'Submitting...' : `Confirm ${actionType}`}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {!payoutsLoading && payouts.length === 0 && (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">receipt_long</span>
              <p>No {activeTab.toLowerCase()} payouts found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceHub;
