import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { KatalogPerizinanSection } from './components/KatalogPerizinanSection';
import { TelusuriSection } from './components/TelusuriSection';
import { ContactFooter } from './components/ContactFooter';
import { ChatThread } from './components/ChatThread';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { PerizinanDetailModal } from './components/PerizinanDetailModal';
import { CloudflareMadiunVerification } from './components/CloudflareMadiunVerification';
import { WhatsAppIcon } from './components/WhatsAppIcon';
import { VoiceNoteRecorder } from './components/VoiceNoteRecorder';
import { VoiceAiWelcomeTour } from './components/VoiceAiWelcomeTour';
import { AudioLines, Play, X } from 'lucide-react';
import { ChatMessage, Perizinan, KategoriPerizinan } from './types/perizinan';
import { askHybridAi, sendVoiceNoteAi } from './services/hybridAiService';
import { getStoredSettings, syncSettingsFromBackend, subscribeSettings } from './services/settingsStore';
import { getStoredPerizinan, syncPerizinanFromDatabase } from './services/perizinanStore';
import { syncKlasterFromDatabase } from './services/klasterStore';
import { trackVisitorEvent } from './services/realStatsService';
import { 
  AppRoute, 
  AdminTab, 
  parseCurrentRoute, 
  navigateTo, 
  subscribeRoute 
} from './services/appRouter';

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'home' | 'chat' | 'telusuri' | 'admin'>('home');
  const [currentQuery, setCurrentQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | undefined>();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  
  // Admin & Security States
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

  // Voice AI Interactive Welcome Tour States
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [simulatedTourQuery, setSimulatedTourQuery] = useState('');
  const [hasDismissedTourPrompt, setHasDismissedTourPrompt] = useState<boolean>(() => {
    return localStorage.getItem('bukusaku_tour_prompt_dismissed') === 'true' || localStorage.getItem('bukusaku_tour_completed') === 'true';
  });

  const startWelcomeTour = () => {
    setIsTourOpen(true);
    setHasDismissedTourPrompt(true);
    localStorage.setItem('bukusaku_tour_prompt_dismissed', 'true');
  };

  // Real Tour Walkthrough Search Simulator
  const handleSimulateTourSearch = (query: string) => {
    executedQueryRef.current = query;
    navigateTo({ name: 'tanya', query }, { scroll: false });

    const userMsg: ChatMessage = {
      id: `tour-user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: Date.now()
    };
    const botMsg: ChatMessage = {
      id: `tour-bot-${Date.now()}`,
      role: 'assistant',
      text: 'Berdasarkan standar pelayanan resmi DPMPTSP Kabupaten Madiun (SOP OSS-RBA):\n\n1. Untuk usaha warung kopi (KBLI 56303 / risiko rendah), perizinan berusaha diterbitkan otomatis berupa Nomor Induk Berusaha (NIB).\n2. Persyaratan Utama: KTP pemohon, NPWP, dan titik koordinat lokasi usaha.\n3. Biaya: Rp 0 (100% Gratis Tanpa Pungli).\n4. Jangka Waktu: Terbit instan (10 menit) melalui portal OSS terintegrasi loket MPP.',
      audioUrl: '/audio/tour_auto_3_chatdemo.mp3',
      timestamp: Date.now(),
      via: 'gemini-llm-rag',
      sourceItems: [
        {
          name: 'Standar Pelayanan Penerbitan NIB Usaha Mikro dan Kecil Risiko Rendah',
          instansi: 'DPMPTSP Kab. Madiun'
        }
      ]
    };
    setMessages([userMsg, botMsg]);
    setCurrentQuery(query);
    setViewMode('chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Ref to prevent duplicate queries on direct URL mount
  const executedQueryRef = useRef<string>('');

  // Core Search Execution Engine
  const executeQuery = useCallback(async (query: string, isFollowup: boolean = false) => {
    if (!query.trim()) return;

    executedQueryRef.current = query;
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

    if (isFollowup) {
      setMessages(prev => [...prev, userMsg]);
    } else {
      setMessages([userMsg]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    try {
      const historyToSend = isFollowup ? [...messages, userMsg] : [];
      const result = await askHybridAi(query, historyToSend);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: result.answer,
        timestamp: Date.now(),
        via: result.via,
        layer: result.layer,
        sourceItems: result.source_items,
        relatedQuestions: result.related,
        needsHuman: result.needs_human,
        isAudio: Boolean(result.audio_url),
        audioUrl: result.audio_url
      };

      if (isFollowup) {
        setMessages(prev => [...prev, botMsg]);
      } else {
        setMessages([userMsg, botMsg]);
      }
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'assistant',
        text: `Mohon maaf, sistem sedang dalam antrean tinggi. Silakan ulangi pertanyaan Anda atau hubungi langsung WhatsApp Loket Mal Pelayanan Publik Kabupaten Madiun di ${appSettings.whatsappNumber}.`,
        timestamp: Date.now(),
        needsHuman: true
      };
      if (isFollowup) {
        setMessages(prev => [...prev, fallbackMsg]);
      } else {
        setMessages([userMsg, fallbackMsg]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [messages, appSettings.whatsappNumber]);

  // Spider-Man Style Voice Note Query Handler (Audio in -> Transcribe -> RAG -> Neural Audio Out)
  const executeVoiceQuery = useCallback(async (audioBlob: Blob, durationSeconds: number, isFollowup: boolean = false) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    trackVisitorEvent('voice_note_ai', `Warga bersuara (${durationSeconds}s)`);
    setCurrentQuery('Memproses pesan suara...');
    setViewMode('chat');
    setIsLoading(true);

    const userMsgId = `user-voice-${Date.now()}`;
    const userVoiceMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text: 'Pesan Suara Anda',
      timestamp: Date.now(),
      isAudio: true,
      audioUrl: audioUrl,
      audioDuration: durationSeconds
    };

    if (isFollowup) {
      setMessages(prev => [...prev, userVoiceMsg]);
    } else {
      setMessages([userVoiceMsg]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    try {
      const result = await sendVoiceNoteAi(audioBlob);

      const transcribedQuery = result.transcription || 'Pesan Suara';
      setCurrentQuery(transcribedQuery);

      const updatedUserMsg: ChatMessage = {
        ...userVoiceMsg,
        text: `"${transcribedQuery}"`,
        transcription: transcribedQuery
      };

      const botVoiceMsg: ChatMessage = {
        id: `bot-voice-${Date.now()}`,
        role: 'assistant',
        text: result.answer,
        timestamp: Date.now(),
        via: result.via,
        layer: result.layer,
        sourceItems: result.source_items,
        relatedQuestions: result.related,
        needsHuman: result.needs_human,
        isAudio: Boolean(result.audio_url),
        audioUrl: result.audio_url
      };

      if (isFollowup) {
        setMessages(prev => [...prev.map(m => m.id === userMsgId ? updatedUserMsg : m), botVoiceMsg]);
      } else {
        setMessages([updatedUserMsg, botVoiceMsg]);
      }
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'assistant',
        text: `Mohon maaf, pesan suara tidak dapat diproses. Silakan ulangi dengan berbicara lebih dekat ke mikrofon atau hubungi loket MPP di ${appSettings.whatsappNumber}.`,
        timestamp: Date.now(),
        needsHuman: true
      };
      if (isFollowup) {
        setMessages(prev => [...prev, fallbackMsg]);
      } else {
        setMessages([userVoiceMsg, fallbackMsg]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [appSettings.whatsappNumber]);

  // Route Dispatcher: updates UI state according to clean SaaS URL
  const handleRouteUpdate = useCallback((route: AppRoute) => {
    switch (route.name) {
      case 'home':
        setViewMode('home');
        setIsDetailModalOpen(false);
        setIsLoginOpen(false);
        break;

      case 'perizinan':
        setViewMode('home');
        setIsLoginOpen(false);
        if (route.slug) {
          const items = getStoredPerizinan();
          const targetSlug = route.slug.toLowerCase();
          const found = items.find(p => 
            p.slug?.toLowerCase() === targetSlug || 
            String(p.id) === targetSlug
          );
          if (found) {
            setSelectedPerizinan(found);
            setIsDetailModalOpen(true);
          } else {
            setIsDetailModalOpen(false);
          }
        } else {
          setIsDetailModalOpen(false);
        }
        break;

      case 'telusuri':
        setViewMode('telusuri');
        setIsDetailModalOpen(false);
        setIsLoginOpen(false);
        if (route.klasterKey) {
          setSelectedCategoryKey(route.klasterKey);
        }
        break;

      case 'tanya':
        setIsDetailModalOpen(false);
        setIsLoginOpen(false);
        if (route.query) {
          if (route.query !== executedQueryRef.current) {
            executeQuery(route.query, false);
          } else {
            setViewMode('chat');
          }
        } else if (messages.length > 0) {
          setViewMode('chat');
        } else {
          setViewMode('home');
        }
        break;

      case 'kontak':
        setViewMode('home');
        setIsDetailModalOpen(false);
        setIsLoginOpen(false);
        break;

      case 'login':
        if (isAdminLoggedIn) {
          setViewMode('admin');
          setAdminTab('dashboard');
          navigateTo({ name: 'admin', tab: 'dashboard' }, { replace: true });
        } else {
          setIsLoginOpen(true);
        }
        break;

      case 'admin':
        if (isAdminLoggedIn) {
          setViewMode('admin');
          const savedTab = (typeof window !== 'undefined' ? localStorage.getItem('bukusaku_admin_active_tab') : null) as any;
          const chosenTab = route.tab && route.tab !== 'dashboard'
            ? route.tab
            : (savedTab && ['dashboard', 'perizinan', 'rag', 'ai', 'web', 'klaster', 'users'].includes(savedTab) ? savedTab : 'dashboard');
          setAdminTab(chosenTab);
          setIsLoginOpen(false);
          setIsDetailModalOpen(false);
        } else {
          setIsLoginOpen(true);
        }
        break;
    }
  }, [isAdminLoggedIn, messages.length, executeQuery]);

  // Initialize theme, sync stores, and subscribe to HTML5 History Routing
  useEffect(() => {
    const savedTheme = localStorage.getItem('bukusaku-theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    // Sync settings, perizinan, and klaster from SQLite database
    syncSettingsFromBackend().then((serverSettings) => {
      if (serverSettings) setAppSettings(serverSettings);
    });
    syncPerizinanFromDatabase().then(() => {
      // Re-check if current route was an SOP slug and load it
      const current = parseCurrentRoute();
      if (current.name === 'perizinan' && current.slug) {
        handleRouteUpdate(current);
      }
    });
    syncKlasterFromDatabase();

    const unsubSettings = subscribeSettings((updated) => {
      setAppSettings(updated);
    });

    // Subscribe to clean HTML5 URL routing (pops, clean url replaces, pushState)
    const unsubRoute = subscribeRoute((route) => {
      handleRouteUpdate(route);
    });

    // Initial route handling on page mount
    const initialRoute = parseCurrentRoute();
    handleRouteUpdate(initialRoute);

    return () => {
      unsubSettings();
      unsubRoute();
    };
  }, [handleRouteUpdate]);

  // Initial visit Cloudflare Verification Splash & Telemetry
  useEffect(() => {
    trackVisitorEvent('visit', 'Warga membuka portal Buku Saku MPP');
    const isVerified = localStorage.getItem('bukusaku_initial_cf_verified');
    const loggedIn = localStorage.getItem('bukusaku_admin_logged') === 'true';
    if (!isVerified && !loggedIn) {
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

  // User Actions mapped to clean SaaS URLs
  const handleSearch = (query: string, isFollowup: boolean = false) => {
    executedQueryRef.current = query;
    if (isFollowup) {
      navigateTo({ name: 'tanya', query }, { replace: true, scroll: false });
      executeQuery(query, true);
    } else {
      navigateTo({ name: 'tanya', query }, { scroll: false });
      executeQuery(query, false);
    }
  };

  const handleVoiceSearch = (audioBlob: Blob, durationSeconds: number, isFollowup: boolean = false) => {
    executedQueryRef.current = 'Pesan Suara';
    navigateTo({ name: 'tanya', query: 'Pesan Suara' }, { scroll: false });
    executeVoiceQuery(audioBlob, durationSeconds, isFollowup);
  };

  const handleSelectPerizinan = (item: Perizinan) => {
    setSelectedPerizinan(item);
    setIsDetailModalOpen(true);
    navigateTo({ name: 'perizinan', slug: item.slug || String(item.id) }, { scroll: false });
    trackVisitorEvent('cek_izin', `Warga melihat SOP: "${item.title}"`);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    // Return clean URL to /perizinan or previous route
    const current = parseCurrentRoute();
    if (current.name === 'perizinan') {
      navigateTo({ name: 'perizinan' }, { scroll: false });
    }
  };

  const handleSelectCategory = (cat: KategoriPerizinan) => {
    setSelectedCategoryKey(cat.key);
    navigateTo({ name: 'telusuri', klasterKey: cat.key });
    trackVisitorEvent('klaster', `Warga menjelajahi klaster: "${cat.name}"`);
  };

  const handleBackToHome = () => {
    navigateTo({ name: 'home' });
  };

  const scrollToPerizinan = () => {
    navigateTo({ name: 'perizinan' });
  };

  const scrollToPopuler = () => {
    navigateTo({ name: 'home' });
    setTimeout(() => {
      const el = document.getElementById('populer');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  const scrollToKontak = () => {
    navigateTo({ name: 'kontak' });
  };

  // Login handler with Permanent Session (Never logs out automatically)
  const handleLoginSuccess = (userName: string) => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('bukusaku_admin_logged', 'true');
    localStorage.setItem('bukusaku_admin_user_name', userName);
    localStorage.setItem('bukusaku_initial_cf_verified', 'true');
    setViewMode('admin');
    setAdminTab('dashboard');
    navigateTo({ name: 'admin', tab: 'dashboard' });
  };

  const handleCloudflareVerified = () => {
    setIsCloudflareOpen(false);
    localStorage.setItem('bukusaku_initial_cf_verified', 'true');
    if (pendingAdminRedirect) {
      setPendingAdminRedirect(false);
      setViewMode('admin');
      setAdminTab('dashboard');
      navigateTo({ name: 'admin', tab: 'dashboard' });
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('bukusaku_admin_logged');
    localStorage.removeItem('bukusaku_admin_user_name');
    localStorage.removeItem('bukusaku_admin_active_tab');
    setViewMode('home');
    navigateTo({ name: 'home' });
  };

  const handleCloseLoginModal = () => {
    setIsLoginOpen(false);
    const current = parseCurrentRoute();
    if (current.name === 'login') {
      navigateTo({ name: 'home' }, { scroll: false });
    }
  };

  // Clean WhatsApp phone number for link
  const cleanWaNumber = appSettings.whatsappNumber.replace(/[^0-9]/g, '');
  const formattedWaNumber = cleanWaNumber.startsWith('0') 
    ? `62${cleanWaNumber.substring(1)}` 
    : cleanWaNumber;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 relative">
      
      {/* Ambient Organic Liquid Glass Glow Orbs (Refracts through white & dark liquid glass) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-400/15 dark:bg-emerald-800/15 blur-[120px]" />
        <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full bg-amber-300/15 dark:bg-emerald-950/25 blur-[140px]" />
        <div className="absolute top-2/3 -left-32 w-[550px] h-[550px] rounded-full bg-teal-300/15 dark:bg-teal-900/15 blur-[130px]" />
      </div>
      
      {/* If viewMode === 'admin', render the full Admin Dashboard Panel */}
      {viewMode === 'admin' ? (
        <AdminDashboard
          initialTab={adminTab}
          onTabChange={(tab) => {
            setAdminTab(tab);
            navigateTo({ name: 'admin', tab }, { scroll: false });
          }}
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
            onTelusuriClick={() => navigateTo({ name: 'telusuri' })}
            onSelectCategory={handleSelectCategory}
            onPopulerClick={scrollToPopuler}
            onKontakClick={scrollToKontak}
            onLoginClick={() => navigateTo({ name: 'login' }, { scroll: false })}
            isAdminLoggedIn={isAdminLoggedIn}
            onAdminPanelClick={() => navigateTo({ name: 'admin', tab: 'dashboard' })}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            onStartTour={startWelcomeTour}
          />

          {/* Main Dynamic View */}
          <main className="flex-1">
            {viewMode === 'chat' ? (
              <ChatThread
                messages={messages}
                currentQuery={currentQuery}
                isLoading={isLoading}
                onSendFollowup={(q) => handleSearch(q, true)}
                onSendVoiceFollowup={handleVoiceSearch}
                onBackToHome={handleBackToHome}
              />
            ) : (
              <>
                {/* Hero Search Section (Home) */}
                <div className="reveal-on-scroll">
                  <HeroSearch 
                    onSearch={(q) => handleSearch(q, false)} 
                    onVoiceSearch={handleVoiceSearch}
                    isLoading={isLoading} 
                    simulatedQuery={simulatedTourQuery}
                  />
                </div>

                {/* Full 80+ Perizinan Catalog (Matching official website) */}
                <div className="reveal-on-scroll reveal-delay-100">
                  <KatalogPerizinanSection 
                    onSelectPerizinan={handleSelectPerizinan}
                    onAskChat={(q) => handleSearch(q, false)}
                  />
                </div>

                {/* Telusuri / Category Exploration Section */}
                <div className="reveal-on-scroll reveal-delay-200">
                  <TelusuriSection 
                    onSelectQuestion={(q) => handleSearch(q, false)}
                    selectedCategoryKey={selectedCategoryKey}
                  />
                </div>
              </>
            )}
          </main>

          {/* Footer */}
          <ContactFooter />

          {/* Floating Action Dock: Voice Note AI & Official WhatsApp */}
          <div id="tour-floating-dock" className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
            {/* Quick Floating Voice Note Button */}
            <VoiceNoteRecorder
              onSendVoice={(blob, sec) => handleVoiceSearch(blob, sec, false)}
              disabled={isLoading}
              floating
            />

            {/* Official WhatsApp Helpdesk Button */}
            <a
              href={`https://wa.me/${formattedWaNumber}?text=${encodeURIComponent('Halo Mal Pelayanan Publik (MPP) Kabupaten Madiun, saya butuh informasi perizinan.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center group border border-white/50 shadow-emerald-950/40 cursor-pointer"
              title={`Chat WhatsApp Helpdesk MPP Madiun (${appSettings.whatsappNumber})`}
              aria-label="Chat WhatsApp Helpdesk MPP Madiun"
            >
              <WhatsAppIcon size={30} className="text-white drop-shadow-sm" />
            </a>
          </div>

          {/* Interactive Voice AI Welcome Tour Toast (Initial Visit Invitation) */}
          {!hasDismissedTourPrompt && !isTourOpen && viewMode === 'home' && (
            <div className="fixed bottom-24 right-6 z-40 max-w-sm rounded-2xl p-4 bg-slate-900/95 border border-emerald-500/40 shadow-2xl backdrop-blur-2xl text-white animate-in slide-in-from-bottom-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <AudioLines className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-300 block">VoiceAI Buku Saku</span>
                    <span className="text-[10px] text-white/50 font-medium">Panduan Suara Resmi</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setHasDismissedTourPrompt(true);
                    localStorage.setItem('bukusaku_tour_prompt_dismissed', 'true');
                  }}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                  title="Tutup ajakan"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-300 mb-3.5 leading-relaxed">
                Ingin mendengarkan sambutan suara & panduan interaktif fitur Buku Saku MPP?
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={startWelcomeTour}
                  className="flex-1 py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Putar Panduan Suara</span>
                </button>
                <button
                  onClick={() => {
                    setHasDismissedTourPrompt(true);
                    localStorage.setItem('bukusaku_tour_prompt_dismissed', 'true');
                  }}
                  className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 text-xs font-medium cursor-pointer"
                >
                  Nanti
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail Modal for Perizinan with clean URL sync */}
      <PerizinanDetailModal
        perizinan={selectedPerizinan}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onAskChat={(q) => handleSearch(q, false)}
      />

      {/* Admin Login Modal with clean URL sync */}
      <AdminLoginModal
        isOpen={isLoginOpen}
        onClose={handleCloseLoginModal}
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

      {/* Voice AI Welcome Tour with Cinema Subtitle & Live Real Search Walkthrough */}
      <VoiceAiWelcomeTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onTypeSimulatedQuery={setSimulatedTourQuery}
        onSimulateSearch={handleSimulateTourSearch}
        onBackToHome={handleBackToHome}
      />

    </div>
  );
};

export default App;
