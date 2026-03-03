import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, ArtistService, UploadService } from '../../services/api';

// ===========================================
// TYPES
// ===========================================
interface Track {
  id: string;
  title: string;
  version?: string;
  isExplicit: boolean;
  file: File | null;
  audioKey?: string;
  duration?: number;
  isValid: boolean;
  validationError?: string;
  uploadProgress: number;
  isUploading: boolean;
  isUploaded: boolean;
}

interface ReleaseData {
  // Step 1: Metadata
  title: string;
  version: string;
  releaseType: 'SINGLE' | 'EP' | 'ALBUM' | 'COMPILATION';
  artistProfileId: string;
  genre: string;
  subgenre: string;
  language: string;
  releaseDate: string;
  isExplicit: boolean;
  // Step 2: Tracks
  tracks: Track[];
  // Step 3: Cover Art
  coverArtFile: File | null;
  coverArtPreview: string | null;
  coverArtKey?: string;
  // Step 4: Rights & Distribution
  cLineYear: number;
  cLineText: string;
  pLineYear: number;
  pLineText: string;
  selectedStores: string[];
  territories: string[];
}

interface ArtistProfile {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface NewReleaseProps {
  onComplete: () => void;
  onCancel: () => void;
}

// ===========================================
// CONSTANTS
// ===========================================
const GENRES = [
  'Pop', 'Hip-Hop/Rap', 'R&B/Soul', 'Electronic/Dance', 'Rock', 'Alternative',
  'Latin', 'Reggaeton', 'Country', 'Jazz', 'Classical', 'Folk', 'Metal',
  'Indie', 'K-Pop', 'Afrobeats', 'Reggae', 'Gospel', 'Blues', 'Punk'
];

const LANGUAGES = [
  { code: 'EN', name: 'English' },
  { code: 'ES', name: 'Spanish' },
  { code: 'FR', name: 'French' },
  { code: 'DE', name: 'German' },
  { code: 'IT', name: 'Italian' },
  { code: 'PT', name: 'Portuguese' },
  { code: 'JA', name: 'Japanese' },
  { code: 'KO', name: 'Korean' },
  { code: 'ZH', name: 'Chinese' },
  { code: 'AR', name: 'Arabic' },
  { code: 'HI', name: 'Hindi' },
  { code: 'RU', name: 'Russian' },
];

const DSP_STORES = [
  { id: 'spotify', name: 'Spotify', icon: '🎵' },
  { id: 'apple_music', name: 'Apple Music', icon: '🍎' },
  { id: 'youtube_music', name: 'YouTube Music', icon: '📺' },
  { id: 'amazon_music', name: 'Amazon Music', icon: '📦' },
  { id: 'deezer', name: 'Deezer', icon: '🎧' },
  { id: 'tidal', name: 'Tidal', icon: '🌊' },
  { id: 'pandora', name: 'Pandora', icon: '📻' },
  { id: 'soundcloud', name: 'SoundCloud', icon: '☁️' },
  { id: 'tiktok', name: 'TikTok/CapCut', icon: '🎬' },
  { id: 'instagram', name: 'Instagram/Facebook', icon: '📸' },
];

const ALLOWED_AUDIO_TYPES = ['audio/wav', 'audio/flac', 'audio/mpeg', 'audio/mp3', 'audio/x-wav', 'audio/x-flac'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_COVER_DIMENSION = 3000;

// ===========================================
// UTILITY FUNCTIONS
// ===========================================
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const validateAudioFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const isValidType = ALLOWED_AUDIO_TYPES.includes(file.type) ||
    file.name.toLowerCase().endsWith('.wav') ||
    file.name.toLowerCase().endsWith('.flac') ||
    file.name.toLowerCase().endsWith('.mp3');

  if (!isValidType) {
    return { valid: false, error: 'Only WAV, FLAC, and MP3 files are accepted' };
  }

  // Check file size
  if (file.size > MAX_AUDIO_SIZE) {
    return { valid: false, error: `File too large. Maximum size is ${formatFileSize(MAX_AUDIO_SIZE)}` };
  }

  // For WAV files, we should check bit depth (would require parsing file header in production)
  // For now, we accept the file and let the backend validate further
  return { valid: true };
};

const validateImageFile = async (file: File): Promise<{ valid: boolean; error?: string }> => {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPEG and PNG files are accepted' };
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: `File too large. Maximum size is ${formatFileSize(MAX_IMAGE_SIZE)}` };
  }

  // Check dimensions
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.width < MIN_COVER_DIMENSION || img.height < MIN_COVER_DIMENSION) {
        resolve({
          valid: false,
          error: `Cover art must be at least ${MIN_COVER_DIMENSION}x${MIN_COVER_DIMENSION}px (yours: ${img.width}x${img.height}px)`
        });
      } else if (img.width !== img.height) {
        resolve({ valid: false, error: 'Cover art must be square (1:1 aspect ratio)' });
      } else {
        resolve({ valid: true });
      }
    };
    img.onerror = () => resolve({ valid: false, error: 'Failed to load image' });
    img.src = URL.createObjectURL(file);
  });
};

