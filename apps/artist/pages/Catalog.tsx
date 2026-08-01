import React, { useEffect, useState, useCallback } from 'react';
import { ArtistService } from '../../../src/services/api';

interface CatalogProps {
  onSelectRelease?: (releaseId: string) => void;
}

const STATUS_META: Record<string, { label: string; dot: string }> = {
  LIVE: { label: 'Live', dot: 'bg-sonic-primary' },
  PENDING: { label: 'Pending', dot: 'bg-sonic-text-dim' },
  APPROVED: { label: 'Approved', dot: 'bg-sonic-text-dim' },
  DRAFT: { label: 'Draft', dot: 'bg-sonic-border' },
  REJECTED: { label: 'Rejected', dot: 'bg-sonic-error' },
  TAKEDOWN: { label: 'Takedown', dot: 'bg-sonic-error' },
};

type FilterKey = 'ALL' | 'LIVE' | 'REVIEW' | 'DRAFT';

const FILTERS: { key: FilterKey; label: string; dot?: string }[] = [
  { key: 'ALL', label: 'All Releases' },
  { key: 'LIVE', label: 'Live', dot: 'bg-sonic-primary' },
  { key: 'REVIEW', label: 'In Review', dot: 'bg-sonic-text-dim' },
  { key: 'DRAFT', label: 'Draft', dot: 'bg-sonic-border' },
];

const matchesFilter = (status: string, filter: FilterKey): boolean => {
  if (filter === 'ALL') return true;
  if (filter === 'LIVE') return status === 'LIVE';
  if (filter === 'REVIEW') return status === 'PENDING' || status === 'APPROVED';
  if (filter === 'DRAFT') return status === 'DRAFT';
  return true;
};

const Catalog: React.FC<CatalogProps> = ({ onSelectRelease }) => {
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterKey>('ALL');

  const fetchReleases = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await ArtistService.getReleases();
      // Backend's PaginatedResponse<Release> shape is { data, total, page,
      // limit, totalPages } - not { releases } - this was silently keeping
      // the catalog empty regardless of how many releases actually existed.
      setReleases(res?.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load your catalog.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReleases(); }, [fetchReleases]);

  const filteredReleases = releases.filter((release) => matchesFilter(release.status, filter));

  if (loading) {
    return (
      <div className="min-h-screen bg-sonic-bg flex items-center justify-center">
        <p className="font-mono text-sonic-text-dim text-xs tracking-[0.05em] uppercase">Loading catalog…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sonic-bg font-sonic">
      <div className="p-6 md:p-16 max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 bg-sonic-error/10 border border-sonic-error/40 text-sonic-error px-4 py-3 rounded text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchReleases} className="font-bold underline">Retry</button>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-sonic-border pb-6">
          <div>
            <h1 className="text-2xl md:text-[32px] font-semibold text-sonic-text mb-2 tracking-tight">Your Catalog</h1>
            <p className="text-sonic-text-dim text-base">Manage your releases and track distribution status.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-full font-mono text-xs tracking-[0.05em] border transition-colors active:scale-95 flex items-center gap-2 whitespace-nowrap ${
                  filter === f.key
                    ? 'bg-sonic-card border-sonic-primary text-sonic-text'
                    : 'bg-transparent border-sonic-border text-sonic-text-dim hover:border-sonic-primary hover:text-sonic-text'
                }`}
              >
                {f.dot && <span className={`w-2 h-2 rounded-full ${f.dot}`} />}
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredReleases.map((release) => {
            const meta = STATUS_META[release.status] || STATUS_META.DRAFT;
            const isDraft = release.status === 'DRAFT';
            return (
              <div
                key={release.id}
                onClick={() => onSelectRelease?.(release.id)}
                className={`group bg-sonic-card rounded-lg border overflow-hidden transition-colors flex flex-col cursor-pointer hover:bg-sonic-elevated hover:border-sonic-primary ${
                  isDraft ? 'border-sonic-border border-dashed' : 'border-sonic-border'
                }`}
              >
                <div className="relative aspect-square overflow-hidden bg-sonic-surface flex items-center justify-center">
                  {release.coverArtUrl ? (
                    <img
                      src={release.coverArtUrl}
                      alt={release.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[64px] text-sonic-border">image</span>
                  )}
                  <div className="absolute top-3 right-3 bg-sonic-bg/80 backdrop-blur-sm px-3 py-1 rounded border border-sonic-border flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                    <span className="font-mono text-[11px] tracking-[0.05em] text-sonic-text uppercase">{meta.label}</span>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className={`text-xl font-medium mb-1 truncate ${isDraft ? 'text-sonic-text-dim italic' : 'text-sonic-text'}`}>
                      {release.title || 'Untitled Release'}
                    </h3>
                    <p className="text-sonic-text-dim text-base truncate">{release.releaseType}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-sonic-border flex justify-between items-center">
                    <span className="font-mono text-xs tracking-[0.05em] text-sonic-text-dim">
                      {release.releaseDate
                        ? new Date(release.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </span>
                    <span className="font-mono text-xs tracking-[0.05em] text-sonic-text-dim">
                      {release.tracks?.length ?? 0} tracks
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredReleases.length === 0 && (
          <div className="p-16 text-center text-sonic-text-dim">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50 block">library_music</span>
            <p className="text-sm">
              {releases.length === 0 ? "You haven't uploaded any releases yet." : 'No releases match this filter.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
