import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles } from 'lucide-react';

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

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio source: answers with dynamic SOP audio, fallback to authentic cloned Bupati voice
  const activeAudioUrl = audioUrl || '/avatar/bupati_voicebox_real.mp3';

  // Clean description for subtitle preview
  const displaySummary = fallbackText
    ? fallbackText.replace(/[*#_`]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) + '...'
    : 'Panduan resmi standar pelayanan perizinan Mal Pelayanan Publik Kabupaten Madiun.';

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
      video.play().catch(e => console.warn('Video play error:', e));
      if (audio) {
        audio.play().catch(e => console.warn('Audio play error:', e));
      }
      setIsPlaying(true);
      if (onAudioPlay) onAudioPlay();
    }
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

    // When audio finishes, return avatar to calm listening/idle state
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
        
        {/* VIDEO AVATAR STAGE (Digital Human Box) */}
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

          {/* Idle Photo State (Avatar tenang saat selesai berbicara) */}
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
              title="Klik untuk mendengarkan penjelasan suara Bapak Bupati"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.7)] group-hover:scale-110 active:scale-95 transition-transform">
                <Play className="w-6 h-6 fill-current ml-1" />
              </div>
            </button>
          )}

          {/* Micro Status Badge */}
          <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-emerald-400/40 text-[10px] font-bold text-emerald-300 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'}`} />
            <span>{isPlaying ? 'Sedang Menjelaskan...' : 'Siaga Melayani Warga'}</span>
          </div>
        </div>

        {/* DETAILS & PLAYBACK CONTROLS */}
        <div className="flex-1 text-center md:text-left space-y-3 min-w-0 w-full">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Digital Human · Suara Resmi Bapak Bupati Madiun</span>
            </div>
            <h3 className="text-lg sm:text-xl font-display font-black text-white tracking-tight">
              H. Hari Wuryanto, S.H., M.Ak.
            </h3>
            <p className="text-xs sm:text-sm text-emerald-400 font-semibold">
              Bupati Madiun · Panduan Standar Pelayanan MPP
            </p>
          </div>

          {/* Subtitle / Ringkasan Penjelasan */}
          <div className="p-3 rounded-xl bg-slate-950/50 border border-emerald-500/20 shadow-inner">
            <p className="text-xs text-slate-200 font-medium leading-relaxed italic">
              “{displaySummary}”
            </p>
          </div>

          {/* Action Button Row */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
            <button
              onClick={togglePlay}
              type="button"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(52,211,153,0.45)] hover:from-emerald-300 hover:to-teal-300 transition-all cursor-pointer active:scale-95"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Jeda Audio & Video</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Dengarkan Penjelasan Bupati</span>
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