const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.onloadedmetadata = () => {
      resolve(Math.floor(audio.duration * 1000));
    };
    audio.onerror = () => resolve(0);
    audio.src = URL.createObjectURL(file);
  });
};

// ===========================================
// ANIMATION VARIANTS
// ===========================================
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

// ===========================================
// STEP COMPONENTS
// ===========================================

// Step 1: Metadata
const MetadataStep: React.FC<{
  data: ReleaseData;
  profiles: ArtistProfile[];
  onChange: (updates: Partial<ReleaseData>) => void;
  errors: Record<string, string>;
}> = ({ data, profiles, onChange, errors }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Release Title */}
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-slate-400 mb-2">
            Release Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Enter release title"
            className={`w-full bg-dark-800 border ${errors.title ? 'border-rose-500' : 'border-dark-800'} rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors`}
          />
          {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title}</p>}
        </div>

        {/* Version (Optional) */}
        <div>
          <label className="block text-sm font-bold text-slate-400 mb-2">
            Version <span className="text-slate-600">(Optional)</span>
          </label>
          <input
            type="text"
            value={data.version}
            onChange={(e) => onChange({ version: e.target.value })}
            placeholder="e.g., Deluxe, Remix, Acoustic"
            className="w-full bg-dark-800 border border-dark-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
          />
        </div>

        {/* Release Type */}
        <div>
          <label className="block text-sm font-bold text-slate-400 mb-2">
            Release Type <span className="text-rose-500">*</span>
          </label>
          <select
            value={data.releaseType}
            onChange={(e) => onChange({ releaseType: e.target.value as ReleaseData['releaseType'] })}
            className={`w-full bg-dark-800 border ${errors.releaseType ? 'border-rose-500' : 'border-dark-800'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors`}
          >
            <option value="SINGLE">Single (1-3 tracks)</option>
            <option value="EP">EP (4-6 tracks)</option>
            <option value="ALBUM">Album (7+ tracks)</option>
            <option value="COMPILATION">Compilation</option>
          </select>
        </div>

        {/* Artist Profile */}
        <div>
          <label className="block text-sm font-bold text-slate-400 mb-2">
            Artist Profile <span className="text-rose-500">*</span>
          </label>
          <select
            value={data.artistProfileId}
            onChange={(e) => onChange({ artistProfileId: e.target.value })}
            className={`w-full bg-dark-800 border ${errors.artistProfileId ? 'border-rose-500' : 'border-dark-800'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors`}
          >
            <option value="">Select artist profile</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>{profile.name}</option>
            ))}
          </select>
          {errors.artistProfileId && <p className="mt-1 text-xs text-rose-500">{errors.artistProfileId}</p>}
        </div>

        {/* Genre */}
        <div>
          <label className="block text-sm font-bold text-slate-400 mb-2">
            Primary Genre <span className="text-rose-500">*</span>
          </label>
          <select
            value={data.genre}
            onChange={(e) => onChange({ genre: e.target.value })}
            className={`w-full bg-dark-800 border ${errors.genre ? 'border-rose-500' : 'border-dark-800'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors`}
          >
            <option value="">Select genre</option>
            {GENRES.map((genre) => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
          {errors.genre && <p className="mt-1 text-xs text-rose-500">{errors.genre}</p>}
        </div>

        {/* Subgenre */}
        <div>
          <label className="block text-sm font-bold text-slate-400 mb-2">
            Subgenre <span className="text-slate-600">(Optional)</span>
          </label>
          <input
            type="text"
            value={data.subgenre}
            onChange={(e) => onChange({ subgenre: e.target.value })}
            placeholder="e.g., Synthwave, Trap, Indie Pop"
            className="w-full bg-dark-800 border border-dark-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
          />
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-bold text-slate-400 mb-2">
            Primary Language <span className="text-rose-500">*</span>
          </label>
          <select
            value={data.language}
            onChange={(e) => onChange({ language: e.target.value })}
            className="w-full bg-dark-800 border border-dark-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>

        {/* Release Date */}
        <div>
          <label className="block text-sm font-bold text-slate-400 mb-2">
            Release Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            value={data.releaseDate}
            onChange={(e) => onChange({ releaseDate: e.target.value })}
            min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            className={`w-full bg-dark-800 border ${errors.releaseDate ? 'border-rose-500' : 'border-dark-800'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors`}
          />
          {errors.releaseDate && <p className="mt-1 text-xs text-rose-500">{errors.releaseDate}</p>}
          <p className="mt-1 text-xs text-slate-500">Releases need at least 7 days for store delivery</p>
        </div>

        {/* Explicit Content */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={data.isExplicit}
                onChange={(e) => onChange({ isExplicit: e.target.checked })}
                className="sr-only"
              />
              <div className={`w-6 h-6 rounded-md border-2 transition-all ${data.isExplicit ? 'bg-brand-500 border-brand-500' : 'border-slate-600 group-hover:border-slate-500'}`}>
                {data.isExplicit && (
                  <svg className="w-full h-full text-white p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-white">Contains Explicit Content</span>
              <p className="text-xs text-slate-500">Check if this release contains explicit lyrics or content</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

// Step 2: Audio Upload
const AudioUploadStep: React.FC<{
  data: ReleaseData;
  onChange: (updates: Partial<ReleaseData>) => void;
}> = ({ data, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const newTracks: Track[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateAudioFile(file);
      const duration = validation.valid ? await getAudioDuration(file) : 0;

      newTracks.push({
        id: generateId(),
        title: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        isExplicit: false,
        file,
        duration,
        isValid: validation.valid,
        validationError: validation.error,
        uploadProgress: 0,
        isUploading: false,
        isUploaded: false,
      });
    }

    onChange({ tracks: [...data.tracks, ...newTracks] });
  }, [data.tracks, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const updateTrack = (id: string, updates: Partial<Track>) => {
    onChange({
      tracks: data.tracks.map(t => t.id === id ? { ...t, ...updates } : t)
    });
  };

  const removeTrack = (id: string) => {
    onChange({ tracks: data.tracks.filter(t => t.id !== id) });
  };

  const moveTrack = (id: string, direction: 'up' | 'down') => {
    const index = data.tracks.findIndex(t => t.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === data.tracks.length - 1)) return;

    const newTracks = [...data.tracks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newTracks[index], newTracks[newIndex]] = [newTracks[newIndex], newTracks[index]];
    onChange({ tracks: newTracks });
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-brand-500 bg-brand-500/10'
            : 'border-dark-800 hover:border-brand-500/50 hover:bg-dark-800/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".wav,.flac,.mp3,audio/wav,audio/flac,audio/mpeg"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full transition-all ${isDragging ? 'bg-brand-500/20 scale-110' : 'bg-dark-800'}`}>
            <span className="material-symbols-outlined text-4xl text-brand-500">cloud_upload</span>
          </div>
          <div>
            <p className="text-lg font-bold text-white mb-1">
              {isDragging ? 'Drop your files here' : 'Drag & drop audio files'}
            </p>
            <p className="text-sm text-slate-400">or click to browse</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400">WAV</span>
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400">FLAC</span>
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400">MP3</span>
          </div>
          <p className="text-xs text-slate-500">Recommended: WAV or FLAC, 16-bit or 24-bit, 44.1kHz or higher</p>
        </div>
      </div>

      {/* Track List */}
      {data.tracks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">
              Tracks ({data.tracks.length})
            </h3>
            <p className="text-sm text-slate-400">
              Total: {formatDuration(data.tracks.reduce((sum, t) => sum + (t.duration || 0), 0))}
            </p>
          </div>

          <div className="space-y-2">
            {data.tracks.map((track, index) => (
              <motion.div
                key={track.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`bg-dark-800 rounded-xl p-4 border ${track.isValid ? 'border-dark-800' : 'border-rose-500/50'}`}
              >
                <div className="flex items-start gap-4">
                  {/* Track Number */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-dark-900 text-slate-400 font-bold text-sm">
                      {index + 1}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveTrack(track.id, 'up')}
                        disabled={index === 0}
                        className="text-slate-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-sm">keyboard_arrow_up</span>
                      </button>
                      <button
                        onClick={() => moveTrack(track.id, 'down')}
                        disabled={index === data.tracks.length - 1}
                        className="text-slate-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                      </button>
                    </div>
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={track.title}
                      onChange={(e) => updateTrack(track.id, { title: e.target.value })}
                      placeholder="Track title"
                      className="w-full bg-transparent text-white font-medium focus:outline-none border-b border-transparent hover:border-dark-800 focus:border-brand-500 pb-1 transition-colors"
                    />
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-slate-500">
                        {track.file?.name} • {track.file && formatFileSize(track.file.size)}
                      </span>
                      {track.duration && track.duration > 0 && (
                        <span className="text-xs text-slate-400 font-mono">{formatDuration(track.duration)}</span>
                      )}
                    </div>
                    {!track.isValid && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">error</span>
                        {track.validationError}
                      </p>
                    )}
                    {track.isUploading && (
                      <div className="mt-2">
                        <div className="h-1 bg-dark-900 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-brand-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${track.uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {track.isUploaded && (
                      <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Uploaded
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={track.isExplicit}
                        onChange={(e) => updateTrack(track.id, { isExplicit: e.target.checked })}
                        className="sr-only"
                      />
                      <span className={`px-2 py-1 rounded text-xs font-bold transition-colors ${track.isExplicit ? 'bg-rose-500/20 text-rose-400' : 'bg-dark-900 text-slate-500 hover:text-slate-400'}`}>
                        E
                      </span>
                    </label>
                    <button
                      onClick={() => removeTrack(track.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex gap-3">
          <span className="material-symbols-outlined text-blue-400">info</span>
          <div className="text-sm text-blue-300">
            <p className="font-bold mb-1">Audio Quality Guidelines</p>
            <ul className="list-disc list-inside space-y-1 text-blue-300/80">
              <li>WAV or FLAC format strongly recommended for best quality</li>
              <li>Minimum bitrate: 320kbps for MP3</li>
              <li>Sample rate: 44.1kHz or 48kHz</li>
              <li>Avoid clipping - keep peak levels below -1dB</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 3: Cover Art
const CoverArtStep: React.FC<{
  data: ReleaseData;
  onChange: (updates: Partial<ReleaseData>) => void;
  error?: string;
}> = ({ data, onChange, error }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleFile = useCallback(async (file: File | null) => {
    if (!file) return;

    setIsValidating(true);
    setValidationError(null);

    const validation = await validateImageFile(file);

    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid image');
      setIsValidating(false);
      return;
    }

    const preview = URL.createObjectURL(file);
    onChange({ coverArtFile: file, coverArtPreview: preview });
    setIsValidating(false);
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const removeCover = () => {
    if (data.coverArtPreview) {
      URL.revokeObjectURL(data.coverArtPreview);
    }
    onChange({ coverArtFile: null, coverArtPreview: null });
    setValidationError(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Zone */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Upload Cover Art</h3>

          {!data.coverArtPreview ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onClick={() => fileInputRef.current?.click()}
              className={`aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-brand-500 bg-brand-500/10'
                  : validationError || error
                    ? 'border-rose-500/50 bg-rose-500/5'
                    : 'border-dark-800 hover:border-brand-500/50 hover:bg-dark-800/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={(e) => handleFile(e.target.files?.[0] || null)}
                className="hidden"
              />

              {isValidating ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-slate-400">Validating image...</p>
                </div>
              ) : (
                <>
                  <div className={`p-4 rounded-full mb-4 ${isDragging ? 'bg-brand-500/20' : 'bg-dark-800'}`}>
                    <span className="material-symbols-outlined text-4xl text-brand-500">add_photo_alternate</span>
                  </div>
                  <p className="text-lg font-bold text-white mb-1">Drop cover art here</p>
                  <p className="text-sm text-slate-400 mb-4">or click to browse</p>
                  <div className="text-xs text-slate-500 text-center">
                    <p>JPEG or PNG</p>
                    <p>Minimum 3000x3000px, square</p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="relative aspect-square rounded-2xl overflow-hidden group">
              <img
                src={data.coverArtPreview}
                alt="Cover preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={removeCover}
                  className="bg-rose-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-rose-600 transition-colors"
                >
                  <span className="material-symbols-outlined">delete</span>
                  Remove
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-4">
                <p className="text-sm font-bold text-white">{data.coverArtFile?.name}</p>
                <p className="text-xs text-slate-400">{data.coverArtFile && formatFileSize(data.coverArtFile.size)}</p>
              </div>
            </div>
          )}

          {(validationError || error) && (
            <p className="mt-3 text-sm text-rose-400 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              {validationError || error}
            </p>
          )}
        </div>

        {/* Guidelines */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Artwork Guidelines</h3>

          <div className="space-y-4">
            <div className="bg-dark-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-emerald-400">check_circle</span>
                <div>
                  <p className="font-bold text-white text-sm">Requirements</p>
                  <ul className="text-sm text-slate-400 mt-2 space-y-1">
                    <li>Minimum 3000 x 3000 pixels</li>
                    <li>Square format (1:1 aspect ratio)</li>
                    <li>JPEG or PNG format</li>
                    <li>RGB color mode</li>
                    <li>No blurry or pixelated images</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-dark-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-rose-400">block</span>
                <div>
                  <p className="font-bold text-white text-sm">Not Allowed</p>
                  <ul className="text-sm text-slate-400 mt-2 space-y-1">
                    <li>Explicit imagery without proper marking</li>
                    <li>Social media handles or URLs</li>
                    <li>Pricing or promotional text</li>
                    <li>Contact information</li>
                    <li>Copyrighted images you don't own</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-amber-400">lightbulb</span>
                <div>
                  <p className="font-bold text-amber-300 text-sm">Pro Tips</p>
                  <ul className="text-sm text-amber-200/70 mt-2 space-y-1">
                    <li>Use high contrast for better visibility at small sizes</li>
                    <li>Keep important elements centered</li>
                    <li>Test how it looks at 100x100px</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 4: Rights & Distribution
const RightsDistributionStep: React.FC<{
  data: ReleaseData;
  onChange: (updates: Partial<ReleaseData>) => void;
}> = ({ data, onChange }) => {
  const currentYear = new Date().getFullYear();
  const [selectAllStores, setSelectAllStores] = useState(true);

  const toggleStore = (storeId: string) => {
    const current = data.selectedStores;
    if (current.includes(storeId)) {
      onChange({ selectedStores: current.filter(s => s !== storeId) });
      setSelectAllStores(false);
    } else {
      const newStores = [...current, storeId];
      onChange({ selectedStores: newStores });
      setSelectAllStores(newStores.length === DSP_STORES.length);
    }
  };

  const handleSelectAll = () => {
    if (selectAllStores) {
      onChange({ selectedStores: [] });
      setSelectAllStores(false);
    } else {
      onChange({ selectedStores: DSP_STORES.map(s => s.id) });
      setSelectAllStores(true);
    }
  };

  useEffect(() => {
    // Initialize with all stores selected
    if (data.selectedStores.length === 0) {
      onChange({ selectedStores: DSP_STORES.map(s => s.id) });
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Copyright Information */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-brand-500">copyright</span>
          Copyright Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">
              Sound Recording Copyright (P)
            </label>
            <div className="flex gap-3">
              <select
                value={data.pLineYear}
                onChange={(e) => onChange({ pLineYear: parseInt(e.target.value) })}
                className="w-24 bg-dark-800 border border-dark-800 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-brand-500"
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i} value={currentYear - i}>{currentYear - i}</option>
                ))}
              </select>
              <input
                type="text"
                value={data.pLineText}
                onChange={(e) => onChange({ pLineText: e.target.value })}
                placeholder="Copyright holder name"
                className="flex-1 bg-dark-800 border border-dark-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">Owner of the master recording</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">
              Composition Copyright (C)
            </label>
            <div className="flex gap-3">
              <select
                value={data.cLineYear}
                onChange={(e) => onChange({ cLineYear: parseInt(e.target.value) })}
                className="w-24 bg-dark-800 border border-dark-800 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-brand-500"
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i} value={currentYear - i}>{currentYear - i}</option>
                ))}
              </select>
              <input
                type="text"
                value={data.cLineText}
                onChange={(e) => onChange({ cLineText: e.target.value })}
                placeholder="Copyright holder name"
                className="flex-1 bg-dark-800 border border-dark-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">Owner of the musical composition</p>
          </div>
        </div>
      </div>

      {/* Store Selection */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-brand-500">storefront</span>
            Distribution Stores
          </h3>
          <button
            onClick={handleSelectAll}
            className="text-sm font-bold text-brand-400 hover:text-brand-300 transition-colors"
          >
            {selectAllStores ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {DSP_STORES.map((store) => {
            const isSelected = data.selectedStores.includes(store.id);
            return (
              <button
                key={store.id}
                onClick={() => toggleStore(store.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-brand-500 bg-brand-500/10'
                    : 'border-dark-800 hover:border-dark-700 bg-dark-800/50'
                }`}
              >
                <div className="text-2xl mb-2">{store.icon}</div>
                <p className={`text-xs font-bold ${isSelected ? 'text-brand-400' : 'text-slate-400'}`}>
                  {store.name}
                </p>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Selected: {data.selectedStores.length} of {DSP_STORES.length} stores
        </p>
      </div>

      {/* Territory Selection */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-brand-500">public</span>
          Territory
        </h3>
        <div className="bg-dark-800 rounded-xl p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="radio"
                name="territory"
                checked={data.territories.includes('worldwide')}
                onChange={() => onChange({ territories: ['worldwide'] })}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 transition-all ${data.territories.includes('worldwide') ? 'border-brand-500 bg-brand-500' : 'border-slate-600'}`}>
                {data.territories.includes('worldwide') && (
                  <div className="absolute inset-1 bg-white rounded-full" />
                )}
              </div>
            </div>
            <div>
              <span className="text-white font-medium">Worldwide</span>
              <p className="text-xs text-slate-500">Distribute to all available territories</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

// Step 5: Review
const ReviewStep: React.FC<{
  data: ReleaseData;
  profiles: ArtistProfile[];
}> = ({ data, profiles }) => {
  const artistProfile = profiles.find(p => p.id === data.artistProfileId);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-brand-600/20 to-purple-600/20 rounded-2xl p-6 border border-brand-500/20">
        <div className="flex items-start gap-6">
          {data.coverArtPreview ? (
            <img
              src={data.coverArtPreview}
              alt="Cover"
              className="w-32 h-32 rounded-xl shadow-lg shadow-black/50"
            />
          ) : (
            <div className="w-32 h-32 rounded-xl bg-dark-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-slate-600">image</span>
            </div>
          )}
          <div className="flex-1">
            <p className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-1">{data.releaseType}</p>
            <h2 className="text-2xl font-black text-white mb-1">
              {data.title || 'Untitled Release'}
              {data.version && <span className="text-slate-400 font-normal"> ({data.version})</span>}
            </h2>
            <p className="text-slate-400">{artistProfile?.name || 'Unknown Artist'}</p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="text-slate-500">{data.genre}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-500">{data.tracks.length} track{data.tracks.length !== 1 ? 's' : ''}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-500">{new Date(data.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              {data.isExplicit && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-slate-700 text-slate-300">E</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="bg-dark-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-dark-700">
          <h3 className="font-bold text-white">Tracklist</h3>
        </div>
        <div className="divide-y divide-dark-700">
          {data.tracks.map((track, index) => (
            <div key={track.id} className="px-4 py-3 flex items-center gap-4">
              <span className="w-6 text-center text-slate-500 text-sm">{index + 1}</span>
              <div className="flex-1">
                <p className="text-white font-medium">{track.title}</p>
                <p className="text-xs text-slate-500">{track.file?.name}</p>
              </div>
              {track.isExplicit && (
                <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-slate-700 text-slate-400">E</span>
              )}
              {track.duration && track.duration > 0 && (
                <span className="text-sm text-slate-500 font-mono">{formatDuration(track.duration)}</span>
              )}
              {track.isValid ? (
                <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
              ) : (
                <span className="material-symbols-outlined text-rose-500 text-sm">error</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Distribution Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-dark-800 rounded-xl p-4">
          <h4 className="text-sm font-bold text-slate-400 mb-3">Distribution</h4>
          <div className="flex flex-wrap gap-2">
            {data.selectedStores.slice(0, 5).map((storeId) => {
              const store = DSP_STORES.find(s => s.id === storeId);
              return store && (
                <span key={storeId} className="px-2 py-1 bg-dark-900 rounded text-xs text-slate-300">
                  {store.icon} {store.name}
                </span>
              );
            })}
            {data.selectedStores.length > 5 && (
              <span className="px-2 py-1 bg-dark-900 rounded text-xs text-slate-400">
                +{data.selectedStores.length - 5} more
              </span>
            )}
          </div>
        </div>

        <div className="bg-dark-800 rounded-xl p-4">
          <h4 className="text-sm font-bold text-slate-400 mb-3">Copyright</h4>
          <div className="space-y-1 text-sm">
            <p className="text-slate-300">&#x2117; {data.pLineYear} {data.pLineText || '—'}</p>
            <p className="text-slate-300">&#x00A9; {data.cLineYear} {data.cLineText || '—'}</p>
          </div>
        </div>
      </div>

      {/* Terms Agreement */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
        <p className="text-sm text-amber-200">
          By submitting this release, you confirm that you own or have obtained all necessary rights
          to distribute this music, including master recordings and compositions. You agree to EAJMUSIC's
          terms of service and distribution agreement.
        </p>
      </div>
    </div>
  );
};

// ===========================================
// MAIN COMPONENT
// ===========================================
const NewRelease: React.FC<NewReleaseProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<ArtistProfile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentYear = new Date().getFullYear();
  const defaultReleaseDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [data, setData] = useState<ReleaseData>({
    title: '',
    version: '',
    releaseType: 'SINGLE',
    artistProfileId: '',
    genre: '',
    subgenre: '',
    language: 'EN',
    releaseDate: defaultReleaseDate,
    isExplicit: false,
    tracks: [],
    coverArtFile: null,
    coverArtPreview: null,
    cLineYear: currentYear,
    cLineText: '',
    pLineYear: currentYear,
    pLineText: '',
    selectedStores: DSP_STORES.map(s => s.id),
    territories: ['worldwide'],
  });

  useEffect(() => {
    // Fetch artist profiles
    ArtistService.getProfiles().then(res => {
      setProfiles(res.profiles || []);
      if (res.profiles?.length === 1) {
        setData(prev => ({ ...prev, artistProfileId: res.profiles[0].id }));
      }
    }).catch(console.error);
  }, []);

  const updateData = (updates: Partial<ReleaseData>) => {
    setData(prev => ({ ...prev, ...updates }));
    // Clear related errors
    Object.keys(updates).forEach(key => {
      if (errors[key]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        });
      }
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!data.title.trim()) newErrors.title = 'Title is required';
        if (!data.artistProfileId) newErrors.artistProfileId = 'Please select an artist profile';
        if (!data.genre) newErrors.genre = 'Genre is required';
        if (!data.releaseDate) newErrors.releaseDate = 'Release date is required';
        break;
      case 2:
        if (data.tracks.length === 0) {
          setSubmitError('Please upload at least one track');
          return false;
        }
        if (data.tracks.some(t => !t.isValid)) {
          setSubmitError('Some tracks have validation errors');
          return false;
        }
        break;
      case 3:
        if (!data.coverArtFile) {
          setSubmitError('Cover art is required');
          return false;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    setSubmitError(null);
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setSubmitError(null);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Upload cover art
      let coverArtKey = data.coverArtKey;
      if (data.coverArtFile && !coverArtKey) {
        const coverResult = await UploadService.uploadCover(data.coverArtFile);
        coverArtKey = coverResult.file?.key || coverResult.key;
      }

      // 2. Upload audio files
      const uploadedTracks = [];
      for (const track of data.tracks) {
        if (track.file && !track.audioKey) {
          const audioResult = await UploadService.uploadAudio(track.file);
          uploadedTracks.push({
            ...track,
            audioKey: audioResult.file?.key || audioResult.key,
          });
        } else {
          uploadedTracks.push(track);
        }
      }

      // 3. Create release
      const releaseData = {
        title: data.title,
        version: data.version || undefined,
        releaseType: data.releaseType,
        artistProfileId: data.artistProfileId,
        genre: data.genre,
        subgenre: data.subgenre || undefined,
        language: data.language,
        releaseDate: data.releaseDate,
        isExplicit: data.isExplicit,
        cLineYear: data.cLineYear,
        cLineText: data.cLineText,
        pLineYear: data.pLineYear,
        pLineText: data.pLineText,
        selectedStores: data.selectedStores,
        territories: data.territories,
        coverArtKey,
        tracks: uploadedTracks.map((track, index) => ({
          title: track.title,
          trackNumber: index + 1,
          isExplicit: track.isExplicit,
          audioKey: track.audioKey,
        })),
      };

      const createResult = await ArtistService.createRelease(releaseData);

      // 4. Submit for review
      if (createResult.release?.id) {
        await ArtistService.submitRelease(createResult.release.id);
      }

      onComplete();
    } catch (error: any) {
      console.error('Submit error:', error);
      setSubmitError(error.message || 'Failed to submit release. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, name: 'Details', icon: 'edit_note' },
    { id: 2, name: 'Audio', icon: 'music_note' },
    { id: 3, name: 'Artwork', icon: 'image' },
    { id: 4, name: 'Rights', icon: 'gavel' },
    { id: 5, name: 'Review', icon: 'fact_check' },
  ];

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={onCancel}
                className="p-2 text-slate-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div>
                <h1 className="text-xl font-black text-white">New Release</h1>
                <p className="text-sm text-slate-500">Step {currentStep} of 5</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                  disabled={step.id > currentStep}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    step.id === currentStep
                      ? 'bg-brand-500/20 text-brand-400'
                      : step.id < currentStep
                        ? 'text-emerald-400 hover:bg-dark-800 cursor-pointer'
                        : 'text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    step.id === currentStep
                      ? 'bg-brand-500 text-white'
                      : step.id < currentStep
                        ? 'bg-emerald-500 text-white'
                        : 'bg-dark-800 text-slate-500'
                  }`}>
                    {step.id < currentStep ? (
                      <span className="material-symbols-outlined text-sm">check</span>
                    ) : (
                      <span className="material-symbols-outlined text-sm">{step.icon}</span>
                    )}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">{step.name}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                    step.id < currentStep ? 'bg-emerald-500' : 'bg-dark-800'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            {currentStep === 1 && (
              <MetadataStep data={data} profiles={profiles} onChange={updateData} errors={errors} />
            )}
            {currentStep === 2 && (
              <AudioUploadStep data={data} onChange={updateData} />
            )}
            {currentStep === 3 && (
              <CoverArtStep data={data} onChange={updateData} />
            )}
            {currentStep === 4 && (
              <RightsDistributionStep data={data} onChange={updateData} />
            )}
            {currentStep === 5 && (
              <ReviewStep data={data} profiles={profiles} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Error Message */}
        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-rose-400">error</span>
            <p className="text-sm text-rose-300">{submitError}</p>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-dark-800">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              currentStep === 1
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-white hover:bg-dark-800'
            }`}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back
          </button>

          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-lg shadow-brand-500/20"
            >
              Continue
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">rocket_launch</span>
                  Submit Release
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewRelease;
