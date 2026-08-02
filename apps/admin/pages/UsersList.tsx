import React, { useState, useEffect, useCallback } from 'react';
import { AdminService } from '../../../src/services/api';
import { useAuth } from '../../../src/contexts/AuthContext';
import { hasAdminPermission } from '../../../src/utils/adminPermissions';

const ROLE_OPTIONS = ['All', 'ARTIST', 'LABEL', 'ADMIN'];
const STATUS_OPTIONS = ['All', 'ACTIVE', 'PENDING', 'SUSPENDED'];

const money = (value: unknown): number => {
  const n = typeof value === 'string' ? parseFloat(value) : Number(value);
  return Number.isFinite(n) ? n : 0;
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const relativeTime = (value?: string | null) => {
  if (!value) return 'Never';
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

const UsersList: React.FC = () => {
  const { user: currentUser } = useAuth();
  const canChangeStatus = hasAdminPermission(currentUser, 'users:status');
  const canChangePlan = hasAdminPermission(currentUser, 'users:write');
  // Role changes are SUPER_ADMIN-only server-side (PATCH /admin/users/:id/role
  // is requireRole('SUPER_ADMIN')); employees:manage is the synthetic
  // permission only '*' matches. See adminPermissions.ts.
  const canChangeRole = hasAdminPermission(currentUser, 'employees:manage');

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [mutating, setMutating] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await AdminService.getUsers({
        role: roleFilter !== 'All' ? roleFilter : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        search: searchTerm || undefined,
      });
      setUsers(res?.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, searchTerm]);

  useEffect(() => {
    const timeout = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeout);
  }, [fetchUsers]);

  const openUser = async (user: any) => {
    setSelectedUser(user);
    setDetailLoading(true);
    setActionError('');
    try {
      const res = await AdminService.getUser(user.id);
      setSelectedUser(res?.user || user);
    } catch (err: any) {
      setActionError(err.message || 'Failed to load user details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const applyLocalUpdate = (patch: Record<string, any>) => {
    setSelectedUser((prev: any) => (prev ? { ...prev, ...patch } : prev));
    setUsers((prev) => prev.map((u) => (u.id === selectedUser?.id ? { ...u, ...patch } : u)));
  };

  const handleStatusToggle = async () => {
    if (!selectedUser) return;
    const newStatus = selectedUser.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    if (newStatus === 'SUSPENDED' && !window.confirm(`Are you sure you want to suspend ${selectedUser.name}?`)) return;

    setMutating(true);
    setActionError('');
    try {
      await AdminService.updateUserStatus(selectedUser.id, newStatus);
      applyLocalUpdate({ status: newStatus });
    } catch (err: any) {
      setActionError(err.message || 'Failed to update status.');
    } finally {
      setMutating(false);
    }
  };

  const handleChangeRole = async (newRole: string) => {
    if (!selectedUser || newRole === selectedUser.role) return;
    setMutating(true);
    setActionError('');
    try {
      await AdminService.updateUserRole(selectedUser.id, newRole);
      applyLocalUpdate({ role: newRole });
    } catch (err: any) {
      setActionError(err.message || 'Failed to update role.');
    } finally {
      setMutating(false);
    }
  };

  const handleChangePlan = async (newPlan: string) => {
    if (!selectedUser) return;
    setMutating(true);
    setActionError('');
    try {
      await AdminService.updateUserPlan(selectedUser.id, newPlan);
      applyLocalUpdate({ subscription: { ...(selectedUser.subscription || {}), plan: newPlan } });
    } catch (err: any) {
      setActionError(err.message || 'Failed to update plan.');
    } finally {
      setMutating(false);
    }
  };

  const getInitials = (name: string) => (name || '?').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': case 'SUPER_ADMIN': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400';
      case 'LABEL': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400';
      case 'ARTIST': default: return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
    }
  };

  const getAvatarBg = (role: string) => {
    switch (role) {
      case 'ADMIN': case 'SUPER_ADMIN': return 'bg-rose-500 text-white';
      case 'LABEL': return 'bg-indigo-500 text-white';
      case 'ARTIST': default: return 'bg-blue-500 text-white';
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'ENTERPRISE': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
      case 'LABEL_PLUS': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30';
      case 'PRO': return 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400 border-brand-200 dark:border-brand-500/30';
      case 'FREE': default: return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 border-slate-200 dark:border-slate-500/30';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Users & Artists</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold">Manage accounts, roles, and platform access.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-dark-800 rounded-lg text-sm focus:outline-none focus:border-brand-500 dark:focus:border-brand-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-dark-800 rounded-lg text-sm font-medium focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 appearance-none"
          >
            {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r === 'All' ? 'All Roles' : r.charAt(0) + r.slice(1).toLowerCase()}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-dark-800 rounded-lg text-sm font-medium focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 appearance-none"
          >
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
          </select>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchUsers} className="font-bold underline">Retry</button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-dark-900/50 border-b border-slate-200 dark:border-dark-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role & Plan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Releases</th>
                <th className="px-6 py-4">Joined & Last Login</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-dark-800">
              {loading && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">Loading users...</td></tr>
              )}
              {!loading && users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-dark-900/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getAvatarBg(user.role)}`}>
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getRoleColor(user.role)}`}>{user.role}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPlanBadge(user.subscription?.plan || 'FREE')}`}>{user.subscription?.plan || 'FREE'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500' : user.status === 'PENDING' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{user.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{user._count?.releases ?? 0}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    <p className="text-sm">{formatDate(user.createdAt)}</p>
                    <p className="text-xs text-slate-500">{relativeTime(user.lastLoginAt)}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openUser(user)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && users.length === 0 && (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
              <p>No users found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* User Detail Drawer Overlay */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-card-dark w-full max-w-[480px] h-full shadow-2xl flex flex-col animate-slide-in-right overflow-hidden border-l border-slate-200 dark:border-dark-800">

            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-900">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                User Details
              </h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-dark-800 rounded-full text-slate-500 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {detailLoading ? (
              <div className="p-16 text-center text-slate-400">Loading details...</div>
            ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {actionError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {actionError}
                </div>
              )}

              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl ${getAvatarBg(selectedUser.role)}`}>
                  {getInitials(selectedUser.name)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{selectedUser.name}</h3>
                  <p className="text-sm font-medium text-slate-500">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${getRoleColor(selectedUser.role)}`}>{selectedUser.role}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getPlanBadge(selectedUser.subscription?.plan || 'FREE')}`}>{selectedUser.subscription?.plan || 'FREE'}</span>
                  </div>
                </div>
              </div>

              {/* Wallet Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Wallet Balance</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 dark:bg-dark-900 p-3 rounded-lg border border-slate-100 dark:border-dark-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Available</p>
                    <p className="text-lg font-black text-emerald-500">${money(selectedUser.wallet?.availableBalance).toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-dark-900 p-3 rounded-lg border border-slate-100 dark:border-dark-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Pending</p>
                    <p className="text-lg font-black text-amber-500">${money(selectedUser.wallet?.pendingBalance).toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-dark-900 p-3 rounded-lg border border-slate-100 dark:border-dark-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Lifetime</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">${money(selectedUser.wallet?.lifetimeEarnings).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons - each gated to the permission its endpoint
                  requires, so read-only roles (SUPPORT looking up an account
                  for a ticket, REVIEWER checking a submitter, FINANCE opening
                  a wallet) see the record without controls that would 403. */}
              {(canChangeStatus || canChangeRole || canChangePlan) && (
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-dark-800">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Management</h4>

                  <div className="space-y-3">
                    {canChangeStatus && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-dark-800">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Account Status</p>
                          <p className="text-xs text-slate-500">Current: {selectedUser.status}</p>
                        </div>
                        <button
                          onClick={handleStatusToggle}
                          disabled={mutating}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-colors disabled:opacity-50 ${selectedUser.status === 'SUSPENDED' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}
                        >
                          {selectedUser.status === 'SUSPENDED' ? 'Activate Account' : 'Suspend Account'}
                        </button>
                      </div>
                    )}

                    {canChangeRole && (
                      <div className="flex flex-col gap-2 p-3 rounded-lg bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-dark-800">
                        <label className="text-sm font-bold text-slate-900 dark:text-white">Change Role</label>
                        <select
                          value={selectedUser.role}
                          onChange={(e) => handleChangeRole(e.target.value)}
                          disabled={mutating}
                          className="p-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-dark-800 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                        >
                          <option value="ARTIST">Artist</option>
                          <option value="LABEL">Label</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </div>
                    )}

                    {canChangePlan && (
                      <div className="flex flex-col gap-2 p-3 rounded-lg bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-dark-800">
                        <label className="text-sm font-bold text-slate-900 dark:text-white">Change Plan</label>
                        <select
                          value={selectedUser.subscription?.plan || 'FREE'}
                          onChange={(e) => handleChangePlan(e.target.value)}
                          disabled={mutating}
                          className="p-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-dark-800 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                        >
                          <option value="FREE">FREE</option>
                          <option value="PRO">PRO</option>
                          <option value="LABEL_PLUS">LABEL PLUS</option>
                          <option value="ENTERPRISE">ENTERPRISE</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recent Releases */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-dark-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Recent Releases</h4>
                {selectedUser.releases?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUser.releases.map((release: any) => (
                      <div key={release.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-dark-800">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-slate-400">album</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{release.title}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          release.status === 'LIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200' :
                          release.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200' :
                          'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200'
                        }`}>
                          {release.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No releases yet.</p>
                )}
              </div>

            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
