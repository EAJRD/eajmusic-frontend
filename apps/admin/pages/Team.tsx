import React, { useState, useEffect, useCallback } from 'react';
import { AdminService } from '../../../src/services/api';
import { useAuth } from '../../../src/contexts/AuthContext';

const EMPLOYEE_ROLE_OPTIONS: Array<{ value: 'SUPPORT' | 'REVIEWER' | 'FINANCE' | 'ADMIN'; label: string }> = [
  { value: 'SUPPORT', label: 'Support' },
  { value: 'REVIEWER', label: 'Reviewer' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'ADMIN', label: 'Admin' },
];

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const getRoleColor = (role: string) => {
  switch (role) {
    case 'SUPER_ADMIN': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400';
    case 'ADMIN': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400';
    case 'FINANCE': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
    case 'REVIEWER': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400';
    case 'SUPPORT': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
    default: return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400';
  }
};

const getInitials = (name: string) => (name || '?').split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

const EMPLOYEE_ROLES = new Set(['SUPPORT', 'REVIEWER', 'FINANCE', 'ADMIN', 'SUPER_ADMIN']);

const Team: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', role: 'SUPPORT' as 'SUPPORT' | 'REVIEWER' | 'FINANCE' | 'ADMIN' });

  // Employees sign themselves up (InsForge requires a self-chosen password)
  // — this just confirms whether the invitation email went out, and gives a
  // copyable link as a fallback if it didn't (e.g. SMTP not configured).
  const [invitation, setInvitation] = useState<{ email: string; sent: boolean; registerUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await AdminService.getUsers({ limit: 100 } as any);
      const all = res?.data || [];
      setEmployees(all.filter((u: any) => EMPLOYEE_ROLES.has(u.role)));
    } catch (err: any) {
      setError(err.message || 'Failed to load the team.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const openCreateForm = () => {
    setForm({ name: '', email: '', role: 'SUPPORT' });
    setFormError('');
    setShowCreateForm(true);
  };

  const closeCreateForm = () => {
    setShowCreateForm(false);
    setFormError('');
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setFormError('Name and email are required.');
      return;
    }
    setCreating(true);
    setFormError('');
    try {
      const res = await AdminService.createEmployee({
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
      });
      setShowCreateForm(false);
      setInvitation({ email: form.email.trim(), sent: !!res?.invitationSent, registerUrl: res?.registerUrl || '' });
      fetchEmployees();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create employee account.');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!invitation) return;
    try {
      await navigator.clipboard.writeText(invitation.registerUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied — the link remains visible for manual copy.
    }
  };

  const dismissInvitation = () => {
    setInvitation(null);
    setCopied(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Team</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold">Employee accounts for the internal admin panel.</p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={openCreateForm}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            New employee
          </button>
        )}
      </header>

      {!isSuperAdmin && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-lg text-sm">
          You have read-only access to the team list. Only a Super Admin can create or promote employee accounts.
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchEmployees} className="font-bold underline">Retry</button>
        </div>
      )}

      {/* Employees Table */}
      <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-dark-900/50 border-b border-slate-200 dark:border-dark-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-dark-800">
              {loading && (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">Loading team...</td></tr>
              )}
              {!loading && employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-slate-50 dark:hover:bg-dark-900/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-sm">
                        {getInitials(employee.name)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{employee.name}</p>
                        <p className="text-xs text-slate-500">{employee.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getRoleColor(employee.role)}`}>{employee.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${employee.status === 'ACTIVE' ? 'bg-emerald-500' : employee.status === 'PENDING' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{employee.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{formatDate(employee.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && employees.length === 0 && (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">group_off</span>
              <p>No employee accounts yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Employee Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-card-dark w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-dark-800 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-dark-800">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">New employee</h2>
              <button onClick={closeCreateForm} className="p-1.5 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-full text-slate-500 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500"
                  placeholder="Jane Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500"
                  placeholder="jane@eajmusic.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as typeof form.role })}
                  className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500"
                >
                  {EMPLOYEE_ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-400">They'll get an email to create their own account with this address — no password to share.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-900/50">
              <button
                onClick={closeCreateForm}
                disabled={creating}
                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create employee'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invitation Confirmation */}
      {invitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className={`bg-white dark:bg-card-dark w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden ${invitation.sent ? 'border-emerald-300 dark:border-emerald-700' : 'border-amber-300 dark:border-amber-700'}`}>
            <div className="p-6 border-b border-slate-200 dark:border-dark-800 flex items-center gap-3">
              <span className={`material-symbols-outlined text-2xl ${invitation.sent ? 'text-emerald-500' : 'text-amber-500'}`}>
                {invitation.sent ? 'mark_email_read' : 'warning'}
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {invitation.sent ? 'Invitation sent' : 'Account created — email not sent'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500">
                {invitation.sent ? (
                  <>An invitation email was sent to <span className="font-bold text-slate-900 dark:text-white">{invitation.email}</span>. They just need to sign up with that same address to activate their account.</>
                ) : (
                  <>The account for <span className="font-bold text-slate-900 dark:text-white">{invitation.email}</span> was created, but the invitation email couldn't be sent (SMTP isn't configured). Share this sign-up link with them directly:</>
                )}
              </p>
              {!invitation.sent && (
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-lg px-4 py-3">
                  <code className="flex-1 font-mono text-xs text-slate-900 dark:text-white select-all break-all">{invitation.registerUrl}</code>
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition-colors flex-shrink-0"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end p-6 border-t border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-900/50">
              <button
                onClick={dismissInvitation}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-bold rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
