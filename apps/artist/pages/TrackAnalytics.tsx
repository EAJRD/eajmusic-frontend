import React, { useState } from 'react';

const TrackAnalytics: React.FC = () => {
    // Dropdown state
    const [timeRange, setTimeRange] = useState('Last 7 Days');

    return (
        <div className="flex-1 px-4 md:px-10 lg:px-20 py-8 max-w-[1600px] w-full mx-auto font-display text-slate-900 dark:text-white">
            {/* Header & Date Picker */}
            <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-1">Track Performance</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Real-time insights for your catalog.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    {['24h', '7d', '28d', 'YTD', 'All'].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range === '7d' ? 'Last 7 Days' : `Last ${range}`)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${(range === '7d' && timeRange === 'Last 7 Days') || range === timeRange
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Top Level Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Streams */}
                <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-500/10 p-3 rounded-xl text-blue-500">
                            <span className="material-symbols-outlined">graphic_eq</span>
                        </div>
                        <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                            <span className="material-symbols-outlined text-[14px]">trending_up</span> +12.5%
                        </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Streams</p>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">842.5k</h2>
                    {/* Tiny Chart Mock */}
                    <div className="absolute bottom-0 left-0 right-0 h-12 flex items-end justify-between px-6 pb-4 opacity-20">
                        {[40, 60, 45, 70, 50, 80, 65].map((h, i) => (
                            <div key={i} className="w-2 bg-blue-500 rounded-t-sm" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>

                {/* Revenue */}
                <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-500">
                            <span className="material-symbols-outlined">payments</span>
                        </div>
                        <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                            <span className="material-symbols-outlined text-[14px]">trending_up</span> +8.2%
                        </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Est. Revenue</p>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">$3,240.50</h2>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500/10">
                        <div className="h-full bg-emerald-500 w-3/4"></div>
                    </div>
                </div>

                {/* Listeners */}
                <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-purple-500/10 p-3 rounded-xl text-purple-500">
                            <span className="material-symbols-outlined">groups</span>
                        </div>
                        <span className="flex items-center text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                            <span className="material-symbols-outlined text-[14px]">remove</span> 0.0%
                        </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Monthly Listeners</p>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">125.2k</h2>
                </div>

                {/* Playlist Adds */}
                <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-rose-500/10 p-3 rounded-xl text-rose-500">
                            <span className="material-symbols-outlined">library_music</span>
                        </div>
                        <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                            <span className="material-symbols-outlined text-[14px]">trending_up</span> +24
                        </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Playlist Adds</p>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">1,842</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Main Graph Area */}
                <div className="lg:col-span-2 bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm min-h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">Streaming Trends</h3>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                <span className="size-2 rounded-full bg-blue-500"></span> Spotify
                            </span>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                <span className="size-2 rounded-full bg-rose-500"></span> Apple Music
                            </span>
                        </div>
                    </div>
                    {/* MOCK Chart Visualization */}
                    <div className="h-80 w-full flex items-end justify-between gap-1">
                        {[...Array(30)].map((_, i) => {
                            const h1 = Math.floor(Math.random() * 60) + 20;
                            const h2 = Math.floor(Math.random() * 40) + 10;
                            return (
                                <div key={i} className="flex-1 flex flex-col justify-end gap-1 h-full group relative">
                                    <div className="w-full bg-rose-500 rounded-sm opacity-80 group-hover:opacity-100 transition-opacity" style={{ height: `${h2}%` }}></div>
                                    <div className="w-full bg-blue-500 rounded-sm opacity-80 group-hover:opacity-100 transition-opacity" style={{ height: `${h1}%` }}></div>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                                        {h1 * 100} Streams
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-slate-400 font-medium">
                        <span>Oct 01</span>
                        <span>Oct 08</span>
                        <span>Oct 15</span>
                        <span>Oct 22</span>
                        <span>Oct 29</span>
                    </div>
                </div>

                {/* Top Tracks List */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl flex flex-col">
                    <h3 className="text-lg font-bold mb-6">Top Performing Tracks</h3>
                    <div className="flex-1 space-y-4 overflow-y-auto">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group">
                                <span className="font-mono text-slate-500 w-4 text-center">{i}</span>
                                <div className="size-10 rounded-lg bg-slate-700 bg-cover bg-center" style={{ backgroundImage: `url('https://picsum.photos/200/200?random=${i}')` }}></div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">Neon Nights {i}</p>
                                    <p className="text-xs text-slate-400 truncate">Cyber Dreamer</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm">{(145 - i * 12).toFixed(1)}k</p>
                                    <span className="text-[10px] text-emerald-400">+{Math.floor(Math.random() * 20)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-sm transition-colors text-white">View Full Report</button>
                </div>
            </div>

            {/* Geo Map Mock Section (Bottom) */}
            <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">Audience Location</h3>
                    <button className="text-primary text-sm font-bold hover:underline">Export CSV</button>
                </div>
                <div className="bg-slate-100 dark:bg-slate-900 rounded-xl h-64 flex items-center justify-center text-slate-400 dark:text-slate-600 font-bold text-sm tracking-widest uppercase border-2 border-dashed border-slate-200 dark:border-slate-800">
                    Interactive World Map Placeholder
                </div>
            </div>
        </div>
    );
};

export default TrackAnalytics;
