import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Grid, 
  TrendingUp, 
  PhoneCall, 
  Moon, 
  Sun, 
  LogIn, 
  Home, 
  ChevronDown,
  Store,
  Landmark,
  UserCheck,
  ShieldCheck,
  Receipt,
  HeartHandshake,
  FileCheck,
  Menu,
  X
} from 'lucide-react';
import { KategoriPerizinan } from '../types/perizinan';
import { getStoredKlaster, subscribeKlaster } from '../services/klasterStore';
import { getStoredSettings, subscribeSettings, AppSettings } from '../services/settingsStore';

interface NavbarProps {
  onHomeClick: () => void;
  onPerizinanClick: () => void;
  onTelusuriClick: () => void;
  onSelectCategory: (cat: KategoriPerizinan) => void;
  onPopulerClick: () => void;
  onKontakClick: () => void;
  onLoginClick: () => void;
  isAdminLoggedIn?: boolean;
  onAdminPanelClick?: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onHomeClick,
  onPerizinanClick,
  onTelusuriClick,
  onSelectCategory,
  onPopulerClick,
  onKontakClick,
  onLoginClick,
  isAdminLoggedIn = false,
  onAdminPanelClick,
  isDarkMode,
  toggleDarkMode
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());
  const [klasterList, setKlasterList] = useState<KategoriPerizinan[]>(getStoredKlaster());

  useEffect(() => {
    setSettings(getStoredSettings());
    setKlasterList(getStoredKlaster());
    const unsubKlaster = subscribeKlaster((updated) => {
      setKlasterList(updated);
    });
    const unsub = subscribeSettings((updated) => {
      setSettings(updated);
    });
    return () => {
      unsubKlaster();
      unsub();
    };
  }, []);

  // Dynamic Island Scroll Observer (Perbesar / Perkecil with fluid spring curve)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getCategoryIcon = (key: string) => {
    switch (key) {
      case 'usaha': return <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case 'pajak': return <Landmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case 'dukcapil': return <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case 'hukum': return <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case 'kpp': return <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case 'sosial': return <HeartHandshake className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      default: return <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
    }
  };

  return (
    <header className="sticky top-0 z-50 px-2.5 sm:px-6 pt-2.5 sm:pt-3 pb-2 transition-all duration-500 pointer-events-none">
      
      {/* Dynamic Island Header Outer Container with Continuous Running Warm-White Border Beam */}
      <div 
        className={`pointer-events-auto relative mx-auto p-[1.5px] overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isScrolled 
            ? 'max-w-4xl rounded-full shadow-2xl shadow-emerald-950/40 scale-[0.98]'
            : 'max-w-7xl rounded-2xl shadow-xl shadow-emerald-950/20 scale-100'
        }`}
      >
        {/* Continuous Running Border Beam in Warm White */}
        <div className="absolute -inset-[250%] pointer-events-none animate-border-beam-spin">
          <div className="w-full h-full bg-conic-warm-white filter drop-shadow-[0_0_8px_rgba(255,248,230,0.85)]" />
        </div>

        {/* Base Static Border for Always-Crisp Definition */}
        <div className="absolute inset-0 rounded-[inherit] border border-white/20 pointer-events-none z-[1]" />

        {/* Inner Liquid Glass Container - Deep Emerald Liquid Glass with Crisp White Elements */}
        <div 
          className={`relative z-10 w-full rounded-[inherit] flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] liquid-glass-dark text-white ${
            isScrolled 
              ? 'px-4 sm:px-5 py-2' 
              : 'px-4 sm:px-6 py-2.5 sm:py-3.5'
          }`}
        >
          {/* Strictly Clipped Internal Sheen Layer (Prevents Glow From Bleeding Past Capsule Borders) */}
          <div className="liquid-sheen-clipper">
            <div className="liquid-sheen-beam" />
          </div>
        
        {/* Dual Brand: Official MPP Madiun & Buku Saku */}
        <button 
          onClick={() => {
            onHomeClick();
            setMobileMenuOpen(false);
          }}
          className="relative z-10 flex items-center gap-2 sm:gap-2.5 text-left focus:outline-none group pl-1 shrink-0"
          title="Mal Pelayanan Publik (MPP) & Buku Saku Kabupaten Madiun"
        >
          {/* MPP Madiun HD Official Emblem */}
          <img 
            src={settings.logoMppUrl || "/images/logo_mpp_madiun_hd.png"} 
            alt="Logo Mal Pelayanan Publik Kabupaten Madiun" 
            className={`w-auto object-contain drop-shadow transition-all duration-300 group-hover:scale-105 ${
              isScrolled ? 'h-7 sm:h-8' : 'h-8 sm:h-9 md:h-10'
            }`} 
          />

          {/* Vertical divider */}
          <div className="h-5 sm:h-6 w-px bg-white/30 rounded-full shrink-0" />

          {/* Buku Saku Official Logo */}
          <img 
            src={settings.logoWhiteUrl || "/images/logo_buku_saku_white_gold.png"} 
            alt="Logo Buku Saku MPP Kabupaten Madiun" 
            className={`w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-all duration-300 ${
              isScrolled ? 'h-6 sm:h-7' : 'h-7 sm:h-8 md:h-9'
            }`} 
          />
        </button>

        {/* Center Desktop Navigation (Responsive on xl/lg) */}
        <nav className="relative z-10 hidden lg:flex items-center gap-1 text-sm font-medium">
          <button
            onClick={onHomeClick}
            className="px-3 py-1.5 rounded-full text-emerald-100 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Home className="w-4 h-4 text-mpp-bright shrink-0" />
            <span>Beranda</span>
          </button>

          {/* Perizinan (Katalog 82+ Layanan) */}
          <button
            onClick={onPerizinanClick}
            className="px-3 py-1.5 rounded-full text-emerald-100 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <FileCheck className="w-4 h-4 text-mpp-bright shrink-0" />
            <span>Perizinan</span>
          </button>

          {/* Telusuri Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="px-3 py-1.5 rounded-full text-emerald-100 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 whitespace-nowrap"
              aria-expanded={dropdownOpen}
            >
              <Grid className="w-4 h-4 text-mpp-bright shrink-0" />
              <span>Telusuri</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Klaster Pelayanan Terpadu
                  </div>
                  {klasterList.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => {
                        onSelectCategory(cat);
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-emerald-50/80 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors text-slate-800 dark:text-slate-200"
                    >
                      <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700">
                        {getCategoryIcon(cat.key)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{cat.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{cat.desc}</div>
                      </div>
                    </button>
                  ))}
                  <div className="border-t border-slate-200 dark:border-slate-800 mt-1 pt-1.5 px-2">
                    <button
                      onClick={() => {
                        onTelusuriClick();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-center py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      Lihat Semua Klaster Pertanyaan
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={onKontakClick}
            className="px-3 py-1.5 rounded-full text-emerald-100 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <PhoneCall className="w-4 h-4 text-mpp-bright shrink-0" />
            <span>Kontak</span>
          </button>
        </nav>

        {/* Actions on Right: Theme Toggle & Login Button (100% Responsive, Zero Offset) */}
        <div className="relative z-10 flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 sm:p-2 rounded-full text-emerald-100 hover:text-white hover:bg-white/10 transition-all shrink-0"
            title={isDarkMode ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-mpp-bright" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Login or Admin Dashboard Button */}
          {isAdminLoggedIn ? (
            <button
              onClick={onAdminPanelClick}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full bg-emerald-500/80 hover:bg-emerald-500 active:bg-emerald-600 text-white font-semibold text-xs tracking-wide border border-emerald-300/40 transition-all shadow-sm shrink-0 whitespace-nowrap active:scale-95"
              title="Buka Panel Admin Buku Saku"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span className="leading-none">Panel Admin</span>
            </button>
          ) : (
            <button
              onClick={onLoginClick}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 text-white font-semibold text-xs sm:text-xs tracking-wide border border-white/25 transition-all shadow-sm shrink-0 whitespace-nowrap active:scale-95"
              title="Login Admin Buku Saku"
            >
              <LogIn className="w-3.5 h-3.5 text-mpp-bright shrink-0" />
              <span className="leading-none">Login</span>
            </button>
          )}

          {/* Mobile Hamburger Menu Button (Visible only on < lg) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-all shrink-0 ml-1"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-mpp-bright" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </div>

      </div>

      {/* Mobile Drawer Dropdown Menu for < lg */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto lg:hidden max-w-4xl mx-auto mt-2 p-3 rounded-2xl liquid-glass-dark border border-white/25 shadow-2xl text-white space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => {
              onHomeClick();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 flex items-center gap-2.5 text-sm font-medium"
          >
            <Home className="w-4 h-4 text-mpp-bright shrink-0" />
            <span>Beranda</span>
          </button>

          <button
            onClick={() => {
              onPerizinanClick();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 flex items-center gap-2.5 text-sm font-medium"
          >
            <FileCheck className="w-4 h-4 text-mpp-bright shrink-0" />
            <span>Perizinan (Katalog 82+)</span>
          </button>

          <button
            onClick={() => {
              onTelusuriClick();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 flex items-center gap-2.5 text-sm font-medium"
          >
            <Grid className="w-4 h-4 text-mpp-bright shrink-0" />
            <span>Telusuri Klaster Layanan</span>
          </button>

          <button
            onClick={() => {
              onKontakClick();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 flex items-center gap-2.5 text-sm font-medium"
          >
            <PhoneCall className="w-4 h-4 text-mpp-bright shrink-0" />
            <span>Kontak & Lokasi MPP</span>
          </button>

          {isAdminLoggedIn ? (
            <button
              onClick={() => {
                if (onAdminPanelClick) onAdminPanelClick();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl bg-emerald-600/60 text-white flex items-center gap-2.5 text-sm font-semibold border border-emerald-400/40"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Panel Admin (Kelola Web)</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onLoginClick();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 flex items-center gap-2.5 text-sm font-medium"
            >
              <LogIn className="w-4 h-4 text-mpp-bright shrink-0" />
              <span>Login Admin</span>
            </button>
          )}
        </div>
      )}

    </header>
  );
};

export default Navbar;
