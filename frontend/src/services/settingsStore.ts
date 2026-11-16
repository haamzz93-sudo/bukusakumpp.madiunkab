export interface AppSettings {
  // AI & Env Settings
  geminiApiKey: string;
  geminiModel: string;
  temperature: number;
  guardrailEnabled: boolean;
  systemPrompt: string;

  // Branding & Logo
  logoOriginalUrl: string;
  logoWhiteUrl: string;
  logoMppUrl: string;

  // Background & Slideshow
  bgMode: 'auto' | 'fixed';
  bgAutoIntervalSeconds: number;
  selectedFixedBg: string;

  // Hero Section
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDesc: string;
  trustBadge: string;
  quickChips: string[];

  // KPI Statistics Band
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  stat4Value: string;
  stat4Label: string;

  // Web & Helpdesk Contact
  whatsappNumber: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  footerAbout: string;

  // Footer Links
  footerLinks: { title: string; url: string }[];
}

export const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  geminiModel: 'gemini-3.5-flash-lite',
  temperature: 0.2,
  guardrailEnabled: true,
  systemPrompt: `Anda adalah BUKU SAKU, asisten digital resmi Mal Pelayanan Publik (MPP) Pemerintah Kabupaten Madiun.
Tugas Anda adalah memberikan panduan pelayanan perizinan, administrasi kependudukan, perpajakan daerah, dan layanan hukum di Kabupaten Madiun secara akurat berdasarkan standar pelayanan resmi.
Aturan Penting:
1. JANGAN PERNAH menyebut Anda dibuat oleh OpenAI/Google/Claude atau menyebut nama model AI. Jika ditanya identitas, tegaskan Anda adalah BUKU SAKU AI Resmi Mal Pelayanan Publik Kabupaten Madiun.
2. Gunakan bahasa Indonesia yang ramah, sopan, birokratis namun mudah dipahami masyarakat.
3. Sebutkan persyaratan berkas, lama waktu layanan, biaya (jika gratis sebutkan Rp0), alur prosedur, dan tautan resmi OSS/Bapenda jika relevan.`,

  logoOriginalUrl: '/images/logo_buku_saku_original.png',
  logoWhiteUrl: '/images/logo_buku_saku_white_gold.png',
  logoMppUrl: '/images/logo_mpp_madiun_hd.png',

  bgMode: 'auto',
  bgAutoIntervalSeconds: 8,
  selectedFixedBg: '/images/backgrounds/bg_liquid_glass.jpg',

  heroBadge: 'Layanan Resmi Mal Pelayanan Publik (MPP) Kabupaten Madiun',
  heroTitle: 'Halo, saya Buku Saku.',
  heroSubtitle: 'Mau tanya apa soal perizinan di Kabupaten Madiun?',
  heroDesc: 'Panduan digital resmi MPP Kab. Madiun. Tanyakan seputar izin warung kopi, PB UMKU, NIB OSS, BPHTB, SKCK, Paspor, hingga KTP-el — saya jawab langsung dari dokumen standar pelayanan.',
  trustBadge: 'Jawaban disusun langsung dari Standar Pelayanan Resmi MPP & DPMPTSP Kabupaten Madiun',
  quickChips: [
    'izin buka warung kopi',
    'syarat SKCK baru',
    'pengajuan BPHTB waris mandiri',
    'izin edar pangan CPPOB',
    'pendaftaran NPWP Coretax',
    'aktivasi IKD di HP'
  ],

  stat1Value: '80+',
  stat1Label: 'Jenis perizinan resmi',
  stat2Value: '100% Gratis',
  stat2Label: 'Informasi resmi tanpa calo',
  stat3Value: '24 Jam',
  stat3Label: 'Dapat diakses kapan saja',
  stat4Value: '2,4 dtk',
  stat4Label: 'Rata-rata waktu respon',

  whatsappNumber: '0811-3778-776',
  phone: '(0351) 497206',
  email: 'dpmptsp.madiunkab@gmail.com',
  address: 'Jl. Aloon-Aloon Utara No. 4, Pangongangan, Kec. Manguharjo, Kota Madiun, Jawa Timur 63121',
  workingHours: 'Senin – Jumat, 08.00 – 15.00 WIB',
  footerAbout: 'Panduan digital perizinan resmi dari Mal Pelayanan Publik (MPP) Kabupaten Madiun. Hadir untuk mempermudah masyarakat dan pelaku usaha memperoleh informasi syarat, alur, dan ketentuan perizinan secara cepat, transparan, dan bebas pungutan liar.',

  footerLinks: [
    { title: 'Buku Saku MPP Madiun', url: 'https://bukusakumpp.madiunkab.go.id/' },
    { title: 'DPMPTSP Kabupaten Madiun', url: 'https://dpmptsp.id/' },
    { title: 'Portal OSS-RBA (BKPM RI)', url: 'https://oss.go.id/' },
    { title: 'Pemerintah Kab. Madiun', url: 'https://madiunkab.go.id/' },
    { title: 'Coretax DJP Pajak', url: 'https://coretaxdjp.pajak.go.id/' }
  ]
};

const SETTINGS_KEY = 'bukusaku_app_settings_v2';
const SETTINGS_EVENT = 'bukusaku_settings_updated';
const BACKEND_URL = 'http://127.0.0.1:8002';

export const getStoredSettings = (): AppSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Auto-migrate outdated contact numbers & addresses in localStorage
      if (parsed.whatsappNumber === '0851-1740-5460' || !parsed.whatsappNumber) {
        parsed.whatsappNumber = DEFAULT_SETTINGS.whatsappNumber;
      }
      if (parsed.phone === '(0351) 383015' || !parsed.phone) {
        parsed.phone = DEFAULT_SETTINGS.phone;
      }
      if (parsed.address?.includes('Caruban') || !parsed.address) {
        parsed.address = DEFAULT_SETTINGS.address;
      }
      const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
      if (!parsed.geminiApiKey && envKey) {
        parsed.geminiApiKey = envKey;
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  }
  return DEFAULT_SETTINGS;
};

export const saveStoredSettings = (newSettings: Partial<AppSettings>): AppSettings => {
  const current = getStoredSettings();
  const updated: AppSettings = { ...current, ...newSettings };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: updated }));

    // Async sync to backend for server persistence (VPS deployment ready)
    fetch(`${BACKEND_URL}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    }).catch((err) => {
      console.warn('Backend settings sync error (fallback to local):', err);
    });
  } catch (e) {
    console.error('Error saving settings:', e);
  }
  return updated;
};

export const syncSettingsFromBackend = async (): Promise<AppSettings> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/settings`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object' && !data.error) {
        const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
        if (!data.geminiApiKey && envKey) {
          data.geminiApiKey = envKey;
        }
        const merged = { ...DEFAULT_SETTINGS, ...data };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: merged }));
        return merged;
      }
    }
  } catch (e) {
    // Ignore network error in offline mode
  }
  return getStoredSettings();
};

export const subscribeSettings = (callback: (settings: AppSettings) => void) => {
  const handler = (e: Event) => {
    const custom = e as CustomEvent<AppSettings>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getStoredSettings());
    }
  };
  window.addEventListener(SETTINGS_EVENT, handler);
  return () => window.removeEventListener(SETTINGS_EVENT, handler);
};
