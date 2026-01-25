import React, { useState } from 'react';

const Announcements: React.FC = () => {
    // State for live preview content
    const [title, setTitle] = useState('Scheduled Maintenance Update');
    const [content, setContent] = useState('Type your message here... to see how it looks.');
    const [type, setType] = useState('info');

    // Helper for notification colors based on type
    const getNotificationStyles = (type: string) => {
        switch (type) {
            case 'success': return 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-100';
            case 'warning': return 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-100';
            case 'urgent': return 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-100';
            case 'info':
            default: return 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-100';
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return 'check_circle';
            case 'warning': return 'warning';
            case 'urgent': return 'error';
            case 'info': default: return 'info';
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'success': return 'text-emerald-500';
            case 'warning': return 'text-amber-500';
            case 'urgent': return 'text-rose-500';
            case 'info': default: return 'text-blue-500';
        }
    }


    return (
        <div className="flex-1 px-4 md:px-10 lg:px-20 py-8 max-w-[1600px] w-full mx-auto font-display">
            {/* Breadcrumbs & Heading */}
            <div className="mb-8">
                <div className="flex flex-wrap gap-2 mb-2 items-center">
                    <a href="#" className="text-slate-500 dark:text-[#90a4cb] text-sm font-medium hover:text-primary">Dashboard</a>
                    <span className="text-slate-500 dark:text-[#90a4cb] text-sm font-medium">/</span>
                    <span className="text-slate-900 dark:text-white text-sm font-medium">Global Announcements</span>
                </div>
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <h1 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">Global Notifications & Announcements</h1>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-[#222f49] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white text-sm font-bold hover:bg-slate-50 dark:hover:bg-[#2d3b55] transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">draft</span>
                        <span>View Drafts (3)</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN: Composition Form */}
                <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
                    {/* Compose Card */}
                    <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-border-dark overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-border-dark flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">edit_square</span>
                                Compose New Announcement
                            </h2>
                            <div className="flex gap-2">
                                <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">System Online</span>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col gap-6">
                            {/* Title Input */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Announcement Title</label>
                                <input
                                    className="form-input w-full rounded-lg bg-slate-50 dark:bg-input-dark border-slate-300 dark:border-border-dark text-slate-900 dark:text-white px-4 py-3 focus:border-primary focus:ring-primary placeholder:text-slate-400"
                                    placeholder="e.g. Scheduled Maintenance Update"
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            {/* Notification Type & Audience Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notification Type</label>
                                    <div className="relative">
                                        <select
                                            className="form-select w-full rounded-lg bg-slate-50 dark:bg-input-dark border-slate-300 dark:border-border-dark text-slate-900 dark:text-white px-4 py-3 pr-10 focus:border-primary focus:ring-primary appearance-none"
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                        >
                                            <option value="info">Info (Blue)</option>
                                            <option value="success">Success (Green)</option>
                                            <option value="warning">Warning (Yellow)</option>
                                            <option value="urgent">Urgent (Red)</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-3.5 text-slate-400 pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Target Audience</label>
                                    <div className="relative">
                                        <select className="form-select w-full rounded-lg bg-slate-50 dark:bg-input-dark border-slate-300 dark:border-border-dark text-slate-900 dark:text-white px-4 py-3 pr-10 focus:border-primary focus:ring-primary appearance-none">
                                            <option value="all">All Users</option>
                                            <option value="free">Free Tier Artists</option>
                                            <option value="pro">Pro Artists</option>
                                            <option value="labels">Record Labels</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-3.5 text-slate-400 pointer-events-none">group</span>
                                    </div>
                                </div>
                            </div>
                            {/* Rich Text Editor (Mock) */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Message Content</label>
                                <div className="rounded-lg border border-slate-300 dark:border-border-dark overflow-hidden bg-slate-50 dark:bg-input-dark">
                                    {/* Toolbar */}
                                    <div className="flex items-center gap-1 p-2 border-b border-slate-300 dark:border-border-dark bg-slate-100 dark:bg-[#1a2436]">
                                        <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">format_bold</span>
                                        </button>
                                        <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">format_italic</span>
                                        </button>
                                        <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">format_underlined</span>
                                        </button>
                                        <div className="w-px h-4 bg-slate-300 dark:bg-border-dark mx-1"></div>
                                        <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">link</span>
                                        </button>
                                        <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">image</span>
                                        </button>
                                        <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">code</span>
                                        </button>
                                    </div>
                                    <textarea
                                        className="w-full bg-transparent border-none text-slate-900 dark:text-white p-4 h-32 resize-none focus:ring-0 placeholder:text-slate-400"
                                        placeholder="Type your message here..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                            {/* Delivery Methods */}
                            <div className="flex flex-col gap-3">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Delivery Method</label>
                                <div className="flex flex-wrap gap-4">
                                    <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-input-dark cursor-pointer hover:border-primary dark:hover:border-primary transition-colors flex-1 min-w-[140px]">
                                        <input defaultChecked className="form-checkbox size-5 rounded text-primary border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-offset-0 focus:ring-primary" type="checkbox" />
                                        <span className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">In-App Banner</span>
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-input-dark cursor-pointer hover:border-primary dark:hover:border-primary transition-colors flex-1 min-w-[140px]">
                                        <input defaultChecked className="form-checkbox size-5 rounded text-primary border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-offset-0 focus:ring-primary" type="checkbox" />
                                        <span className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">Email</span>
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-input-dark cursor-pointer hover:border-primary dark:hover:border-primary transition-colors flex-1 min-w-[140px]">
                                        <input className="form-checkbox size-5 rounded text-primary border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-offset-0 focus:ring-primary" type="checkbox" />
                                        <span className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">Push Notification</span>
                                        </span>
                                    </label>
                                </div>
                            </div>
                            {/* Scheduling & Actions */}
                            <div className="pt-4 border-t border-slate-200 dark:border-border-dark flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Schedule:</span>
                                    <div className="flex items-center bg-slate-100 dark:bg-input-dark rounded-lg p-1 border border-slate-200 dark:border-border-dark">
                                        <button className="px-3 py-1.5 text-xs font-bold rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm transition-all">Now</button>
                                        <button className="px-3 py-1.5 text-xs font-medium rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all">Later</button>
                                    </div>
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                    <button className="flex-1 md:flex-none px-5 py-2.5 rounded-lg border border-slate-200 dark:border-border-dark text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        Save Draft
                                    </button>
                                    <button className="flex-1 md:flex-none px-5 py-2.5 rounded-lg bg-primary text-white font-bold text-sm shadow-lg shadow-primary/30 hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">send</span>
                                        Broadcast Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Broadcasts Table */}
                    <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-border-dark overflow-hidden flex-1">
                        <div className="p-6 border-b border-slate-200 dark:border-border-dark flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sent Announcements</h2>
                            <div className="flex gap-2">
                                <input className="bg-slate-50 dark:bg-input-dark border border-slate-200 dark:border-border-dark rounded-lg px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:ring-primary focus:border-primary w-48" placeholder="Search history..." type="text" />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                <thead className="bg-slate-50 dark:bg-[#1a2436] text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Title</th>
                                        <th className="px-6 py-4">Audience</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Open Rate</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-border-dark">
                                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                                <span className="size-1.5 rounded-full bg-emerald-500"></span> Delivered
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">New Analytics Dashboard Live</td>
                                        <td className="px-6 py-4">All Users</td>
                                        <td className="px-6 py-4">Oct 24, 2023</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-slate-900 dark:text-white min-w-[3ch]">68%</span>
                                                <div className="h-1.5 w-24 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full" style={{ width: '68%' }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-slate-400 hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Preview & Info */}
                <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-8">
                    {/* Live Preview Device */}
                    <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-border-dark overflow-hidden flex flex-col h-full max-h-[700px] sticky top-28">
                        <div className="p-4 border-b border-slate-200 dark:border-border-dark flex justify-between items-center bg-slate-50 dark:bg-[#1a2436]">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                                Live Preview
                            </h2>
                            <div className="flex gap-2">
                                <button className="p-1.5 rounded bg-white dark:bg-card-dark shadow-sm text-primary">
                                    <span className="material-symbols-outlined text-[18px]">desktop_windows</span>
                                </button>
                                <button className="p-1.5 rounded hover:bg-white dark:hover:bg-card-dark text-slate-400 transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">smartphone</span>
                                </button>
                            </div>
                        </div>
                        {/* Mock Browser Window */}
                        <div className="flex-1 bg-slate-200 dark:bg-[#111827] p-6 flex flex-col items-center justify-center relative overflow-hidden">
                            {/* Abstract Background for Device Screen */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                            {/* Simulated App Interface */}
                            <div className="w-full max-w-sm bg-background-light dark:bg-[#0f172a] rounded-xl shadow-2xl border border-slate-300 dark:border-slate-700 overflow-hidden flex flex-col h-[500px]">
                                {/* App Header Mock */}
                                <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-white dark:bg-[#1e293b]">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                    <div className="w-24 h-3 rounded bg-slate-200 dark:bg-slate-700"></div>
                                    <div className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700"></div>
                                </div>
                                {/* App Content Mock */}
                                <div className="p-4 space-y-4 flex-1 overflow-y-auto relative">
                                    {/* The Banner Notification (Preview Target) */}
                                    <div className={`animate-pulse absolute top-4 left-4 right-4 z-10 border-l-4 p-4 rounded-r shadow-lg backdrop-blur-sm ${getNotificationStyles(type)}`}>
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <span className={`material-symbols-outlined ${getIconColor(type)}`}>{getIcon(type)}</span>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className={`text-sm font-bold ${type === 'info' ? 'text-blue-800 dark:text-blue-300' : ''}`}>{title}</h3>
                                                <div className={`mt-1 text-xs ${type === 'info' ? 'text-blue-700 dark:text-blue-200' : ''}`}>
                                                    <p>{content}</p>
                                                </div>
                                                <div className="mt-2">
                                                    <a href="#" className={`text-xs font-bold underline ${type === 'info' ? 'text-blue-800 dark:text-blue-300' : ''}`}>Read more</a>
                                                </div>
                                            </div>
                                            <div className="ml-auto pl-3">
                                                <div className="-mx-1.5 -my-1.5">
                                                    <button type="button" className={`inline-flex rounded-md p-1.5 ${type === 'info' ? 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600' : ''}`}>
                                                        <span className="material-symbols-outlined text-[16px]">close</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Blurred Background Content */}
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
                        <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
                            <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase mb-1">Total Sent</div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">1,204</div>
                            <div className="text-emerald-500 text-xs font-bold mt-1 flex items-center">
                                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                                +12% this month
                            </div>
                        </div>
                        <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
                            <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase mb-1">Avg Open Rate</div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">48.2%</div>
                            <div className="text-slate-400 text-xs mt-1">
                                Above industry avg.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Announcements;
