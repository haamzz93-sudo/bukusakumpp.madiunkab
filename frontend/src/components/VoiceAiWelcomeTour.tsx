import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Pause, Play, X, AudioLines, CheckCircle2, MessageSquareText, Search } from 'lucide-react';

export interface TourStep {
  id: string;
  targetId: string;
  title: string;
  category: string;
  text: string;
  audioSrc: string;
  isDemoChat?: boolean;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'step-1',
    targetId: 'tour-brand',
    title: 'Buku Saku Digital MPP Madiun',
    category: '1. Sambutan Resmi',
    text: 'Halo, selamat datang di Buku Saku Digital Mal Pelayanan Publik Kabupaten Madiun. Saya adalah Voice AI resmi Anda. Mari kita lihat seluruh fitur layanan di web ini secara otomatis.',
    audioSrc: '/audio/tour_auto_1_intro.mp3'
  },
  {
    id: 'step-2',
    targetId: 'tour-search',
    title: 'Pencarian & Voice Note ala Spider-Man',
    category: '2. Input Suara & Teks',
    text: 'Pertama, di kolom pencarian ini, Anda bisa menanyakan syarat izin, berkas, atau prosedur, cukup dengan mengetik atau berbicara langsung lewat tombol Voice Note.',
    audioSrc: '/audio/tour_auto_2_search.mp3'
  },
  {
    id: 'step-3',
    targetId: 'tour-search',
    title: 'Jawaban Cerdas & Voice Note Balasan',
    category: '3. Respon AI & Suara',
    text: 'Sistem AI Gemini dan basis regulasi resmi MPP langsung merespons dengan jawaban akurat serta suara balasan resmi, praktis tanpa perlu membaca dokumen tebal.',
    audioSrc: '/audio/tour_auto_3_chatdemo.mp3',
    isDemoChat: true
  },
  {
    id: 'step-4',
    targetId: 'tour-stats',
    title: '4 Indikator Layanan Resmi MPP',
    category: '4. Standar Mutu',
    text: 'Kedua, empat indikator ini menjamin lebih dari delapan puluh perizinan resmi, seratus persen gratis tanpa pungli, dapat diakses dua puluh empat jam dengan respon cepat.',
    audioSrc: '/audio/tour_auto_4_stats.mp3'
  },
  {
    id: 'step-5',
    targetId: 'katalog-perizinan',
    title: 'Katalog 80+ Perizinan Lengkap',
    category: '5. Katalog Izin',
    text: 'Ketiga, ini adalah katalog resmi seluruh izin berusaha dan perizinan kependudukan. Dilengkapi filter instansi dan tombol cek detail dokumen persyaratan.',
    audioSrc: '/audio/tour_auto_5_katalog.mp3'
  },
  {
    id: 'step-6',
    targetId: 'telusuri',
    title: 'Basis Pengetahuan Per Klaster',
    category: '6. Klaster Layanan',
    text: 'Keempat, Anda dapat menjelajahi basis pengetahuan per klaster untuk melihat pertanyaan populer seputar izin usaha, pajak daerah, hingga administrasi kependudukan.',
    audioSrc: '/audio/tour_auto_6_klaster.mp3'
  },
  {
    id: 'step-7',
    targetId: 'kontak',
    title: 'Helpdesk Langsung & Lokasi Loket',
    category: '7. Bantuan Langsung',
    text: 'Kelima, jika butuh verifikasi berkas langsung, alamat loket MPP, telepon kantor, dan WhatsApp Helpdesk resmi siap melayani Anda.',
    audioSrc: '/audio/tour_auto_7_kontak.mp3'
  },
  {
    id: 'step-8',
    targetId: 'tour-floating-dock',
    title: 'Tombol Melayang Siaga 24 Jam',
    category: '8. Akses Cepat',
    text: 'Terakhir, tombol WhatsApp dan Voice Note selalu melayang di kanan bawah untuk kemudahan akses Anda kapan saja. Panduan selesai, selamat menjelajah!',
    audioSrc: '/audio/tour_auto_8_finish.mp3'
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
  const [spotlightRect, setSpotlightRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

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
        The inside of this box is 100% TRANSPARENT and UNBLURRED (crystal clear sharpness).
        The entire screen outside is dimmed by the 9999px box-shadow.
      */}
      {spotlightRect && (
        <div
          className="fixed rounded-2xl pointer-events-none transition-all duration-700 ease-out z-20 border-2 border-emerald-400/90 shadow-[0_0_35px_rgba(52,211,153,0.55)]"
          style={{
            left: Math.max(6, spotlightRect.left - 10),
            top: Math.max(6, spotlightRect.top - 10),
            width: spotlightRect.width + 20,
            height: spotlightRect.height + 20,
            boxShadow: '0 0 0 9999px rgba(2, 6, 23, 0.78)'
          }}
        >
          {/* Active Feature Badge */}
          <div className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
            <AudioLines className="w-3 h-3 stroke-[2.5]" />
            <span>{activeStep.category}</span>
          </div>
        </div>
      )}

      {/* Fallback dark overlay if spotlight element isn't found */}
      {!spotlightRect && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-20 pointer-events-none" />
      )}

      {/* 
        2. Automated Bottom VoiceAI Guidance HUD:
        Single unified flex column anchored at bottom.
        On Step 3, the demo chat preview sits neatly atop the HUD within the same container,
        guaranteeing ZERO overlap and 100% responsiveness on any screen height!
      */}
      <div className="fixed inset-x-0 bottom-3 sm:bottom-5 z-40 flex flex-col items-center px-3 sm:px-4 pointer-events-auto">
        <div className="w-full max-w-lg space-y-2 sm:space-y-2.5">
          
          {/* Step 3: Interactive Demo Chat Preview Card */}
          {activeStep.isDemoChat && (
            <div className="rounded-2xl bg-slate-900/98 border border-emerald-400/60 p-3 sm:p-3.5 shadow-2xl shadow-emerald-950/60 text-white backdrop-blur-xl animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wide">
                  Simulasi Respon Resmi Buku Saku
                </span>
              </div>

              {/* Simulated User Question */}
              <div className="flex items-end justify-end mb-2">
                <div className="max-w-[90%] rounded-xl rounded-br-none bg-emerald-600 px-3 py-1.5 text-xs text-white font-medium shadow-sm">
                  "Bagaimana syarat dan cara buat NIB OSS warung kopi?"
                </div>
              </div>

              {/* Simulated AI Answer with Audio Player */}
              <div className="rounded-xl rounded-tl-none bg-slate-800/90 border border-white/10 p-2.5 text-xs text-slate-200">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 mb-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Standar Pelayanan DPMPTSP · OSS RBA</span>
                </div>
                <p className="leading-relaxed mb-2 text-xs">
                  Untuk warung kopi (risiko rendah), izin NIB terbit otomatis gratis 100% via OSS cukup dengan KTP & NPWP.
                </p>
                {/* Audio Cassette Bar */}
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-emerald-500/30">
                  <div className="p-0.5 rounded-full bg-emerald-500 text-slate-950">
                    <AudioLines className="w-3 h-3 animate-pulse" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-300">Suara Gadis AI Berbicara...</span>
                </div>
              </div>
            </div>
          )}

          {/* Main VoiceAI Tour Guidance HUD */}
          <div className="rounded-2xl sm:rounded-3xl bg-slate-900/95 border border-emerald-500/40 p-3 sm:p-4 shadow-2xl shadow-emerald-950/60 backdrop-blur-2xl text-white">
            
            {/* Top Bar: Voice AI Badge, Auto Timeline, Close */}
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <AudioLines className="w-4 h-4 animate-pulse stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      VoiceAI Buku Saku
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                      Tur Otomatis
                    </span>
                  </div>
                  <span className="text-[10px] text-white/50 block font-medium">
                    {activeStep.category} · Berjalan Tanpa Klik
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Step indicator */}
                <span className="text-xs font-mono font-bold text-slate-300 px-2 py-0.5 rounded-full bg-white/10 border border-white/15">
                  {safeStepIndex + 1} / {TOUR_STEPS.length}
                </span>

                {/* Close / Skip button */}
                <button
                  onClick={handleSkip}
                  className="p-1.5 rounded-xl hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
                  title="Lewati panduan suara & kembali"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Real-time Voice Audio Timeline Bar */}
            <div className="relative w-full h-1 bg-slate-800 rounded-full overflow-hidden mb-2.5">
              <div
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-300 transition-all duration-150 rounded-full shadow-[0_0_8px_#34d399]"
                style={{ width: `${audioProgress}%` }}
              />
            </div>

            {/* Step Title & Narration */}
            <div className="mb-3">
              <h4 className="font-display font-bold text-xs sm:text-sm text-white mb-0.5">
                {activeStep.title}
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-normal bg-slate-950/50 p-2 rounded-xl border border-white/10">
                "{activeStep.text}"
              </p>
            </div>

            {/* Simple Control Toolbar (Pause/Play, Mute, Selesai) */}
            <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/10 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={togglePlay}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold flex items-center gap-1 border border-white/15 transition-all cursor-pointer active:scale-95 text-xs"
                  title={isPlaying ? 'Jeda Suara' : 'Lanjutkan Suara'}
                >
                  {isPlaying ? <Pause className="w-3 h-3 text-emerald-400" /> : <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />}
                  <span>{isPlaying ? 'Jeda' : 'Lanjut'}</span>
                </button>

                <button
                  onClick={toggleMute}
                  className="p-1 rounded-lg hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
                  title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  Otomatis berpindah saat suara selesai
                </span>
                <button
                  onClick={handleSkip}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 font-semibold transition-all cursor-pointer text-xs"
                >
                  Lewati
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
