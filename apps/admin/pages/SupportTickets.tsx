import React, { useState, useEffect, useCallback } from 'react';
import { AdminService } from '../../../src/services/api';

const CATEGORIES = ["All", "Release Hold", "Copyright Claim", "Payout Issue", "Account Verification", "Store Rejection", "General"];

const CANNED_RESPONSES = [
  "Your release has been approved and is being delivered to stores. Please allow 24-48 hours for it to appear.",
  "We've identified an issue with your cover artwork. Please ensure it meets the 3000x3000px minimum resolution requirement.",
  "Your payout has been processed and should arrive within 3-5 business days.",
  "We've detected potential copyright issues with your submission. Please provide proof of ownership or licensing.",
  "Your account verification is complete. You now have full access to all platform features."
];

const SIDEBAR_FILTERS = [
  { label: 'All Tickets', icon: 'inbox' },
  { label: 'Unassigned', icon: 'person_off' },
  { label: 'Open', icon: 'mark_email_unread', status: 'OPEN' },
  { label: 'In Progress', icon: 'pause_circle', status: 'IN_PROGRESS' },
];

const getInitials = (name: string) => (name || '?').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

const avatarColorFor = (id: string) => {
  const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % colors.length;
  return colors[hash];
};

const relativeTime = (value?: string | null) => {
  if (!value) return '—';
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const SupportTickets: React.FC = () => {
  const [activeSidebarFilter, setActiveSidebarFilter] = useState('All Tickets');
  const [activeCategory, setActiveCategory] = useState('All');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const filter = SIDEBAR_FILTERS.find(f => f.label === activeSidebarFilter);
      const res = await AdminService.getTickets({ status: filter?.status, page: 1, ...( { limit: 100 } as any) });
      setTickets(res?.tickets || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  }, [activeSidebarFilter]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const openTicket = async (ticket: any) => {
    setSelectedTicket(ticket);
    setDetailLoading(true);
    setReplyText('');
    setIsInternal(false);
    try {
      const res = await AdminService.getTicket(ticket.id);
      setSelectedTicket(res?.ticket || ticket);
    } catch (err: any) {
      setError(err.message || 'Failed to load ticket details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setSending(true);
    try {
      await AdminService.replyToTicket(selectedTicket.id, replyText, isInternal);
      const refreshed = await AdminService.getTicket(selectedTicket.id);
      setSelectedTicket(refreshed?.ticket || selectedTicket);
      setReplyText('');
      setIsInternal(false);
      fetchTickets();
    } catch (err: any) {
      setError(err.message || 'Failed to send reply.');
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedTicket) return;
    try {
      await AdminService.updateTicketStatus(selectedTicket.id, status);
      setSelectedTicket((prev: any) => (prev ? { ...prev, status } : prev));
      fetchTickets();
    } catch (err: any) {
      setError(err.message || 'Failed to update ticket status.');
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch ((priority || '').toLowerCase()) {
      case 'urgent': return 'bg-rose-500/10 text-rose-500 border-rose-500/20 dark:border-rose-500/30';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20 dark:border-orange-500/30';
      case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:border-amber-500/30';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20 dark:border-slate-500/30';
    }
  };

  const getStatusButton = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
      case 'IN_PROGRESS': return 'bg-brand-500/20 text-brand-600 dark:text-brand-400';
      case 'RESOLVED': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      default: return 'bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-300';
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
    const matchesSidebar = activeSidebarFilter === 'Unassigned' ? !t.assignee : true;
    return matchesCategory && matchesSidebar;
  });

  const unassignedCount = tickets.filter(t => !t.assignee).length;
  const openCount = tickets.filter(t => t.status === 'OPEN').length;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden text-slate-900 dark:text-white bg-slate-50 dark:bg-dark-950 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex flex-col bg-white dark:bg-card-dark border-r border-slate-200 dark:border-dark-800 shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-brand-500 rounded-lg p-2 flex items-center justify-center">
            <span className="material-symbols-outlined text-white">support_agent</span>
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight uppercase">Support Desk</h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">EAJMUSIC ADMIN</p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {SIDEBAR_FILTERS.map(item => (
            <div
              key={item.label}
              onClick={() => setActiveSidebarFilter(item.label)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer group transition-colors ${activeSidebarFilter === item.label ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800 font-medium'}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
              {item.label === 'Unassigned' && unassignedCount > 0 ? (
                <span className="ml-auto text-xs bg-rose-500/20 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full font-bold">{unassignedCount}</span>
              ) : null}
            </div>
          ))}
          <div
            onClick={() => setActiveSidebarFilter('Resolved')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer group transition-colors border-t border-slate-100 dark:border-dark-800 pt-4 mt-4 ${activeSidebarFilter === 'Resolved' ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800 font-medium'}`}
          >
            <span className="material-symbols-outlined">check_circle</span>
            <span className="text-sm">Resolved</span>
          </div>
        </nav>
      </aside>

      {/* Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-dark-950">
        {/* Top Header */}
        <header className="p-6 border-b border-slate-200 dark:border-dark-800 bg-white dark:bg-card-dark">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex gap-4">
                <div className="flex flex-col gap-1 min-w-[150px] p-4 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-900">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Open Tickets</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{loading ? '—' : openCount}</p>
                </div>
                <div className="flex flex-col gap-1 min-w-[150px] p-4 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-900">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Unassigned</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{loading ? '—' : unassignedCount}</p>
                </div>
              </div>
            </div>

            {/* Categories Filter */}
            <div className="flex flex-wrap gap-2 pt-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${activeCategory === cat ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-dark-800 dark:text-slate-400 dark:hover:bg-dark-700'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </header>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchTickets} className="font-bold underline">Retry</button>
          </div>
        )}

        {/* Table View */}
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-dark-900/50 border-b border-slate-200 dark:border-dark-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Artist/User</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-dark-800">
                {loading && (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">Loading tickets...</td></tr>
                )}
                {!loading && filteredTickets.map(ticket => (
                  <tr
                    key={ticket.id}
                    onClick={() => openTicket(ticket)}
                    className={`hover:bg-slate-50 dark:hover:bg-dark-900/50 transition-colors cursor-pointer ${selectedTicket?.id === ticket.id ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${avatarColorFor(ticket.id)} text-white flex items-center justify-center font-bold text-xs`}>{getInitials(ticket.user?.name)}</div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{ticket.user?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{ticket.subject}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-dark-800 dark:text-slate-400">{ticket.category}</span>
                        <span className="text-[10px] font-medium text-slate-400">Last activity {relativeTime(ticket.updatedAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityStyles(ticket.priority)}`}>
                        {(ticket.priority || 'normal').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-block text-xs px-3 py-1 rounded-md font-bold ${getStatusButton(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && filteredTickets.length === 0 && (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inbox</span>
                <p className="font-bold">No tickets found.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Ticket Detail Drawer */}
      {selectedTicket && (
        <aside className="w-[420px] bg-white dark:bg-card-dark border-l border-slate-200 dark:border-dark-800 flex flex-col shadow-2xl shrink-0 z-10">
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-900">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Detail View</span>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <h2 className="text-xl font-black mb-1 text-slate-900 dark:text-white">{selectedTicket.subject}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500">{selectedTicket.assignee ? `Assigned to ${selectedTicket.assignee.name}` : 'Unassigned'}</span>
              <select
                value={selectedTicket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="ml-auto text-xs font-bold bg-white dark:bg-card-dark border border-slate-200 dark:border-dark-800 rounded-lg px-2 py-1 focus:outline-none focus:border-brand-500"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>

          {/* Content Area (Scrollable) */}
          {detailLoading ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">Loading conversation...</div>
          ) : (
          <div className="flex-1 overflow-auto p-6 space-y-6">
            {/* Chat History */}
            <div className="space-y-4">
              {(selectedTicket.messages || []).map((msg: any) => (
                msg.isInternal ? (
                  <div key={msg.id} className="bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/30 p-3 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-amber-600 dark:text-amber-500 text-sm">lock</span>
                      <span className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase">Internal Note · {msg.user?.name}</span>
                    </div>
                    <p className="text-xs font-medium text-amber-800 dark:text-amber-200/70">{msg.message}</p>
                  </div>
                ) : msg.user?.role === 'ADMIN' || msg.user?.role === 'SUPER_ADMIN' ? (
                  <div key={msg.id} className="flex flex-col gap-1 max-w-[85%] ml-auto items-end">
                    <div className="bg-brand-500 p-3 rounded-2xl rounded-tr-none text-sm font-medium text-white leading-relaxed">
                      {msg.message}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 mr-1">{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                ) : (
                  <div key={msg.id} className="flex flex-col gap-1 max-w-[85%]">
                    <div className="bg-slate-100 dark:bg-dark-800 p-3 rounded-2xl rounded-tl-none text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                      {msg.message}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 ml-1">{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                )
              ))}
              {(!selectedTicket.messages || selectedTicket.messages.length === 0) && (
                <p className="text-sm text-slate-400 text-center py-4">No messages yet.</p>
              )}
            </div>
          </div>
          )}

          {/* Ticket Settings / Response Footer */}
          <div className="p-6 bg-slate-50 dark:bg-dark-900 border-t border-slate-200 dark:border-dark-800 space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Canned Response</label>
              <select
                onChange={(e) => {
                  if (e.target.value) setReplyText(e.target.value);
                  e.target.value = '';
                }}
                className="w-full bg-white dark:bg-card-dark border border-slate-200 dark:border-dark-800 rounded-lg text-xs font-bold py-2 px-3 focus:outline-none focus:border-brand-500 text-slate-700 dark:text-slate-300"
              >
                <option value="">Select a template...</option>
                {CANNED_RESPONSES.map((res, i) => (
                  <option key={i} value={res}>{res.substring(0, 50)}...</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full bg-white dark:bg-card-dark border border-slate-200 dark:border-dark-800 rounded-xl text-sm font-medium p-3 pr-12 focus:outline-none focus:border-brand-500 min-h-[100px] resize-none text-slate-900 dark:text-white"
                placeholder="Type your response..."
              ></textarea>
              <div className="absolute right-3 bottom-3 flex gap-2">
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || sending}
                  className="bg-brand-500 text-white size-8 flex items-center justify-center rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
              <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} className="rounded text-amber-500 focus:ring-amber-500" />
              Internal note (not visible to the user)
            </label>
          </div>
        </aside>
      )}
    </div>
  );
};

export default SupportTickets;
