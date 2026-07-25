import React, { useEffect, useState, useCallback } from 'react';
import { ArtistService } from '../../../src/services/api';

const STATUS_STYLES: Record<string, string> = {
  LIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  APPROVED: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400',
  DRAFT: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400',
  REJECTED: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
  TAKEDOWN: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
};

const Catalog: React.FC = () => {
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReleases = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await ArtistService.getReleases();
      setReleases(res?.releases || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load your catalog.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReleases(); }, [fetchReleases]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading catalog...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-8">My Music Catalog</h1>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchReleases} className="font-bold underline">Retry</button>
        </div>
      )}

      <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-dark-800 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-dark-800 text-xs font-bold text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-4">Release</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Release Date</th>
              <th className="px-6 py-4">Tracks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-dark-800">
            {releases.map((release) => (
              <tr key={release.id} className="hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={release.coverArtUrl || 'https://placehold.co/80x80/1a1a2e/7c3aed?text=%E2%99%AA'}
                      className="size-10 rounded shadow-sm object-cover"
                      alt="Cover"
                    />
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{release.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{release.releaseType}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${STATUS_STYLES[release.status] || STATUS_STYLES.DRAFT}`}>
                    {release.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {release.releaseDate ? new Date(release.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </td>
                <td className="px-6 py-4 text-sm font-mono">{release.tracks?.length ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {releases.length === 0 && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">library_music</span>
            <p>You haven't uploaded any releases yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
