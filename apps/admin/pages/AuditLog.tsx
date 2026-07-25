import React, { useState, useEffect, useCallback } from 'react';
import { AdminService } from '../../../src/services/api';

const ACTION_MAP: Record<string, { label: string, icon: string, color: string, group: string }> = {
  USER_REGISTERED: { label: 'New User Registered', icon: 'person_add', color: 'text-blue-500 bg-blue-500/10', group: 'user' },
  USER_LOGIN: { label: 'User Logged In', icon: 'login', color: 'text-slate-500 bg-slate-500/10', group: 'user' },
  USER_STATUS_CHANGED: { label: 'User Status Changed', icon: 'manage_accounts', color: 'text-amber-500 bg-amber-500/10', group: 'user' },
  USER_ROLE_CHANGED: { label: 'User Role Changed', icon: 'admin_panel_settings', color: 'text-indigo-500 bg-indigo-500/10', group: 'user' },
  USER_PLAN_CHANGED: { label: 'User Plan Changed', icon: 'workspace_premium', color: 'text-indigo-500 bg-indigo-500/10', group: 'user' },
  RELEASE_CREATED: { label: 'Release Created', icon: 'add_circle', color: 'text-purple-500 bg-purple-500/10', group: 'release' },
  RELEASE_SUBMITTED: { label: 'Release Submitted', icon: 'upload', color: 'text-purple-500 bg-purple-500/10', group: 'release' },
  RELEASE_APPROVED: { label: 'Release Approved', icon: 'check_circle', color: 'text-emerald-500 bg-emerald-500/10', group: 'release' },
  RELEASE_REJECTED: { label: 'Release Rejected', icon: 'cancel', color: 'text-rose-500 bg-rose-500/10', group: 'release' },
  PAYOUT_BULK_COMPLETED: { label: 'Payout Marked Completed', icon: 'payments', color: 'text-emerald-500 bg-emerald-500/10', group: 'payout' },
  PAYOUT_BULK_CREATED: { label: 'Payout Record Created', icon: 'payments', color: 'text-emerald-500 bg-emerald-500/10', group: 'payout' },
  PAYOUT_BULK_IMPORT: { label: 'Bulk Payout Import', icon: 'upload_file', color: 'text-emerald-500 bg-emerald-500/10', group: 'payout' },
  SETTING_CHANGED: { label: 'Setting Updated', icon: 'settings', color: 'text-slate-500 bg-slate-500/10', group: 'settings' },
  SETTING_UPDATED: { label: 'Setting Updated', icon: 'settings', color: 'text-slate-500 bg-slate-500/10', group: 'settings' },
};

const getActionConfig = (action: string) => ACTION_MAP[action] || { label: action, icon: 'info', color: 'text-slate-500 bg-slate-500/10', group: 'other' };

const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [actionFilter, setActionFilter] = useState('All');
  const [userSearch, setUserSearch] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await AdminService.getAuditLogs({ limit: 100 } as any);
      setLogs(res?.logs || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filteredLogs = logs.filter(log => {
    const matchesUser = (log.user?.name || 'System').toLowerCase().includes(userSearch.toLowerCase());

    let matchesAction = true;
    if (actionFilter !== 'All') {
      matchesAction = getActionConfig(log.action).group === actionFilter;
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

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchLogs} className="font-bold underline">Retry</button>
        </div>
      )}

      {/* Filters Row */}
      <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-slate-200 dark:border-dark-800 shadow-sm flex flex-wrap gap-4">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-4 py-2 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-lg text-sm font-medium focus:outline-none focus:border-brand-500 flex-1 min-w-[200px]"
        >
          <option value="All">All Actions</option>
          <option value="user">User Actions</option>
          <option value="release">Release Actions</option>
          <option value="payout">Payout Actions</option>
          <option value="settings">Settings</option>
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
              {loading && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">Loading audit logs...</td></tr>
              )}
              {!loading && filteredLogs.map(log => {
                const config = getActionConfig(log.action);
                const userName = log.user?.name || 'System';
                const isSystem = userName === 'System';
                const isExpanded = expandedRow === log.id;
                const initials = userName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

                return (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-slate-50 dark:hover:bg-dark-900/50 transition-colors cursor-pointer" onClick={() => setExpandedRow(isExpanded ? null : log.id)}>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString('en-US') : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isSystem ? 'bg-slate-800 text-slate-300' : 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400'}`}>
                            {isSystem ? <span className="material-symbols-outlined text-[16px]">smart_toy</span> : initials}
                          </div>
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{userName}</span>
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
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{log.entityType || '—'}</span>
                          <span className="text-sm font-medium text-brand-500 truncate max-w-[160px]">{log.entityId || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-slate-500 bg-slate-100 dark:bg-dark-900 px-2 py-1 rounded">{log.ipAddress || '—'}</span>
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
                              {JSON.stringify(log.newValues ?? log.oldValues ?? {}, null, 2)}
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
          {!loading && filteredLogs.length === 0 && (
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
