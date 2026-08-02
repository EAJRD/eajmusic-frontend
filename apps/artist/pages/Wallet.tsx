import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArtistService, api } from '../../../src/services/api';

const money = (value: unknown): number => {
    const n = typeof value === 'string' ? parseFloat(value) : Number(value);
    return Number.isFinite(n) ? n : 0;
};

const METHOD_LABELS: Record<string, string> = {
    BANK_TRANSFER: 'bank_transfer',
    PAYPAL: 'paypal',
    ATH_MOVIL: 'ath_movil',
};

const Wallet: React.FC = () => {
    const [wallet, setWallet] = useState<any | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal state
    const [payoutAmount, setPayoutAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('BANK_TRANSFER');
    const [athMovilConfigured, setAthMovilConfigured] = useState(false);
    const [requesting, setRequesting] = useState(false);
    const [requestError, setRequestError] = useState('');
    const [requestSuccess, setRequestSuccess] = useState('');

    useEffect(() => {
        const fetchWalletData = async () => {
            setIsLoading(true);
            try {
                const [walletRes, txRes, athRes] = await Promise.all([
                    ArtistService.getWallet().catch(() => null),
                    api.get<any>('/artist/wallet/transactions').catch(() => null),
                    api.get<{ configured: boolean }>('/payment/ath-movil/config').catch(() => null),
                ]);

                setWallet(walletRes || { availableBalance: 0, pendingBalance: 0, lifetimeEarnings: 0 });
                setTransactions(txRes?.transactions || []);
                setAthMovilConfigured(!!athRes?.configured);
            } catch (err: any) {
                setError(err.message || 'Failed to load wallet data.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchWalletData();
    }, []);

    const handleRequestPayout = async (e: React.FormEvent) => {
        e.preventDefault();
        setRequestError('');
        setRequesting(true);
        try {
            await ArtistService.requestPayout(Number(payoutAmount), METHOD_LABELS[selectedMethod] || selectedMethod.toLowerCase(), {});
            setRequestSuccess('Payout requested successfully!');
            setIsModalOpen(false);
            setPayoutAmount('');
            const walletRes = await ArtistService.getWallet().catch(() => null);
            if (walletRes) setWallet(walletRes);
            setTimeout(() => setRequestSuccess(''), 4000);
        } catch (err: any) {
            setRequestError(err.message || 'Failed to request payout.');
        } finally {
            setRequesting(false);
        }
    };

    if (isLoading || !wallet) {
        return <div className="p-20 text-center"><div className="animate-spin size-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto"></div></div>;
    }

    return (
        <div className="flex-1 px-4 md:px-10 lg:px-20 py-8 max-w-[1600px] w-full mx-auto font-display text-slate-900 dark:text-white">
            <header className="mb-8">
                <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-black tracking-tight mb-2">Wallet & Payouts</motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-500 dark:text-slate-400">Manage your earnings and withdrawal methods.</motion.p>
            </header>

            {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}
            {requestSuccess && (
                <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-lg text-sm">
                    {requestSuccess}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-2 bg-gradient-to-br from-brand-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden flex flex-col justify-between min-h-[240px]">
                    <div className="absolute top-0 right-0 p-40 bg-white opacity-5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <p className="text-brand-100 font-bold uppercase tracking-widest text-xs mb-2">Available Balance</p>
                            <h2 className="text-5xl font-black tracking-tight">${money(wallet.availableBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                            <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                        </div>
                    </div>

                    <div className="relative z-10 flex gap-4 mt-8">
                        <button onClick={() => setIsModalOpen(true)} className="flex-1 bg-white text-brand-600 font-bold py-3 rounded-xl shadow-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-lg">payments</span>
                            Request Payout
                        </button>
                    </div>
                </motion.div>

                <div className="space-y-4">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500">
                                <span className="material-symbols-outlined text-xl">trending_up</span>
                            </div>
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">${money(wallet.pendingBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Pending Clearance</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500">
                                <span className="material-symbols-outlined text-xl">savings</span>
                            </div>
                            <span className="text-xs font-bold text-slate-400">Lifetime</span>
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">${money(wallet.lifetimeEarnings).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Total Earnings</p>
                    </motion.div>
                </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Transaction History</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Source/Method</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {transactions.map(tx => (
                                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium">{tx.date ? new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${tx.type === 'payout' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'}`}>
                                            {tx.description || tx.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 capitalize">{tx.method || tx.source || '—'}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-emerald-500 capitalize">{tx.status}</td>
                                    <td className={`px-6 py-4 text-right font-mono text-sm font-bold ${tx.amount < 0 ? 'text-slate-900 dark:text-white' : 'text-emerald-500'}`}>
                                        {tx.amount < 0 ? '-' : '+'}${Math.abs(money(tx.amount)).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {transactions.length === 0 && (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">receipt_long</span>
                            <p>No transactions yet.</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Payout Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                <h3 className="text-xl font-bold">Request Payout</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleRequestPayout} className="p-6 space-y-6">
                                {requestError && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                                        {requestError}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Amount to Withdraw</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                        <input type="number" max={money(wallet.availableBalance)} min={0} step="0.01" value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-8 pr-4 text-lg font-bold focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none dark:text-white" />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">Available: ${money(wallet.availableBalance).toFixed(2)}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Withdrawal Method</label>
                                    <div className="space-y-2">
                                        <label className="flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <input type="radio" name="method" value="BANK_TRANSFER" checked={selectedMethod === 'BANK_TRANSFER'} onChange={() => setSelectedMethod('BANK_TRANSFER')} className="text-brand-500 focus:ring-brand-500" />
                                            <span className="ml-3 font-bold text-sm">Bank Transfer</span>
                                        </label>
                                        <label className="flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <input type="radio" name="method" value="PAYPAL" checked={selectedMethod === 'PAYPAL'} onChange={() => setSelectedMethod('PAYPAL')} className="text-brand-500 focus:ring-brand-500" />
                                            <span className="ml-3 font-bold text-sm">PayPal</span>
                                        </label>
                                        {athMovilConfigured && (
                                            <label className="flex items-center p-3 border border-[#2FCB6F]/30 bg-[#2FCB6F]/5 rounded-xl cursor-pointer hover:bg-[#2FCB6F]/10 transition-colors">
                                                <input type="radio" name="method" value="ATH_MOVIL" checked={selectedMethod === 'ATH_MOVIL'} onChange={() => setSelectedMethod('ATH_MOVIL')} className="text-[#2FCB6F] focus:ring-[#2FCB6F]" />
                                                <span className="ml-3 font-bold text-sm text-[#2FCB6F]">ATH Móvil</span>
                                            </label>
                                        )}
                                    </div>
                                </div>
                                <button type="submit" disabled={requesting} className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
                                    {requesting ? 'Submitting...' : 'Confirm Request'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Wallet;
