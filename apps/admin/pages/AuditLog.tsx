import React, { useState, useEffect } from 'react';

const MOCK_AUDIT_LOGS = [
  {
    id: 'log_1',
    timestamp: 'Jul 24, 2026 11:30 PM',
    user: { name: 'Alex Smith', avatar: 'AS' },
    action: 'USER_REGISTERED',
    entity: { type: 'User', id: 'u_123' },
    ip: '192.168.1.100',
    details: { plan: 'FREE', country: 'US' }
  },
  {
    id: 'log_2',
    timestamp: 'Jul 24, 2026 10:15 PM',
    user: { name: 'Sarah Beats', avatar: 'SB' },
    action: 'RELEASE_SUBMITTED',
    entity: { type: 'Release', id: 'rel_456' },
    ip: '10.0.0.55',
    details: { title: 'Midnight Sun', tracks: 1 }
  },
  {
    id: 'log_3',
    timestamp: 'Jul 24, 2026 09:45 PM',
    user: { name: 'System', avatar: 'SY' },
    action: 'RELEASE_APPROVED',
    entity: { type: 'Release', id: 'rel_456' },
    ip: '127.0.0.1',
    details: { approvedBy: 'Auto-Review AI' }
  },
  {
    id: 'log_4',
    timestamp: 'Jul 24, 2026 08:20 PM',
    user: { name: 'Admin User', avatar: 'AD' },
    action: 'SETTING_UPDATED',
    entity: { type: 'Settings', id: 'plans_config' },
    ip: '172.16.0.5',
    details: { field: 'PRO_PLAN_PRICE', old: 19.99, new: 24.99 }
  },
  {
    id: 'log_5',
    timestamp: 'Jul 24, 2026 07:10 PM',
    user: { name: 'DJ Chill', avatar: 'DC' },
    action: 'ATH_MOVIL_PAYMENT_INITIATED',
    entity: { type: 'Transaction', id: 'tx_789' },
    ip: '64.233.160.0',
    details: { amount: 15.00, phone: '***-***-1234' }
  }
];

const ACTION_MAP: Record<string, { label: string, icon: string, color: string }> = {
  USER_REGISTERED: { label: 'New User Registered', icon: 'person_add', color: 'text-blue-500 bg-blue-500/10' },
  USER_LOGIN: { label: 'User Logged In', icon: 'login', color: 'text-slate-500 bg-slate-500/10' },
  RELEASE_CREATED: { label: 'Release Created', icon: 'add_circle', color: 'text-purple-500 bg-purple-500/10' },
  RELEASE_SUBMITTED: { label: 'Release Submitted', icon: 'upload', color: 'text-purple-500 bg-purple-500/10' },
  RELEASE_APPROVED: { label: 'Release Approved', icon: 'check_circle', color: 'text-emerald-500 bg-emerald-500/10' },
  RELEASE_REJECTED: { label: 'Release Rejected', icon: 'cancel', color: 'text-rose-500 bg-rose-500/10' },
  PASSWORD_CHANGED: { label: 'Password Changed', icon: 'lock', color: 'text-amber-500 bg-amber-500/10' },
  PAYOUT_COMPLETED: { label: 'Payout Processed', icon: 'payments', color: 'text-emerald-500 bg-emerald-500/10' },
  SETTING_UPDATED: { label: 'Setting Updated', icon: 'settings', color: 'text-slate-500 bg-slate-500/10' },
  USER_STATUS_CHANGED: { label: 'User Status Changed', icon: 'manage_accounts', color: 'text-amber-500 bg-amber-500/10' },
  USER_ROLE_CHANGED: { label: 'User Role Changed', icon: 'admin_panel_settings', color: 'text-indigo-500 bg-indigo-500/10' },
  ATH_MOVIL_PAYMENT_INITIATED: { label: 'ATH Móvil Payment Started', icon: 'phone_iphone', color: 'text-emerald-500 bg-emerald-500/10' }
};

