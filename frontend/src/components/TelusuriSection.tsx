import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Store, 
  Landmark, 
  UserCheck, 
  ShieldCheck, 
  Receipt, 
  HeartHandshake, 
  Building2,
  Phone
} from 'lucide-react';
import { KategoriPerizinan } from '../types/perizinan';
import { getStoredKlaster, subscribeKlaster } from '../services/klasterStore';
import { WA_NUM_MPP, TELP_MPP } from '../services/hybridAiService';
import { WhatsAppIcon } from './WhatsAppIcon';

interface TelusuriSectionProps {
  onSelectQuestion: (question: string) => void;
  selectedCategoryKey?: string;
}

export const TelusuriSection: React.FC<TelusuriSectionProps> = ({ 
  onSelectQuestion,
  selectedCategoryKey
}) => {
  const [klasterList, setKlasterList] = useState<KategoriPerizinan[]>(getStoredKlaster());
  const [activeKey, setActiveKey] = useState<string>(selectedCategoryKey || klasterList[0]?.key || 'usaha');

  useEffect(() => {
    setKlasterList(getStoredKlaster());
    const unsub = subscribeKlaster((updated) => {
      setKlasterList(updated);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (selectedCategoryKey) {
      setActiveKey(selectedCategoryKey);
    }
  }, [selectedCategoryKey]);

  const activeCategory = klasterList.find(c => c.key === activeKey) || klasterList[0] || {
    key: 'usaha',
    name: 'Perizinan Usaha, OSS & BPOM',
    desc: 'Layanan Perizinan Terpadu',
    questions: []
  };

  const getCategoryIcon = (key: string, isBig = false) => {
    const size = isBig ? "w-6 h-6" : "w-4 h-4";
    switch (key) {
      case 'usaha': return <Store className={size} />;
      case 'pajak': return <Landmark className={size} />;
      case 'dukcapil': return <UserCheck className={size} />;
      case 'hukum': return <ShieldCheck className={size} />;
      case 'kpp': return <Receipt className={size} />;
      case 'sosial': return <HeartHandshake className={size} />;
      default: return <Building2 className={size} />;
    }
  };

  return (
    <section id="telusuri" className="py-16 px-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-emerald-500/10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 text-xs font-bold tracking-wider uppercase mb-2">
            Telusuri Per Klaster
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Jelajahi Basis Pengetahuan MPP
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-2">
            Pilih klaster pelayanan untuk melihat daftar pertanyaan resmi yang siap dijawab secara instan.
          </p>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div id="tour-klaster-box" className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {klasterList.map((cat) => {
            const isActive = cat.key === activeKey;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveKey(cat.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-madiun-forest text-white shadow-md border border-emerald-400/50 scale-[1.02]'
                    : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-emerald-500/20 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-900 dark:hover:text-white'
                }`}
              >
                <span>{getCategoryIcon(cat.key)}</span>
                <span>{cat.name}</span>
                <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {cat.questionCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Two-Column Display: Category Details & Question List on Left, Helpdesk on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Questions List */}
          <div className="lg:col-span-8 liquid-glass-sidebar rounded-2xl border border-emerald-500/20 shadow-xl p-6 sm:p-8">
            
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-200 dark:border-emerald-500/15">
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                {getCategoryIcon(activeCategory.key, true)}
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  {activeCategory.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {activeCategory.desc}
                </p>
              </div>
            </div>

            {/* List of Questions with Arrow Right */}
            <div className="divide-y divide-slate-100 dark:divide-emerald-500/15">
              {activeCategory.questions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectQuestion(q)}
                  className="w-full text-left py-3.5 px-3 -mx-3 rounded-xl hover:bg-emerald-50/80 dark:hover:bg-emerald-950/50 transition-colors flex items-center justify-between gap-4 group"
                >
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-mpp-bright transition-colors">
                    {q}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-emerald-500/20 group-hover:bg-mpp-bright text-slate-400 group-hover:text-slate-950 flex items-center justify-center shrink-0 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>

          </div>

          {/* Right Column: Fast Helpdesk Contact */}
          <div className="lg:col-span-4 liquid-glass-sidebar rounded-2xl border border-emerald-500/20 p-6 shadow-xl space-y-4">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-display">
                Butuh Bantuan Cepat?
              </div>
              <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Konsultasi Tatap Muka & WA
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Staf perizinan dan helpdesk MPP Kabupaten Madiun siap membantu memeriksa kelengkapan berkas Anda.
              </p>
            </div>

            <a
              href={`https://wa.me/${WA_NUM_MPP}?text=${encodeURIComponent('Halo Helpdesk MPP Kabupaten Madiun, saya ingin berkonsultasi seputar perizinan.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm shadow-md transition-all hover:scale-[1.01]"
            >
              <WhatsAppIcon size={18} className="text-white shrink-0" />
              <span>WhatsApp 0811-3778-776</span>
            </a>

            <a
              href={`tel:${TELP_MPP}`}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-200 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Telepon MPP: {TELP_MPP}</span>
            </a>

            <div className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
              Pelayanan langsung buka setiap hari kerja pukul 08.00 s/d 15.00 WIB di Gedung MPP Kabupaten Madiun (Jl. Aloon-Aloon Utara No. 4, Pangongangan, Madiun).
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
