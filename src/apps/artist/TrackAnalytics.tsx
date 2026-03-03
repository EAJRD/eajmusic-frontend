import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ArtistService } from '../../services/api';

// ===========================================
// TYPES
// ===========================================
interface AnalyticsData {
  period: string;
  dailyStats: Array<{
    date: string;
    _sum: {
      streams: number;
      saves: number;
      playlistAdds: number;
      revenueNet: number;
    };
  }>;
  topTracks: Array<{
    trackId: string;
    _sum: { streams: number; revenueNet: number };
    track?: {
      id: string;
      title: string;
      release: { title: string; coverArtUrl: string };
    };
  }>;
  totals: {
    streams: number;
    revenue: number;
    saves: number;
    playlistAdds: number;
  };
}

// ===========================================
// MOCK DATA (for demo when API not available)
// ===========================================
const generateMockData = (period: string) => {
  const days = period === '7d' ? 7 : period === '28d' ? 28 : period === 'ytd' ? 365 : 90;
  const today = new Date();
  const dailyStats = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Create realistic looking patterns
    const dayOfWeek = date.getDay();
    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.3 : 1;
    const trendMultiplier = 1 + (days - i) * 0.005; // Slight upward trend

    const baseStreams = 15000 + Math.random() * 10000;
    const streams = Math.floor(baseStreams * weekendMultiplier * trendMultiplier);

    dailyStats.push({
      date: date.toISOString().split('T')[0],
      _sum: {
        streams,
        saves: Math.floor(streams * 0.02 + Math.random() * 50),
        playlistAdds: Math.floor(streams * 0.005 + Math.random() * 20),
        revenueNet: parseFloat((streams * 0.004).toFixed(2)),
      },
    });
  }

  const totalStreams = dailyStats.reduce((sum, d) => sum + d._sum.streams, 0);

  return {
    period,
    dailyStats,
    topTracks: [
      { trackId: '1', _sum: { streams: Math.floor(totalStreams * 0.25), revenueNet: totalStreams * 0.25 * 0.004 }, track: { id: '1', title: 'Midnight Dreams', release: { title: 'Neon Nights', coverArtUrl: 'https://picsum.photos/200/200?random=1' } } },
      { trackId: '2', _sum: { streams: Math.floor(totalStreams * 0.18), revenueNet: totalStreams * 0.18 * 0.004 }, track: { id: '2', title: 'City Lights', release: { title: 'Neon Nights', coverArtUrl: 'https://picsum.photos/200/200?random=2' } } },
      { trackId: '3', _sum: { streams: Math.floor(totalStreams * 0.15), revenueNet: totalStreams * 0.15 * 0.004 }, track: { id: '3', title: 'Electric Feel', release: { title: 'Voltage', coverArtUrl: 'https://picsum.photos/200/200?random=3' } } },
      { trackId: '4', _sum: { streams: Math.floor(totalStreams * 0.12), revenueNet: totalStreams * 0.12 * 0.004 }, track: { id: '4', title: 'Summer Vibes', release: { title: 'Seasonal', coverArtUrl: 'https://picsum.photos/200/200?random=4' } } },
      { trackId: '5', _sum: { streams: Math.floor(totalStreams * 0.09), revenueNet: totalStreams * 0.09 * 0.004 }, track: { id: '5', title: 'Rain On Me', release: { title: 'Elements', coverArtUrl: 'https://picsum.photos/200/200?random=5' } } },
    ],
    totals: {
      streams: totalStreams,
      revenue: parseFloat((totalStreams * 0.004).toFixed(2)),
      saves: dailyStats.reduce((sum, d) => sum + d._sum.saves, 0),
      playlistAdds: dailyStats.reduce((sum, d) => sum + d._sum.playlistAdds, 0),
    },
  };
};

const PLATFORM_BREAKDOWN = [
  { name: 'Spotify', value: 45, color: '#1DB954' },
  { name: 'Apple Music', value: 25, color: '#FA243C' },
  { name: 'YouTube Music', value: 15, color: '#FF0000' },
  { name: 'Amazon Music', value: 8, color: '#FF9900' },
  { name: 'Others', value: 7, color: '#6366F1' },
];

const COUNTRY_DATA = [
  { country: 'United States', code: 'US', streams: 245000, flag: '🇺🇸' },
  { country: 'United Kingdom', code: 'GB', streams: 89000, flag: '🇬🇧' },
  { country: 'Germany', code: 'DE', streams: 67000, flag: '🇩🇪' },
  { country: 'Mexico', code: 'MX', streams: 54000, flag: '🇲🇽' },
  { country: 'Brazil', code: 'BR', streams: 48000, flag: '🇧🇷' },
  { country: 'Canada', code: 'CA', streams: 42000, flag: '🇨🇦' },
  { country: 'France', code: 'FR', streams: 38000, flag: '🇫🇷' },
  { country: 'Spain', code: 'ES', streams: 35000, flag: '🇪🇸' },
];

