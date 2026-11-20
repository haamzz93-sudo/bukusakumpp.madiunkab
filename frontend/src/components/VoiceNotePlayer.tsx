import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Mic } from 'lucide-react';
import { getApiBaseUrl } from '../services/apiConfig';
import { BupatiAiAvatar } from './BupatiAiAvatar';

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

    // Auto-play when audio is ready
    if (autoPlay && resolvedUrl && !hasAudioError) {
      const timer = setTimeout(() => {
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          // Fallback to Web Speech if audio element autoplay is blocked
          if (fallbackText && 'speechSynthesis' in window) {
            playWebSpeechFallback();
          }
        });
      }, 300);
      return () => clearTimeout(timer);
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
        // Fallback to Web Speech API if audio file fails
        if (fallbackText && 'speechSynthesis' in window) {
          playWebSpeechFallback();
        }
      });
    }
  };

  const playWebSpeechFallback = () => {
    window.speechSynthesis.cancel();
    const cleanText = fallbackText?.replace(/[*#_\[\]\(\)]/g, ' ') || '';
    const utterance = new SpeechSynthesisUtterance(cleanText.substring(0, 400));
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
    25, 45, 65, 35, 80, 95, 45, 70, 85, 55, 95, 75, 50, 90, 65, 40,
    60, 80, 45, 95, 70, 35, 85, 75, 55, 85, 50, 65, 80, 45, 60, 35
  ];

  const progressRatio = totalDuration > 0 ? Math.min(1, currentTime / totalDuration) : 0;
  const activeBarIndex = Math.floor(progressRatio * waveHeights.length);

  const isAssistant = sender === 'assistant';

  return (
    <div className="relative rounded-2xl p-4 my-3 transition-all duration-300 shadow-[0_12px_36px_rgba(0,0,0,0.35)] border border-emerald-500/35 bg-slate-900/95 dark:bg-slate-950/95 text-white backdrop-blur-2xl">
      {resolvedUrl && (
        <audio ref={audioRef} src={resolvedUrl} preload="metadata" />
      )}

      {/* Header Info: Speaker Badge & VoiceAI Buku Saku Badge */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2.5">
          {isAssistant ? (
            <BupatiAiAvatar isSpeaking={isPlaying} size="sm" />
          ) : (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 text-emerald-300 border border-white/25">
              <Mic className="w-4 h-4" />
            </div>
          )}

          <div>
            <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>{isAssistant ? 'Bupati Madiun (VoiceAI Resmi MPP)' : 'Pesan Suara Anda'}</span>
              {isAssistant && (
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                  Avatar Resmi
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
            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer active:scale-95"
            title="Kecepatan putar"
          >
            {playbackRate}x
          </button>
          <button
            onClick={toggleMute}
            type="button"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer active:scale-95"
            title={isMuted ? 'Bunyikan' : 'Senyapkan'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Waveform Player Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          type="button"
          className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 text-slate-950 hover:from-emerald-300 hover:to-teal-300 shadow-[0_0_24px_rgba(52,211,153,0.5)] transition-all duration-200 active:scale-95 cursor-pointer"
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
          className="flex-1 flex items-center gap-[2.5px] sm:gap-[3.5px] h-10 cursor-pointer group py-1"
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
                  backgroundColor: isPlayed ? '#34d399' : 'rgba(255, 255, 255, 0.22)',
                  boxShadow: isPlayed && isPlaying && i === activeBarIndex
                    ? '0 0 12px #34d399'
                    : 'none',
                  transform: isPlaying && isPlayed ? 'scaleY(1.12)' : 'scaleY(1)'
                }}
              />
            );
          })}
        </div>

        {/* Time Stamp */}
        <div className="text-xs font-mono text-emerald-300 font-bold shrink-0 select-none min-w-[55px] text-right drop-shadow-sm">
          {isPlaying ? formatSeconds(currentTime) : formatSeconds(totalDuration || currentTime)}
        </div>
      </div>
    </div>
  );
};
