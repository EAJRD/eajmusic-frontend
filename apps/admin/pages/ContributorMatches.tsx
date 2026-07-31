import React, { useState, useEffect, useCallback } from 'react';
import { AdminService } from '../../../src/services/api';

const getInitials = (name: string) => (name || '?').split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

const ContributorMatches: React.FC = () => {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mutatingId, setMutatingId] = useState<string | null>(null);

    const fetchMatches = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await AdminService.getContributorMatches();
            setMatches(res?.matches || []);
        } catch (err: any) {
            setError(err.message || 'Failed to load contributor matches.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMatches(); }, [fetchMatches]);

    const handleResolve = async (id: string, action: 'APPROVE' | 'REJECT') => {
        setMutatingId(id);
        setError('');
        try {
            await AdminService.resolveContributorMatch(id, action);
            setMatches((prev) => prev.filter((m) => m.id !== id));
        } catch (err: any) {
            setError(err.message || 'Failed to resolve match.');
        } finally {
            setMutatingId(null);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <header>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Contributor Matches</h1>
                <p className="text-slate-500 dark:text-slate-400 font-bold">
                    Un artista se registró con un nombre que coincide con créditos existentes en el catálogo. Confirma para vincular ese historial a su cuenta.
                </p>
            </header>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={fetchMatches} className="font-bold underline">Retry</button>
                </div>
            )}

            <div className="space-y-4">
                {loading && (
                    <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-10 text-center text-slate-400">
                        Loading...
                    </div>
                )}

                {!loading && matches.length === 0 && (
                    <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 p-10 text-center text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">verified_user</span>
                        <p>No hay coincidencias pendientes.</p>
                    </div>
                )}

                {!loading && matches.map((m) => (
                    <div key={m.id} className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 shadow-sm p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                {m.matchedUser?.avatarUrl ? (
                                    <img src={m.matchedUser.avatarUrl} alt={m.matchedUser.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                        {getInitials(m.matchedUser?.name || '?')}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{m.matchedUser?.name} <span className="text-slate-400 font-normal">({m.matchedUser?.email})</span></p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Coincide con créditos de <span className="font-bold">"{m.contributorName}"</span> en {m.trackIds?.length || 0} track{m.trackIds?.length !== 1 ? 's' : ''}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">{new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={() => handleResolve(m.id, 'REJECT')}
                                    disabled={mutatingId === m.id}
                                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Rechazar
                                </button>
                                <button
                                    onClick={() => handleResolve(m.id, 'APPROVE')}
                                    disabled={mutatingId === m.id}
                                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ContributorMatches;