// ===========================================
// UTILITY FUNCTIONS
// ===========================================
const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatCurrency = (num: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const formatDate = (dateStr: string, period: string): string => {
  const date = new Date(dateStr);
  if (period === '7d' || period === '28d') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { month: 'short' });
};

// ===========================================
// CUSTOM TOOLTIP
// ===========================================
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl p-4 shadow-xl">
      <p className="text-sm text-slate-400 mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-white font-bold">
            {entry.name}: {entry.name === 'Revenue' ? formatCurrency(entry.value) : formatNumber(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

// ===========================================
// STAT CARD COMPONENT
// ===========================================
const StatCard: React.FC<{
  label: string;
  value: string;
  subValue?: string;
  change?: string;
  icon: string;
  color: string;
  isPositive?: boolean;
}> = ({ label, value, subValue, change, icon, color, isPositive = true }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-dark-800/50 backdrop-blur-xl border border-dark-700 rounded-2xl p-6 relative overflow-hidden group"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />

    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <span className="material-symbols-outlined text-white">{icon}</span>
      </div>
      {change && (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
          isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
        }`}>
          <span className="material-symbols-outlined text-sm">
            {isPositive ? 'trending_up' : 'trending_down'}
          </span>
          {change}
        </div>
      )}
    </div>

    <p className="text-sm text-slate-400 mb-1">{label}</p>
    <p className="text-3xl font-black text-white">{value}</p>
    {subValue && <p className="text-sm text-slate-500 mt-1">{subValue}</p>}
  </motion.div>
);

// ===========================================
// MAIN COMPONENT
// ===========================================
const TrackAnalytics: React.FC = () => {
  const [period, setPeriod] = useState<string>('28d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'streams' | 'revenue'>('streams');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await ArtistService.getAnalytics(period);
        setData(result);
      } catch (error) {
        // Use mock data if API fails
        console.log('Using mock data for analytics');
        setData(generateMockData(period) as AnalyticsData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [period]);

  // Process chart data
  const chartData = useMemo(() => {
    if (!data?.dailyStats) return [];

    return data.dailyStats.map((stat) => ({
      date: formatDate(stat.date, period),
      fullDate: stat.date,
      streams: stat._sum.streams,
      revenue: stat._sum.revenueNet,
      saves: stat._sum.saves,
      playlistAdds: stat._sum.playlistAdds,
    }));
  }, [data, period]);

  // Calculate comparison
  const comparison = useMemo(() => {
    if (!chartData.length) return { streams: 0, revenue: 0 };

    const midpoint = Math.floor(chartData.length / 2);
    const firstHalf = chartData.slice(0, midpoint);
    const secondHalf = chartData.slice(midpoint);

    const firstStreams = firstHalf.reduce((sum, d) => sum + d.streams, 0);
    const secondStreams = secondHalf.reduce((sum, d) => sum + d.streams, 0);
    const streamsChange = firstStreams ? ((secondStreams - firstStreams) / firstStreams * 100).toFixed(1) : '0';

    const firstRevenue = firstHalf.reduce((sum, d) => sum + d.revenue, 0);
    const secondRevenue = secondHalf.reduce((sum, d) => sum + d.revenue, 0);
    const revenueChange = firstRevenue ? ((secondRevenue - firstRevenue) / firstRevenue * 100).toFixed(1) : '0';

    return {
      streams: parseFloat(streamsChange),
      revenue: parseFloat(revenueChange),
    };
  }, [chartData]);

  const periods = [
    { value: '7d', label: '7 days' },
    { value: '28d', label: '28 days' },
    { value: 'ytd', label: 'This year' },
    { value: 'all', label: 'All time' },
  ];

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-1">Analytics</h1>
          <p className="text-slate-400 text-sm">Track your performance across all platforms</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 bg-dark-800 rounded-xl p-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                period === p.value
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Streams"
          value={formatNumber(data?.totals.streams || 0)}
          change={`${comparison.streams > 0 ? '+' : ''}${comparison.streams}%`}
          icon="graphic_eq"
          color="bg-brand-500"
          isPositive={comparison.streams >= 0}
        />
        <StatCard
          label="Revenue"
          value={formatCurrency(data?.totals.revenue || 0)}
          change={`${comparison.revenue > 0 ? '+' : ''}${comparison.revenue}%`}
          icon="payments"
          color="bg-emerald-500"
          isPositive={comparison.revenue >= 0}
        />
        <StatCard
          label="Saves"
          value={formatNumber(data?.totals.saves || 0)}
          subValue="Library additions"
          icon="favorite"
          color="bg-rose-500"
        />
        <StatCard
          label="Playlist Adds"
          value={formatNumber(data?.totals.playlistAdds || 0)}
          subValue="This period"
          icon="queue_music"
          color="bg-purple-500"
        />
      </div>

      {/* Main Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dark-800/50 backdrop-blur-xl border border-dark-700 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Performance Overview</h2>
          <div className="flex gap-2">
            {(['streams', 'revenue'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setActiveChart(type)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeChart === type
                    ? 'bg-brand-500/20 text-brand-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type === 'streams' ? 'Streams' : 'Revenue'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[300px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="streamsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => activeChart === 'revenue' ? `$${formatNumber(value)}` : formatNumber(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <AnimatePresence mode="wait">
                {activeChart === 'streams' ? (
                  <Area
                    key="streams"
                    type="monotone"
                    dataKey="streams"
                    name="Streams"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#streamsGradient)"
                  />
                ) : (
                  <Area
                    key="revenue"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#10B981"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                  />
                )}
              </AnimatePresence>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tracks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-800/50 backdrop-blur-xl border border-dark-700 rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-4">Top Tracks</h2>
          <div className="space-y-3">
            {data?.topTracks.slice(0, 5).map((track, index) => (
              <div
                key={track.trackId}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark-700/50 transition-colors group cursor-pointer"
              >
                <span className="w-6 text-center text-slate-500 font-bold">{index + 1}</span>
                <div className="relative">
                  <img
                    src={track.track?.release.coverArtUrl || `https://picsum.photos/200/200?random=${index}`}
                    alt={track.track?.title || 'Track'}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-white">play_arrow</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{track.track?.title || 'Unknown Track'}</p>
                  <p className="text-sm text-slate-400 truncate">{track.track?.release.title || 'Unknown Release'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{formatNumber(track._sum.streams)}</p>
                  <p className="text-xs text-slate-500">streams</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Platform Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-800/50 backdrop-blur-xl border border-dark-700 rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-4">Platform Breakdown</h2>
          <div className="flex items-center justify-center">
            <div className="w-[200px] h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PLATFORM_BREAKDOWN}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {PLATFORM_BREAKDOWN.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {PLATFORM_BREAKDOWN.map((platform) => (
              <div key={platform.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: platform.color }}
                  />
                  <span className="text-sm text-slate-300">{platform.name}</span>
                </div>
                <span className="text-sm font-bold text-white">{platform.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Countries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-dark-800/50 backdrop-blur-xl border border-dark-700 rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-4">Top Countries</h2>
          <div className="space-y-3">
            {COUNTRY_DATA.map((country, index) => (
              <div key={country.code} className="flex items-center gap-4">
                <span className="w-6 text-center text-slate-500 font-bold">{index + 1}</span>
                <span className="text-2xl">{country.flag}</span>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">{country.country}</p>
                  <div className="mt-1 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(country.streams / COUNTRY_DATA[0].streams) * 100}%` }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      className="h-full bg-brand-500 rounded-full"
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-white">{formatNumber(country.streams)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Daily Pattern */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-dark-800/50 backdrop-blur-xl border border-dark-700 rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-4">Streams by Day</h2>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { day: 'Mon', streams: 12500 },
                { day: 'Tue', streams: 14200 },
                { day: 'Wed', streams: 13800 },
                { day: 'Thu', streams: 15100 },
                { day: 'Fri', streams: 18500 },
                { day: 'Sat', streams: 22000 },
                { day: 'Sun', streams: 20500 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatNumber}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="streams"
                  name="Streams"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Engagement Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-br from-brand-600/20 to-purple-600/20 border border-brand-500/20 rounded-2xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-brand-500/20 rounded-xl">
            <span className="material-symbols-outlined text-2xl text-brand-400">lightbulb</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Insights & Recommendations</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-sm mt-0.5">check_circle</span>
                Your streams increased by {comparison.streams > 0 ? '+' : ''}{comparison.streams}% compared to the previous period
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-brand-400 text-sm mt-0.5">trending_up</span>
                Peak listening times are Friday and Saturday evenings - consider releasing new music on Fridays
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-400 text-sm mt-0.5">tips_and_updates</span>
                Your top market is the United States. Consider focusing your marketing efforts there
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TrackAnalytics;
