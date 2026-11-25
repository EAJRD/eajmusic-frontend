import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';

export interface AudioPreviewPlayerProps {
  src: string;
  trackTitle?: string;
  artistName?: string;
  duration?: number;
  className?: string;
  onEnded?: () => void;
}

export const AudioPreviewPlayer: React.FC<AudioPreviewPlayerProps> = ({
  src,
  trackTitle = 'Preview de Audio',
  artistName = 'Artista EAJ',
  duration: initialDuration = 0,
  className = '',
  onEnded
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(initialDuration);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (onEnded) onEnded();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [src, onEnded]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      audio.play().catch(err => {
        console.warn('Playback error or prevented by browser:', err);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetVal = parseFloat(e.target.value);
    setCurrentTime(targetVal);
    if (audioRef.current) {
      audioRef.current.currentTime = targetVal;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (audioRef.current) {
        audioRef.current.volume = volume > 0 ? volume : 0.85;
      }
    } else {
      setIsMuted(true);
      if (audioRef.current) {
        audioRef.current.volume = 0;
      }
    }
  };

  const restartTrack = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div
      className={`w-full rounded-xl p-4 border border-[#262626] shadow-xl text-[#F5F5F5] transition-all duration-200 ${className}`}
      style={{ backgroundColor: '#0D0D0D' }}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Header Info */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold truncate text-[#F5F5F5] tracking-wide">
            {trackTitle}
          </h4>
          <p className="text-xs text-neutral-400 truncate mt-0.5">{artistName}</p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#121212] border border-[#262626] text-[10px] uppercase tracking-wider text-sky-400 font-medium">
          <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-sky-400 animate-pulse' : 'bg-neutral-500'}`} />
          {isPlaying ? 'Reproduciendo' : 'Listo'}
        </div>
      </div>

      {/* Scrubber & Progress */}
      <div className="space-y-1.5 mb-3">
        <div className="relative flex items-center group">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Progreso de audio"
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-[#1A1A1A] accent-sky-500 hover:h-2 transition-all focus:outline-none"
            style={{
              background: `linear-gradient(to right, #0ea5e9 ${progressPercent}%, #262626 ${progressPercent}%)`
            }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] font-mono text-neutral-400 px-0.5">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Control Buttons & Volume */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#1C1C1C]">
        <div className="flex items-center gap-2">
          {/* Main Play/Pause Button */}
          <button
            type="button"
            onClick={togglePlayPause}
            aria-label={isPlaying ? 'Pausar audio' : 'Reproducir audio'}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-sky-500 hover:bg-sky-400 text-black font-bold shadow-lg shadow-sky-500/20 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            )}
          </button>

          {/* Restart Button */}
          <button
            type="button"
            onClick={restartTrack}
            aria-label="Reiniciar audio"
            title="Reiniciar pista"
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#141414] hover:bg-[#202020] text-neutral-400 hover:text-[#F5F5F5] border border-[#262626] transition-colors focus:outline-none"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Volume controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Activar volumen' : 'Silenciar volumen'}
            className="text-neutral-400 hover:text-[#F5F5F5] p-1.5 rounded-md hover:bg-[#1A1A1A] transition-colors focus:outline-none"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            aria-label="Control de volumen"
            className="w-16 md:w-20 h-1 rounded-lg appearance-none cursor-pointer bg-[#262626] accent-sky-400 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