const getActionConfig = (action: string) => ACTION_MAP[action] || { label: action, icon: 'info', color: 'text-slate-500 bg-slate-500/10' };

const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState(MOCK_AUDIT_LOGS);
  const [loading, setLoading] = useState(true);
  
  const [actionFilter, setActionFilter] = useState('All');
  const [userSearch, setUserSearch] = useState('');
  
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/admin/audit-logs', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
        if (res.ok) {
          const json = await res.json();
          setLogs(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesUser = log.user.name.toLowerCase().includes(userSearch.toLowerCase());
    
    let matchesAction = true;
    if (actionFilter !== 'All') {
      if (actionFilter === 'User Actions') matchesAction = ['USER_REGISTERED', 'USER_LOGIN', 'PASSWORD_CHANGED', 'USER_STATUS_CHANGED', 'USER_ROLE_CHANGED'].includes(log.action);
      else if (actionFilter === 'Release Actions') matchesAction = ['RELEASE_CREATED', 'RELEASE_SUBMITTED', 'RELEASE_APPROVED', 'RELEASE_REJECTED'].includes(log.action);
      else if (actionFilter === 'Payout Actions') matchesAction = ['PAYOUT_COMPLETED', 'ATH_MOVIL_PAYMENT_INITIATED'].includes(log.action);
      else if (actionFilter === 'Settings') matchesAction = ['SETTING_UPDATED'].includes(log.action);
    }

    return matchesUser && matchesAction;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Audit Log</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold">Complete activity log of all system actions.</p>
        </div>
      </header>

      {/* Filters Row */}
      <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-slate-200 dark:border-dark-800 shadow-sm flex flex-wrap gap-4">
        <select 
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-4 py-2 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-lg text-sm font-medium focus:outline-none focus:border-brand-500 flex-1 min-w-[200px]"
        >
          <option value="All">All Actions</option>
          <option value="User Actions">User Actions</option>
          <option value="Release Actions">Release Actions</option>
          <option value="Payout Actions">Payout Actions</option>
          <option value="Settings">Settings</option>
        </select>

        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input 
            type="text" 
            placeholder="Search by user name..." 
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-lg text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <input type="date" className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-lg text-sm text-slate-500 focus:outline-none focus:border-brand-500" />
          <span className="text-slate-400">to</span>
          <input type="date" className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-lg text-sm text-slate-500 focus:outline-none focus:border-brand-500" />
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-dark-900/50 border-b border-slate-200 dark:border-dark-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Entity</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-dark-800">
              {filteredLogs.map(log => {
                const config = getActionConfig(log.action);
                const isSystem = log.user.name === 'System';
                const isExpanded = expandedRow === log.id;
                
                return (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-slate-50 dark:hover:bg-dark-900/50 transition-colors cursor-pointer" onClick={() => setExpandedRow(isExpanded ? null : log.id)}>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isSystem ? 'bg-slate-800 text-slate-300' : 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400'}`}>
                            {isSystem ? <span className="material-symbols-outlined text-[16px]">smart_toy</span> : log.user.avatar}
                          </div>
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{log.user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${config.color}`}>
                            <span className="material-symbols-outlined text-[16px]">{config.icon}</span>
                          </div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{config.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{log.entity.type}</span>
                          <span className="text-sm font-medium text-brand-500 cursor-pointer hover:underline">{log.entity.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-slate-500 bg-slate-100 dark:bg-dark-900 px-2 py-1 rounded">{log.ip}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1">
                          <span className="material-symbols-outlined">{isExpanded ? 'expand_less' : 'expand_more'}</span>
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="bg-slate-50 dark:bg-dark-900/50 p-0 border-b border-slate-200 dark:border-dark-800">
                          <div className="p-6">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Event Details Payload</h4>
                            <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs font-mono overflow-x-auto shadow-inner">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">history_toggle_off</span>
              <p>No audit logs found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
