import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, ShieldCheck } from 'lucide-react';
import { getStoredSettings, subscribeSettings, AppSettings } from '../services/settingsStore';
import { VoiceNoteRecorder } from './VoiceNoteRecorder';

interface HeroSearchProps {
  onSearch: (query: string) => void;
  onVoiceSearch?: (audioBlob: Blob, durationSeconds: number) => void;
  isLoading: boolean;
}

const BG_IMAGES = [
  '/images/backgrounds/bg_mpp_building_2d.jpg',
  '/images/backgrounds/bg_liquid_glass.jpg',
  '/images/backgrounds/bg_topographic_mesh.jpg'
];

export const HeroSearch: React.FC<HeroSearchProps> = ({ onSearch, onVoiceSearch, isLoading }) => {
  const [inputVal, setInputVal] = useState('');
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());
  const [bgIndex, setBgIndex] = useState(0);

  // Typewriter State (Looped every N seconds)
  const [displayedTitle, setDisplayedTitle] = useState('');
  const [displayedSubtitle, setDisplayedSubtitle] = useState('');
  const [isTypingTitle, setIsTypingTitle] = useState(true);
  const [isTypingDone, setIsTypingDone] = useState(false);

  // Subscribe to settings changes from Admin Panel
  useEffect(() => {
    setSettings(getStoredSettings());
    const unsub = subscribeSettings((updated) => {
      setSettings(updated);
    });
    return unsub;
  }, []);

  // Automated Smooth Background Slideshow (Every N seconds)
  useEffect(() => {
    if (settings.bgMode === 'fixed') {
      const idx = BG_IMAGES.indexOf(settings.selectedFixedBg);
      if (idx !== -1) setBgIndex(idx);
      return;
    }

    const intervalMs = Math.max(4, settings.bgAutoIntervalSeconds || 8) * 1000;
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BG_IMAGES.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [settings.bgMode, settings.bgAutoIntervalSeconds, settings.selectedFixedBg]);

  // Smooth Typewriter Loop: Types letter-by-letter, pauses for 5 seconds, then smoothly deletes and repeats
  const fullTitle = settings.heroTitle || 'Halo, saya Buku Saku.';
  const fullSubtitle = settings.heroSubtitle || 'Mau tanya apa soal perizinan di Kabupaten Madiun?';

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let titleChar = 0;
    let subChar = 0;
    let isDeleting = false;
    let isCancelled = false;

    const runTypewriterLoop = () => {
      if (isCancelled) return;

      if (!isDeleting) {
        // 1. Typing Phase
        if (titleChar < fullTitle.length) {
          titleChar++;
          setDisplayedTitle(fullTitle.slice(0, titleChar));
          setIsTypingTitle(true);
          setIsTypingDone(false);
          timeoutId = setTimeout(runTypewriterLoop, 40);
        } else if (subChar < fullSubtitle.length) {
          setIsTypingTitle(false);
          subChar++;
          setDisplayedSubtitle(fullSubtitle.slice(0, subChar));
          setIsTypingDone(false);
          timeoutId = setTimeout(runTypewriterLoop, 30);
        } else {
          // Both lines are fully typed!
          setIsTypingDone(true);
          // Hold the complete text for 5 seconds so users can read comfortably
          timeoutId = setTimeout(() => {
            isDeleting = true;
            runTypewriterLoop();
          }, 5000);
        }
      } else {
        // 2. Smooth Deleting Phase
        if (subChar > 0) {
          subChar--;
          setDisplayedSubtitle(fullSubtitle.slice(0, subChar));
          setIsTypingDone(false);
          timeoutId = setTimeout(runTypewriterLoop, 15);
        } else if (titleChar > 0) {
          setIsTypingTitle(true);
          titleChar--;
          setDisplayedTitle(fullTitle.slice(0, titleChar));
          setIsTypingDone(false);
          timeoutId = setTimeout(runTypewriterLoop, 15);
        } else {
          // Fully cleared! Pause briefly, then restart typing cycle
          isDeleting = false;
          setIsTypingTitle(true);
          timeoutId = setTimeout(runTypewriterLoop, 450);
        }
      }
    };

    runTypewriterLoop();

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [fullTitle, fullSubtitle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim() && !isLoading) {
      onSearch(inputVal.trim());
    }
  };

  const handleChipClick = (chip: string) => {
    setInputVal(chip);
    onSearch(chip);
  };

  return (
    <section className="relative overflow-hidden text-white pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 min-h-[750px] sm:min-h-[85vh] lg:min-h-[90vh] flex flex-col justify-center transition-all duration-700 bg-slate-950">
      
      {/* Background Slideshow Layer with Smooth Crossfade - 16:9 Full Bleed */}
      {BG_IMAGES.map((img, i) => (
        <div
          key={img}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out pointer-events-none ${
            i === bgIndex ? 'opacity-100 z-0' : 'opacity-0 z-0'
          }`}
          style={{ backgroundImage: `url("${img}")` }}
        />
      ))}

      {/* Modern Frosted Dark Ambient Overlay - Keeps 2D building visible while maximizing text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/90 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(6,78,59,0.35)_0%,_transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(2,6,23,0.5)_100%)] pointer-events-none" />

      {/* Luminous Warm White & Champagne Amber Glow Orbs (Diffused Ambience) */}
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] max-w-[95vw] h-[350px] bg-[radial-gradient(ellipse_at_center,_rgba(255,250,235,0.18)_0%,_rgba(254,243,199,0.08)_45%,_transparent_75%)] blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -top-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute right-[-10%] top-[15%] w-[500px] h-[500px] rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center z-10 w-full">
        
        {/* Official Service Notice - Pure Clean White Typography Only (No Capsule, No AI Slop) */}
        <p className="text-xs sm:text-sm font-semibold tracking-widest text-white/90 uppercase mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {settings.heroBadge}
        </p>

        {/* Hero Headline with Animated Typewriter (Looping every 5s) & Warm White Radiance */}
        <div className="relative min-h-[120px] sm:min-h-[145px] flex flex-col justify-center items-center mb-5">
          {/* Subtle Ambient Backlight specifically for the text */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,253,245,0.20)_0%,_rgba(254,240,138,0.07)_50%,_transparent_70%)] blur-xl pointer-events-none" />

          <h1 className="relative font-display font-black text-3xl sm:text-5xl lg:text-[3.25rem] tracking-tight leading-[1.2] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            {/* Line 1: Halo, saya Buku Saku. */}
            <span className="text-white drop-shadow-[0_0_28px_rgba(255,253,245,0.85)] drop-shadow-[0_0_55px_rgba(254,243,199,0.45)]">
              {displayedTitle}
            </span>
            {isTypingTitle && (
              <span className="inline-block w-[3px] h-[0.9em] ml-1.5 bg-amber-200 rounded-full shadow-[0_0_12px_rgba(255,250,230,0.95)] animate-pulse align-middle" />
            )}

            <br className="hidden sm:inline" />

            {/* Line 2: Mau tanya apa soal perizinan di Kabupaten Madiun? */}
            <span className="bg-gradient-to-r from-amber-100 via-amber-200 to-yellow-300 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(254,243,199,0.65)] drop-shadow-[0_0_65px_rgba(251,191,36,0.35)]">
              {displayedSubtitle}
            </span>
            {!isTypingTitle && !isTypingDone && (
              <span className="inline-block w-[3px] h-[0.9em] ml-1.5 bg-amber-300 rounded-full shadow-[0_0_14px_rgba(252,211,77,0.95)] animate-pulse align-middle" />
            )}
            {isTypingDone && (
              <span className="inline-block w-[3px] h-[0.85em] ml-1.5 bg-amber-200/80 rounded-full shadow-[0_0_10px_rgba(255,250,230,0.8)] animate-[pulse_2s_ease-in-out_infinite] align-middle opacity-75" />
            )}
          </h1>
        </div>

        {/* Clean, Modern Subtitle */}
        <p className="text-slate-200/90 text-sm sm:text-base max-w-2xl mx-auto mb-8 font-normal leading-relaxed drop-shadow-sm px-2">
          {settings.heroDesc}
        </p>

        {/* Search Box - Liquid Glass Aesthetic */}
        <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto mb-5 px-1 sm:px-0">
          <div className="relative group">
            {/* Luminous Glow Halo behind search bar */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-300/25 via-emerald-400/20 to-amber-300/25 blur-xl opacity-70 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="relative flex items-center rounded-2xl liquid-glass p-2 sm:p-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.5)] transition-all duration-300 focus-within:border-white/60 focus-within:ring-2 focus-within:ring-white/30">
              <div className="pl-3.5 pr-2 text-white/90 shrink-0">
                <Search className="w-5 h-5 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
              </div>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Tanya Buku Saku... atau bicara lewat Voice Note"
                className="w-full bg-transparent py-2 px-2 text-white placeholder-white/60 focus:outline-none text-sm sm:text-base font-medium"
                disabled={isLoading}
              />
              {onVoiceSearch && (
                <div className="shrink-0 pr-1.5">
                  <VoiceNoteRecorder
                    onSendVoice={(blob, sec) => onVoiceSearch(blob, sec)}
                    disabled={isLoading}
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading || !inputVal.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold text-sm shadow-[0_4px_18px_rgba(245,158,11,0.35)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
              >
                <span>{isLoading ? 'Memproses...' : 'Tanya'}</span>
                {!isLoading && <ArrowRight className="w-4 h-4 stroke-[2.5]" />}
              </button>
            </div>
          </div>
        </form>

        {/* Quick Suggestion Chips - Liquid Glass Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs mb-8 max-w-2xl mx-auto px-2">
          <span className="font-semibold text-white/80 mr-1">Coba:</span>
          {settings.quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(chip)}
              className="liquid-glass px-4 py-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/25 transition-all duration-200 cursor-pointer font-medium active:scale-95 shadow-sm hover:shadow-[0_0_12px_rgba(255,255,255,0.2)]"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Trust Verification Note - Liquid Glass Badge */}
        <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full liquid-glass text-xs text-white/90 mb-10 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{settings.trustBadge}</span>
        </div>

        {/* 4 Stats Band - Pure Liquid Glass Floating Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto text-center px-1">
          <div className="p-4 rounded-2xl liquid-glass transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group">
            <div className="font-display font-extrabold text-2xl sm:text-3xl text-amber-300 group-hover:text-amber-200 transition-colors drop-shadow-[0_0_12px_rgba(252,211,77,0.3)]">
              {settings.stat1Value}
            </div>
            <div className="text-xs text-white/80 font-medium mt-1">{settings.stat1Label}</div>
          </div>
          <div className="p-4 rounded-2xl liquid-glass transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group">
            <div className="font-display font-extrabold text-2xl sm:text-3xl text-emerald-300 group-hover:text-emerald-200 transition-colors drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]">
              {settings.stat2Value}
            </div>
            <div className="text-xs text-white/80 font-medium mt-1">{settings.stat2Label}</div>
          </div>
          <div className="p-4 rounded-2xl liquid-glass transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group">
            <div className="font-display font-extrabold text-2xl sm:text-3xl text-amber-300 group-hover:text-amber-200 transition-colors drop-shadow-[0_0_12px_rgba(252,211,77,0.3)]">
              {settings.stat3Value}
            </div>
            <div className="text-xs text-white/80 font-medium mt-1">{settings.stat3Label}</div>
          </div>
          <div className="p-4 rounded-2xl liquid-glass transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group">
            <div className="font-display font-extrabold text-2xl sm:text-3xl text-emerald-300 group-hover:text-emerald-200 transition-colors drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]">
              {settings.stat4Value}
            </div>
            <div className="text-xs text-white/80 font-medium mt-1">{settings.stat4Label}</div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSearch;
