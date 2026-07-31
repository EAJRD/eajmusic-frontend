import React, { useEffect, useState, useCallback } from 'react';
import { ArtistService } from '../../../src/services/api';
import type { Release, Track } from '../../../src/types/api';

interface ReleaseDetailProps {
  releaseId: string;
  onBack: () => void;
}

// ===========================================
// Formatting helpers
// ===========================================

const formatDuration = (durationMs: number | null): string => {
  if (durationMs === null || !Number.isFinite(durationMs) || durationMs < 0) return '--:--';
  const totalSeconds = Math.round(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const formatDate = (value: string | undefined | null): string => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const formatReleaseType = (type: Release['releaseType']): string => {
  switch (type) {
    case 'SINGLE': return 'Single';
    case 'EP': return 'EP';
    case 'ALBUM': return 'Album';
    case 'COMPILATION': return 'Compilation';
    default: return type;
  }
};

// ===========================================
// Status presentation
// ===========================================

const RELEASE_STATUS_LABELS: Record<Release['status'], string> = {
  DRAFT: 'Draft',
  PENDING: 'Under Review',
  APPROVED: 'Approved',
  LIVE: 'Live',
  REJECTED: 'Rejected',
  TAKEDOWN: 'Taken Down',
};

const RELEASE_STATUS_STYLES: Record<Release['status'], string> = {
  DRAFT: 'bg-sonic-elevated text-sonic-text-dim',
  PENDING: 'bg-sonic-primary/10 text-sonic-primary',
  APPROVED: 'bg-sonic-primary/10 text-sonic-primary',
  LIVE: 'bg-sonic-primary text-sonic-primary-ink',
  REJECTED: 'bg-sonic-error/10 text-sonic-error',
  TAKEDOWN: 'bg-sonic-error/10 text-sonic-error',
};

const TRACK_STATUS_LABELS: Record<Track['status'], string> = {
  PROCESSING: 'Processing',
  READY: 'Ready',
  ERROR: 'Error',
};

const TRACK_STATUS_STYLES: Record<Track['status'], string> = {
  PROCESSING: 'bg-sonic-elevated text-sonic-text-dim',
  READY: 'bg-sonic-primary/10 text-sonic-primary',
  ERROR: 'bg-sonic-error/10 text-sonic-error',
};

// Distribution pipeline steps, derived from Release.status — there is no
// per-DSP delivery field on the Release/Track API types, so this reflects
// the overall release lifecycle rather than fabricating per-store state.
const PIPELINE_STEPS = ['Submitted', 'Under Review', 'Delivered to Stores', 'Live'] as const;

const pipelineStepIndex = (status: Release['status']): number => {
  switch (status) {
    case 'DRAFT': return -1;
    case 'PENDING': return 0;
    case 'APPROVED': return 2;
    case 'LIVE': return 3;
    case 'REJECTED': return 0;
    case 'TAKEDOWN': return 3;
    default: return -1;
  }
};

const isPipelineError = (status: Release['status']): boolean =>
  status === 'REJECTED' || status === 'TAKEDOWN';

// Platforms are presentational only (no per-store delivery data exists yet
// on the API) — reflects whether the release as a whole has gone live.
const STORE_PLATFORMS = [
  { name: 'Spotify', icon: 'graphic_eq' },
  { name: 'Apple Music', icon: 'album' },
  { name: 'YouTube Music', icon: 'smart_display' },
  { name: 'Amazon Music', icon: 'shopping_bag' },
  { name: 'Tidal', icon: 'waves' },
] as const;

// ===========================================
// Component
// ===========================================

const ReleaseDetail: React.FC<ReleaseDetailProps> = ({ releaseId, onBack }) => {
  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRelease = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await ArtistService.getRelease(releaseId);
      setRelease(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load this release.');
    } finally {
      setLoading(false);
    }
  }, [releaseId]);

  useEffect(() => {
    fetchRelease();
  }, [fetchRelease]);

  if (loading) {
    return (
      <div className="min-h-full bg-sonic-bg p-8 font-sonic">
        <div className="max-w-6xl mx-auto text-center py-24 text-sonic-text-dim">
          Loading release...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-sonic-bg p-8 font-sonic">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-sonic-text-dim hover:text-sonic-text transition-colors mb-6"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back
          </button>
          <div className="bg-sonic-error/10 border border-sonic-error/30 text-sonic-error px-4 py-3 rounded flex items-center justify-between gap-4">
            <span className="text-sm">{error}</span>
            <button
              onClick={fetchRelease}
              className="font-bold text-sm underline shrink-0"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!release) {
    return null;
  }

  const tracks = release.tracks || [];
  const stepIndex = pipelineStepIndex(release.status);
  const pipelineError = isPipelineError(release.status);
  const isLive = release.status === 'LIVE';

  return (
    <div className="min-h-full bg-sonic-bg font-sonic text-sonic-text p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Breadcrumb / Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-sonic-text-dim hover:text-sonic-text transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to Catalog
        </button>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-sonic-text">{release.title}</h1>
            {release.artistName && (
              <p className="text-sonic-text-dim text-sm mt-1">by {release.artistName}</p>
            )}
          </div>
          <span
            className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wide ${RELEASE_STATUS_STYLES[release.status]}`}
          >
            {RELEASE_STATUS_LABELS[release.status]}
          </span>
        </div>

        {/* Distribution Status */}
        <div className="bg-sonic-card border border-sonic-border rounded-lg p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-sonic-text-dim mb-6">
            Distribution Status
          </p>
          <div className="flex items-center">
            {PIPELINE_STEPS.map((step, i) => {
              const reached = stepIndex >= i;
              const isCurrent = stepIndex === i;
              const errored = pipelineError && isCurrent;
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-2 min-w-[6rem]">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        errored
                          ? 'bg-sonic-error border-sonic-error'
                          : reached
                          ? 'bg-sonic-primary border-sonic-primary'
                          : 'bg-transparent border-sonic-border'
                      }`}
                    />
                    <span
                      className={`text-xs text-center ${
                        errored
                          ? 'text-sonic-error font-bold'
                          : reached
                          ? 'text-sonic-primary font-bold'
                          : 'text-sonic-text-dim'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-px ${
                        stepIndex > i ? 'bg-sonic-primary' : 'bg-sonic-border'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Main grid: cover + metadata (left) / track list + stores (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,20rem)_1fr] gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <div className="rounded-lg overflow-hidden border border-sonic-border bg-sonic-card aspect-square">
              {release.coverArtUrl ? (
                <img
                  src={release.coverArtUrl}
                  alt={release.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sonic-text-dim">
                  <span className="material-symbols-outlined text-5xl opacity-50">album</span>
                </div>
              )}
            </div>

            <div className="bg-sonic-card border border-sonic-border rounded-lg p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-sonic-text-dim mb-4">
                Release Metadata
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-sonic-text-dim mb-1">Genre</p>
                  <p className="text-sm font-medium text-sonic-text">{release.genre || '--'}</p>
                </div>
                <div>
                  <p className="text-xs text-sonic-text-dim mb-1">Type</p>
                  <p className="text-sm font-medium text-sonic-text">{formatReleaseType(release.releaseType)}</p>
                </div>
                <div>
                  <p className="text-xs text-sonic-text-dim mb-1">Release Date</p>
                  <p className="text-sm font-medium font-mono text-sonic-text">{formatDate(release.releaseDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-sonic-text-dim mb-1">Submitted</p>
                  <p className="text-sm font-medium font-mono text-sonic-text">{formatDate(release.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Track list */}
            <div className="bg-sonic-card border border-sonic-border rounded-lg overflow-hidden">
              <p className="text-xs font-bold uppercase tracking-wider text-sonic-text-dim px-5 pt-5 pb-4">
                Track List
              </p>
              {tracks.length === 0 ? (
                <p className="px-5 pb-5 text-sm text-sonic-text-dim">No tracks uploaded yet.</p>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-t border-sonic-border text-xs font-bold uppercase tracking-wider text-sonic-text-dim">
                      <th className="px-5 py-3 w-12">#</th>
                      <th className="px-3 py-3">Title</th>
                      <th className="px-3 py-3">ISRC</th>
                      <th className="px-3 py-3 text-right">Duration</th>
                      <th className="px-5 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...tracks]
                      .sort((a, b) => a.trackNumber - b.trackNumber)
                      .map((track) => {
                        const isLead = track.trackNumber === 1;
                        return (
                          <tr
                            key={track.id}
                            className={`border-t border-sonic-border ${
                              isLead ? 'bg-sonic-primary/5' : ''
                            }`}
                          >
                            <td className="px-5 py-3 relative">
                              {isLead && (
                                <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-sonic-primary" />
                              )}
                              <span
                                className={`font-mono text-sm ${
                                  isLead ? 'text-sonic-primary font-bold' : 'text-sonic-text-dim'
                                }`}
                              >
                                {String(track.trackNumber).padStart(2, '0')}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-sm font-medium text-sonic-text">
                              {track.title}
                            </td>
                            <td className="px-3 py-3 text-sm font-mono text-sonic-text-dim">
                              {track.isrc || '--'}
                            </td>
                            <td className="px-3 py-3 text-sm font-mono text-sonic-text-dim text-right">
                              {formatDuration(track.durationMs)}
                            </td>
                            <td className="px-5 py-3 text-right">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-bold ${TRACK_STATUS_STYLES[track.status]}`}
                              >
                                {TRACK_STATUS_LABELS[track.status]}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Store deliveries */}
            <div className="bg-sonic-card border border-sonic-border rounded-lg p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-sonic-text-dim mb-4">
                Store Deliveries
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STORE_PLATFORMS.map((platform) => (
                  <div
                    key={platform.name}
                    className="flex items-center justify-between gap-3 border border-sonic-border rounded px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="material-symbols-outlined text-sonic-text-dim text-lg shrink-0">
                        {platform.icon}
                      </span>
                      <span className="text-sm font-medium text-sonic-text truncate">{platform.name}</span>
                    </div>
                    <span
                      className={`material-symbols-outlined text-lg shrink-0 ${
                        isLive ? 'text-sonic-primary' : 'text-sonic-text-dim'
                      }`}
                      title={isLive ? 'Live' : 'Pending'}
                    >
                      {isLive ? 'check_circle' : 'schedule'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReleaseDetail;
