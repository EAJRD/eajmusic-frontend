import React, { useState } from 'react';

const Wallet: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'balance' | 'payouts' | 'tax'>('balance');

    const transactions = [
        { id: 'TX-9821', date: 'Oct 01, 2023', type: 'Payout', amount: -1250.00, status: 'Completed', method: 'PayPal' },
        { id: 'TX-9750', date: 'Sep 15, 2023', type: 'Royalty Earnings', amount: 450.25, status: 'Cleared', source: 'Spotify' },
        { id: 'TX-9742', date: 'Sep 15, 2023', type: 'Royalty Earnings', amount: 320.50, status: 'Cleared', source: 'Apple Music' },
        { id: 'TX-9600', date: 'Sep 15, 2023', type: 'Royalty Earnings', amount: 89.10, status: 'Cleared', source: 'Amazon Music' },
        { id: 'TX-9555', date: 'Sep 01, 2023', type: 'Payout', amount: -600.00, status: 'Completed', method: 'Bank Transfer' },
    ];

    return (
        <div className="flex-1 px-4 md:px-10 lg:px-20 py-8 max-w-[1600px] w-full mx-auto font-display text-slate-900 dark:text-white">
            <header className="mb-8">
                <h1 className="text-3xl font-black tracking-tight mb-2">Wallet & Payouts</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage your earnings and withdrawal methods.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* Main Balance Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-brand-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden flex flex-col justify-between min-h-[240px]">
                    <div className="absolute top-0 right-0 p-40 bg-white opacity-5 rounded-full -mr-20 -mt-20 blur-3xl"></div>

                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <p className="text-brand-100 font-bold uppercase tracking-widest text-xs mb-2">Available Balance</p>
                            <h2 className="text-5xl font-black tracking-tight">$3,240.50</h2>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                            <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                        </div>
                    </div>

                    <div className="relative z-10 flex gap-4 mt-8">
                        <button className="flex-1 bg-white text-brand-600 font-bold py-3 rounded-xl shadow-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-lg">payments</span>
                            Request Payout
                        </button>
                        <button className="px-6 py-3 bg-brand-700/50 hover:bg-brand-700/70 border border-white/10 text-white font-bold rounded-xl transition-colors backdrop-blur-md">
                            Add Method
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500">
                                <span className="material-symbols-outlined text-xl">trending_up</span>
                            </div>
                            <span className="text-xs font-bold text-slate-400">This Month</span>
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">$850.25</p>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Pending Clearance</p>
                    </div>
                    <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500">
                                <span className="material-symbols-outlined text-xl">savings</span>
                            </div>
                            <span className="text-xs font-bold text-slate-400">Lifetime</span>
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">$12,450.00</p>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Total Earnings</p>
                    </div>
                </div>
            </div>

            {/* Transactions Section */}
            <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Transaction History</h3>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Export CSV</button>
                        <button className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Filter</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Transaction ID</th>
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
                                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">{tx.id}</td>
                                    <td className="px-6 py-4 text-sm font-medium">{tx.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${tx.type === 'Payout' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'}`}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{tx.method || tx.source}</td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                                            <span className="size-1.5 rounded-full bg-emerald-500"></span> {tx.status}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 text-right font-mono text-sm font-bold ${tx.amount < 0 ? 'text-slate-900 dark:text-white' : 'text-emerald-500'}`}>
                                        {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-center">
                    <button className="text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Load More</button>
                </div>
            </div>
        </div>
    );
};

export default Wallet;
