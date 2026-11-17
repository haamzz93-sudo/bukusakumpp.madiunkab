import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, ShieldCheck } from 'lucide-react';
import { getStoredSettings, subscribeSettings, AppSettings } from '../services/settingsStore';

interface HeroSearchProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const BG_IMAGES = [
  '/images/backgrounds/bg_liquid_glass.jpg',
  '/images/backgrounds/bg_topographic_mesh.jpg',
  '/images/backgrounds/bg_mpp_civic.jpg'
];

export const HeroSearch: React.FC<HeroSearchProps> = ({ onSearch, isLoading }) => {
  const [inputVal, setInputVal] = useState('');
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());
  const [bgIndex, setBgIndex] = useState(0);

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
    <section className="relative overflow-hidden text-white pt-28 sm:pt-32 pb-20 px-4 transition-all duration-700 bg-slate-950 -mt-[72px] sm:-mt-[76px]">
      
      {/* Background Slideshow Layer with Smooth Crossfade */}
      {BG_IMAGES.map((img, i) => (
        <div
          key={img}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out scale-105 pointer-events-none ${
            i === bgIndex ? 'opacity-100 z-0' : 'opacity-0 z-0'
          }`}
          style={{ backgroundImage: `url("${img}")` }}
        />
      ))}

      {/* High-Grade Liquid Glass Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-emerald-950/85 to-slate-950/95 backdrop-blur-[2px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-600/20 via-transparent to-transparent pointer-events-none" />

      {/* Radial Glass Glow Orbs */}
      <div className="absolute -left-20 -top-20 w-96 h-96 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
      <div className="absolute right-[-10%] top-[10%] w-[500px] h-[500px] rounded-full bg-mpp-bright/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center z-10">
        
        {/* Official Service Notice - Clean typography only, no capsule, no blinking dot */}
        <p className="text-xs sm:text-sm font-semibold tracking-widest text-emerald-300 uppercase mb-4 drop-shadow-sm">
          {settings.heroBadge}
        </p>

        {/* Hero Headline */}
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight leading-tight mb-4 drop-shadow-md">
          {settings.heroTitle} <br className="hidden sm:inline" />
          <span className="text-mpp-bright">{settings.heroSubtitle}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-200/95 text-sm sm:text-base max-w-2xl mx-auto mb-8 font-normal leading-relaxed drop-shadow-sm">
          {settings.heroDesc}
        </p>

        {/* Search Box with Liquid Glass Effect */}
        <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto mb-5">
          <div className="flex items-center rounded-2xl liquid-glass p-2.5 shadow-2xl transition-all focus-within:border-mpp-bright/80 focus-within:ring-2 focus-within:ring-mpp-bright/30">
            <div className="pl-3 pr-2 text-emerald-200">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Tanya Buku Saku... misal: syarat izin buka warung kopi"
              className="w-full bg-transparent py-2 px-2 text-white placeholder-emerald-200/70 focus:outline-none text-sm sm:text-base font-medium"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputVal.trim()}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-mpp-bright hover:bg-mpp-yellow text-slate-950 font-bold text-sm shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <span>{isLoading ? 'Memproses...' : 'Tanya'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-emerald-200/90 mb-7 max-w-2xl mx-auto">
          <span className="font-semibold text-white/80">Coba:</span>
          {settings.quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(chip)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer font-medium active:scale-95"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Trust Verification Note */}
        <div className="flex items-center justify-center gap-2 text-xs text-emerald-200/80 mb-10">
          <ShieldCheck className="w-4 h-4 text-mpp-bright" />
          <span>{settings.trustBadge}</span>
        </div>

        {/* 4 Stats Band - Liquid Glass Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-3xl mx-auto text-center">
          <div className="p-4 rounded-2xl liquid-glass transition-transform hover:-translate-y-1">
            <div className="font-display font-extrabold text-2xl text-mpp-bright">{settings.stat1Value}</div>
            <div className="text-xs text-emerald-200 font-medium mt-1">{settings.stat1Label}</div>
          </div>
          <div className="p-4 rounded-2xl liquid-glass transition-transform hover:-translate-y-1">
            <div className="font-display font-extrabold text-2xl text-emerald-300">{settings.stat2Value}</div>
            <div className="text-xs text-emerald-200 font-medium mt-1">{settings.stat2Label}</div>
          </div>
          <div className="p-4 rounded-2xl liquid-glass transition-transform hover:-translate-y-1">
            <div className="font-display font-extrabold text-2xl text-mpp-bright">{settings.stat3Value}</div>
            <div className="text-xs text-emerald-200 font-medium mt-1">{settings.stat3Label}</div>
          </div>
          <div className="p-4 rounded-2xl liquid-glass transition-transform hover:-translate-y-1">
            <div className="font-display font-extrabold text-2xl text-emerald-300">{settings.stat4Value}</div>
            <div className="text-xs text-emerald-200 font-medium mt-1">{settings.stat4Label}</div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSearch;
