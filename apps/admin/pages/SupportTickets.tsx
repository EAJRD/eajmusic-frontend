import React, { useState } from 'react';

const SupportTickets: React.FC = () => {
    // Mock Data
    const tickets = [
        { id: 'TK-9021', user: 'Luna Echo', userId: 'LE', subject: 'Payment Issue - Premium Payout', priority: 'URGENT', status: 'Open', lastActive: '12m ago', avatarColor: 'bg-slate-200 dark:bg-slate-700' },
        { id: 'TK-8842', user: 'Vibe Master', userId: 'VM', subject: "Metadata Error on 'Neon Dreams'", priority: 'MEDIUM', status: 'Active', lastActive: '2h ago', avatarColor: 'bg-slate-200 dark:bg-slate-700' },
        { id: 'TK-8710', user: 'The Beatmaker', userId: 'TB', subject: 'Login Trouble - 2FA Lockout', priority: 'LOW', status: 'On Hold', lastActive: '1d ago', avatarColor: 'bg-slate-200 dark:bg-slate-700' },
        { id: 'TK-8655', user: 'Sarah J.', userId: 'SJ', subject: 'Withdrawal Request Verification', priority: 'HIGH', status: 'Unassigned', lastActive: '3d ago', avatarColor: 'bg-slate-200 dark:bg-slate-700' },
    ];

    const [selectedTicket, setSelectedTicket] = useState(tickets[1]);

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case 'URGENT': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'HIGH': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'MEDIUM': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'LOW': default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const getStatusButton = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-primary/20 text-primary';
            case 'Unassigned': return 'bg-rose-500/10 text-rose-500';
            default: return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden font-display text-slate-900 dark:text-white bg-background-light dark:bg-background-dark">
            {/* Sidebar Navigation */}
            <aside className="w-64 flex flex-col bg-background-light dark:bg-background-dark border-r border-slate-200 dark:border-slate-800 shrink-0">
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-primary rounded-lg p-2 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white">graphic_eq</span>
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-tight uppercase">EAJMUSIC Admin</h1>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">SUPPORT PORTAL V2.4</p>
                    </div>
                </div>
                <nav className="flex-1 px-4 space-y-1">
                    <div className="flex items-center gap-3 px-3 py-2 text-primary bg-primary/10 rounded-lg cursor-pointer">
                        <span className="material-symbols-outlined">inbox</span>
                        <span className="text-sm font-semibold">All Tickets</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer group transition-colors">
                        <span className="material-symbols-outlined group-hover:text-primary">person_off</span>
                        <span className="text-sm font-medium">Unassigned</span>
                        <span className="ml-auto text-xs bg-rose-500/20 text-rose-500 px-2 py-0.5 rounded-full font-bold">12</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer group transition-colors">
                        <span className="material-symbols-outlined group-hover:text-primary">mark_email_unread</span>
                        <span className="text-sm font-medium">Open</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer group transition-colors">
                        <span className="material-symbols-outlined group-hover:text-primary">pause_circle</span>
                        <span className="text-sm font-medium">On Hold</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer group transition-colors border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                        <span className="material-symbols-outlined group-hover:text-primary">check_circle</span>
                        <span className="text-sm font-medium">Resolved</span>
                    </div>
                </nav>
                <div className="p-4 mt-auto">
                    <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        <div className="size-10 rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA2e7IQHeoiApUuvtpFnK3Gwk74gp4bqQR4xOVU7mgoi0LZS1_yg1Gus5ogkfaSYibFVv14P4jqmdSVA4D7asIg7PQy-qNmBypP1N0zOg6zgTvNT15HSyqCfpILF6po0Av37lnG9j0QvwVJKEVI9YEjeFtmS46Yzmw6ygwhMixUX8wEH4g_fSfaHfapspMTtLg-wsG_2xFjhmZJwWOdCGOgt341YKcEhTMzuRUWjP3QeSHMSuahNanixqKCiSx7JjD-_fD2hY7E3Mo')" }}></div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold">Marcus Chen</span>
                            <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                            </span>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 ml-auto cursor-pointer">settings</span>
                    </div>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header Stats */}
                <header className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-background-dark/50 backdrop-blur-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex gap-4">
                            <div className="flex flex-col gap-1 min-w-[180px] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Avg. Response Time</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-bold">14m 22s</p>
                                    <span className="text-[10px] text-emerald-500 font-bold flex items-center">
                                        <span className="material-symbols-outlined text-xs">trending_down</span> 4%
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 min-w-[180px] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Open Tickets</p>
                                <p className="text-2xl font-bold">124</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative w-full max-w-md">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                                <input className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-800 rounded-lg focus:ring-primary focus:border-primary dark:text-white" placeholder="Search ticket ID, artist, or subject..." type="text" />
                            </div>
                            <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
                                <span className="material-symbols-outlined text-base">how_to_reg</span>
                                Assign to Me
                            </button>
                        </div>
                    </div>
                </header>

                {/* Table View */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="bg-white dark:bg-[#182234] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ticket ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Artist/User</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subject</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {tickets.map(ticket => (
                                    <tr
                                        key={ticket.id}
                                        onClick={() => setSelectedTicket(ticket)}
                                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${selectedTicket.id === ticket.id ? 'bg-blue-50/20 dark:bg-blue-900/10 border-l-2 border-l-primary' : ''}`}
                                    >
                                        <td className="px-6 py-4 font-mono text-xs font-medium text-primary">#{ticket.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`size-8 rounded-full ${ticket.avatarColor} flex items-center justify-center font-bold text-[10px]`}>{ticket.userId}</div>
                                                <span className="text-sm font-medium">{ticket.user}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium">{ticket.subject}</p>
                                            <p className="text-[10px] text-slate-400">Last activity {ticket.lastActive}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityStyles(ticket.priority)}`}>
                                                {ticket.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className={`text-xs px-3 py-1 rounded-md font-semibold ${getStatusButton(ticket.status)}`}>
                                                {ticket.status}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Ticket Detail Drawer */}
            <aside className="w-[420px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl shrink-0">
                {/* Drawer Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Detail View</span>
                        <button className="text-slate-400 hover:text-white">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <h2 className="text-xl font-bold mb-1">#{selectedTicket.id}: {selectedTicket.subject.split(' - ')[0]}</h2>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-xs font-medium text-slate-500">Assigned to Marcus Chen</span>
                    </div>
                </div>
                {/* Content Area (Scrollable) */}
                <div className="flex-1 overflow-auto p-6 space-y-6">
                    {/* Artist Metadata */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <div className="size-12 rounded-lg bg-cover bg-center border-2 border-primary/20" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCIjjYxKHO1KYA9Vpv6hV78yopgqH_-Liq3gF2yOUUmmkjCNKJaUVLsBVwur97pXRXTKR4GVNSfuhphY46wWxWIN6RdNwRe2uSXta8B5Fgb8NaOus98yEdjvxvNZ179lpG48FBncww3Y6NQJl89f28tLSCm75moJ8z0OOv9vORvF6q0bmwtQ8tbaYuxsXc9OqMg71ugIAFko0MIccpm_NqbF1eu29z-qnq9R6QJbwCPCuWQY6v8D5VNiVdTCii10KIewe6roSeU1oc')" }}></div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold">{selectedTicket.user}</h3>
                                <span className="material-symbols-outlined text-blue-400 text-xs">verified</span>
                            </div>
                            <p className="text-[10px] text-slate-500">42 Tracks • Verified Partner</p>
                        </div>
                        <button className="ml-auto text-primary">
                            <span className="material-symbols-outlined">open_in_new</span>
                        </button>
                    </div>
                    {/* Chat History */}
                    <div className="space-y-4">
                        {/* User Message */}
                        <div className="flex flex-col gap-1 max-w-[85%]">
                            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none text-xs leading-relaxed">
                                Hello, I'm trying to update the genre metadata for my new album 'Neon Dreams' but it keeps defaulting to 'Pop' instead of 'Synthwave'. Can you help?
                            </div>
                            <span className="text-[10px] text-slate-500 ml-1">Yesterday, 14:20</span>
                        </div>
                        {/* Internal Note */}
                        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="material-symbols-outlined text-amber-500 text-sm">lock</span>
                                <span className="text-[10px] font-bold text-amber-500 uppercase">Internal Note</span>
                            </div>
                            <p className="text-[11px] text-slate-400">Checked server logs. Seems like a cache issue on the ingest server #3.</p>
                        </div>
                        {/* Admin Response */}
                        <div className="flex flex-col gap-1 max-w-[85%] ml-auto items-end">
                            <div className="bg-primary p-3 rounded-2xl rounded-tr-none text-xs text-white leading-relaxed">
                                Hi {selectedTicket.user.split(' ')[0]}, I'm looking into this for you. We've identified a sync delay. I'll manually trigger a metadata refresh for your catalog.
                            </div>
                            <span className="text-[10px] text-slate-500 mr-1">Today, 09:15</span>
                        </div>
                    </div>
                </div>
                {/* Ticket Settings / Response Footer */}
                <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Priority</label>
                            <select className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium py-1.5 focus:ring-primary focus:border-primary">
                                <option>Low</option>
                                <option selected>Medium</option>
                                <option>High</option>
                                <option>Urgent</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Department</label>
                            <select className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium py-1.5 focus:ring-primary focus:border-primary">
                                <option>Billing</option>
                                <option selected>Technical Support</option>
                                <option>Content Management</option>
                            </select>
                        </div>
                    </div>
                    <div className="relative">
                        <textarea className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-xs p-3 pr-12 focus:ring-primary focus:border-primary min-h-[100px] resize-none" placeholder="Type your response..."></textarea>
                        <div className="absolute right-3 bottom-3 flex gap-2">
                            <button className="bg-primary text-white size-8 flex items-center justify-center rounded-lg hover:bg-primary/90 transition-colors">
                                <span className="material-symbols-outlined text-sm">send</span>
                            </button>
                        </div>
                        <div className="absolute left-3 bottom-3 flex gap-3 text-slate-400">
                            <button className="hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-sm">attach_file</span>
                            </button>
                            <button className="hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-sm">lock</span>
                            </button>
                            <button className="hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-sm">sentiment_satisfied</span>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default SupportTickets;
