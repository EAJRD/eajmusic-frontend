import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { ArtistService } from '../../../src/services/api';

interface DailyPoint {
    date: string;
    streams: number;
    revenueNet: number;
}

interface CountryPoint {
    countryCode: string;
    streams: number;
    percent: number;
}

const COUNTRY_NAMES: Record<string, { name: string; flag: string }> = {
    US: { name: 'United States', flag: '🇺🇸' },
    PR: { name: 'Puerto Rico', flag: '🇵🇷' },
    MX: { name: 'Mexico', flag: '🇲🇽' },
    ES: { name: 'Spain', flag: '🇪🇸' },
    CO: { name: 'Colombia', flag: '🇨🇴' },
    DO: { name: 'Dominican Republic', flag: '🇩🇴' },
    AR: { name: 'Argentina', flag: '🇦🇷' },
    CL: { name: 'Chile', flag: '🇨🇱' },
    PE: { name: 'Peru', flag: '🇵🇪' },
    BR: { name: 'Brazil', flag: '🇧🇷' },
    CA: { name: 'Canada', flag: '🇨🇦' },
    GB: { name: 'United Kingdom', flag: '🇬🇧' },
};

const timeRangeToPeriod: Record<string, string> = { '24h': '24h', '7d': '7d', '28d': '28d', 'YTD': 'ytd', 'All': 'all' };

const TrackAnalytics: React.FC = () => {
    const [timeRange, setTimeRange] = useState('28d');
    const [stats, setStats] = useState<any>(null);
    const [chartData, setChartData] = useState<DailyPoint[]>([]);
    const [topTracks, setTopTracks] = useState<any[]>([]);
    const [countryData, setCountryData] = useState<CountryPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setIsLoading(true);
            try {
                const [statsData, overviewData] = await Promise.all([
                    ArtistService.getStats().catch(() => null),
                    ArtistService.getAnalytics(timeRangeToPeriod[timeRange] || '28d').catch(() => null),
                ]);

                setStats(statsData || { totalStreams: 0, totalRevenue: 0, monthlyListeners: 0, followers: 0 });

                const daily = (overviewData?.dailyStats || []).map((d: any) => ({
                    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    streams: Number(d._sum?.streams || 0),
                    revenueNet: Number(d._sum?.revenueNet || 0),
                }));
                setChartData(daily);
                setTopTracks(overviewData?.topTracks || []);
                setCountryData(overviewData?.countryBreakdown || []);
            } catch (error) {
                console.error('Failed to load analytics', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, [timeRange]);

    if (isLoading || !stats) {
        return <div className="p-20 text-center"><div className="animate-spin size-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto"></div></div>;
    }

    return (
        <div className="flex-1 px-4 md:px-10 lg:px-20 py-8 max-w-[1600px] w-full mx-auto font-display text-slate-900 dark:text-white">
            {/* Header & Date Picker */}
            <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
                <div>
                    <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-3xl font-black tracking-tight mb-1">Analytics</motion.h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Real-time insights for your catalog.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    {['24h', '7d', '28d', 'YTD', 'All'].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${range === timeRange
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
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-500/10 p-3 rounded-xl text-blue-500">
                            <span className="material-symbols-outlined">graphic_eq</span>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Streams</p>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalStreams >= 1000 ? (stats.totalStreams / 1000).toFixed(1) + 'k' : stats.totalStreams}</h2>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-500">
                            <span className="material-symbols-outlined">payments</span>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Est. Revenue</p>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">${Number(stats.totalRevenue || 0).toLocaleString()}</h2>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-purple-500/10 p-3 rounded-xl text-purple-500">
                            <span className="material-symbols-outlined">groups</span>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Monthly Listeners</p>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">{((stats.monthlyListeners || 0) / 1000).toFixed(1)}k</h2>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-rose-500/10 p-3 rounded-xl text-rose-500">
                            <span className="material-symbols-outlined">favorite</span>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Followers</p>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">{((stats.followers || 0) / 1000).toFixed(1)}k</h2>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Main Graph Area */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-2 bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm min-h-[500px] flex flex-col">
                    <h3 className="text-lg font-bold mb-6">Streaming Trends</h3>

                    {chartData.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">No streaming data for this period yet.</div>
                    ) : (
                        <>
                            <div className="h-48 mb-8">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorStreams" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                        <Area type="monotone" dataKey="streams" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorStreams)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <h3 className="text-lg font-bold mb-4">Revenue Trends</h3>
                            <div className="h-40 flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                        <XAxis dataKey="date" hide />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                        <Bar dataKey="revenueNet" fill="#2FCB6F" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </>
                    )}
                </motion.div>

                {/* Top Tracks List */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl flex flex-col">
                    <h3 className="text-lg font-bold mb-6">Top Performing Tracks</h3>
                    <div className="flex-1 space-y-4 overflow-y-auto">
                        {topTracks.length === 0 && (
                            <p className="text-sm text-slate-400 text-center py-8">No streaming activity yet.</p>
                        )}
                        {topTracks.map((track, i) => (
                            <div key={track.trackId} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group">
                                <span className="font-mono text-slate-500 w-4 text-center">{i + 1}</span>
                                <div className="size-10 rounded-lg bg-slate-700 bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${track.track?.release?.coverArtUrl || 'https://placehold.co/150'}')` }}></div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate group-hover:text-brand-400 transition-colors">{track.track?.title}</p>
                                    <p className="text-xs text-slate-400 truncate">{track.track?.release?.title}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm">{(track._sum.streams >= 1000 ? (track._sum.streams / 1000).toFixed(1) + 'k' : track._sum.streams)}</p>
                                    <span className="text-[10px] text-emerald-400">${Number(track._sum.revenueNet || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Streams by Country */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">Streams by Country</h3>
                </div>
                {countryData.length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-slate-400 text-sm">No geographic breakdown available yet.</div>
                ) : (
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={countryData} margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="countryCode" axisLine={false} tickLine={false} tick={({ x, y, payload }) => {
                                    const info = COUNTRY_NAMES[payload.value] || { name: payload.value, flag: '🌍' };
                                    return (
                                        <g transform={`translate(${x},${y})`}>
                                            <text x={0} y={0} dy={4} textAnchor="end" fill="#64748b" fontSize="12" fontWeight="bold">
                                                {info.flag} {info.name}
                                            </text>
                                        </g>
                                    );
                                }} width={160} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    formatter={(value: number) => [`${value}%`, 'Streams']}
                                />
                                <Bar dataKey="percent" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                                    {countryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index < 3 ? '#8b5cf6' : '#cbd5e1'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default TrackAnalytics;
