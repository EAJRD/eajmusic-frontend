import React, { useEffect, useState } from 'react';
import { ArtistService } from '../../services/mockBackend';
import { Release, ArtistStats, Report } from '../../types';
import { 
  Logo, 
  ChartIcon, 
  MusicIcon, 
  UploadIcon, 
  SettingsIcon,
  WalletIcon,
  DocumentIcon
} from '../../components/Icons';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Mock data for chart
const CHART_DATA = [
  { name: 'Jan', streams: 4000 },
  { name: 'Feb', streams: 3000 },
  { name: 'Mar', streams: 2000 },
  { name: 'Apr', streams: 2780 },
  { name: 'May', streams: 1890 },
  { name: 'Jun', streams: 2390 },
  { name: 'Jul', streams: 3490 },
];

type ArtistView = 'overview' | 'music' | 'earnings' | 'settings';

const ArtistDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<ArtistView>('overview');
  const [stats, setStats] = useState<ArtistStats | null>(null);
  const [releases, setReleases] = useState<Release[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [statsData, releasesData, reportsData] = await Promise.all([
        ArtistService.getStats(),
        ArtistService.getReleases(),
        ArtistService.getReports()
      ]);
      setStats(statsData);
      setReleases(releasesData);
      setReports(reportsData);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="h-screen bg-dark-950 flex items-center justify-center text-brand-500">Loading Dashboard...</div>;
  }

  const NavItem = ({ view, icon: Icon, label }: { view: ArtistView; icon: any; label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
        currentView === view 
          ? 'bg-brand-600/10 text-brand-400 border border-brand-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
          : 'text-gray-400 hover:bg-dark-800 hover:text-white'
      }`}
    >
      <Icon className={currentView === view ? "text-brand-400" : ""} /> {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-dark-950 text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-900 border-r border-dark-800 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-dark-800 h-16">
          <Logo className="w-6 h-6 text-brand-500" />
          <span className="font-bold tracking-tight">Artist Hub</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem view="overview" icon={ChartIcon} label="Dashboard" />
          <NavItem view="music" icon={MusicIcon} label="My Music" />
          <NavItem view="earnings" icon={WalletIcon} label="Earnings" />
          <NavItem view="settings" icon={SettingsIcon} label="Settings" />
        </nav>

        <div className="p-4 border-t border-dark-800">
          <div className="flex items-center gap-3">
            <img src="https://picsum.photos/40/40" alt="Avatar" className="w-10 h-10 rounded-full border border-gray-600" />
            <div>
              <p className="text-sm font-medium text-white">Cyber Dreamer</p>
              <p className="text-xs text-gray-500">Pro Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b border-dark-800 flex items-center justify-between px-8 bg-dark-950/50 backdrop-blur sticky top-0 z-10">
          <h1 className="text-xl font-bold capitalize">{currentView}</h1>
          <button className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-all">
            <UploadIcon className="w-4 h-4" />
            New Release
          </button>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          
          {currentView === 'overview' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-dark-900 border border-dark-800 p-6 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><ChartIcon className="w-16 h-16 text-brand-500" /></div>
                  <p className="text-sm text-gray-400 font-medium">Total Streams</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats?.totalStreams.toLocaleString()}</p>
                  <span className="text-xs text-emerald-400 font-medium mt-1 inline-block">+12.5% this month</span>
                </div>
                
                <div className="bg-dark-900 border border-dark-800 p-6 rounded-xl">
                  <p className="text-sm text-gray-400 font-medium">Est. Revenue</p>
                  <p className="text-3xl font-bold text-white mt-2">${stats?.totalRevenue.toLocaleString()}</p>
                  <span className="text-xs text-emerald-400 font-medium mt-1 inline-block">Next payout: Nov 15</span>
                </div>

                <div className="bg-dark-900 border border-dark-800 p-6 rounded-xl">
                  <p className="text-sm text-gray-400 font-medium">Monthly Listeners</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats?.monthlyListeners.toLocaleString()}</p>
                </div>

                <div className="bg-dark-900 border border-dark-800 p-6 rounded-xl">
                  <p className="text-sm text-gray-400 font-medium">Followers</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats?.followers.toLocaleString()}</p>
                </div>
              </div>

              {/* Chart Section */}
              <div className="bg-dark-900 border border-dark-800 p-6 rounded-xl">
                <h2 className="text-lg font-bold mb-6">Streaming Performance</h2>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={CHART_DATA}>
                      <defs>
                        <linearGradient id="colorStreams" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                      <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} dy={10} />
                      <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} dx={-10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
                        itemStyle={{ color: '#60a5fa' }}
                      />
                      <Area type="monotone" dataKey="streams" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorStreams)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {(currentView === 'overview' || currentView === 'music') && (
            <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-dark-800 flex justify-between items-center">
                <h2 className="text-lg font-bold">Your Discography</h2>
                {currentView === 'overview' && <button onClick={() => setCurrentView('music')} className="text-sm text-brand-400 hover:text-brand-300 font-medium">View All</button>}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-dark-950/50 text-gray-400 text-xs uppercase font-medium">
                    <tr>
                      <th className="px-6 py-4">Release</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-right">Streams</th>
                      <th className="px-6 py-4 text-right">Revenue</th>
                      {currentView === 'music' && <th className="px-6 py-4 text-right">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-800">
                    {releases.map((release) => (
                      <tr key={release.id} className="hover:bg-dark-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img src={release.coverUrl} alt={release.title} className="w-12 h-12 rounded bg-dark-800 object-cover" />
                            <div>
                              <p className="font-medium text-white">{release.title}</p>
                              <p className="text-sm text-gray-500">{release.artist}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            release.status === 'Live' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            release.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-gray-700 text-gray-300 border-gray-600'
                          }`}>
                            {release.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">{release.date}</td>
                        <td className="px-6 py-4 text-right text-sm text-white font-mono">{release.streams.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-sm text-white font-mono">${release.revenue.toFixed(2)}</td>
                        {currentView === 'music' && (
                          <td className="px-6 py-4 text-right">
                             <button className="text-sm text-gray-400 hover:text-white">Edit</button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentView === 'earnings' && (
            <div className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-gradient-to-br from-brand-900 to-dark-900 border border-brand-500/30 p-6 rounded-xl">
                    <p className="text-brand-200 text-sm font-medium mb-1">Total Balance Available</p>
                    <h2 className="text-4xl font-bold text-white mb-4">$3,650.75</h2>
                    <button className="bg-white text-brand-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors">
                      Request Payout
                    </button>
                 </div>
                 <div className="bg-dark-900 border border-dark-800 p-6 rounded-xl flex flex-col justify-center">
                    <h3 className="text-lg font-bold mb-2">Payment Method</h3>
                    <div className="flex items-center gap-3 p-3 bg-dark-950 rounded-lg border border-dark-800 mb-3">
                      <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 text-xs font-bold">PP</div>
                      <div>
                        <p className="text-sm font-medium">PayPal</p>
                        <p className="text-xs text-gray-500">art***@eajmusic.com</p>
                      </div>
                    </div>
                    <button className="text-sm text-brand-400 font-medium hover:text-brand-300 self-start">Manage Methods</button>
                 </div>
               </div>

               <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
                  <div className="p-6 border-b border-dark-800">
                    <h2 className="text-lg font-bold">Statements & Reports</h2>
                    <p className="text-sm text-gray-500">Download your monthly earnings and analytics reports.</p>
                  </div>
                  <div className="divide-y divide-dark-800">
                    {reports.map((report) => (
                      <div key={report.id} className="p-4 flex items-center justify-between hover:bg-dark-800/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            report.type === 'WALLET' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                          }`}>
                            {report.type === 'WALLET' ? <WalletIcon className="w-5 h-5" /> : <DocumentIcon className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-medium text-white">{report.title}</p>
                            <p className="text-xs text-gray-500">{report.date} • Uploaded {report.createdAt}</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 text-sm border border-dark-700 rounded-lg hover:bg-dark-800 transition-colors">
                          Download
                        </button>
                      </div>
                    ))}
                    {reports.length === 0 && (
                      <div className="p-8 text-center text-gray-500">No reports available yet.</div>
                    )}
                  </div>
               </div>
            </div>
          )}

          {currentView === 'settings' && (
            <div className="max-w-2xl mx-auto bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
               <div className="p-6 border-b border-dark-800">
                 <h2 className="text-lg font-bold">Artist Profile</h2>
               </div>
               <div className="p-6 space-y-6">
                 <div className="flex items-center gap-6">
                   <img src="https://picsum.photos/100/100?random=10" className="w-24 h-24 rounded-full border-4 border-dark-800" alt="Profile" />
                   <div>
                     <button className="bg-dark-800 hover:bg-dark-700 text-white px-4 py-2 rounded-md text-sm font-medium border border-dark-700">Change Avatar</button>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-400">Artist Name</label>
                     <input type="text" defaultValue="Cyber Dreamer" className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-2 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-400">Email Address</label>
                     <input type="email" defaultValue="artist@eajmusic.com" className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-2 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all" />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-400">Bio</label>
                   <textarea rows={4} className="w-full bg-dark-950 border border-dark-700 rounded-lg px-4 py-2 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all" defaultValue="Creating electronic soundscapes from the future."></textarea>
                 </div>

                 <div className="pt-4 border-t border-dark-800 flex justify-end">
                   <button className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">Save Changes</button>
                 </div>
               </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default ArtistDashboard;