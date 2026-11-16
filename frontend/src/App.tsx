import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { ChatThread } from './components/ChatThread';
import { TelusuriSection } from './components/TelusuriSection';
import { KatalogPerizinanSection } from './components/KatalogPerizinanSection';
import { PerizinanDetailModal } from './components/PerizinanDetailModal';
import { ContactFooter } from './components/ContactFooter';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { CloudflareMadiunVerification } from './components/CloudflareMadiunVerification';
import { ChatMessage, KategoriPerizinan, Perizinan } from './types/perizinan';
import { askHybridAi } from './services/hybridAiService';
import { getStoredSettings, subscribeSettings, syncSettingsFromBackend } from './services/settingsStore';
import { syncPerizinanFromDatabase } from './services/perizinanStore';
import { syncKlasterFromDatabase } from './services/klasterStore';
import { trackVisitorEvent } from './services/realStatsService';
import { WhatsAppIcon } from './components/WhatsAppIcon';

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'home' | 'chat' | 'telusuri' | 'admin'>('home');
  const [currentQuery, setCurrentQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | undefined>();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Admin & Cloudflare Security States
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('bukusaku_admin_logged') === 'true';
  });
  const [isCloudflareOpen, setIsCloudflareOpen] = useState(false);
  const [pendingAdminRedirect, setPendingAdminRedirect] = useState(false);

  // Settings State for dynamic WhatsApp & phone
  const [appSettings, setAppSettings] = useState(getStoredSettings());

  // Perizinan Detail Modal State
  const [selectedPerizinan, setSelectedPerizinan] = useState<Perizinan | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Initialize theme and hash navigation
  useEffect(() => {
    const savedTheme = localStorage.getItem('bukusaku-theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    if (window.location.hash === '#admin' && isAdminLoggedIn) {
      setViewMode('admin');
    } else if (window.location.hash === '#telusuri') {
      setViewMode('telusuri');
    } else if (window.location.hash === '#perizinan') {
      setTimeout(() => {
        const el = document.getElementById('katalog-perizinan');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }

    // Sync settings, perizinan, and klaster from SQLite database
    syncSettingsFromBackend().then((serverSettings) => {
      if (serverSettings) setAppSettings(serverSettings);
    });
    syncPerizinanFromDatabase();
    syncKlasterFromDatabase();

    const unsubSettings = subscribeSettings((updated) => {
      setAppSettings(updated);
    });
    return unsubSettings;
  }, [isAdminLoggedIn]);

  // Initial visit Cloudflare Verification Splash & Telemetry
  useEffect(() => {
    trackVisitorEvent('visit', 'Warga membuka portal Buku Saku MPP');
    const isVerified = sessionStorage.getItem('bukusaku_initial_cf_verified');
    if (!isVerified) {
      setIsCloudflareOpen(true);
    }
  }, []);

  // Scroll Reveal Observer
  useEffect(() => {
    if (viewMode === 'admin') return;

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [viewMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('bukusaku-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('bukusaku-theme', 'light');
      }
      return next;
    });
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    trackVisitorEvent('tanya_ai', `Warga menanyakan: "${query.substring(0, 40)}${query.length > 40 ? '...' : ''}"`);
    setCurrentQuery(query);
    setViewMode('chat');
    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const result = await askHybridAi(query, [...messages, userMsg]);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: result.answer,
        timestamp: Date.now(),
        via: result.via,
        layer: result.layer,
        sourceItems: result.source_items,
        relatedQuestions: result.related,
        needsHuman: result.needs_human
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'assistant',
        text: `Mohon maaf, sistem sedang dalam antrean tinggi. Silakan ulangi pertanyaan Anda atau hubungi langsung WhatsApp Loket Mal Pelayanan Publik Kabupaten Madiun di ${appSettings.whatsappNumber}.`,
        timestamp: Date.now(),
        needsHuman: true
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPerizinan = (item: Perizinan) => {
    setSelectedPerizinan(item);
    setIsDetailModalOpen(true);
    trackVisitorEvent('cek_izin', `Warga melihat SOP: "${item.title}"`);
  };

  const handleSelectCategory = (cat: KategoriPerizinan) => {
    setSelectedCategoryKey(cat.key);
    setViewMode('telusuri');
    trackVisitorEvent('klaster', `Warga menjelajahi klaster: "${cat.name}"`);
    const el = document.getElementById('telusuri');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setViewMode('home');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToPerizinan = () => {
    if (viewMode !== 'home') {
      setViewMode('home');
    }
    setTimeout(() => {
      const el = document.getElementById('katalog-perizinan');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  const scrollToPopuler = () => {
    if (viewMode !== 'home') {
      setViewMode('home');
    }
    setTimeout(() => {
      const el = document.getElementById('populer');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  const scrollToKontak = () => {
    const el = document.getElementById('kontak');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Login handler with Cloudflare Verification Splash
  const handleLoginSuccess = (username: string) => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('bukusaku_admin_logged', 'true');
    setPendingAdminRedirect(true);
    setIsCloudflareOpen(true);
  };

  const handleCloudflareVerified = () => {
    setIsCloudflareOpen(false);
    sessionStorage.setItem('bukusaku_initial_cf_verified', 'true');
    if (pendingAdminRedirect) {
      setPendingAdminRedirect(false);
      setViewMode('admin');
      window.location.hash = '#admin';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('bukusaku_admin_logged');
    setViewMode('home');
    window.location.hash = '';
  };

  // Clean WhatsApp phone number for link
  const cleanWaNumber = appSettings.whatsappNumber.replace(/[^0-9]/g, '');
  const formattedWaNumber = cleanWaNumber.startsWith('0') 
    ? `62${cleanWaNumber.substring(1)}` 
    : cleanWaNumber;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-darkbg-base transition-colors duration-200">
      
      {/* If viewMode === 'admin', render the full Admin Dashboard Panel */}
      {viewMode === 'admin' ? (
        <AdminDashboard
          onLogout={handleLogout}
          onViewLandingPage={handleBackToHome}
          onTriggerCloudflare={() => setIsCloudflareOpen(true)}
        />
      ) : (
        <>
          {/* Universal Navigation with Dynamic Island Expansion / Contraction */}
          <Navbar
            onHomeClick={handleBackToHome}
            onPerizinanClick={scrollToPerizinan}
            onTelusuriClick={() => {
              setViewMode('telusuri');
              window.location.hash = '#telusuri';
            }}
            onSelectCategory={handleSelectCategory}
            onPopulerClick={scrollToPopuler}
            onKontakClick={scrollToKontak}
            onLoginClick={() => setIsLoginOpen(true)}
            isAdminLoggedIn={isAdminLoggedIn}
            onAdminPanelClick={() => {
              setViewMode('admin');
              window.location.hash = '#admin';
            }}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
          />

          {/* Main Dynamic View */}
          <main className="flex-1">
            {viewMode === 'chat' ? (
              <ChatThread
                messages={messages}
                currentQuery={currentQuery}
                isLoading={isLoading}
                onSendFollowup={handleSearch}
                onBackToHome={handleBackToHome}
              />
            ) : (
              <>
                {/* Hero Search Section (Home) */}
                <div className="reveal-on-scroll">
                  <HeroSearch onSearch={handleSearch} isLoading={isLoading} />
                </div>

                {/* Full 80+ Perizinan Catalog (Matching official website) */}
                <div className="reveal-on-scroll reveal-delay-100">
                  <KatalogPerizinanSection 
                    onSelectPerizinan={handleSelectPerizinan}
                    onAskChat={handleSearch}
                  />
                </div>

                {/* Telusuri / Category Exploration Section */}
                <div className="reveal-on-scroll reveal-delay-200">
                  <TelusuriSection 
                    onSelectQuestion={handleSearch}
                    selectedCategoryKey={selectedCategoryKey}
                  />
                </div>
              </>
            )}
          </main>

          {/* Footer */}
          <ContactFooter />

          {/* Floating WhatsApp Helpdesk Button (Official WhatsApp Icon & Styling) */}
          <a
            href={`https://wa.me/${formattedWaNumber}?text=${encodeURIComponent('Halo Mal Pelayanan Publik (MPP) Kabupaten Madiun, saya butuh informasi perizinan.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center group border border-white/50 shadow-emerald-950/40 cursor-pointer"
            title={`Chat WhatsApp Helpdesk MPP Madiun (${appSettings.whatsappNumber})`}
            aria-label="Chat WhatsApp Helpdesk MPP Madiun"
          >
            <WhatsAppIcon size={32} className="text-white drop-shadow-sm" />
          </a>
        </>
      )}

      {/* Detail Modal for Perizinan */}
      <PerizinanDetailModal
        perizinan={selectedPerizinan}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onAskChat={handleSearch}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Official Diskominfo Madiun Cloudflare Verification Screen */}
      <CloudflareMadiunVerification
        isOpen={isCloudflareOpen}
        onVerified={handleCloudflareVerified}
        onCancel={() => {
          setIsCloudflareOpen(false);
          setPendingAdminRedirect(false);
        }}
        autoCompleteSeconds={2.4}
        rayId="85b5bd7e1ab024e1"
      />

    </div>
  );
};

export default App;
