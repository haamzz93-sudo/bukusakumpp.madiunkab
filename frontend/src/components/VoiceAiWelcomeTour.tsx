import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Pause, Play, X, AudioLines, ArrowUp, ArrowDown } from 'lucide-react';

export interface TourStep {
  id: string;
  targetId: string;
  title: string;
  category: string;
  text: string;
  audioSrc: string;
  arrowPosition?: 'top' | 'bottom';
  isRealSearchTrigger?: boolean;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'step-1',
    targetId: 'tour-brand',
    title: 'Judul Resmi Buku Saku MPP',
    category: 'Sambutan Resmi',
    text: 'Halo, selamat datang di Buku Saku Digital Mal Pelayanan Publik Kabupaten Madiun. Saya adalah asisten suara resmi Anda. Mari kita lihat seluruh fitur layanan di web ini secara otomatis.',
    audioSrc: '/audio/tour_auto_1_intro.mp3',
    arrowPosition: 'bottom'
  },
  {
    id: 'step-2',
    targetId: 'tour-search',
    title: 'Pencarian Cerdas & Pesan Suara',
    category: 'Input Suara & Teks',
    text: 'Pertama, pada kolom pencarian ini, Anda dapat menanyakan persyaratan izin atau alur layanan cukup dengan mengetik atau berbicara langsung lewat tombol pesan suara.',
    audioSrc: '/audio/tour_auto_2_search.mp3',
    arrowPosition: 'top',
    isRealSearchTrigger: true
  },
  {
    id: 'step-3',
    targetId: 'tour-chat-result',
    title: 'Hasil Jawaban Resmi & Pemutar Suara',
    category: 'Jawaban Cerdas RAG',
    text: 'Berikut adalah contoh hasil jawaban resmi. Sistem langsung menyajikan rangkuman standar pelayanan yang akurat, lengkap dengan pemutar pesan suara resmi MPP.',
    audioSrc: '/audio/tour_auto_3_chatdemo.mp3',
    arrowPosition: 'top'
  },
  {
    id: 'step-4',
    targetId: 'tour-stats',
    title: '4 Indikator Mutu Layanan Resmi',
    category: 'Standar Mutu',
    text: 'Kedua, empat indikator ini menjamin lebih dari delapan puluh layanan resmi, seratus persen gratis tanpa perantara, dapat diakses dua puluh empat jam dengan respon cepat.',
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
    title: 'Basis Pengetahuan Per Klaster',
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
    text: 'Kelima, jika membutuhkan konsultasi atau verifikasi berkas langsung, alamat gedung MPP, telepon kantor, dan WhatsApp Helpdesk resmi siap membantu Anda.',
    audioSrc: '/audio/tour_auto_7_kontak.mp3',
    arrowPosition: 'bottom'
  },
  {
    id: 'step-8',
    targetId: 'tour-floating-dock',
    title: 'Tombol Melayang Siaga 24 Jam',
    category: 'Tombol Siaga',
    text: 'Terakhir, tombol WhatsApp dan tombol pesan suara selalu melayang di kanan bawah untuk kemudahan akses Anda. Panduan selesai, selamat memanfaatkan layanan kami!',
    audioSrc: '/audio/tour_auto_8_finish.mp3',
    arrowPosition: 'top'
  }
];

interface VoiceAiWelcomeTourProps {
  isOpen: boolean;
  onClose: () => void;
  onTypeSimulatedQuery?: (text: string) => void;
  onSimulateSearch?: (query: string) => void;
  onBackToHome?: () => void;
}

