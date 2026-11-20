import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Pause, Play, AudioLines, ArrowUp, ArrowDown } from 'lucide-react';

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
    targetId: 'tour-katalog-box',
    title: 'Katalog 80+ Standar Pelayanan',
    category: 'Katalog Layanan',
    text: 'Ketiga, ini adalah katalog resmi seluruh izin berusaha dan perizinan kependudukan. Dilengkapi filter instansi dan tombol cek detail dokumen persyaratan.',
    audioSrc: '/audio/tour_auto_5_katalog.mp3',
    arrowPosition: 'top'
  },
  {
    id: 'step-6',
    targetId: 'tour-klaster-box',
    title: 'Basis Pengetahuan Per Klaster',
    category: 'Basis Pengetahuan',
    text: 'Keempat, Anda dapat menjelajahi basis pengetahuan per klaster untuk melihat pertanyaan populer seputar izin usaha, pajak daerah, hingga administrasi kependudukan.',
    audioSrc: '/audio/tour_auto_6_klaster.mp3',
    arrowPosition: 'top'
  },
  {
    id: 'step-7',
    targetId: 'tour-contact-card',
    title: 'Helpdesk & Loket Fisik MPP',
    category: 'Bantuan Langsung',
    text: 'Kelima, jika membutuhkan konsultasi atau verifikasi berkas langsung, alamat gedung MPP, telepon kantor, dan WhatsApp Helpdesk resmi siap membantu Anda.',
    audioSrc: '/audio/tour_auto_7_kontak.mp3',
    arrowPosition: 'top'
  },
  {
    id: 'step-8',
    targetId: 'tour-floating-dock',
    title: 'Tombol Melayang Siaga 24 Jam',
    category: 'Tombol Siaga',
    text: 'Terakhir, tombol WhatsApp dan tombol pesan suara selalu melayang di kanan bawah untuk kemudahan akses Anda. Panduan selesai, selamat memanfaatkan layanan kami! Terima kasih.',
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
      }, 400);
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
      }, 400);
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

  const goToNextStepRef = useRef(goToNextStep);
  useEffect(() => {
    goToNextStepRef.current = goToNextStep;
  });

  // Single robust audio lifecycle on mount - Never torn down or paused by step transitions!
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    audio.onended = () => {
      setIsPlaying(false);
      setTimeout(() => {
        goToNextStepRef.current();
      }, 600);
    };

    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);
    audio.onerror = (e) => {
      console.warn('Audio error in tour:', e);
      setIsPlaying(false);
      setTimeout(() => {
        goToNextStepRef.current();
      }, 3500);
    };

    return () => {
      audio.onended = null;
      audio.onplay = null;
      audio.onpause = null;
      audio.onerror = null;
      audio.pause();
      audio.src = '';
    };
  }, []);

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
      }, 70);
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
            console.log('Autoplay waiting for interaction:', err);
            setIsPlaying(false);
          });
      }
    }
  }, [safeStepIndex, isOpen, isMuted]);

  const isScrollingRef = useRef(false);
  const scrollEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Measure element in DOM
  const measureElement = useCallback(() => {
    if (!isOpen || !activeStep) return false;
    const el = document.getElementById(activeStep.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSpotlightRect({
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height
        });
        return true;
      }
    }
    return false;
  }, [isOpen, activeStep]);

  // Smooth scroll and calculate spotlight cutout coordinates with retry for view transitions
  const updateSpotlight = useCallback(() => {
    if (!isOpen || !activeStep) return;

    let attempts = 0;
    const checkAndScroll = () => {
      const el = document.getElementById(activeStep.targetId);
      if (el) {
        isScrollingRef.current = true;
        const computedStyle = window.getComputedStyle(el);
        if (computedStyle.position === 'fixed') {
          // If element is fixed (like the floating dock), scroll smoothly to the bottom of the page
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        } else {
          const navOffset = 90;
          const elementTop = el.getBoundingClientRect().top + window.pageYOffset;
          const scrollToY = Math.max(0, elementTop - navOffset);
          window.scrollTo({ top: scrollToY, behavior: 'smooth' });
        }

        // Wait for smooth scroll to settle before measuring to prevent render jitter
        if (scrollEndTimeoutRef.current) clearTimeout(scrollEndTimeoutRef.current);
        scrollEndTimeoutRef.current = setTimeout(() => {
          measureElement();
          isScrollingRef.current = false;
        }, 320);
      } else if (attempts < 20) {
        attempts++;
        setTimeout(checkAndScroll, 100);
      } else {
        setSpotlightRect(null);
      }
    };

    checkAndScroll();
  }, [activeStep, isOpen, measureElement]);

  useEffect(() => {
    updateSpotlight();

    let rafId: number | null = null;
    const handleScrollResize = () => {
      // Ignore micro-events while smooth programmatic scroll is animating
      if (isScrollingRef.current) return;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        measureElement();
      });
    };

    window.addEventListener('resize', handleScrollResize);
    window.addEventListener('scroll', handleScrollResize, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (scrollEndTimeoutRef.current) clearTimeout(scrollEndTimeoutRef.current);
      window.removeEventListener('resize', handleScrollResize);
      window.removeEventListener('scroll', handleScrollResize);
    };
  }, [updateSpotlight, measureElement]);

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
      {spotlightRect && (() => {
        const winWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const winHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
        const isRightSide = spotlightRect.left + spotlightRect.width / 2 > winWidth / 2;

        const padX = 10;
        const padY = 10;
        const rawLeft = spotlightRect.left - padX;
        const rawTop = spotlightRect.top - padY;
        const rawWidth = spotlightRect.width + padX * 2;
        const rawHeight = spotlightRect.height + padY * 2;

        // Clamp securely inside viewport with margins to prevent horizontal overflow & taskbar clipping
        const left = Math.max(8, Math.min(rawLeft, winWidth - rawWidth - 12));
        const top = Math.max(8, Math.min(rawTop, winHeight - rawHeight - 12));
        const width = Math.min(rawWidth, winWidth - left - 12);
        const height = Math.min(rawHeight, winHeight - top - 12);

        return (
          <div
            className="fixed rounded-2xl pointer-events-none z-20 border-2 border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.55)]"
            style={{
              left,
              top,
              width,
              height,
              boxShadow: '0 0 0 9999px rgba(2, 6, 23, 0.78)',
              transition: 'left 0.45s cubic-bezier(0.16, 1, 0.3, 1), top 0.45s cubic-bezier(0.16, 1, 0.3, 1), width 0.45s cubic-bezier(0.16, 1, 0.3, 1), height 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
              willChange: 'left, top, width, height',
              transform: 'translateZ(0)'
            }}
          >
            {/* Concentric Pulsing Radar Circles at Top-Left */}
            <div className="absolute -top-3.5 -left-3.5 flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-9 w-9 rounded-full bg-emerald-400 opacity-75"></span>
              <span className="animate-pulse absolute inline-flex h-6 w-6 rounded-full bg-emerald-500/50"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400 border-2 border-slate-950 shadow-[0_0_12px_#34d399]"></span>
            </div>

            {/* Concentric Pulsing Radar Circles at Bottom-Right */}
            <div className="absolute -bottom-2 -right-2 flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-7 w-7 rounded-full bg-amber-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400 border-2 border-slate-950 shadow-[0_0_10px_#f59e0b]"></span>
            </div>

            {/* Feature Pointer Arrow & Pill - Smart Alignment to avoid screen boundary clipping */}
            {activeStep.arrowPosition === 'top' ? (
              <div className={`absolute -top-12 ${isRightSide ? 'right-0' : 'left-1/2 -translate-x-1/2'} flex flex-col items-center animate-bounce z-30`}>
                <div 
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-slate-950 font-black text-xs whitespace-nowrap"
                  style={{
                    backgroundColor: '#10b981',
                    color: '#020617',
                    border: '2px solid #ffffff',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.5), 0 0 15px rgba(16,185,129,0.7)'
                  }}
                >
                  <span>{activeStep.title}</span>
                  <ArrowDown className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            ) : (
              <div className={`absolute -bottom-12 ${isRightSide ? 'right-0' : 'left-1/2 -translate-x-1/2'} flex flex-col items-center animate-bounce z-30`}>
                <div 
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-slate-950 font-black text-xs whitespace-nowrap"
                  style={{
                    backgroundColor: '#10b981',
                    color: '#020617',
                    border: '2px solid #ffffff',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.5), 0 0 15px rgba(16,185,129,0.7)'
                  }}
                >
                  <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{activeStep.title}</span>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* 
        2. Cinema Subtitle Bar (Subtitle Berjalan Otomatis di Bawah Layar):
        Solid Opaque Obsidian Dark Slate (#020617) with Emerald Border (#10b981)
        Guaranteed 100% OPAQUE - ANTI-MENYARU on both Light Mode (White background) and Dark Mode.
        Responsive: Rounded card on mobile (< sm), sleek pill on desktop (sm+).
        Never covers the screen or squishes text into a vertical egg!
      */}
      <div className={`fixed ${safeStepIndex === 7 ? 'top-20 sm:top-auto sm:bottom-7' : 'bottom-4 sm:bottom-7'} inset-x-3 sm:inset-x-0 mx-auto w-auto sm:w-fit max-w-[96vw] sm:max-w-3xl z-50 pointer-events-auto`}>
        <div 
          className="rounded-2xl sm:rounded-full px-4 sm:px-6 py-3 text-white transition-all duration-300"
          style={{
            backgroundColor: '#020617',
            color: '#ffffff',
            border: '2px solid #10b981',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.95), 0 0 25px rgba(16, 185, 129, 0.45)'
          }}
        >
          
          {/* DESKTOP LAYOUT (sm+): 1-Line Sleek Cinema Bar */}
          <div className="hidden sm:flex items-center gap-3 sm:gap-4">
            {/* Step Pill & Pulsing Audio Icon */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="p-1.5 rounded-full bg-emerald-500 text-slate-950 shadow-[0_0_12px_#10b981]">
                <AudioLines className="w-3.5 h-3.5 animate-pulse stroke-[3]" />
              </div>
              <span 
                className="font-mono text-xs font-black px-2.5 py-0.5 rounded-full whitespace-nowrap"
                style={{
                  backgroundColor: '#064e3b',
                  color: '#6ee7b7',
                  border: '1px solid #10b981'
                }}
              >
                {safeStepIndex + 1}/{TOUR_STEPS.length}
              </span>
            </div>

            {/* Running Subtitle Text (Karaoke / Typewriter Live Sync) */}
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

          {/* MOBILE LAYOUT (< sm): Clean 2-Row Native Mobile Card */}
          <div className="flex flex-col gap-2 sm:hidden">
            {/* Row 1: Header with Avatar, Step, Category, and Controls */}
            <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1 rounded-full bg-emerald-500 text-slate-950 shadow-[0_0_8px_#10b981]">
                  <AudioLines className="w-3 h-3 animate-pulse stroke-[3]" />
                </div>
                <span 
                  className="font-mono text-[11px] font-black px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: '#064e3b',
                    color: '#6ee7b7',
                    border: '1px solid #10b981'
                  }}
                >
                  {safeStepIndex + 1}/{TOUR_STEPS.length}
                </span>
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider truncate">
                  {activeStep.category}
                </span>
              </div>

              {/* Mobile Playback Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={togglePlay}
                  className="p-1 rounded-full bg-white/10 text-emerald-400"
                  title={isPlaying ? 'Jeda Suara' : 'Lanjutkan Suara'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 text-emerald-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />}
                </button>

                <button
                  onClick={toggleMute}
                  className="p-1 rounded-full bg-white/10 text-white/80"
                  title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>

                <button
                  onClick={handleSkip}
                  className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/40"
                  title="Lewati panduan suara"
                >
                  Lewati
                </button>
              </div>
            </div>

            {/* Row 2: Full-Width Subtitle Text (Natural 2-3 lines, zero vertical squish!) */}
            <p className="text-xs text-white/95 font-medium leading-relaxed drop-shadow">
              "{displayedSubtitle}"
              {displayedSubtitle.length < activeStep.text.length && (
                <span className="inline-block w-1.5 h-3.5 ml-1 bg-emerald-400 animate-pulse align-middle" />
              )}
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
