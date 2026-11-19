import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Pause, Play, X, AudioLines, ArrowUp, ArrowDown, Sparkles, CheckCircle2 } from 'lucide-react';

export interface TourStep {
  id: string;
  targetId: string;
  title: string;
  category: string;
  text: string;
  audioSrc: string;
  arrowPosition?: 'top' | 'bottom';
  isDemoChat?: boolean;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'step-1',
    targetId: 'tour-brand',
    title: 'Judul Resmi Buku Saku MPP',
    category: 'Sambutan Resmi',
    text: 'Halo, selamat datang di Buku Saku Digital Mal Pelayanan Publik Kabupaten Madiun. Saya adalah Voice AI resmi Anda. Mari kita lihat seluruh fitur layanan di web ini secara otomatis.',
    audioSrc: '/audio/tour_auto_1_intro.mp3',
    arrowPosition: 'bottom'
  },
  {
    id: 'step-2',
    targetId: 'tour-search',
    title: 'Pencarian Cerdas & Voice Note',
    category: 'Input Suara & Teks',
    text: 'Pertama, di kolom pencarian ini, Anda bisa menanyakan syarat izin, berkas, atau prosedur, cukup dengan mengetik atau berbicara langsung lewat tombol Voice Note.',
    audioSrc: '/audio/tour_auto_2_search.mp3',
    arrowPosition: 'top'
  },
  {
    id: 'step-3',
    targetId: 'tour-search',
    title: 'Simulasi Respon Cepat AI & Suara',
    category: 'Respon Cerdas',
    text: 'Sistem AI Gemini dan basis regulasi resmi MPP langsung merespons dengan jawaban akurat serta suara balasan resmi, praktis tanpa perlu membaca dokumen tebal.',
    audioSrc: '/audio/tour_auto_3_chatdemo.mp3',
    isDemoChat: true,
    arrowPosition: 'top'
  },
  {
    id: 'step-4',
    targetId: 'tour-stats',
    title: '4 Indikator Mutu Layanan',
    category: 'Standar Mutu',
    text: 'Kedua, empat indikator ini menjamin lebih dari delapan puluh perizinan resmi, seratus persen gratis tanpa pungli, dapat diakses dua puluh empat jam dengan respon cepat.',
    audioSrc: '/audio/tour_auto_4_stats.mp3',
    arrowPosition: 'top'
  },
  {
    id: 'step-5',
    targetId: 'katalog-perizinan',
    title: 'Katalog 80+ Standar Pelayanan',
    category: 'Katalog Layanan',
    text: 'Ketiga, ini adalah katalog resmi seluruh izin berusaha dan perizinan kependudukan. Dilengkapi filter instansi dan tombol cek detail dokumen persyaratan.',
    audioSrc: '/audio/tour_auto_5_katalog.mp3',
    arrowPosition: 'top'
  },
  {
    id: 'step-6',
    targetId: 'telusuri',
    title: 'Klaster Pertanyaan Cepat',
    category: 'Basis Pengetahuan',
    text: 'Keempat, Anda dapat menjelajahi basis pengetahuan per klaster untuk melihat pertanyaan populer seputar izin usaha, pajak daerah, hingga administrasi kependudukan.',
    audioSrc: '/audio/tour_auto_6_klaster.mp3',
    arrowPosition: 'top'
  },
  {
    id: 'step-7',
    targetId: 'kontak',
    title: 'Helpdesk & Loket Fisik MPP',
    category: 'Bantuan Langsung',
    text: 'Kelima, jika butuh verifikasi berkas langsung, alamat loket MPP, telepon kantor, dan WhatsApp Helpdesk resmi siap melayani Anda.',
    audioSrc: '/audio/tour_auto_7_kontak.mp3',
    arrowPosition: 'bottom'
  },
  {
    id: 'step-8',
    targetId: 'tour-floating-dock',
    title: 'Aksi Cepat Melayang 24 Jam',
    category: 'Tombol Siaga',
    text: 'Terakhir, tombol WhatsApp dan Voice Note selalu melayang di kanan bawah untuk kemudahan akses Anda kapan saja. Panduan selesai, selamat menjelajah!',
    audioSrc: '/audio/tour_auto_8_finish.mp3',
    arrowPosition: 'top'
  }
];

