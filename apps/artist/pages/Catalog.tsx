import React, { useEffect, useState } from 'react';
import api from '../../../services/apiClient';

interface Release {
  id: string;
  title: string;
  coverUrl: string;
  status: string;
  releaseDate: string;
  streams: number;
  revenue: number;
}

const Catalog: React.FC = () => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const data = await api.get('/api/artist/releases');
        if (Array.isArray(data) && data.length > 0) {
          setReleases(data);
        } else {
          // Fallback to mock data if API returns empty or fails gracefully inside api client
          setReleases(getMockData());
        }
      } catch (error) {
        // Fallback to mock data on error
        setReleases(getMockData());
      } finally {
        setLoading(false);
      }
    };

    fetchReleases();
  }, []);

  const getMockData = (): Release[] => [
    { id: '1', title: 'Track Title 1', coverUrl: 'https://picsum.photos/200/200?random=1', status: 'Live', releaseDate: 'Oct 15, 2023', streams: 124500, revenue: 450.25 },
    { id: '2', title: 'Track Title 2', coverUrl: 'https://picsum.photos/200/200?random=2', status: 'Pending', releaseDate: 'Oct 22, 2023', streams: 0, revenue: 0 },
    { id: '3', title: 'Track Title 3', coverUrl: 'https://picsum.photos/200/200?random=3', status: 'Live', releaseDate: 'Sep 10, 2023', streams: 89000, revenue: 310.00 },
  ];

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading catalog...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-8">My Music Catalog</h1>
      <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-dark-800 text-xs font-bold text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-4">Release</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Streams</th>
              <th className="px-6 py-4">Revenue</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-dark-800">
            {releases.map((release) => (
              <tr key={release.id} className="hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={release.coverUrl} className="size-10 rounded shadow-sm" alt="Cover" />
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{release.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    release.status.toLowerCase() === 'live' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                  }`}>
                    {release.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{release.releaseDate}</td>
                <td className="px-6 py-4 text-sm font-mono">{release.streams.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm font-mono">${release.revenue.toFixed(2)}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-brand-500"><span className="material-symbols-outlined">more_vert</span></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Catalog;
