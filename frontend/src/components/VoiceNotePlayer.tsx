import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles, User, RotateCcw } from 'lucide-react';
import { getApiBaseUrl } from '../services/apiConfig';

interface VoiceNotePlayerProps {
  audioUrl?: string;
  fallbackText?: string;
  sender: 'user' | 'assistant';
  duration?: number;
  autoPlay?: boolean;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({
  audioUrl,
  fallbackText,
  sender,
  duration,
  autoPlay = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hasAudioError, setHasAudioError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Compute absolute audio URL if relative
  const resolvedUrl = React.useMemo(() => {
    if (!audioUrl) return '';
    if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://') || audioUrl.startsWith('blob:')) {
      return audioUrl;
    }
    const baseUrl = getApiBaseUrl();
    if (baseUrl && audioUrl.startsWith('/')) {
      return `${baseUrl}${audioUrl}`;
    }
    return audioUrl;
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setTotalDuration(audio.duration);
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onError = () => {
      setHasAudioError(true);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    if (autoPlay && resolvedUrl && !hasAudioError) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {
        // Autoplay may be restricted by browser policy before user interaction
      });
    }

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [resolvedUrl, autoPlay, hasAudioError]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setHasAudioError(false);
      audio.playbackRate = playbackRate;
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Fallback to Web Speech API if audio file fails to stream
        if (fallbackText && 'speechSynthesis' in window) {
          playWebSpeechFallback();
        }
      });
    }
  };

  const playWebSpeechFallback = () => {
    window.speechSynthesis.cancel();
    const cleanText = fallbackText?.replace(/[*#_\[\]\(\)]/g, ' ') || '';
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'id-ID';
    utterance.rate = playbackRate;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const toggleSpeed = () => {
    const nextRate = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    if (audioRef.current && totalDuration > 0) {
      const newTime = ratio * totalDuration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Soundwave frequency bars (32 bars)
  const waveHeights = [
    25, 45, 60, 30, 75, 90, 40, 65, 80, 50, 95, 70, 45, 85, 60, 35,
    55, 75, 40, 90, 65, 30, 85, 70, 50, 80, 45, 60, 75, 40, 55, 30
  ];

  const progressRatio = totalDuration > 0 ? Math.min(1, currentTime / totalDuration) : 0;
  const activeBarIndex = Math.floor(progressRatio * waveHeights.length);

  const isAssistant = sender === 'assistant';

  return (
    <div className={`relative rounded-2xl liquid-glass p-3.5 sm:p-4 my-2.5 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border ${
      isAssistant 
        ? 'border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-slate-900/40 to-teal-950/30' 
        : 'border-white/20 bg-gradient-to-r from-slate-900/40 to-slate-800/40'
    }`}>
      {resolvedUrl && (
        <audio ref={audioRef} src={resolvedUrl} preload="metadata" />
      )}

      {/* Header Info: Speaker Badge & Spider-Man / Karen HUD indicator */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isAssistant ? (
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]">
              <Sparkles className="w-3.5 h-3.5" />
              {isPlaying && (
                <span className="absolute -inset-1 rounded-full border border-emerald-400/60 animate-ping pointer-events-none" />
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 text-white/90 border border-white/20">
              <User className="w-3.5 h-3.5" />
            </div>
          )}

          <div>
            <div className="text-xs font-semibold text-white/95 flex items-center gap-1.5">
              <span>{isAssistant ? 'Buku Saku AI (Suara Resmi MPP)' : 'Pesan Suara Anda'}</span>
              {isAssistant && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Gadis Neural
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Speed button & Mute */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleSpeed}
            type="button"
            className="text-[11px] font-bold px-2 py-0.5 rounded-lg liquid-glass text-white/90 hover:text-white transition-all cursor-pointer hover:bg-white/20"
            title="Kecepatan putar"
          >
            {playbackRate}x
          </button>
          <button
            onClick={toggleMute}
            type="button"
            className="p-1 rounded-lg liquid-glass text-white/80 hover:text-white transition-all cursor-pointer"
            title={isMuted ? 'Bunyikan' : 'Senyapkan'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Waveform Player Controls */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          type="button"
          className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 cursor-pointer shadow-lg ${
            isAssistant
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
              : 'bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.2)]'
          }`}
          title={isPlaying ? 'Jeda' : 'Putar Suara'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Waveform Visualization Bars */}
        <div 
          onClick={handleSeek}
          className="flex-1 flex items-center gap-[2.5px] sm:gap-[3px] h-9 cursor-pointer group py-1"
          title="Klik untuk melompat durasi"
        >
          {waveHeights.map((h, i) => {
            const isPlayed = i <= activeBarIndex;
            return (
              <div
                key={i}
                className="flex-1 rounded-full transition-all duration-150"
                style={{
                  height: `${h}%`,
                  backgroundColor: isPlayed 
                    ? (isAssistant ? '#34d399' : '#ffffff') 
                    : 'rgba(255, 255, 255, 0.22)',
                  boxShadow: isPlayed && isPlaying && i === activeBarIndex
                    ? (isAssistant ? '0 0 10px #34d399' : '0 0 8px #ffffff')
                    : 'none',
                  transform: isPlaying && isPlayed ? 'scaleY(1.08)' : 'scaleY(1)'
                }}
              />
            );
          })}
        </div>

        {/* Time Stamp */}
        <div className="text-[11px] font-mono text-white/80 shrink-0 font-medium select-none min-w-[55px] text-right">
          {isPlaying ? formatSeconds(currentTime) : formatSeconds(totalDuration || currentTime)}
        </div>
      </div>
    </div>
  );
};
