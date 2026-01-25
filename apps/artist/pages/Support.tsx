import React from 'react';

const Support: React.FC = () => {
    return (
        <div className="flex-1 px-4 md:px-10 lg:px-20 py-8 max-w-[1600px] w-full mx-auto font-display text-slate-900 dark:text-white">
            <header className="mb-10 text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full text-primary mb-4">
                    <span className="material-symbols-outlined text-3xl">support_agent</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight mb-2">How can we help?</h1>
                <p className="text-slate-500 dark:text-slate-400">Search our knowledge base or get in touch with our team.</p>
            </header>

            <div className="max-w-4xl mx-auto space-y-12">
                {/* Search Knowledge Base */}
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                    <input type="text" placeholder="Search for answers (e.g. 'Royalty Payouts', 'Metadata')" className="w-full bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-4 shadow-sm focus:ring-4 focus:ring-primary/20 transition-all font-medium text-lg" />
                </div>

                {/* Common Topics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: 'payments', title: 'Royalties & Payments', desc: 'Understanding your monthly statement.' },
                        { icon: 'graphic_eq', title: 'Distribution', desc: 'Issues with Spotify, Apple Music, etc.' },
                        { icon: 'manage_accounts', title: 'Account Issues', desc: 'Login, 2FA, and profile settings.' }
                    ].map((topic, i) => (
                        <div key={i} className="bg-white dark:bg-card-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors cursor-pointer group shadow-sm">
                            <div className="bg-slate-100 dark:bg-slate-800 size-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined">{topic.icon}</span>
                            </div>
                            <h3 className="font-bold text-lg mb-1">{topic.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{topic.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Contact Form */}
                <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                    <h3 className="text-xl font-bold mb-6">Create a Support Ticket</h3>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Subject</label>
                                <select className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold">
                                    <option>Select a topic...</option>
                                    <option>Missing Royalties</option>
                                    <option>Takedown Request</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Priority</label>
                                <select className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold">
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Message</label>
                            <textarea rows={5} className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium resize-none" placeholder="Describe your issue in detail..."></textarea>
                        </div>
                        <div className="flex justify-end">
                            <button className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-blue-600 transition-colors">Submit Ticket</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Support;
