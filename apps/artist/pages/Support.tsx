import React, { useState, useEffect, useCallback } from 'react';
import { ArtistService } from '../../../src/services/api';
import type { SupportTicket } from '../../../src/types/api';

const Support: React.FC = () => {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loadingTickets, setLoadingTickets] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState('');
    const [toastIsError, setToastIsError] = useState(false);

    const [formData, setFormData] = useState({
        subject: '',
        category: '',
        message: ''
    });

    const fetchTickets = useCallback(async () => {
        try {
            const res = await ArtistService.getTickets();
            setTickets(res?.tickets || []);
        } catch (error) {
            console.error('Failed to fetch tickets', error);
        } finally {
            setLoadingTickets(false);
        }
    }, []);

    useEffect(() => { fetchTickets(); }, [fetchTickets]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await ArtistService.createTicket(
                formData.subject || formData.category,
                formData.category,
                formData.message
            );
            if (!response?.ticket?.id) {
                throw new Error('The ticket could not be created. Please try again.');
            }
            // Show it immediately - don't make the user wait on a reload to
            // see what they just submitted.
            setTickets((prev) => [response.ticket, ...prev]);
            setToastIsError(false);
            setToast('Ticket submitted successfully');
            setFormData({ subject: '', category: '', message: '' });
            // Silent background sync to reconcile with the real server state
            // (ordering, any server-side fields) without blocking the UI.
            fetchTickets();
        } catch (error: any) {
            setToastIsError(true);
            setToast(error.message || 'Failed to submit ticket');
        } finally {
            setSubmitting(false);
            setTimeout(() => setToast(''), 3000);
        }
    };

    return (
        <div className="flex-1 px-4 md:px-10 lg:px-20 py-8 max-w-[1600px] w-full mx-auto font-display text-slate-900 dark:text-white">
            {toast && (
                <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3">
                    <span className={`material-symbols-outlined ${toastIsError ? 'text-red-400' : 'text-emerald-400'}`}>{toastIsError ? 'error' : 'info'}</span>
                    <p className="font-bold">{toast}</p>
                </div>
            )}
            <header className="mb-10 text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full text-primary mb-4">
                    <span className="material-symbols-outlined text-3xl">support_agent</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight mb-2">How can we help?</h1>
                <p className="text-slate-500 dark:text-slate-400">Get in touch with our team about releases, royalties, or your account.</p>
            </header>

            <div className="max-w-4xl mx-auto space-y-12">
                {/* Common Topics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: 'payments', title: 'Royalties & Payments', desc: 'Understanding your monthly statement.' },
                        { icon: 'graphic_eq', title: 'Distribution', desc: 'Issues with Spotify, Apple Music, etc.' },
                        { icon: 'manage_accounts', title: 'Account Issues', desc: 'Login, 2FA, and profile settings.' }
                    ].map((topic, i) => (
                        <div key={i} className="bg-white dark:bg-card-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="bg-slate-100 dark:bg-slate-800 size-12 rounded-xl flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined">{topic.icon}</span>
                            </div>
                            <h3 className="font-bold text-lg mb-1">{topic.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{topic.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Tickets List */}
                <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                    <h3 className="text-xl font-bold mb-6">Your Recent Tickets</h3>
                    {loadingTickets ? (
                        <div className="animate-pulse space-y-4">
                            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                        </div>
                    ) : tickets.length > 0 ? (
                        <div className="space-y-4">
                            {tickets.map(t => (
                                <div key={t.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <div>
                                        <p className="font-bold">{t.subject}</p>
                                        <p className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        t.status === 'OPEN' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                        t.status === 'IN_PROGRESS' ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400' :
                                        'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400'
                                    }`}>
                                        {t.status.replace('_', ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm">No recent tickets.</p>
                    )}
                </div>

                {/* Contact Form */}
                <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                    <h3 className="text-xl font-bold mb-6">Create a Support Ticket</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                required
                                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold"
                            >
                                <option value="">Select a category...</option>
                                <option value="Missing Royalties">Missing Royalties</option>
                                <option value="Takedown Request">Takedown Request</option>
                                <option value="Account Issues">Account Issues</option>
                                <option value="Other">Other</option>
                            </select>
                            {/* No priority field: the platform assigns priority automatically
                                from category + message content, so a self-reported "urgent"
                                can't jump the queue. */}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Subject</label>
                            <input
                                type="text"
                                required
                                value={formData.subject}
                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold"
                                placeholder="Brief summary of your issue"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Message</label>
                            <textarea
                                required
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                rows={5}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-medium resize-none"
                                placeholder="Describe your issue in detail..."
                            ></textarea>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Submit Ticket'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Support;