interface VoiceAiWelcomeTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAiWelcomeTour: React.FC<VoiceAiWelcomeTourProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [displayedSubtitle, setDisplayedSubtitle] = useState('');
  const [spotlightRect, setSpotlightRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const typewriterTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Safely clamp step index
  const safeStepIndex = Math.min(Math.max(0, currentStep), TOUR_STEPS.length - 1);
  const activeStep = TOUR_STEPS[safeStepIndex];

  // Auto-advance helper
  const goToNextStep = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Tour Finished: Scroll back to top and close
      window.scrollTo({ top: 0, behavior: 'smooth' });
      localStorage.setItem('bukusaku_tour_completed', 'true');
      onClose();
    }
  }, [currentStep, onClose]);

  // Audio lifecycle handler
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setAudioProgress(100);
      // Automatic smooth transition to next step (Zero clicks needed)
      setTimeout(() => {
        goToNextStep();
      }, 700);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [goToNextStep]);

  // Live Typewriter / Running Subtitle Text synchronized with audio
  useEffect(() => {
    if (!isOpen || !activeStep) return;

    if (typewriterTimerRef.current) {
      clearInterval(typewriterTimerRef.current);
    }

    const fullText = activeStep.text;
    let charIndex = 0;
    setDisplayedSubtitle('');

    // Smooth typewriter pace to match natural audio reading
    const speedMs = 38;
    typewriterTimerRef.current = setInterval(() => {
      if (charIndex < fullText.length) {
        charIndex++;
        setDisplayedSubtitle(fullText.substring(0, charIndex));
      } else {
        if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
      }
    }, speedMs);

    return () => {
      if (typewriterTimerRef.current) clearInterval(typewriterTimerRef.current);
    };
  }, [safeStepIndex, isOpen, activeStep]);

  // Play audio automatically upon entering a step
  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    const step = TOUR_STEPS[safeStepIndex];
    if (audioRef.current && step) {
      audioRef.current.src = step.audioSrc;
      audioRef.current.currentTime = 0;
      audioRef.current.muted = isMuted;

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.log('Autoplay prevented waiting for interaction:', err);
            setIsPlaying(false);
          });
      }
    }
  }, [safeStepIndex, isOpen, isMuted]);

  // Smooth scroll and calculate spotlight cutout coordinates
  const updateSpotlight = useCallback(() => {
    if (!isOpen || !activeStep) return;

    const el = document.getElementById(activeStep.targetId);
    if (el) {
      // Calculate top position with 85px offset so navbar and header are clear
      const navOffset = 85;
      const elementTop = el.getBoundingClientRect().top + window.pageYOffset;
      const scrollToY = Math.max(0, elementTop - navOffset);
      window.scrollTo({ top: scrollToY, behavior: 'smooth' });

      // Measure after smooth scroll starts
      setTimeout(() => {
        const rect = el.getBoundingClientRect();
        setSpotlightRect({
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height
        });
      }, 250);
    } else {
      setSpotlightRect(null);
    }
  }, [activeStep, isOpen]);

  useEffect(() => {
    updateSpotlight();
    window.addEventListener('resize', updateSpotlight);
    window.addEventListener('scroll', updateSpotlight, { passive: true });
    return () => {
      window.removeEventListener('resize', updateSpotlight);
      window.removeEventListener('scroll', updateSpotlight);
    };
  }, [updateSpotlight]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    audioRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleSkip = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    localStorage.setItem('bukusaku_tour_completed', 'true');
    onClose();
  };

  if (!isOpen || !activeStep) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none pointer-events-auto">
      
      {/* 
        1. True Spotlight Cutout (Box-shadow Masking):
        The inside of this box is 100% TRANSPARENT and UNBLURRED (sharp content).
        The screen outside is dimmed by the 9999px box-shadow.
      */}
      {spotlightRect && (
        <div
          className="fixed rounded-2xl pointer-events-none transition-all duration-700 ease-out z-20 border-2 border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.55)]"
          style={{
            left: Math.max(6, spotlightRect.left - 10),
            top: Math.max(6, spotlightRect.top - 10),
            width: spotlightRect.width + 20,
            height: spotlightRect.height + 20,
            boxShadow: '0 0 0 9999px rgba(2, 6, 23, 0.76)'
          }}
        >
          {/* 
            "Bundar-bundar" (Concentric Pulsing Radar Circles) at the Top-Left Corner
          */}
          <div className="absolute -top-3.5 -left-3.5 flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-9 w-9 rounded-full bg-emerald-400 opacity-75"></span>
            <span className="animate-pulse absolute inline-flex h-6 w-6 rounded-full bg-emerald-500/50"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400 border-2 border-slate-950 shadow-[0_0_12px_#34d399]"></span>
          </div>

          {/* 
            "Bundar-bundar" at Bottom-Right Corner as well for dynamic balance
          */}
          <div className="absolute -bottom-3.5 -right-3.5 flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-amber-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400 border-2 border-slate-950 shadow-[0_0_10px_#f59e0b]"></span>
          </div>

          {/* 
            "Panah Menunjukkan Fitur" (Animated Bouncing Arrow & Feature Pill)
          */}
          {activeStep.arrowPosition === 'top' ? (
            <div className="absolute -top-11 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce z-30">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold text-xs shadow-xl border border-white/60 whitespace-nowrap">
                <span>{activeStep.title}</span>
                <ArrowDown className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>
          ) : (
            <div className="absolute -bottom-11 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce z-30">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold text-xs shadow-xl border border-white/60 whitespace-nowrap">
                <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />
                <span>{activeStep.title}</span>
              </div>
            </div>
          )}

          {/* Step 3: Minimal Live Response Preview Tag (Unobtrusive) */}
          {activeStep.isDemoChat && (
            <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-[90%] max-w-md p-3 rounded-2xl bg-slate-900/98 border border-emerald-400/60 shadow-2xl backdrop-blur-2xl text-white pointer-events-auto animate-in fade-in zoom-in-95 duration-300 z-40">
              <div className="flex items-center justify-between mb-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Respon Standar DPMPTSP Madiun
                </span>
                <span className="text-white/50">Simulasi AI</span>
              </div>
              <p className="text-xs text-slate-200 leading-snug mb-2 font-normal">
                "Syarat izin warung kopi (risiko rendah): cukup KTP & NPWP, NIB terbit instan gratis via portal OSS."
              </p>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold">
                <AudioLines className="w-3 h-3 animate-pulse" />
                <span>Suara Gadis AI Berbicara Resmi...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fallback dark overlay if target element isn't found */}
      {!spotlightRect && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-20 pointer-events-none" />
      )}

      {/* 
        2. Cinema Subtitle Bar (Subtitle Berjalan Otomatis di Bawah Layar):
        Ultra-sleek, minimalist capsule strip.
        Leaves 95% of the screen completely unobstructed!
      */}
      <div className="fixed bottom-5 sm:bottom-7 inset-x-0 mx-auto w-fit max-w-[94vw] sm:max-w-3xl z-50 pointer-events-auto px-2">
        <div className="flex items-center gap-2.5 sm:gap-3.5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-slate-950/92 border border-emerald-400/50 shadow-[0_12px_40px_rgba(0,0,0,0.85)] shadow-emerald-950/50 backdrop-blur-2xl text-white transition-all duration-300">
          
          {/* Step Pill & Pulsing Audio Icon */}
          <div className="flex items-center gap-1.5 shrink-0 pl-0.5">
            <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <AudioLines className="w-3.5 h-3.5 animate-pulse stroke-[2.5]" />
            </div>
            <span className="font-mono text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full whitespace-nowrap">
              {safeStepIndex + 1}/{TOUR_STEPS.length}
            </span>
          </div>

          {/* Running Subtitle Text (Karaoke / Typewriter Live Sync) */}
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-xs sm:text-sm text-slate-100 font-medium tracking-wide leading-snug line-clamp-2 drop-shadow-sm">
              "{displayedSubtitle}"
              {displayedSubtitle.length < activeStep.text.length && (
                <span className="inline-block w-1.5 h-3 ml-1 bg-emerald-400 animate-pulse align-middle" />
              )}
            </p>
          </div>

          {/* Mini Playback Controls: Pause/Play & Mute */}
          <div className="flex items-center gap-1.5 shrink-0 border-l border-white/15 pl-2 sm:pl-3">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
              title={isPlaying ? 'Jeda Suara' : 'Lanjutkan Suara'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-emerald-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />}
            </button>

            <button
              onClick={toggleMute}
              className="p-1.5 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            {/* Skip Tour Button */}
            <button
              onClick={handleSkip}
              className="ml-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-[11px] font-semibold border border-white/15 transition-all cursor-pointer whitespace-nowrap"
              title="Lewati panduan suara"
            >
              Lewati
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
