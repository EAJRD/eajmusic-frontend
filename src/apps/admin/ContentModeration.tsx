import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminService } from '../../services/api';

// ===========================================
// TYPES
// ===========================================
interface Release {
  id: string;
  title: string;
  version?: string;
  releaseType: 'SINGLE' | 'EP' | 'ALBUM' | 'COMPILATION';
  genre: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'LIVE' | 'DRAFT' | 'TAKEDOWN';
  coverArtUrl?: string;
  coverArtKey?: string;
  isExplicit: boolean;
  releaseDate: string;
  submittedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  artistProfile?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  tracks: Array<{
    id: string;
    title: string;
    trackNumber: number;
    audioUrl?: string;
    audioKey?: string;
    durationMs?: number;
    status: 'PROCESSING' | 'READY' | 'ERROR';
  }>;
}

interface ReviewModalProps {
  release: Release | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  isProcessing: boolean;
}

// ===========================================
// MOCK DATA
// ===========================================
const generateMockReleases = (): Release[] => [
  {
    id: '1',
    title: 'Neon Horizons',
    version: 'Deluxe',
    releaseType: 'ALBUM',
    genre: 'Electronic/Dance',
    status: 'PENDING',
    coverArtUrl: 'https://picsum.photos/400/400?random=10',
    isExplicit: false,
    releaseDate: '2024-02-15',
    submittedAt: '2024-01-28T10:30:00Z',
    user: { id: '1', name: 'Alex Rivera', email: 'alex@example.com' },
    artistProfile: { id: '1', name: 'Alex Rivera', avatarUrl: 'https://picsum.photos/100/100?random=20' },
    tracks: [
      { id: '1', title: 'Opening', trackNumber: 1, durationMs: 245000, status: 'READY' },
      { id: '2', title: 'Midnight Drive', trackNumber: 2, durationMs: 198000, status: 'READY' },
      { id: '3', title: 'Neon Dreams', trackNumber: 3, durationMs: 212000, status: 'READY' },
    ],
  },
  {
    id: '2',
    title: 'Summer Vibes',
    releaseType: 'SINGLE',
    genre: 'Pop',
    status: 'PENDING',
    coverArtUrl: 'https://picsum.photos/400/400?random=11',
    isExplicit: true,
    releaseDate: '2024-02-10',
    submittedAt: '2024-01-27T15:45:00Z',
    user: { id: '2', name: 'Sarah Chen', email: 'sarah@example.com' },
    artistProfile: { id: '2', name: 'Sarah Chen', avatarUrl: 'https://picsum.photos/100/100?random=21' },
    tracks: [
      { id: '4', title: 'Summer Vibes', trackNumber: 1, durationMs: 186000, status: 'READY' },
    ],
  },
  {
    id: '3',
    title: 'Urban Nights EP',
    releaseType: 'EP',
    genre: 'Hip-Hop/Rap',
    status: 'PENDING',
    coverArtUrl: 'https://picsum.photos/400/400?random=12',
    isExplicit: true,
    releaseDate: '2024-02-20',
    submittedAt: '2024-01-26T09:15:00Z',
    user: { id: '3', name: 'Marcus Johnson', email: 'marcus@example.com' },
    artistProfile: { id: '3', name: 'M.J. Beats', avatarUrl: 'https://picsum.photos/100/100?random=22' },
    tracks: [
      { id: '5', title: 'City Lights', trackNumber: 1, durationMs: 210000, status: 'READY' },
      { id: '6', title: 'Hustle', trackNumber: 2, durationMs: 195000, status: 'READY' },
      { id: '7', title: 'Dreams', trackNumber: 3, durationMs: 224000, status: 'PROCESSING' },
      { id: '8', title: 'Legacy', trackNumber: 4, durationMs: 198000, status: 'READY' },
    ],
  },
  {
    id: '4',
    title: 'Acoustic Sessions',
    releaseType: 'ALBUM',
    genre: 'Folk',
    status: 'PENDING',
    coverArtUrl: 'https://picsum.photos/400/400?random=13',
    isExplicit: false,
    releaseDate: '2024-03-01',
    submittedAt: '2024-01-25T14:00:00Z',
    user: { id: '4', name: 'Emma Wilson', email: 'emma@example.com' },
    artistProfile: { id: '4', name: 'Emma Wilson', avatarUrl: 'https://picsum.photos/100/100?random=23' },
    tracks: [
      { id: '9', title: 'Morning Light', trackNumber: 1, durationMs: 234000, status: 'READY' },
      { id: '10', title: 'River Song', trackNumber: 2, durationMs: 278000, status: 'READY' },
    ],
  },
];

// ===========================================
// UTILITY FUNCTIONS
// ===========================================
const formatDuration = (ms?: number): string => {
  if (!ms) return '--:--';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getTimeSince = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
};

