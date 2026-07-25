import React, { useState } from 'react';

const CATEGORIES = ["All", "Release Hold", "Copyright Claim", "Payout Issue", "Account Verification", "Store Rejection", "General"];

const CANNED_RESPONSES = [
  "Your release has been approved and is being delivered to stores. Please allow 24-48 hours for it to appear.",
  "We've identified an issue with your cover artwork. Please ensure it meets the 3000x3000px minimum resolution requirement.",
  "Your payout has been processed and should arrive within 3-5 business days.",
  "We've detected potential copyright issues with your submission. Please provide proof of ownership or licensing.",
  "Your account verification is complete. You now have full access to all platform features."
];

const MOCK_TICKETS = [
    { id: 'TK-9021', user: 'Luna Echo', userId: 'LE', subject: 'Payment Issue - Premium Payout', category: 'Payout Issue', priority: 'URGENT', status: 'Open', lastActive: '12m ago', avatarColor: 'bg-indigo-500' },
    { id: 'TK-8842', user: 'Vibe Master', userId: 'VM', subject: "Metadata Error on 'Neon Dreams'", category: 'General', priority: 'MEDIUM', status: 'Active', lastActive: '2h ago', avatarColor: 'bg-purple-500' },
    { id: 'TK-8710', user: 'The Beatmaker', userId: 'TB', subject: 'Login Trouble - 2FA Lockout', category: 'Account Verification', priority: 'LOW', status: 'On Hold', lastActive: '1d ago', avatarColor: 'bg-blue-500' },
    { id: 'TK-8655', user: 'Sarah J.', userId: 'SJ', subject: 'Withdrawal Request Verification', category: 'Payout Issue', priority: 'HIGH', status: 'Unassigned', lastActive: '3d ago', avatarColor: 'bg-emerald-500' },
];

