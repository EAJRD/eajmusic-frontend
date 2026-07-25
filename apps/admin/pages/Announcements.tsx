import React, { useState, useEffect, useCallback } from 'react';
import { AdminService } from '../../../src/services/api';

const Announcements: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('Type your message here... to see how it looks.');
  const [type, setType] = useState('info');
  const [targetAudience, setTargetAudience] = useState('all');
  const [expiresAt, setExpiresAt] = useState('');

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AdminService.getAnnouncements();
      setAnnouncements(res?.announcements || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const getNotificationStyles = (t: string) => {
    switch (t) {
      case 'success': return 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-100';
      case 'warning': return 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-100';
      case 'urgent': return 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-100';
      case 'info': default: return 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-100';
    }
  };
  const getIcon = (t: string) => ({ success: 'check_circle', warning: 'warning', urgent: 'error' } as any)[t] || 'info';
  const getIconColor = (t: string) => ({ success: 'text-emerald-500', warning: 'text-amber-500', urgent: 'text-rose-500' } as any)[t] || 'text-blue-500';

  const handleBroadcast = async () => {
    if (!title.trim() || !content.trim()) return;
    setSending(true);
    setError('');
    try {
      await AdminService.createAnnouncement({
        title,
        content,
        type,
        targetAudience,
        expiresAt: expiresAt || undefined,
      });
      setTitle('');
      setContent('Type your message here... to see how it looks.');
      setType('info');
      setTargetAudience('all');
      setExpiresAt('');
      fetchAnnouncements();
    } catch (err: any) {
      setError(err.message || 'Failed to send announcement.');
    } finally {
      setSending(false);
    }
  };

  const handleToggleActive = async (announcement: any) => {
    try {
      await AdminService.updateAnnouncement(announcement.id, { isActive: !announcement.isActive });
      setAnnouncements((prev) => prev.map((a) => a.id === announcement.id ? { ...a, isActive: !a.isActive } : a));
    } catch (err: any) {
      setError(err.message || 'Failed to update announcement.');
    }
  };

  const handleDelete = async (announcement: any) => {
    if (!window.confirm(`Delete announcement "${announcement.title}"?`)) return;
    try {
      await AdminService.deleteAnnouncement(announcement.id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== announcement.id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete announcement.');
    }
  };

  const filteredAnnouncements = announcements.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));
  const activeCount = announcements.filter(a => a.isActive).length;

  return (
    <div className="flex-1 px-4 md:px-10 lg:px-20 py-8 max-w-[1600px] w-full mx-auto font-display">
      <div className="mb-8">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">Global Notifications & Announcements</h1>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Composition Form */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
          {/* Compose Card */}
          <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-dark-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-dark-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit_square</span>
                Compose New Announcement
              </h2>
            </div>
            <div className="p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Announcement Title</label>
                <input
                  className="form-input w-full rounded-lg bg-slate-50 dark:bg-input-dark border-slate-300 dark:border-dark-800 text-slate-900 dark:text-white px-4 py-3 focus:border-primary focus:ring-primary placeholder:text-slate-400"
                  placeholder="e.g. Scheduled Maintenance Update"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notification Type</label>
                  <select
                    className="form-select w-full rounded-lg bg-slate-50 dark:bg-input-dark border-slate-300 dark:border-dark-800 text-slate-900 dark:text-white px-4 py-3 pr-10 focus:border-primary focus:ring-primary appearance-none"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="info">Info (Blue)</option>
                    <option value="success">Success (Green)</option>
                    <option value="warning">Warning (Yellow)</option>
                    <option value="urgent">Urgent (Red)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Target Audience</label>
                  <select
                    className="form-select w-full rounded-lg bg-slate-50 dark:bg-input-dark border-slate-300 dark:border-dark-800 text-slate-900 dark:text-white px-4 py-3 pr-10 focus:border-primary focus:ring-primary appearance-none"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                  >
                    <option value="all">All Users</option>
                    <option value="free">Free Tier Artists</option>
                    <option value="pro">Pro Artists</option>
                    <option value="labels">Record Labels</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Expires (Optional)</label>
                  <input
                    type="date"
                    className="form-input w-full rounded-lg bg-slate-50 dark:bg-input-dark border-slate-300 dark:border-dark-800 text-slate-900 dark:text-white px-4 py-3 focus:border-primary focus:ring-primary"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Message Content</label>
                <textarea
                  className="w-full bg-slate-50 dark:bg-input-dark border border-slate-300 dark:border-dark-800 rounded-lg text-slate-900 dark:text-white p-4 h-32 resize-none focus:ring-primary focus:border-primary placeholder:text-slate-400"
                  placeholder="Type your message here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                ></textarea>
              </div>
              <div className="pt-4 border-t border-slate-200 dark:border-dark-800 flex justify-end">
                <button
                  onClick={handleBroadcast}
                  disabled={sending || !title.trim() || !content.trim()}
                  className="px-5 py-2.5 rounded-lg bg-primary text-white font-bold text-sm shadow-lg shadow-primary/30 hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  {sending ? 'Broadcasting...' : 'Broadcast Now'}
                </button>
              </div>
            </div>
          </div>

          {/* Recent Broadcasts Table */}
          <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-dark-800 overflow-hidden flex-1">
            <div className="p-6 border-b border-slate-200 dark:border-dark-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sent Announcements</h2>
              <input
                className="bg-slate-50 dark:bg-input-dark border border-slate-200 dark:border-dark-800 rounded-lg px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:ring-primary focus:border-primary w-48"
                placeholder="Search history..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-[#1a2436] text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Audience</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-dark-800">
                  {loading && (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">Loading...</td></tr>
                  )}
                  {!loading && filteredAnnouncements.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${a.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-500/20'}`}>
                          <span className={`size-1.5 rounded-full ${a.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span> {a.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{a.title}</td>
                      <td className="px-6 py-4 capitalize">{a.targetAudience}</td>
                      <td className="px-6 py-4">{new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleToggleActive(a)} className="text-slate-400 hover:text-primary transition-colors text-xs font-bold">
                            {a.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button onClick={() => handleDelete(a)} className="text-slate-400 hover:text-rose-500 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && filteredAnnouncements.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">No announcements sent yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Preview & Info */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-8">
          {/* Live Preview Device */}
          <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-dark-800 overflow-hidden flex flex-col h-full max-h-[700px] sticky top-28">
            <div className="p-4 border-b border-slate-200 dark:border-dark-800 flex justify-between items-center bg-slate-50 dark:bg-[#1a2436]">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                Live Preview
              </h2>
            </div>
            <div className="flex-1 bg-slate-200 dark:bg-[#111827] p-6 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              <div className="w-full max-w-sm bg-background-light dark:bg-[#0f172a] rounded-xl shadow-2xl border border-slate-300 dark:border-slate-700 overflow-hidden flex flex-col h-[500px]">
                <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-white dark:bg-[#1e293b]">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                  <div className="w-24 h-3 rounded bg-slate-200 dark:bg-slate-700"></div>
                  <div className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700"></div>
                </div>
                <div className="p-4 space-y-4 flex-1 overflow-y-auto relative">
                  <div className={`absolute top-4 left-4 right-4 z-10 border-l-4 p-4 rounded-r shadow-lg backdrop-blur-sm ${getNotificationStyles(type)}`}>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <span className={`material-symbols-outlined ${getIconColor(type)}`}>{getIcon(type)}</span>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-bold">{title || 'Announcement title'}</h3>
                        <div className="mt-1 text-xs">
                          <p>{content}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 opacity-30 pointer-events-none filter blur-[1px]">
                    <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-lg w-full"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                      <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                    </div>
                    <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4"></div>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 font-medium">Preview updates automatically</p>
            </div>
          </div>
          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-slate-200 dark:border-dark-800 shadow-sm">
              <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase mb-1">Total Sent</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{loading ? '—' : announcements.length}</div>
            </div>
            <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-slate-200 dark:border-dark-800 shadow-sm">
              <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase mb-1">Active Now</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{loading ? '—' : activeCount}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Announcements;