const getReleaseTypeColor = (type: string): string => {
  switch (type) {
    case 'SINGLE': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'EP': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'ALBUM': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'COMPILATION': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
};

// ===========================================
// AUDIO PLAYER COMPONENT
// ===========================================
const AudioPlayer: React.FC<{
  track: Release['tracks'][0];
  isPlaying: boolean;
  onToggle: () => void;
}> = ({ track, isPlaying, onToggle }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime * 1000);
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  // Use a demo audio URL for preview (in production, this would be the actual track URL)
  const audioUrl = track.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

  return (
    <div className="flex items-center gap-3 bg-dark-800 rounded-lg p-2">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <button
        onClick={onToggle}
        className="p-2 bg-brand-500 hover:bg-brand-400 rounded-full text-white transition-colors"
      >
        <span className="material-symbols-outlined text-lg">
          {isPlaying ? 'pause' : 'play_arrow'}
        </span>
      </button>
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-white font-medium">{track.title}</span>
          <span className="text-slate-500">
            {formatDuration(currentTime)} / {formatDuration(track.durationMs)}
          </span>
        </div>
        <div className="h-1 bg-dark-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-brand-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// ===========================================
// REVIEW MODAL COMPONENT
// ===========================================
const ReviewModal: React.FC<ReviewModalProps> = ({
  release,
  onClose,
  onApprove,
  onReject,
  isProcessing,
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [showFullCover, setShowFullCover] = useState(false);

  if (!release) return null;

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(release.id, rejectionReason);
    }
  };

  const rejectionReasons = [
    'Cover art does not meet guidelines (wrong dimensions, contains prohibited content)',
    'Audio quality is below acceptable standards',
    'Metadata contains inaccuracies or prohibited content',
    'Copyright infringement detected',
    'Content violates community guidelines',
    'Missing or incorrect artist credits',
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl my-8"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-dark-700 bg-dark-900">
            <h2 className="text-xl font-bold text-white">Review Release</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
            {/* Release Header */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              {/* Cover Art */}
              <div className="relative group">
                <img
                  src={release.coverArtUrl || 'https://picsum.photos/400/400'}
                  alt={release.title}
                  className="w-48 h-48 rounded-xl object-cover shadow-lg cursor-pointer"
                  onClick={() => setShowFullCover(true)}
                />
                <button
                  onClick={() => setShowFullCover(true)}
                  className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="material-symbols-outlined text-white text-3xl">zoom_in</span>
                </button>
                {release.isExplicit && (
                  <span className="absolute top-2 left-2 px-2 py-1 bg-slate-900/80 rounded text-xs font-bold text-slate-300">
                    EXPLICIT
                  </span>
                )}
              </div>

              {/* Release Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${getReleaseTypeColor(release.releaseType)}`}>
                    {release.releaseType}
                  </span>
                  <span className="text-xs text-slate-500">{release.genre}</span>
                </div>
                <h3 className="text-2xl font-black text-white mb-1">
                  {release.title}
                  {release.version && <span className="text-slate-400 font-normal"> ({release.version})</span>}
                </h3>
                <p className="text-slate-400 mb-4">{release.artistProfile?.name || 'Unknown Artist'}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Release Date</p>
                    <p className="text-white">{formatDate(release.releaseDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Submitted</p>
                    <p className="text-white">{getTimeSince(release.submittedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Tracks</p>
                    <p className="text-white">{release.tracks.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Submitted By</p>
                    <p className="text-white">{release.user.name}</p>
                    <p className="text-xs text-slate-500">{release.user.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracks */}
            <div className="mb-8">
              <h4 className="text-lg font-bold text-white mb-4">Tracks</h4>
              <div className="space-y-2">
                {release.tracks.map((track) => (
                  <div
                    key={track.id}
                    className="bg-dark-800 rounded-xl p-4 flex items-center gap-4"
                  >
                    <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-dark-700 text-slate-400 font-bold text-sm">
                      {track.trackNumber}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-white">{track.title}</p>
                      <p className="text-xs text-slate-500">{formatDuration(track.durationMs)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {track.status === 'READY' ? (
                        <button
                          onClick={() => setPlayingTrackId(playingTrackId === track.id ? null : track.id)}
                          className="p-2 bg-brand-500 hover:bg-brand-400 rounded-full text-white transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {playingTrackId === track.id ? 'pause' : 'play_arrow'}
                          </span>
                        </button>
                      ) : track.status === 'PROCESSING' ? (
                        <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold rounded">
                          Processing
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-rose-500/10 text-rose-400 text-xs font-bold rounded">
                          Error
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audio Player */}
            {playingTrackId && (
              <div className="mb-8">
                <h4 className="text-lg font-bold text-white mb-4">Now Playing</h4>
                {release.tracks
                  .filter((t) => t.id === playingTrackId)
                  .map((track) => (
                    <AudioPlayer
                      key={track.id}
                      track={track}
                      isPlaying={playingTrackId === track.id}
                      onToggle={() => setPlayingTrackId(null)}
                    />
                  ))}
              </div>
            )}

            {/* Rejection Form */}
            <AnimatePresence>
              {showRejectForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6"
                >
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
                    <h4 className="font-bold text-rose-400 mb-3">Rejection Reason</h4>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {rejectionReasons.map((reason, i) => (
                        <button
                          key={i}
                          onClick={() => setRejectionReason(reason)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            rejectionReason === reason
                              ? 'bg-rose-500 text-white'
                              : 'bg-dark-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {reason.substring(0, 30)}...
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter detailed rejection reason..."
                      rows={3}
                      className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
                    />

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => setShowRejectForm(false)}
                        className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white font-bold rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={!rejectionReason.trim() || isProcessing}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-600/50 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-sm">block</span>
                            Confirm Rejection
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex items-center justify-between px-6 py-4 border-t border-dark-700 bg-dark-900">
            <button
              onClick={onClose}
              className="px-6 py-3 text-slate-400 hover:text-white font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>

            <div className="flex gap-3">
              {!showRejectForm && (
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="px-6 py-3 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 font-bold rounded-xl transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">block</span>
                  Reject
                </button>
              )}
              <button
                onClick={() => onApprove(release.id)}
                disabled={isProcessing}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">check_circle</span>
                    Approve Release
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Full Cover Modal */}
        <AnimatePresence>
          {showFullCover && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4"
              onClick={() => setShowFullCover(false)}
            >
              <div className="absolute inset-0 bg-black/90" />
              <motion.img
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                src={release.coverArtUrl || 'https://picsum.photos/400/400'}
                alt={release.title}
                className="relative max-w-[90vw] max-h-[90vh] rounded-2xl shadow-2xl"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};

// ===========================================
// MAIN COMPONENT
// ===========================================
const ContentModeration: React.FC = () => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const fetchReleases = async () => {
    setIsLoading(true);
    try {
      const status = filter === 'all' ? undefined : filter.toUpperCase();
      const result = await AdminService.getReleases({ status });
      setReleases(result.releases || []);
    } catch (error) {
      console.log('Using mock releases data');
      setReleases(generateMockReleases());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, [filter]);

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    try {
      await AdminService.reviewRelease(id, 'APPROVE');
      setReleases((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'LIVE' as const } : r))
      );
      setSelectedRelease(null);
    } catch (error) {
      console.error('Failed to approve:', error);
      // Update mock data
      setReleases((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'LIVE' as const } : r))
      );
      setSelectedRelease(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    setIsProcessing(true);
    try {
      await AdminService.reviewRelease(id, 'REJECT', reason);
      setReleases((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'REJECTED' as const } : r))
      );
      setSelectedRelease(null);
    } catch (error) {
      console.error('Failed to reject:', error);
      // Update mock data
      setReleases((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'REJECTED' as const } : r))
      );
      setSelectedRelease(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredReleases = releases.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return r.status === 'PENDING';
    if (filter === 'approved') return r.status === 'LIVE' || r.status === 'APPROVED';
    if (filter === 'rejected') return r.status === 'REJECTED';
    return true;
  });

  const pendingCount = releases.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-1">Content Moderation</h1>
          <p className="text-slate-400 text-sm">Review and approve pending releases</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 bg-dark-800 rounded-xl p-1">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                filter === f
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'pending' && pendingCount > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  filter === f ? 'bg-white/20' : 'bg-amber-500 text-white'
                }`}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <p className="text-xs text-amber-400/70 uppercase font-bold">Pending Review</p>
          <p className="text-2xl font-black text-amber-400">{pendingCount}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <p className="text-xs text-emerald-400/70 uppercase font-bold">Approved Today</p>
          <p className="text-2xl font-black text-emerald-400">12</p>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
          <p className="text-xs text-rose-400/70 uppercase font-bold">Rejected Today</p>
          <p className="text-2xl font-black text-rose-400">3</p>
        </div>
        <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4">
          <p className="text-xs text-brand-400/70 uppercase font-bold">Avg Review Time</p>
          <p className="text-2xl font-black text-brand-400">2.4h</p>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            <p className="text-slate-400">Loading releases...</p>
          </div>
        </div>
      ) : filteredReleases.length === 0 ? (
        <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-600 mb-4">inbox</span>
          <h3 className="text-xl font-bold text-white mb-2">No Releases</h3>
          <p className="text-slate-400">
            {filter === 'pending'
              ? 'All caught up! No releases pending review.'
              : `No ${filter} releases to display.`}
          </p>
        </div>
      ) : (
        <div className="bg-dark-800/50 border border-dark-700 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-900 text-left">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Release</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Artist</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Submitted</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {filteredReleases.map((release) => (
                  <motion.tr
                    key={release.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-dark-700/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={release.coverArtUrl || 'https://picsum.photos/100/100'}
                          alt={release.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-bold text-white">{release.title}</p>
                          <p className="text-xs text-slate-500">{release.tracks.length} track{release.tracks.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${getReleaseTypeColor(release.releaseType)}`}>
                        {release.releaseType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={release.artistProfile?.avatarUrl || 'https://picsum.photos/50/50'}
                          alt={release.artistProfile?.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="text-sm text-white">{release.artistProfile?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {getTimeSince(release.submittedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        release.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' :
                        release.status === 'LIVE' || release.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                        release.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400' :
                        'bg-slate-500/10 text-slate-400'
                      }`}>
                        {release.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedRelease(release)}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-lg transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedRelease && (
        <ReviewModal
          release={selectedRelease}
          onClose={() => setSelectedRelease(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
};

export default ContentModeration;