const SupportTickets: React.FC = () => {
    const [activeSidebarFilter, setActiveSidebarFilter] = useState('All Tickets');
    const [activeCategory, setActiveCategory] = useState('All');
    const [tickets, setTickets] = useState(MOCK_TICKETS);
    const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
    const [replyText, setReplyText] = useState('');

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case 'URGENT': return 'bg-rose-500/10 text-rose-500 border-rose-500/20 dark:border-rose-500/30';
            case 'HIGH': return 'bg-orange-500/10 text-orange-500 border-orange-500/20 dark:border-orange-500/30';
            case 'MEDIUM': return 'bg-amber-500/10 text-amber-500 border-amber-500/20 dark:border-amber-500/30';
            case 'LOW': default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20 dark:border-slate-500/30';
        }
    };

    const getStatusButton = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-brand-500/20 text-brand-600 dark:text-brand-400';
            case 'Unassigned': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
            default: return 'bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-300';
        }
    };

    const handleSendReply = () => {
        if (!replyText.trim()) return;
        // In a real app, this would make an API call
        alert('Reply sent: ' + replyText);
        setReplyText('');
    };

    const filteredTickets = tickets.filter(t => {
        const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
        const matchesSidebar = 
            activeSidebarFilter === 'All Tickets' ? true :
            activeSidebarFilter === 'Unassigned' ? t.status === 'Unassigned' :
            activeSidebarFilter === 'Open' ? t.status === 'Open' :
            activeSidebarFilter === 'On Hold' ? t.status === 'On Hold' :
            activeSidebarFilter === 'Resolved' ? t.status === 'Resolved' : true;
        
        return matchesCategory && matchesSidebar;
    });

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
                    {[
                        { label: 'All Tickets', icon: 'inbox' },
                        { label: 'Unassigned', icon: 'person_off', badge: tickets.filter(t=>t.status==='Unassigned').length },
                        { label: 'Open', icon: 'mark_email_unread' },
                        { label: 'On Hold', icon: 'pause_circle' },
                    ].map(item => (
                        <div 
                            key={item.label}
                            onClick={() => setActiveSidebarFilter(item.label)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer group transition-colors ${activeSidebarFilter === item.label ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800 font-medium'}`}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span className="text-sm">{item.label}</span>
                            {item.badge ? (
                                <span className="ml-auto text-xs bg-rose-500/20 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full font-bold">{item.badge}</span>
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
                <div className="p-4 mt-auto">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-dark-900 rounded-xl border border-slate-200 dark:border-dark-800">
                        <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-sm">
                            MC
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">Marcus Chen</span>
                            <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                            </span>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 ml-auto cursor-pointer">settings</span>
                    </div>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-dark-950">
                {/* Top Header */}
                <header className="p-6 border-b border-slate-200 dark:border-dark-800 bg-white dark:bg-card-dark">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex gap-4">
                                <div className="flex flex-col gap-1 min-w-[150px] p-4 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-900">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Avg. Response Time</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-2xl font-black text-slate-900 dark:text-white">14m 22s</p>
                                        <span className="text-[10px] text-emerald-500 font-bold flex items-center">
                                            <span className="material-symbols-outlined text-xs">trending_down</span> 4%
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 min-w-[150px] p-4 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-900">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Open Tickets</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">124</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative w-full max-w-md">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                                    <input className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-lg focus:outline-none focus:border-brand-500 dark:text-white" placeholder="Search ticket ID, artist, or subject..." type="text" />
                                </div>
                                <button className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm shadow-brand-500/20">
                                    <span className="material-symbols-outlined text-base">how_to_reg</span>
                                    Assign to Me
                                </button>
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

                {/* Table View */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-dark-900/50 border-b border-slate-200 dark:border-dark-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    <th className="px-6 py-4">Ticket ID</th>
                                    <th className="px-6 py-4">Artist/User</th>
                                    <th className="px-6 py-4">Subject</th>
                                    <th className="px-6 py-4">Priority</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-dark-800">
                                {filteredTickets.map(ticket => (
                                    <tr
                                        key={ticket.id}
                                        onClick={() => setSelectedTicket(ticket)}
                                        className={`hover:bg-slate-50 dark:hover:bg-dark-900/50 transition-colors cursor-pointer ${selectedTicket?.id === ticket.id ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}`}
                                    >
                                        <td className="px-6 py-4 font-mono text-xs font-bold text-brand-600 dark:text-brand-400">#{ticket.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full ${ticket.avatarColor} text-white flex items-center justify-center font-bold text-xs`}>{ticket.userId}</div>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{ticket.user}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{ticket.subject}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-dark-800 dark:text-slate-400">{ticket.category}</span>
                                                <span className="text-[10px] font-medium text-slate-400">Last activity {ticket.lastActive}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityStyles(ticket.priority)}`}>
                                                {ticket.priority}
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
                        {filteredTickets.length === 0 && (
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
                        <h2 className="text-xl font-black mb-1 text-slate-900 dark:text-white">#{selectedTicket.id}: {selectedTicket.subject.split(' - ')[0]}</h2>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="text-xs font-bold text-slate-500">Assigned to Marcus Chen</span>
                        </div>
                    </div>
                    
                    {/* Content Area (Scrollable) */}
                    <div className="flex-1 overflow-auto p-6 space-y-6">
                        {/* Artist Metadata */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg ${selectedTicket.avatarColor} text-white flex items-center justify-center font-bold text-xl`}>
                                {selectedTicket.userId}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white">{selectedTicket.user}</h3>
                                    <span className="material-symbols-outlined text-brand-500 text-sm">verified</span>
                                </div>
                                <p className="text-xs font-medium text-slate-500">42 Tracks • Verified Partner</p>
                            </div>
                            <button className="ml-auto text-brand-500 hover:text-brand-600 transition-colors">
                                <span className="material-symbols-outlined">open_in_new</span>
                            </button>
                        </div>
                        
                        {/* Chat History */}
                        <div className="space-y-4">
                            {/* User Message */}
                            <div className="flex flex-col gap-1 max-w-[85%]">
                                <div className="bg-slate-100 dark:bg-dark-800 p-3 rounded-2xl rounded-tl-none text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                                    Hello, I'm trying to update the genre metadata for my new album 'Neon Dreams' but it keeps defaulting to 'Pop' instead of 'Synthwave'. Can you help?
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 ml-1">Yesterday, 14:20</span>
                            </div>
                            
                            {/* Internal Note */}
                            <div className="bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/30 p-3 rounded-xl">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-500 text-sm">lock</span>
                                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase">Internal Note</span>
                                </div>
                                <p className="text-xs font-medium text-amber-800 dark:text-amber-200/70">Checked server logs. Seems like a cache issue on the ingest server #3.</p>
                            </div>
                            
                            {/* Admin Response */}
                            <div className="flex flex-col gap-1 max-w-[85%] ml-auto items-end">
                                <div className="bg-brand-500 p-3 rounded-2xl rounded-tr-none text-sm font-medium text-white leading-relaxed">
                                    Hi {selectedTicket.user.split(' ')[0]}, I'm looking into this for you. We've identified a sync delay. I'll manually trigger a metadata refresh for your catalog.
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 mr-1">Today, 09:15</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Ticket Settings / Response Footer */}
                    <div className="p-6 bg-slate-50 dark:bg-dark-900 border-t border-slate-200 dark:border-dark-800 space-y-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Canned Response</label>
                            <select 
                                onChange={(e) => {
                                    if(e.target.value) setReplyText(e.target.value);
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
                                    disabled={!replyText.trim()}
                                    className="bg-brand-500 text-white size-8 flex items-center justify-center rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-sm">send</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>
            )}
        </div>
    );
};

export default SupportTickets;
