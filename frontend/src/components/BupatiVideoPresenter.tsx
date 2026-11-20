import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles, Mic, Bot } from 'lucide-react';

interface BupatiVideoPresenterProps {
  audioUrl?: string;
  fallbackText?: string;
  onAudioPlay?: () => void;
  className?: string;
}

export const BupatiVideoPresenter: React.FC<BupatiVideoPresenterProps> = ({
  audioUrl,
  fallbackText,
  onAudioPlay,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [voiceMode, setVoiceMode] = useState<'asli' | 'ai'>('asli');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Active audio URL based on selected mode
  const activeAudioUrl = voiceMode === 'asli' 
    ? '/avatar/bupati_suara_asli.wav' 
    : (audioUrl || '/avatar/bupati_suara_asli.wav');

  // Sync Video and Audio playback
  const togglePlay = () => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (!video) return;

    if (isPlaying) {
      video.pause();
      if (audio) audio.pause();
      setIsPlaying(false);
    } else {
      setHasStarted(true);
      video.play().catch(e => console.warn('Video play error:', e));
      if (audio) {
        audio.play().catch(e => console.warn('Audio play error:', e));
      }
      setIsPlaying(true);
      if (onAudioPlay) onAudioPlay();
    }
  };

  const handleModeChange = (mode: 'asli' | 'ai') => {
    if (isPlaying) {
      if (videoRef.current) videoRef.current.pause();
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    }
    setVoiceMode(mode);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (video) video.muted = nextMuted;
    if (audio) audio.muted = nextMuted;
  };

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (!video) return;

    // Loop video seamlessly while speaking
    const onVideoEnded = () => {
      if (isPlaying) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    };

    const onAudioEnded = () => {
      setIsPlaying(false);
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    };

    video.addEventListener('ended', onVideoEnded);
    if (audio) audio.addEventListener('ended', onAudioEnded);

    return () => {
      video.removeEventListener('ended', onVideoEnded);
      if (audio) audio.removeEventListener('ended', onAudioEnded);
    };
  }, [isPlaying]);

  return (
    <div className={`relative rounded-3xl overflow-hidden liquid-glass-sidebar border-2 border-emerald-500/40 shadow-2xl p-4 sm:p-5 text-white ${className}`}>
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-slate-950/80 to-slate-950 pointer-events-none" />

      {/* Synchronized Audio Element */}
      <audio 
        key={activeAudioUrl} 
        ref={audioRef} 
        src={activeAudioUrl} 
        preload="auto" 
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 sm:gap-6">
        
        {/* VIDEO AVATAR STAGE (Large 1080p Digital Human Box) */}
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 shrink-0 rounded-2xl overflow-hidden border-2 border-emerald-400/50 shadow-[0_0_30px_rgba(16,185,129,0.35)] group bg-slate-900">
          
          {/* Active Speaking Video */}
          <video
            ref={videoRef}
            src="/avatar/bupati_talking.mp4"
            loop
            playsInline
            muted={true}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isPlaying ? 'opacity-100 scale-105' : 'opacity-0 absolute inset-0 pointer-events-none'
            }`}
          />

          {/* Idle Photo Fallback */}
          <img
            src="/avatar/bupati_photo1.png"
            alt="Bapak Bupati Madiun"
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isPlaying ? 'opacity-0 absolute inset-0 pointer-events-none' : 'opacity-100 scale-100'
            }`}
          />

          {/* Big Center Play Overlay when Idle */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              type="button"
              className="absolute inset-0 flex items-center justify-center bg-black/35 hover:bg-black/20 transition-all cursor-pointer group"
              title="Klik untuk mendengarkan suara Bapak Bupati"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.7)] group-hover:scale-110 active:scale-95 transition-transform">
                <Play className="w-6 h-6 fill-current ml-1" />
              </div>
            </button>
          )}

          {/* Micro Status Badge */}
          <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-emerald-400/40 text-[10px] font-bold text-emerald-300 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'}`} />
            <span>{isPlaying ? 'Sedang Berbicara' : 'AI Digital Human'}</span>
          </div>
        </div>

        {/* DETAILS & PLAYBACK CONTROLS */}
        <div className="flex-1 text-center md:text-left space-y-3 min-w-0 w-full">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Asisten Virtual Resmi Mal Pelayanan Publik</span>
            </div>
            <h3 className="text-lg sm:text-xl font-display font-black text-white tracking-tight">
              H. Hari Wuryanto, S.H., M.Ak.
            </h3>
            <p className="text-xs sm:text-sm text-emerald-400 font-semibold">
              Bupati Madiun · Siaga Menjawab Pertanyaan Warga
            </p>
          </div>

          {/* Voice Mode Selector Tabs: Suara Asli Bupati vs Suara AI Standar */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-xs">
            <button
              onClick={() => handleModeChange('asli')}
              type="button"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                voiceMode === 'asli'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Suara Asli Bapak Bupati</span>
            </button>

            <button
              onClick={() => handleModeChange('ai')}
              type="button"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                voiceMode === 'ai'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Suara AI Panduan SOP</span>
            </button>
          </div>

          {/* Descriptive Text */}
          <p className="text-xs text-slate-300 font-normal leading-relaxed line-clamp-3">
            {voiceMode === 'asli' 
              ? "Memutar rekaman suara asli Bapak Bupati Madiun (H. Hari Wuryanto) saat memberikan arahan langsung kepada masyarakat Madiun."
              : (fallbackText || "Memutar jawaban panduan perizinan dan dokumen standar pelayanan resmi MPP Kabupaten Madiun.")
            }
          </p>

          {/* Action Button Row */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
            <button
              onClick={togglePlay}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(52,211,153,0.45)] hover:from-emerald-300 hover:to-teal-300 transition-all cursor-pointer active:scale-95"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Jeda Video & Suara</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>{voiceMode === 'asli' ? 'Putar Suara Asli Bupati' : 'Dengarkan Jawaban AI'}</span>
                </>
              )}
            </button>

            <button
              onClick={toggleMute}
              type="button"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer active:scale-95"
              title={isMuted ? 'Bunyikan' : 'Senyapkan'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
