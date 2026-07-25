import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Fallback mock data - replace when API is connected
const MOCK_FINANCE_STATS = {
  totalRevenue: 125400.50,
  platformCommission: 18810.08,
  totalPaidOut: 98500.00,
  pendingPayoutsCount: 15,
  pendingPayoutsAmount: 8090.42
};

const MOCK_CHART_DATA = [
  { month: 'Jan', revenue: 8000, commission: 1200 },
  { month: 'Feb', revenue: 9500, commission: 1425 },
  { month: 'Mar', revenue: 11000, commission: 1650 },
  { month: 'Apr', revenue: 10500, commission: 1575 },
  { month: 'May', revenue: 13000, commission: 1950 },
  { month: 'Jun', revenue: 14500, commission: 2175 },
  { month: 'Jul', revenue: 16000, commission: 2400 },
  { month: 'Aug', revenue: 15500, commission: 2325 },
  { month: 'Sep', revenue: 18000, commission: 2700 },
  { month: 'Oct', revenue: 20000, commission: 3000 },
  { month: 'Nov', revenue: 22000, commission: 3300 },
  { month: 'Dec', revenue: 25000, commission: 3750 },
];

const MOCK_PAYOUTS = [
  { id: 'p_1', artist: 'Sarah Beats', email: 'sarah@example.com', amount: 450.50, method: 'PayPal', requestedAt: 'Jul 22, 2026', status: 'Pending' },
  { id: 'p_2', artist: 'DJ Chill', email: 'dj@example.com', amount: 120.00, method: 'Bank Transfer', requestedAt: 'Jul 23, 2026', status: 'Pending' },
  { id: 'p_3', artist: 'The Starlight Band', email: 'star@example.com', amount: 2450.00, method: 'Wire', requestedAt: 'Jul 20, 2026', status: 'Completed', transactionId: 'TXN-987654321' },
  { id: 'p_4', artist: 'Synthwave Joe', email: 'joe@example.com', amount: 890.00, method: 'PayPal', requestedAt: 'Jul 15, 2026', status: 'Failed', reason: 'Invalid PayPal address' },
];

const FinanceHub: React.FC = () => {
  const [stats, setStats] = useState(MOCK_FINANCE_STATS);
  const [payouts, setPayouts] = useState(MOCK_PAYOUTS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Pending' | 'Completed' | 'Failed'>('Pending');
  
  const [actioningPayout, setActioningPayout] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'Complete' | 'Reject' | null>(null);
  const [actionInput, setActionInput] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, payoutsRes] = await Promise.all([
          fetch('/api/admin/finance/overview', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
          fetch('/api/admin/payouts', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
        ]);
        
        if (statsRes.ok) setStats(await statsRes.json());
        if (payoutsRes.ok) setPayouts(await payoutsRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePayoutAction = async () => {
    if (!actioningPayout || !actionType || !actionInput.trim()) return;

    const newStatus = actionType === 'Complete' ? 'Completed' : 'Failed';
    const payload = actionType === 'Complete' ? { transactionId: actionInput } : { reason: actionInput };

    try {
      // Mock API call
      // await fetch(`/api/admin/payouts/${actioningPayout.id}/${actionType.toLowerCase()}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      //   body: JSON.stringify(payload)
      // });

      setPayouts(payouts.map(p => 
        p.id === actioningPayout.id 
          ? { ...p, status: newStatus, ...(actionType === 'Complete' ? { transactionId: actionInput } : { reason: actionInput }) } 
          : p
      ));
      
      setActioningPayout(null);
      setActionType(null);
      setActionInput('');
    } catch (err) {
      console.error(err);
    }
  };

  const processAllPending = async () => {
    if (!window.confirm('Are you sure you want to mark all pending payouts as completed? This should only be done if you have bulk processed them externally.')) return;
    
    try {
      // Mock API
      setPayouts(payouts.map(p => p.status === 'Pending' ? { ...p, status: 'Completed', transactionId: 'BULK-' + Date.now() } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPayouts = payouts.filter(p => p.status === activeTab);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Finance Hub</h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold">Manage revenue, commissions, and artist payouts.</p>
      </header>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
            <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
            <p className="text-xs font-bold uppercase tracking-wider">Gross Revenue</p>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">${stats.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <span className="material-symbols-outlined text-lg">savings</span>
            <p className="text-xs font-bold uppercase tracking-wider">Commission Earned</p>
          </div>
          <p className="text-3xl font-black text-emerald-500">${stats.platformCommission.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <span className="material-symbols-outlined text-lg">payments</span>
            <p className="text-xs font-bold uppercase tracking-wider">Total Paid Out</p>
          </div>
          <p className="text-3xl font-black text-blue-500">${stats.totalPaidOut.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
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
            <p className="text-3xl font-black text-amber-500">${stats.pendingPayoutsAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.pendingPayoutsCount} requests</p>
          </div>
        </div>
      </div>

      {/* Revenue vs Commission Chart */}
      <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-6 shadow-sm">
        <h3 className="text-lg font-black mb-6 text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-brand-500">monitoring</span>
          Revenue vs Commission
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_CHART_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCom" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `$${val/1000}k`} dx={-10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ fontWeight: 'bold' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
              />
              <Area type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#7c3aed" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              <Area type="monotone" dataKey="commission" name="Commission" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCom)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payouts Queue */}
      <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-dark-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">receipt_long</span>
            Payouts Queue
          </h3>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 dark:bg-dark-900 rounded-lg p-1">
              {['Pending', 'Completed', 'Failed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${activeTab === tab ? 'bg-white dark:bg-card-dark text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            {activeTab === 'Pending' && (
              <button 
                onClick={processAllPending}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold rounded-lg transition-colors shadow-sm shadow-brand-500/20"
              >
                Process All Pending
              </button>
            )}
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
              {filteredPayouts.map(payout => (
                <React.Fragment key={payout.id}>
                  <tr className="hover:bg-slate-50 dark:hover:bg-dark-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{payout.artist}</p>
                      <p className="text-xs text-slate-500">{payout.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 text-sm">
                          {payout.method === 'PayPal' ? 'account_balance_wallet' : 'account_balance'}
                        </span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{payout.method}</span>
                      </div>
                      {payout.transactionId && <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-1">TXN: {payout.transactionId}</p>}
                      {payout.reason && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">Reason: {payout.reason}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {payout.requestedAt}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-black text-slate-900 dark:text-white">${payout.amount.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {payout.status === 'Pending' ? (
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
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${payout.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-500/30'}`}>
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
                            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handlePayoutAction}
                            disabled={!actionInput.trim()}
                            className={`px-4 py-2 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 ${actionType === 'Complete' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}
                          >
                            Confirm {actionType}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {filteredPayouts.length === 0 && (
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