export const VoiceAiWelcomeTour: React.FC<VoiceAiWelcomeTourProps> = ({ 
  isOpen, 
  onClose,
  onTypeSimulatedQuery,
  onSimulateSearch,
  onBackToHome
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [displayedSubtitle, setDisplayedSubtitle] = useState('');
  const [spotlightRect, setSpotlightRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const typewriterTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Safely clamp step index
  const safeStepIndex = Math.min(Math.max(0, currentStep), TOUR_STEPS.length - 1);
  const activeStep = TOUR_STEPS[safeStepIndex];

  // Auto-advance helper with real state routing
  const goToNextStep = useCallback(() => {
    if (currentStep === 1) {
      // Step 2 Finished -> Execute real search to enter real Chat page for Step 3
      if (onSimulateSearch) {
        onSimulateSearch('syarat izin buka warung kopi');
      }
      setTimeout(() => {
        setCurrentStep(2);
      }, 500);
    } else if (currentStep === 2) {
      // Step 3 Finished -> Return to Landing page for Step 4 (stats), 5 (katalog), 6, 7, 8
      if (onBackToHome) {
        onBackToHome();
      }
      if (onTypeSimulatedQuery) {
        onTypeSimulatedQuery('');
      }
      setTimeout(() => {
        setCurrentStep(3);
      }, 500);
    } else if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Tour Finished: Scroll back to top and close
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (onTypeSimulatedQuery) {
        onTypeSimulatedQuery('');
      }
      localStorage.setItem('bukusaku_tour_completed', 'true');
      onClose();
    }
  }, [currentStep, onSimulateSearch, onBackToHome, onTypeSimulatedQuery, onClose]);

  // Audio lifecycle handler
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const handleEnded = () => {
      setIsPlaying(false);
      // Automatic smooth transition to next step
      setTimeout(() => {
        goToNextStep();
      }, 800);
    };

    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [goToNextStep]);

  // Real Typing in Step 2 into the real HeroSearch Bar
  useEffect(() => {
    if (!isOpen) return;

    if (safeStepIndex === 1 && onTypeSimulatedQuery) {
      const sampleText = 'syarat izin buka warung kopi';
      let charIdx = 0;
      onTypeSimulatedQuery('');

      if (searchInputTimerRef.current) clearInterval(searchInputTimerRef.current);
      searchInputTimerRef.current = setInterval(() => {
        if (charIdx < sampleText.length) {
          charIdx++;
          onTypeSimulatedQuery(sampleText.substring(0, charIdx));
        } else {
          if (searchInputTimerRef.current) clearInterval(searchInputTimerRef.current);
        }
      }, 75);
    }

    return () => {
      if (searchInputTimerRef.current) clearInterval(searchInputTimerRef.current);
    };
  }, [safeStepIndex, isOpen, onTypeSimulatedQuery]);

  // Live Typewriter Subtitle Text synchronized with audio
  useEffect(() => {
    if (!isOpen || !activeStep) return;

    if (typewriterTimerRef.current) {
      clearInterval(typewriterTimerRef.current);
    }

    const fullText = activeStep.text;
    let charIndex = 0;
    setDisplayedSubtitle('');

    const speedMs = 35;
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
      // Calculate top position with 90px offset so navbar and header are clear
      const navOffset = 90;
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
      }, 300);
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
    if (onBackToHome) {
      onBackToHome();
    }
    if (onTypeSimulatedQuery) {
      onTypeSimulatedQuery('');
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
            boxShadow: '0 0 0 9999px rgba(2, 6, 23, 0.78)'
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
            "Bundar-bundar" at Bottom-Right Corner
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
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs shadow-xl border border-white/60 whitespace-nowrap">
                <span>{activeStep.title}</span>
                <ArrowDown className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>
          ) : (
            <div className="absolute -bottom-11 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce z-30">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs shadow-xl border border-white/60 whitespace-nowrap">
                <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />
                <span>{activeStep.title}</span>
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
        High-Contrast Dark Glass (Anti-Menyaru pada mode terang maupun gelap).
        Menampilkan teks lengkap tanpa terpotong '...' sedikitpun!
      */}
      <div className="fixed bottom-5 sm:bottom-7 inset-x-0 mx-auto w-fit max-w-[94vw] sm:max-w-3xl z-50 pointer-events-auto px-2">
        <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 rounded-full bg-slate-950/98 border-2 border-emerald-400/80 shadow-[0_16px_50px_rgba(0,0,0,0.95)] shadow-emerald-950/70 text-white transition-all duration-300">
          
          {/* Step Pill & Pulsing Audio Icon */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="p-1.5 rounded-full bg-emerald-500 text-slate-950 shadow-[0_0_10px_#34d399]">
              <AudioLines className="w-3.5 h-3.5 animate-pulse stroke-[3]" />
            </div>
            <span className="font-mono text-xs font-black text-emerald-300 bg-emerald-950 border border-emerald-500/50 px-2.5 py-0.5 rounded-full whitespace-nowrap">
              {safeStepIndex + 1}/{TOUR_STEPS.length}
            </span>
          </div>

          {/* Running Subtitle Text (Karaoke / Typewriter Live Sync) - FULL TEXT WITHOUT '...' */}
          <div className="flex-1 min-w-0 pr-1">
            <p className="text-xs sm:text-sm text-white font-semibold tracking-wide leading-relaxed drop-shadow">
              "{displayedSubtitle}"
              {displayedSubtitle.length < activeStep.text.length && (
                <span className="inline-block w-1.5 h-3.5 ml-1 bg-emerald-400 animate-pulse align-middle" />
              )}
            </p>
          </div>

          {/* Mini Playback Controls: Pause/Play & Mute */}
          <div className="flex items-center gap-2 shrink-0 border-l border-white/20 pl-2 sm:pl-3">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-emerald-400 transition-colors cursor-pointer"
              title={isPlaying ? 'Jeda Suara' : 'Lanjutkan Suara'}
            >
              {isPlaying ? <Pause className="w-4 h-4 text-emerald-400" /> : <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />}
            </button>

            <button
              onClick={toggleMute}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Skip Tour Button */}
            <button
              onClick={handleSkip}
              className="ml-0.5 px-3 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 hover:text-white text-xs font-bold border border-emerald-400/40 transition-all cursor-pointer whitespace-nowrap active:scale-95"
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
